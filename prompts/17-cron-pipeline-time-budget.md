# 17 — Cron pipeline time budget

## Goal

Stop `GET /api/cron/pipeline` from running past its `maxDuration = 300` limit.

The first production run finished in **299,609 ms** against a 300,000 ms limit — 391 ms of headroom. This was not bad luck; it is structural:

- `runAnalysisPipeline` always starts a fresh `MAX_ANALYSIS_RUN_MS` (240,000 ms) budget measured from **its own** start (`lib/pipeline/analysis.ts:69`), with no knowledge of time the caller already spent.
- The cron route runs `processScheduledResults()` first (~55 s in that run), then analysis. Total = step one + up to 240 s, which can exceed 300 s whenever step one is slow.
- The pre-call check `Date.now() + ANALYSIS_REQUEST_DELAY_MS >= state.deadline` (`lib/pipeline/analysis.ts:219`) reserves time for the *delay* but not for the model call that follows it (~20 s measured). So even a standalone analysis run can overshoot its own budget by roughly one call.

When the limit is exceeded, Vercel kills the function: the DB writes already committed survive, but the response and the `[cron] hourly pipeline completed` summary are lost, and the GitHub Actions job goes red on a truncated reply. The pipeline would look broken while actually having done most of its work.

Fix: give the cron route one wall-clock budget for the whole request and let analysis inherit the *remaining* time instead of assuming a fresh 240 s.

No behaviour change for `POST /api/analyze`, which keeps its current full budget.

## Skills read

None. This change touches no Clerk, Supabase, Oxylabs, or AI SDK API surface — it is arithmetic on existing timers plus one new optional parameter. `AGENTS.md` section 3 scopes skills to those products, and reading them here would add nothing. Existing project patterns (centralized limits in `lib/config/limits.ts`, thin route handlers, typed pipeline results) are the relevant guidance and are followed.

## Existing code inspected

- `lib/pipeline/analysis.ts` — `runAnalysisPipeline(options)`; `RunState.deadline` set at line 69 to `startedAt + MAX_ANALYSIS_RUN_MS`; the only deadline read is the pre-call check at line 219, which sets `stoppedReason = "time_budget"` and breaks the batch loop.
- `lib/pipeline/analysis-run-logger.ts` — `analysisLog.timeBudgetReached(budgetMs)` currently receives the constant; it should receive the *effective* budget once that can differ.
- `app/api/cron/pipeline/route.ts` — records `startedAt`, runs step one in a `try/catch`, then step two unconditionally. `maxDuration = 300`.
- `lib/config/limits.ts` — `MAX_ANALYSIS_RUN_MS = 240_000`, `ANALYSIS_REQUEST_DELAY_MS = 13_000`.
- `lib/pipeline/types.ts` — `AnalysisStoppedReason` already includes `"time_budget"`; no new type is needed for the stop path.
- Measured from the production run: step one ~55 s, one analysis article ~20 s (11 articles analyzed inside ~245 s including the 13 s inter-call delays).

## Decisions and assumptions

1. **One budget, owned by the caller.** Add an optional `deadline?: number` (an absolute `Date.now()` instant) to `RunAnalysisPipelineOptions`. When present it wins; when absent, behaviour is exactly today's `startedAt + MAX_ANALYSIS_RUN_MS`. `POST /api/analyze` passes nothing and is unaffected.

   An absolute instant is chosen over a relative `timeBudgetMs` because the cron route computes it once from its own request start; a relative value would have to be recomputed and could drift.

2. **Reserve headroom for the model call, not just the delay.** The pre-call check becomes `Date.now() + ANALYSIS_REQUEST_DELAY_MS + ANALYSIS_CALL_ESTIMATE_MS >= deadline`. New constant `ANALYSIS_CALL_ESTIMATE_MS = 30_000` — above the ~20 s measured, so a slower-than-usual call still lands inside the budget. This alone fixes the standalone overshoot.

