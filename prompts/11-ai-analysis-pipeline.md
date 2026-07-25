# 11 — AI article analysis pipeline (AGENTS.md section 19)

## Goal

Implement the AI analysis pipeline: find articles that have no `article_analyses`
row, analyze each one with Google Gemini through the Vercel AI SDK, validate the
model output with Zod, save it to `article_analyses`, and set `analyzed_at` only
after a valid save. Triggered by `POST /api/analyze`, guarded by the
`x-PIXCA-admin-secret` header.

## Scope

**In scope** — section 19 backend pipeline:

- `ai` + `@ai-sdk/google` install
- centralized model config
- analysis prompt + Zod output schema
- batched analysis pipeline module with run logging + summary object
- `POST /api/analyze` route
- pending-analysis query fix (LEFT JOIN semantics, lighter column selection)

**Explicitly out of scope** (flagged, not silently dropped):

- **Embeddings / pgvector / Related Articles** — AGENTS.md section 20, which
  states it is implemented *after* AI analysis is working. Separate prompt.
- **UI wiring** — `app/page.tsx` and `app/article/[id]/page.tsx` are still static
  mock data (`ARTICLES`, `RELATED_STORIES` constants). Section 19's card/details
  display requirements need those pages connected to
  `getPublishedArticles` / `getArticleWithAnalysis`, which is a UI task of its own
  size and design sensitivity. Separate prompt, to be done next.
- **Cron pipeline route** — section 18. The analysis pipeline module here is
  written so the cron route can import and reuse it unchanged.

## Skills read

- `.agents/skills/supabase/SKILL.md` — service-role usage is server-only; never
  expose the service key; RLS already enabled with default-deny on all tables and
  all access goes through the service-role client; joined-table filter gotcha
  (`.eq('foreignTable.column', …)` is broken → filter in JS after the query).
- `.agents/skills/ai-sdk/SKILL.md` — never write AI SDK code from memory; install
  `ai` first, provider packages when the task needs them; read the version-matched
  bundled docs under `node_modules/ai/docs/` and `node_modules/@ai-sdk/google/docs/`
  before writing code; verify model IDs against the live list; run the type checker
  after changes.

Verified against live docs (not memory), to be re-confirmed against the bundled
version-matched docs at implementation time:

- `ai` latest is `7.0.37`; `@ai-sdk/google` latest is `4.0.24`.
- In AI SDK v7 structured output is produced by `generateText` with
  `output: Output.object({ schema })`, read back from the `output` property —
  there is no separate `generateObject` call in the v7 docs.
- `@ai-sdk/google` exports `google`; model is `google('gemini-2.5-flash')`; the
  API key defaults to `GOOGLE_GENERATIVE_AI_API_KEY`, so no `createGoogle` wiring.

## Existing code inspected

- `lib/supabase/queries/analyses.ts` — `insertArticleAnalysis`,
  `markArticleAnalyzed` already exist and are exactly what the pipeline needs.
- `lib/supabase/queries/articles.ts` — `getPendingAnalysisArticles({ limit })`
  exists: selects `*, analysis:article_analyses(id)` over **all** articles, filters
  `row.analysis === null` in JS, then slices. Correct LEFT JOIN semantics per
  section 19 and correct per the Supabase joined-filter gotcha, but it pulls every
  article row including `raw_text` on every call.
- `lib/pipeline/scrape.ts` — pipeline module shape to mirror: injected
  dependencies, per-item try/catch so one failure never aborts the run, counters
  accumulated into a typed summary, `runLog.*` + `persistRunSummary` at the end.
- `lib/pipeline/run-logger.ts` — `runLog` object with one method per event,
  `persistRunSummary` writing a `logs` row, `toMessage(error)` helper. Prefix
  `[scrape]`.
- `lib/pipeline/types.ts` — `ScrapeRunSummary` / `SourceRunResult` typed-summary
  convention.
- `app/api/scrape/route.ts` — thin-handler convention: `requireAdminSecret` →
  `readJsonBody` → Zod `.strict()` schema → run pipeline → `Response.json(summary)`;
  `export const dynamic = "force-dynamic"` and `export const maxDuration = 300`.
- `lib/api/admin-secret.ts` — constant-time `x-pixca-admin-secret` guard,
  returns a `401` Response or `null`.
- `lib/config/limits.ts` — where centralized limits live.
- `supabase/schema.sql` + `lib/supabase/types.ts` — `article_analyses` already has
  every column section 19 requires, plus DB check constraints:
  scores in `[-1, 1]`, percentages in `[0, 100]`, confidence in `[0, 1]`,
  `left + center + right = 100`, `article_id` unique, label enums enforced.
  **No schema change is needed for this prompt.**
