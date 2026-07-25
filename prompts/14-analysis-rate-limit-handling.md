# 14 — Analysis rate-limit handling and run pacing

## Goal

Stop the analysis pipeline from destroying its own Gemini quota. A free-tier
run currently fires ~6 requests per article against a 5 RPM limit, so every
article fails, the failures themselves consume quota, and the run reports
incoherent counts. Fix five things:

1. Retry only what is worth retrying — never retry a rate limit or a transport
   failure, only invalid model output.
2. Set the AI SDK's `maxRetries` explicitly instead of inheriting its default
   of 2, so one attempt means exactly one API request.
3. Add `rate_limited` as a distinct failure reason, separate from
   `model_error`.
4. Abort the rest of a run once a rate limit is hit — remaining articles cannot
   succeed, and attempting them extends the lockout.
5. Pace requests for the real limit (5 RPM on `gemini-2.5-flash`) and stop a
   run before it exceeds the route's `maxDuration`.

Also fix the pre-existing double-count bug where the same article is reported
as both failed and skipped.

## Skills read

- None newly required. This changes retry/pacing behaviour in existing
  `lib/ai/` and `lib/pipeline/` modules; the `ai-sdk` skill was already read for
  prompt 13 and no new SDK surface is introduced beyond `APICallError`.
- `node_modules/@ai-sdk/provider/dist/index.d.ts` — `APICallError` exposes
  `statusCode`, `responseHeaders`, `isRetryable`, and a static
  `isInstance(error)` type guard. This is the supported way to detect a 429;
  message-string matching is not.
- `node_modules/ai/dist/index.d.ts` — both `generateText` and `embed` accept
  `maxRetries` (default 2, i.e. 3 attempts).

## Existing code inspected

- `lib/ai/analyze-article.ts` — outer loop runs `attemptAnalysis` up to
  `ANALYSIS_MAX_ATTEMPTS` (2) for **every** failure reason including
  `model_error`; `generateText` is called with no `maxRetries`, so the SDK adds
  2 more attempts internally. Worst case is 2 × 3 = **6 requests per article**.
- `lib/ai/embed-article.ts` — same missing `maxRetries` (prompt 13). Embeddings
  use a different model with a 100 RPM budget, so this is correctness/cost
  hygiene rather than the active problem.
- `lib/pipeline/analysis.ts` — `drainPendingArticles` loops until a batch
  returns nothing new; `processBatch` sleeps `ANALYSIS_REQUEST_DELAY_MS` (500ms)
  between articles; the no-progress guard does
  `state.skipped += batch.length` for articles already counted in
  `state.failed`.
- `lib/pipeline/types.ts` — `AnalysisRunSummary`, `AnalysisItemResult`.
- `lib/pipeline/analysis-run-logger.ts` — `analysisLog.*`.
- `lib/config/limits.ts` — `ANALYSIS_REQUEST_DELAY_MS = 500`,
  `ANALYSIS_MAX_ATTEMPTS = 2`, `DEFAULT_ANALYSIS_BATCH_SIZE = 5`.
- `app/api/analyze/route.ts` — `maxDuration = 300`; returns the summary as-is.

## Observed failure (the reason for this prompt)

Two real runs on 2026-07-25, free tier:

```
[analyze] failed 03df85c5… (model_error): Failed after 3 attempts. …
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
Please retry in 8.520958837s.
…
[analyze] batch 1 done — 0 analyzed, 0 embedded, 4 failed
[analyze] stopping — 4 pending article(s) returned again with no new analysis saved
[analyze] analysis completed in 83826ms — 0 analyzed, 0 embedded, 4 skipped, 4 failed
```

Google AI Studio → Rate Limit confirms the ceiling:

| Model | RPM | TPM |
| --- | --- | --- |
| Gemini 2.5 Flash | **5 / 5** (at limit) | 8.81K / 250K |
| Gemini Embedding 1 | 15 / 100 | 16.92K / 30K |

So: the analysis model is request-capped at 5/min, token usage is irrelevant,
and the embedding model is not implicated. Four articles produced ~24 requests
in 84 seconds.

## Decisions and assumptions

1. **Retry classification.** `ANALYSIS_MAX_ATTEMPTS` applies only to
   `invalid_output` and `percentages_unusable` — the cases where asking the
   model again can plausibly produce a different result. `model_error` and the
   new `rate_limited` are returned on the first failure. This matches what
   AGENTS.md section 19 actually asks for ("If output is invalid, retry once").
2. **`maxRetries: 0`** on both `generateText` and `embed`. One attempt = one
   request makes quota accounting exact and puts retry policy in one place
   (our outer loop) rather than two. Transient 5xx now surfaces as a failed
   article that the next run retries — acceptable for a background job, and far
   cheaper than invisible amplification. Worst case drops from 6 requests per
   article to 2.
3. **Rate-limit detection** via `APICallError.isInstance(error) && error.statusCode === 429`,
   not message matching. A 429 maps to the new `rate_limited` reason.
4. **Run-level abort on 429.** The first `rate_limited` sets a flag; the batch
   loop and the drain loop both stop immediately. Remaining pending articles are
   *not* counted as failed — they were never attempted. The summary gains
   `stoppedReason: "rate_limited" | "time_budget" | null` so the caller can tell
   "nothing left to do" from "we had to stop early".