3. **Cron budget is 280 s, not 300 s.** New constant `CRON_PIPELINE_BUDGET_MS = 280_000`, leaving 20 s of headroom under `maxDuration = 300` for response serialization, the final `persistRunSummary` write, and PostHog-style teardown. The route computes `deadline = startedAt + CRON_PIPELINE_BUDGET_MS` once, before step one.

4. **Step one is not interrupted.** It is bounded in practice (4 schedules, `MAX_DETAIL_PAGES_PER_SOURCE`, the consecutive-failure circuit breaker) and cutting it mid-source would waste already-paid Oxylabs detail fetches. Instead, step two simply inherits whatever remains. Bounding step one is deliberately out of scope; if it ever becomes the dominant cost, that is a separate change.

5. **Zero or negative remaining time is a clean no-op.** If step one consumed the whole budget, `runAnalysisPipeline` must return a valid summary with `articlesAnalyzed: 0` and `stoppedReason: "time_budget"` — never throw, never start a call it cannot finish. The existing check already runs before the *second* article only (`state.callsMade > 0`), so this needs an explicit pre-loop guard to also stop the first.

6. **`analysisLog.timeBudgetReached` reports the effective budget**, so a cron-shortened run logs the real number rather than a misleading 240,000.

7. No schema, route-method, auth, or UI changes. The cron response shape is unchanged.

## Files likely to change

Modified:

- `lib/config/limits.ts` — add `CRON_PIPELINE_BUDGET_MS`, `ANALYSIS_CALL_ESTIMATE_MS`; document both, including why the cron budget sits below `maxDuration`.
- `lib/pipeline/analysis.ts` — accept `deadline`, resolve the effective deadline and budget, add the pre-loop exhausted-budget guard, widen the pre-call reservation to include `ANALYSIS_CALL_ESTIMATE_MS`, pass the effective budget to the logger.
- `app/api/cron/pipeline/route.ts` — compute the deadline once from `startedAt` and pass it to `runAnalysisPipeline`.

Unchanged on purpose: `app/api/analyze/route.ts`, `lib/pipeline/types.ts`, `lib/pipeline/scheduler.ts`, all Supabase queries, all UI.

## Implementation requirements

### `lib/config/limits.ts`

- `CRON_PIPELINE_BUDGET_MS = 280_000` — wall-clock budget for the whole cron request, below the route's `maxDuration = 300` so the summary is always returned rather than the function being killed mid-flight.
- `ANALYSIS_CALL_ESTIMATE_MS = 30_000` — conservative upper estimate of one analyze+embed slot, reserved before starting a call so a run stops *before* overshooting rather than after.
- Both get a comment explaining the measured numbers they derive from.

### `lib/pipeline/analysis.ts`

- Add to `RunAnalysisPipelineOptions`:
  ```ts
  /** Absolute `Date.now()` instant this run must finish by. Defaults to
   *  `MAX_ANALYSIS_RUN_MS` from the start of the run. Used by the cron route so
   *  analysis inherits the time step one did not consume. */
  deadline?: number;
  ```
- Resolve once near `startedAt`:
  ```ts
  const deadline = options.deadline ?? startedAt + MAX_ANALYSIS_RUN_MS;
  const budgetMs = deadline - startedAt;
  ```
  and store `deadline` on `RunState` as today.
- Before entering the drain/selected path, if `Date.now() + ANALYSIS_CALL_ESTIMATE_MS >= deadline`, set `stoppedReason = "time_budget"`, log via `analysisLog.timeBudgetReached(budgetMs)`, and skip straight to building the summary. No Supabase pending-query, no model call.
- In the batch loop, replace the existing check with one that reserves the call too:
  ```ts
  const reserve = (state.callsMade > 0 ? ANALYSIS_REQUEST_DELAY_MS : 0) + ANALYSIS_CALL_ESTIMATE_MS;
  if (Date.now() + reserve >= state.deadline) { /* stop */ }
  ```
  Note this now guards the **first** article of a batch as well, which the current `state.callsMade > 0` wrapper does not.