- `package.json` — no `ai`, no `@ai-sdk/*`. `zod@^4.4.3` present. Next `16.2.10`.
- `.env.local` / `.env.example` — `GOOGLE_GENERATIVE_AI_API_KEY`,
  `PIXCA_ADMIN_SECRET`, `ANALYSIS_BATCH_SIZE` are all present already.

## Decisions and assumptions

1. **No schema/migration work.** Every required column and constraint already
   exists. `supabase/schema.sql` and `lib/supabase/types.ts` stay untouched.
2. **Model ID centralized** in a new `lib/config/ai.ts` as
   `ANALYSIS_MODEL_ID = "gemini-2.5-flash"`, never inlined in the route
   (section 19). The same string is written to `article_analyses.model`.
3. **`bias_score` is derived in code**, not asked of the model:
   `(rightPercentage − leftPercentage) / 100`, rounded to 4 decimals. The model
   returns only the three percentages, the label, sentiment, confidence, and text
   fields. Fewer model-supplied numbers means fewer constraint violations.
4. **Percentage sum is repaired, then re-validated.** The DB enforces
   `left + center + right = 100` exactly, and models routinely return e.g.
   `30/35/34`. Round each to an integer, then adjust the largest bucket by the
   residual so the three sum to exactly 100. If the raw values are off by more
   than 2 before repair, treat the output as invalid and retry rather than
   silently reshaping a bad answer.