5. **Pacing for 5 RPM.** `ANALYSIS_REQUEST_DELAY_MS` 500 → 13_000 (60 ÷ 5 = 12s,
   plus a second of headroom). Embeddings ride along inside the same per-article
   slot and need no separate delay at 100 RPM. This makes runs slow by design;
   the hourly cron is the intended consumer and has an hour to work with.
6. **Time budget.** `MAX_ANALYSIS_RUN_MS = 240_000` — the drain loop stops
   before the route's `maxDuration = 300` so a long backfill returns a real
   summary instead of being killed mid-flight. Remaining articles stay pending
   for the next run. `stoppedReason: "time_budget"`.
7. **Double-count fix.** The no-progress guard stops counting already-failed
   articles as skipped. `articlesSkipped` keeps its section 19 meaning:
   articles explicitly requested that were not pending. With the run-level abort
   in place the guard should rarely fire at all — it stays as a backstop.
8. **No new env vars, no schema change, no UI change.** Prompt 13's pgvector
   work is untouched; this only changes when and how often the pipeline calls
   Gemini.

## Files likely to change

- `lib/config/limits.ts` — `ANALYSIS_REQUEST_DELAY_MS` 500 → 13_000 (documented
  against the measured 5 RPM), new `MAX_ANALYSIS_RUN_MS`, comment on
  `ANALYSIS_MAX_ATTEMPTS` narrowing its scope.
- `lib/ai/analyze-article.ts` — `rate_limited` in `AnalysisFailureReason`,
  429 detection, `maxRetries: 0`, retry only the two output-shape reasons.
- `lib/ai/embed-article.ts` — `maxRetries: 0`; surface a rate limit distinctly
  so the pipeline can abort on an embedding 429 too.
- `lib/pipeline/analysis.ts` — abort flag, time budget, no-progress
  double-count fix, `stoppedReason` plumbing.
- `lib/pipeline/types.ts` — `stoppedReason` on `AnalysisRunSummary`.
- `lib/pipeline/analysis-run-logger.ts` — a clear one-line rate-limit message
  naming the model and telling the reader the run stopped early; `stoppedReason`
  in the completion line.

Not touched: `app/api/analyze/route.ts` (returns the summary unchanged), any
schema, any UI, scraping, Oxylabs.

## Implementation requirements

1. A rate-limited article must cost exactly **one** API request, never six.
2. `rate_limited` must appear in `failureReasons` and in the per-article
   results — never collapsed into `model_error`.
3. Once a 429 is seen, no further Gemini call is made for the remainder of the
   run, from either the analysis or the embedding step.
4. No article is counted in more than one of analyzed / embedded / skipped /
   failed. `articlesPending` must equal the sum of the outcome counts.
5. The drain loop stops at `MAX_ANALYSIS_RUN_MS` and reports
   `stoppedReason: "time_budget"`.
6. Articles stopped early stay pending — no `analyzed_at`, no partial rows.
7. Prompt 13 behaviour is preserved exactly: `embed_only` backfill, embedding
   before `markArticleAnalyzed`, `embedding_error` semantics.
8. No `any`; no unrelated refactors.

## Security requirements

- No change to the server-only boundary; all Gemini calls stay in
  `server-only` modules.
- Error messages logged from `APICallError` must not include request bodies or
  headers (they can carry the API key). Log `statusCode` and `message` only.
- No new environment variables; no change to admin-secret handling.

## Acceptance criteria

1. With quota exhausted, a run of N pending articles makes at most 1 analysis
   request total and returns promptly, not after N × 6 attempts.
2. The summary reports `failureReasons: { rate_limited: 1 }` and
   `stoppedReason: "rate_limited"`.
3. With quota available, articles are analyzed and embedded exactly as prompt 13
   delivered, at roughly one article per 13 seconds.
4. `articlesPending` equals analyzed + embedded + skipped + failed in every run.
5. A backfill larger than the time budget returns a valid summary before 300s
   with `stoppedReason: "time_budget"`, and a follow-up run continues where it
   left off.
6. `npm run typecheck`, `npm run lint`, and `npm run build` all pass.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (server modules and pipeline types change)

## Manual test steps

These cost real quota, so run them in this order.

1. Start the dev server and watch its terminal:
   ```bash
   npm run dev
   ```
2. **While still rate-limited** (cheapest test, do this first) — confirm the
   run gives up immediately instead of amplifying:
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{}'
   ```
   Expect: one `rate_limited` failure, `stoppedReason: "rate_limited"`, a run
   duration of seconds not minutes, and no repeated attempts in the log.
3. Wait for the quota window to reset. Check
   https://ai.dev/rate-limit — Gemini 2.5 Flash RPM should be below 5/5 and RPD
   should not be at its ceiling.
4. Analyze a single article and confirm the full path still works:
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{"articleIds":["<real-article-uuid>"],"batchSize":1}'
   ```
   Expect `analyzing …` then `embedded … — 1536 dimensions`, and
   `1 analyzed, 1 embedded, 0 skipped, 0 failed`.
5. Drain the rest, pacing itself at ~13s per article:
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{}'
   ```
6. Verify the counts add up and no article is double-counted — in the summary,
   `articlesPending` must equal analyzed + embedded + skipped + failed.
7. Confirm prompt 13 is unaffected:
   ```sql
   select count(*) filter (where embedding is null) as missing,
          count(*) filter (where embedding is not null) as embedded
   from public.article_analyses;
   ```
   Then open an article in the browser and check the Related Articles section.