- The delay itself still only applies when `state.callsMade > 0`; pacing behaviour is otherwise unchanged.
- `analysisLog.timeBudgetReached` is called with the effective `budgetMs`.
- Rate-limit handling, batching, retry, and embedding logic are untouched.

### `app/api/cron/pipeline/route.ts`

- After `const startedAt = Date.now();`, add `const deadline = startedAt + CRON_PIPELINE_BUDGET_MS;`.
- Step two becomes `await runAnalysisPipeline({ deadline })`.
- Add a short comment stating that step one is unbounded by design and step two inherits the remainder.
- No change to the guard, the response shape, `maxDuration`, or the always-run-step-two behaviour.

### Style

- TypeScript throughout; no `any`; explicit return types on exported functions.
- No unrelated refactors. Do not change `POST /api/analyze` behaviour.

## Security requirements

- No change to authentication: `/api/cron/pipeline` stays `CRON_SECRET`-only with a constant-time compare; the three action routes keep `x-PIXCA-admin-secret`.
- No secret, credential, or raw payload enters a log line, error, or response.
- No new environment variables.
- No client-side code touched; all modules stay server-only.

## Acceptance criteria

1. `GET /api/cron/pipeline` returns a complete JSON summary in under 300 s even when step one is slow — analysis stops early instead of the function being killed.
2. When the budget is exhausted by step one, the analysis summary is valid with `articlesAnalyzed: 0`, `stoppedReason: "time_budget"`, `error: null` — no throw, and no Gemini call is made.
3. A run stops *before* starting a call it cannot finish: no article is attempted when `now + delay + ANALYSIS_CALL_ESTIMATE_MS` is past the deadline.
4. `POST /api/analyze` behaviour is unchanged — it still gets the full `MAX_ANALYSIS_RUN_MS` and its summaries look as they do today.
5. Articles skipped for time remain pending and are picked up by the next run (the LEFT JOIN pending check already guarantees this).
6. `analysisLog.timeBudgetReached` logs the effective budget, so a cron-shortened run does not print 240000.
7. `npm run typecheck`, `npm run lint`, and `npm run build` all pass.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (a route and server modules changed)

## Manual test steps

Start the dev server and watch its terminal — analysis progress and the stop reason are logged there:

```bash
npm run dev
```

1. Confirm `/api/analyze` is unaffected — it should behave exactly as before, draining until pending is empty or a 429 stops it:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
  -H 'Content-Type: application/json' -d '{"limit": 2}'
```

2. Run the full cron chain locally (the secret check is skipped outside production) and check the reported duration:

```bash
curl -s http://localhost:3000/api/cron/pipeline | python3 -m json.tool | head -20
```

`durationMs` must be comfortably below 280,000, and `analysis.stoppedReason` should be `null`, `"rate_limited"`, or `"time_budget"` — never a killed request.

3. Force the exhausted-budget path by temporarily setting `CRON_PIPELINE_BUDGET_MS = 1_000` in `lib/config/limits.ts`, then:

```bash
curl -s http://localhost:3000/api/cron/pipeline | python3 -m json.tool | head -30
```

Expect step one to complete normally, and the analysis block to show `articlesAnalyzed: 0`, `stoppedReason: "time_budget"`, `error: null`, with the terminal logging the 1000 ms budget — not 240000. **Restore the constant to 280_000 afterwards.**

4. Confirm nothing was lost: articles skipped for time are still pending, so re-running analysis picks them up.

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET"
```

5. After deploying, trigger the workflow by hand and confirm the job stays green with a `durationMs` under 280,000:

```bash
gh workflow run hourly-pipeline.yml
gh run watch "$(gh run list --workflow=hourly-pipeline.yml --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```