5. **One retry on invalid output** (section 19: "retry once or mark the article as
   failed"). Attempt 1 → Zod parse → on failure, one retry with the same prompt →
   on second failure, count the article as `failed`, save nothing, and leave
   `analyzed_at` null so the next run picks it up again.
6. **Sequential within a batch**, batch after batch. Concurrency would risk Gemini
   rate limits and makes the log stream unreadable; the run is a background job, so
   latency is not the constraint. Batching exists only for timeout control
   (section 19).
7. **Batch size** from `ANALYSIS_BATCH_SIZE`, default 5, clamped to a sane max in
   `lib/config/limits.ts`. Request-level `limit` (total articles) is optional; with
   no limit the run continues until no pending articles remain (section 19).
8. **`raw_text` is truncated** to a centralized character cap before being sent to
   Gemini, to bound token cost on outlier articles. The cap is generous enough that
   a normal article is sent whole.
9. **`getPendingAnalysisArticles` is tightened**, keeping the same LEFT JOIN
   semantics: select only the columns analysis needs
   (`id, title, published_at, raw_text, source_id, analysis:article_analyses(id)`),
   keep the JS-side `analysis === null` filter (Supabase joined-filter gotcha), and
   pass the limit through to the query so a run does not load the whole table. The
   `analyzed_at IS NULL` shortcut is **not** used anywhere.
10. **Prompt is source-blind.** The source name is deliberately not included in the
    model prompt — section 19 requires framing to be judged from article text
    evidence only, not from the outlet's reputation.
11. **New logger, not a reshaped scrape logger.** `lib/pipeline/analysis-run-logger.ts`
    with prefix `[analyze]`, same shape as the scrape one, reusing `toMessage` and
    `insertLog`. `lib/pipeline/run-logger.ts` is not modified.

## Files likely to change

New:

- `lib/config/ai.ts` — model ID, analysis prompt limits
- `lib/ai/analysis-schema.ts` — Zod schema for model output + derived-field helpers
- `lib/ai/analyze-article.ts` — single-article Gemini call + validation + retry
- `lib/ai/prompt.ts` — system + user prompt builders
- `lib/pipeline/analysis.ts` — batched pipeline, counters, summary
- `lib/pipeline/analysis-run-logger.ts` — `[analyze]` console logging + summary row
- `app/api/analyze/route.ts` — `POST` handler

Modified:

- `lib/config/limits.ts` — analysis batch size + raw-text cap constants
- `lib/pipeline/types.ts` — `AnalysisRunSummary` / `AnalysisItemResult` types
- `lib/supabase/queries/articles.ts` — tighten `getPendingAnalysisArticles`
- `package.json` / `package-lock.json` — `ai`, `@ai-sdk/google`

## Implementation requirements

### 1. Install and read the bundled docs first

Install `ai` and `@ai-sdk/google` (pinned versions, lockfile committed — supabase
skill dependency rule). **Before writing any AI SDK code**, read
`node_modules/ai/docs/` and `node_modules/@ai-sdk/google/docs/` to confirm the
exact structured-output API for the installed version. If the installed version
differs from the `generateText` + `Output.object()` pattern noted above, follow the
bundled docs, not this prompt, and say so in the completion report.

### 2. `lib/config/ai.ts`

- `export const ANALYSIS_MODEL_ID = "gemini-2.5-flash";`
- `export const ANALYSIS_DISCLAIMER_FALLBACK` — used only if the model omits a
  disclaimer; the column is `not null`.
- No secrets, no client imports.

### 3. `lib/config/limits.ts` additions

- `DEFAULT_ANALYSIS_BATCH_SIZE = 5`, `MAX_ANALYSIS_BATCH_SIZE = 25`
- `MAX_ANALYSIS_INPUT_CHARACTERS` — raw-text cap sent to the model
- `ANALYSIS_MAX_ATTEMPTS = 2` (first attempt + one retry)
- `ANALYSIS_REQUEST_DELAY_MS` — small politeness delay between model calls

### 4. `lib/ai/analysis-schema.ts`

Zod schema for the model output, matching the DB constraints:

- `summary` — non-empty string
- `sentimentScore` — number, −1…1
- `sentimentLabel` — enum `positive | neutral | negative`
- `politicalFramingLabel` — enum `left | center | right | mixed | unclear`
- `leftPercentage`, `centerPercentage`, `rightPercentage` — numbers 0…100
- `confidence` — number 0…1
- `framingNotes` — string (nullable/optional → stored as null when absent)
- `loadedTerms` — array of strings, defaults to `[]`
- `disclaimer` — string, falls back to `ANALYSIS_DISCLAIMER_FALLBACK`

Plus exported pure helpers, unit-testable by inspection:

- `normalizePercentages(left, center, right)` → rounds to integers and adjusts the
  largest bucket so the sum is exactly 100; returns `null` when the pre-repair sum
  deviates from 100 by more than 2 (decision 4).
- `deriveBiasScore(left, right)` → `(right − left) / 100`, clamped to [−1, 1].

### 5. `lib/ai/prompt.ts`

System prompt states: neutral news analyst; judge framing from the article text
only, never from the outlet; percentages must be integers summing to 100; the label
must match the strongest percentage unless the percentages are close or evidence is
weak, in which case use `mixed`/`unclear` with low confidence; output is an
AI estimate, not objective truth.

User prompt carries the article title, published date, and the truncated
`raw_text`. **The source name is not included** (decision 10).

### 6. `lib/ai/analyze-article.ts`

`analyzeArticle(article)` → `{ ok: true; analysis: ArticleAnalysisInsert } | { ok: false; reason }`:

- calls Gemini via the AI SDK with `Output.object({ schema })` (or the installed
  version's equivalent)
- Zod-parses the output; on parse failure or failed percentage repair, retries once
  (`ANALYSIS_MAX_ATTEMPTS`), then returns `{ ok: false }`
- builds the `ArticleAnalysisInsert` with derived `bias_score`, repaired
  percentages, `model: ANALYSIS_MODEL_ID`
- `import "server-only"` at the top

### 7. `lib/pipeline/analysis.ts`

`runAnalysisPipeline({ batchSize, limit, articleIds })`:

- loop: fetch the next pending batch via `getPendingAnalysisArticles`, stop when it
  comes back empty or the requested `limit` is reached
- for each article: `analyzeArticle` → on success `insertArticleAnalysis` then
  `markArticleAnalyzed` (in that order — `analyzed_at` set **only** after the
  analysis row is committed, section 19 requirement 6); on failure count it and
  continue
- a single article throwing must never abort the run (mirrors `processSource`)
- if `articleIds` is supplied, analyze exactly those articles that are still
  pending, and skip the "continue until none remain" loop
- guard against an infinite loop: if a batch yields zero successful inserts and the
  same pending set comes back, stop and report
- counts per batch and in the final summary: `analyzed`, `skipped`, `failed`
- `runLog`-style console progress, then a final summary object, then
  `persistRunSummary` equivalent writing one `logs` row

### 8. `lib/pipeline/types.ts` additions

`AnalysisRunSummary`: `status`, `articlesPending`, `articlesAnalyzed`,
`articlesSkipped`, `articlesFailed`, `batchesRun`, `durationMs`,
`failureReasons` (counts grouped by reason), `model`.

### 9. `app/api/analyze/route.ts`

- `POST` only (section 14), `export const dynamic = "force-dynamic"`,
  `export const maxDuration = 300`
- `requireAdminSecret` first; empty body is valid and means "analyze everything
  pending" (mirrors the scrape route's `readJsonBody`)
- Zod `.strict()` body: `{ limit?: number ≥ 1, batchSize?: number 1…MAX, articleIds?: uuid[] }`
- thin handler: parse → `runAnalysisPipeline` → `Response.json(summary)`;
  unexpected errors → logged server-side, generic `500` body

## Security requirements

- `GOOGLE_GENERATIVE_AI_API_KEY` is server-only and read only by the AI SDK
  provider default. Never `NEXT_PUBLIC_`, never referenced from a client component.
- Every new `lib/ai/*` and `lib/pipeline/*` module starts with `import "server-only"`.
- Gemini calls and Supabase service-role writes happen only inside the route
  handler / server modules — never from browser code (section 21).
- `POST /api/analyze` rejects a missing or wrong `x-PIXCA-admin-secret` with `401`
  via the existing constant-time guard; the secret never appears in a query string.
- Error responses stay generic; model errors and stack traces are logged
  server-side only.
- No new table is exposed to `anon`/`authenticated`; RLS state is unchanged.

## Acceptance criteria

- `POST /api/analyze` without the admin header returns `401`.
- With the header and an empty body, every article lacking an `article_analyses`
  row is analyzed, in batches, until none remain.
- Pending detection uses the LEFT JOIN; an article whose `analyzed_at` is set but
  whose `article_analyses` row was deleted **is** picked up again.
- Saved rows satisfy every DB constraint — the three percentages are integers
  summing to exactly 100, `bias_score = (right − left) / 100`, scores and
  confidence in range, `model = "gemini-2.5-flash"`.
- `analyzed_at` is set only for articles whose analysis row was successfully saved.
- Invalid model output after one retry produces a `failed` count, no
  `article_analyses` row, and an unchanged `analyzed_at`.
- One failing article does not abort the run.
- Console shows per-batch and per-article progress under `[analyze]`, and a final
  summary object; one `logs` row holds the summary.
- The model ID appears in `lib/config/ai.ts` only — `grep -rn "gemini-2.5-flash" app lib`
  returns just the config file.
- No schema change was made; `supabase/schema.sql` and `lib/supabase/types.ts` are
  untouched.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` — required here: new route, new server modules, new dependencies.

## Manual test steps

1. Confirm `.env.local` has `GOOGLE_GENERATIVE_AI_API_KEY`, `PIXCA_ADMIN_SECRET`,
   and optionally `ANALYSIS_BATCH_SIZE`. Restart `npm run dev` after any change.
2. Start the dev server and **watch that terminal** — all analysis progress is
   logged there (section 17):
   ```bash
   npm run dev
   ```
3. Confirm the guard rejects unauthenticated calls:
   ```bash
   curl -i -X POST http://localhost:3000/api/analyze
   ```
   Expect `401`.
4. Analyze a small batch first:
   ```bash
   curl -s -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{"limit": 2}' | jq
   ```
   Expect a summary with `articlesAnalyzed: 2` and per-article lines in the dev
   server terminal.
5. Inspect a saved row in Supabase Dashboard → SQL Editor:
   ```sql
   select a.title,
          an.sentiment_label, an.sentiment_score,
          an.bias_label, an.bias_score,
          an.left_percentage, an.center_percentage, an.right_percentage,
          an.left_percentage + an.center_percentage + an.right_percentage as pct_sum,
          an.confidence, an.model, an.loaded_terms
   from article_analyses an
   join articles a on a.id = an.article_id
   order by an.created_at desc
   limit 5;
   ```
   Expect `pct_sum = 100` on every row and `model = 'gemini-2.5-flash'`.
6. Run the full pipeline with no body — analyze everything pending:
   ```bash
   curl -s -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{}' | jq
   ```
7. Confirm idempotency — run the same command again. Expect
   `articlesPending: 0`, `articlesAnalyzed: 0`, and a fast completion.
8. Confirm LEFT JOIN detection. Delete one analysis row, then re-run step 6:
   ```sql
   delete from article_analyses
   where article_id = '<some-article-id>';
   ```
   That article must be re-analyzed even though its `analyzed_at` is still set.
9. Confirm the summary was persisted:
   ```sql
   select level, message, created_at
   from logs
   where message like 'analysis run%'
   order by created_at desc
   limit 5;
   ```
10. Note: the homepage and details page still render mock data, so analyzed
    articles will **not** appear in the UI yet — that is the next prompt.
