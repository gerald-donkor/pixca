# 16 — Oxylabs Scheduler + Vercel Cron (automatic hourly pipeline)

## Goal

Make the scrape → analyze pipeline fully automatic (AGENTS.md section 18).

Deliver all five parts together:

1. **Sync schedules route** — `POST /api/oxylabs/schedules`: one Oxylabs hourly schedule per active source, plus orphan deactivation.
2. **List schedules route** — `GET /api/oxylabs/schedules`: reads stored `oxylabs_schedules` rows.
3. **Runs route** — `GET /api/oxylabs/runs`: reads stored `oxylabs_schedule_runs` rows.
4. **Manual process route** — `POST /api/oxylabs/scheduled-results/process`: turns completed Oxylabs job HTML into articles via the existing scrape-to-insert pipeline.
5. **Cron pipeline** — `vercel.json` cron at `15 * * * *` calling `GET /api/cron/pipeline`, which chains process-results then AI analysis.

No UI work. No schema changes — `oxylabs_schedules` and `oxylabs_schedule_runs` already exist in `supabase/schema.sql`.

## Skills read

- `.agents/skills/oxylabs-web-scraper/SKILL.md` — auth (Basic, `OXY_WSA_USERNAME` / `OXY_WSA_PASSWORD`), `data.oxylabs.io` Push-Pull endpoint, `universal` source payload shape, error-code table.
- `.agents/skills/supabase/SKILL.md` — service-role client for server-only writes, no RLS policies for these tables (service_role only by design), joined-filter gotcha.

## Live Oxylabs Scheduler docs (fetched, per AGENTS.md section 18 — not from memory)

Source: `https://developers.oxylabs.io/products/web-scraper-api/features/scheduler` and the Push-Pull integration page.

| Purpose | Method + path |
| --- | --- |
| Create schedule | `POST https://data.oxylabs.io/v1/schedules` — body `{ cron, items: [...], end_time }`; response has `schedule_id`, `active`, `items_count`, `cron`, `end_time`, `next_run_at` |
| List schedule IDs | `GET https://data.oxylabs.io/v1/schedules` — response `{ "schedules": [ ...ids ] }` |
| Schedule runs (with per-job status) | `GET https://data.oxylabs.io/v1/schedules/{id}/runs` — `runs[].jobs[]` each with `id`, `create_status_code`, `result_status`, `created_at`, `result_created_at` |
| Change schedule state | `PUT https://data.oxylabs.io/v1/schedules/{id}/state` — body `{ "active": false }`, returns `202` with empty body |
| Job results | `GET https://data.oxylabs.io/v1/queries/{job_id}/results` — results retained at least 24h |

`GET /schedules/{id}/jobs` is deliberately **not** used: it returns bare job IDs with no status (AGENTS.md section 18).

## Existing code inspected

- `lib/oxylabs/client.ts` — Realtime `universal` fetch, `OxylabsError` + `OxylabsErrorCode`, retry/backoff, Basic auth header construction. The new scheduler client must reuse these error types and the same credential handling.
- `lib/pipeline/scrape.ts` — `runScrapePipeline({ sources, limitPerSource, fetchHomepageHtml, fetchDetailHtml })`. Already built for this: homepage HTML is injected, so the scheduler supplies job-result HTML and reuses every validation, cleanup, dedupe, and logging step unchanged.
- `lib/pipeline/types.ts` — `HomepageHtmlFetcher`, `ScrapeRunSummary`, `AnalysisRunSummary`.
- `lib/pipeline/run-logger.ts` — `runLog`, `persistRunSummary`, `toMessage`.
- `lib/pipeline/analysis.ts` — `runAnalysisPipeline(options)` → `AnalysisRunSummary`.
- `lib/supabase/queries/oxylabs.ts` — `upsertScheduleForSource`, `listSchedules`, `deactivateSchedule`, `insertScheduleRun`, `listUnprocessedDoneRuns`, `markScheduleRunProcessed`.
- `lib/supabase/queries/sources.ts` — `getActiveSources()`.
- `lib/api/admin-secret.ts` — `requireAdminSecret(request)` → `Response | null`.
- `lib/scraping/render-policy.ts` — `sourceNeedsRender(url)`; detail fetches stay live via `fetchPageHtml`.
- `app/api/scrape/route.ts`, `app/api/analyze/route.ts` — the thin-handler shape, `dynamic = "force-dynamic"`, `maxDuration = 300`, PostHog capture, JSON-body reader. New routes follow the same shape.
- `supabase/schema.sql` — `oxylabs_schedule_id` and `oxylabs_job_id` are `text` columns precisely because these IDs exceed `Number.MAX_SAFE_INTEGER`.
- Repo root has **no** `vercel.json` — it will be created.

## Decisions and assumptions

1. **One schedule per active source** (AGENTS.md section 18), each with a single `items` entry: `{ source: "universal", url: <listing_url>, user_agent_type: "desktop_chrome", geo_location: "United States" }` — the same payload shape `fetchPageHtml` sends, minus `render` (no configured source needs rendering). One schedule per source means the job → schedule → source mapping is unambiguous, and a source can be deactivated independently.
2. **Cron expression `0 * * * *`** (top of every hour) with Vercel Cron 15 minutes later at `15 * * * *`.
3. **`end_time` is required by the API.** Use a centralized far-future constant in `lib/config/limits.ts` rather than a computed date, so re-running sync never churns the stored `schedule_config`.
4. **Sync is idempotent.** A source that already has an active row in `oxylabs_schedules` is left alone; only sources without one get a new Oxylabs schedule. Orphan deactivation then runs unconditionally.
5. **Large-integer precision.** `schedule_id`, run `run_id`, and job `id` are read as exact digit strings from the **raw response text** before any `JSON.parse`. Implemented as a small shared helper that quotes the numeric values of those keys (and bare numbers inside the `schedules` array) in the raw text, then parses — never converting a parsed JS number back to a string. All these IDs stay `string` end to end, matching the `text` DB columns.
6. **Run discovery uses `/runs` only**, filtered to `result_status === "done"`. `pending` and `faulted` jobs are skipped and never fetched.
7. **Idempotent processing.** Each done job is recorded in `oxylabs_schedule_runs` (unique `oxylabs_job_id`); jobs already stored are skipped. Rows are marked `processed = true` after their HTML has been through the pipeline, whether or not it yielded articles — a job's HTML is only worth one attempt.
8. **Only the newest done job per schedule is processed per run.** Older runs of the same source are recorded and marked processed without a pipeline pass: their homepage HTML is stale and would only produce duplicates already covered by the URL existence check, at the cost of Oxylabs detail fetches.
9. **Detail pages are always fetched live** through `fetchPageHtml` (Realtime), including for the scheduler. Only homepage HTML comes from job results.
10. **Cron auth**: Vercel sends `Authorization: Bearer $CRON_SECRET`. Reject missing/wrong with `401`. Skip the check when `process.env.NODE_ENV !== "production"` so it is locally testable. `CRON_SECRET` is never added to `.env.local`; `PIXCA_ADMIN_SECRET` is **not** used to protect the cron route.
11. **Step two always runs.** If process-results throws, the cron route logs it, records it in the response, and still runs analysis — there may be pre-existing unanalyzed articles.
12. `limitPerSource` for scheduled runs defaults to `DEFAULT_ARTICLES_PER_SOURCE` (5); the manual process route may override it via body.

## Files likely to change

New:

- `lib/oxylabs/precise-json.ts` — big-integer-safe raw-text JSON parsing for Oxylabs IDs.
- `lib/oxylabs/scheduler.ts` — server-only Scheduler API client: `createSchedule`, `listOxylabsScheduleIds`, `getScheduleRuns`, `setScheduleActive`, `fetchJobResultHtml`.
- `lib/pipeline/scheduler.ts` — orchestration: `syncSchedules()` and `processScheduledResults(options)`.
- `lib/pipeline/scheduler-logger.ts` — console logging for sync and process runs (or extend `run-logger.ts` if it stays small; prefer a separate module to keep `runLog` scrape-specific).
- `app/api/oxylabs/schedules/route.ts` — `POST` sync + `GET` list.
- `app/api/oxylabs/runs/route.ts` — `GET` stored runs.
- `app/api/oxylabs/scheduled-results/process/route.ts` — `POST` manual process.
- `app/api/cron/pipeline/route.ts` — `GET`, `CRON_SECRET`-protected.
- `vercel.json` — cron registration.

Modified:

- `lib/config/limits.ts` — `OXYLABS_SCHEDULE_CRON`, `OXYLABS_SCHEDULE_END_TIME`, `OXYLABS_SCHEDULE_MAX_RUNS_LOOKBACK`.
- `lib/supabase/queries/oxylabs.ts` — add `findScheduleRunsByJobIds(jobIds)` (chunked `.in()`, ≤ 15 per call, mirroring the URL existence check) and `listScheduleRuns(limit)` for the runs route.
- `lib/pipeline/types.ts` — `ScheduleSyncSummary`, `ScheduledProcessSummary`, `CronPipelineSummary`.
- `.env.example` — document `CRON_SECRET` as Vercel-injected (commented, not a blank assignment).

## Implementation requirements

### `lib/oxylabs/precise-json.ts`

- Export `parseOxylabsJson<T>(rawText: string): T` which, before `JSON.parse`, rewrites unquoted integer values of the keys `schedule_id`, `run_id`, and `id` into quoted strings, and quotes bare integers inside the top-level `schedules` array.
- Export `parseOxylabsResponse<T>(response: Response): Promise<T>` that reads `response.text()` then calls the above.
- Document why: `JSON.parse` silently corrupts these 64-bit IDs.

### `lib/oxylabs/scheduler.ts`

- `import "server-only"` at the top.
- Reuse `OxylabsError` / `OxylabsErrorCode` and `mapStatusToCode`-equivalent behaviour from `lib/oxylabs/client.ts`. Export the shared auth-header + status-mapping helpers from `client.ts` rather than duplicating them.
- All requests: Basic auth, `AbortSignal.timeout(OXYLABS_REQUEST_TIMEOUT_MS)`, `cache: "no-store"`.
- `createSchedule(items, cron, endTime): Promise<{ scheduleId: string; nextRunAt: string | null }>` — POST `/v1/schedules`; schedule ID read via `parseOxylabsResponse`.
- `listOxylabsScheduleIds(): Promise<string[]>` — GET `/v1/schedules`; tolerate an empty/absent `schedules` array.
- `getScheduleRuns(scheduleId): Promise<ScheduleRun[]>` where a run is `{ runId: string; jobs: { id: string; resultStatus: string | null; resultCreatedAt: string | null }[] }`.
- `setScheduleActive(scheduleId, active): Promise<void>` — PUT `/v1/schedules/{id}/state`; accept `200`/`202` and an empty body.
- `fetchJobResultHtml(jobId): Promise<string>` — GET `/v1/queries/{jobId}/results`; return `results[0].content` as a string; throw `OxylabsError("empty_content", ...)` when absent or blank. This response body is not ID-sensitive, so plain `response.json()` is acceptable here.
- Errors must never carry credentials or raw payloads.

### `lib/pipeline/scheduler.ts` — `syncSchedules()`

1. Load active sources.
2. Load stored schedule rows; build a `source_id → row` map.
3. For each active source without an active stored schedule: `createSchedule` with a single item for its `listing_url`, then `upsertScheduleForSource({ sourceId, oxylabsScheduleId, scheduleConfig: { cron, endTime, item }, isActive: true })`.
4. Orphan deactivation: `listOxylabsScheduleIds()`, subtract the IDs stored in `oxylabs_schedules`, and `setScheduleActive(id, false)` for each remainder. Also mark any stored row whose source is no longer active as inactive and deactivate it upstream.
5. Return `ScheduleSyncSummary`: created, existing, deactivatedOrphans, failures with messages, per-source detail.
6. One source failing must not abort the sync.

### `lib/pipeline/scheduler.ts` — `processScheduledResults({ limitPerSource })`

1. Load active stored schedules joined to their sources (fetch separately and join in JS — do not `.eq()` a joined column, per AGENTS.md section 21).
2. For each schedule: `getScheduleRuns`, flatten jobs, keep `result_status === "done"`, sort newest first by `result_created_at`/`created_at`.
3. Skip jobs already present in `oxylabs_schedule_runs` (chunked existence check).
4. Insert a row for each newly seen done job. Take the newest unseen job per schedule as the one to process; mark the rest `processed = true` immediately with a log line explaining they are stale.
5. `fetchJobResultHtml` for the selected jobs, building `Map<listingUrl, html>`.
6. Call `runScrapePipeline({ sources: <sources with HTML>, limitPerSource, fetchHomepageHtml: url => map.get(url) ?? throw, fetchDetailHtml: url => fetchPageHtml(url, { render: sourceNeedsRender(url) }) })`.
7. Mark the processed run rows `processed = true` after the pipeline returns.
8. Return `ScheduledProcessSummary`: schedules checked, done jobs found, jobs skipped as already-seen, jobs stale-skipped, jobs processed, job fetch failures, plus the embedded `ScrapeRunSummary`.
9. When no source has fresh HTML, return early with a `status: "completed"` summary and zero counts — do not call the pipeline.
10. Console logs at each step, mirroring the tone of `runLog`.

### Routes

All follow the thin-handler pattern in `app/api/scrape/route.ts`: `export const dynamic = "force-dynamic"`, `export const maxDuration = 300`, admin-secret guard first, Zod-validated body where a body is accepted, `try/catch` returning `500` with a generic message and a `console.error`.

- `POST /api/oxylabs/schedules` — admin secret; no body; runs `syncSchedules()`.
- `GET /api/oxylabs/schedules` — read-only status route. Per AGENTS.md section 14 `GET` routes are read/status routes; `GET /api/sources` is unauthenticated today, so match it and keep this one unauthenticated. It returns no secrets — only source IDs, Oxylabs schedule IDs, and flags.
- `GET /api/oxylabs/runs` — same treatment; supports `?limit=` (default 50, max 200).
- `POST /api/oxylabs/scheduled-results/process` — admin secret; optional body `{ limitPerSource?: number }` validated against `MAX_ARTICLES_PER_SOURCE`.
- `GET /api/cron/pipeline` — `CRON_SECRET` guard (constant-time compare, reusing the comparison helper by exporting it from `lib/api/admin-secret.ts`); skipped when not production. Runs `processScheduledResults()`, then `runAnalysisPipeline({})` regardless of step-one outcome. Returns `{ scrape: ... | null, scrapeError: string | null, analysis: ..., analysisError: string | null }`. Logs start/finish for both steps.

### `vercel.json`

```json
{
  "crons": [{ "path": "/api/cron/pipeline", "schedule": "15 * * * *" }]
}
```

### Style

- TypeScript throughout; no `any`; explicit return types on exported functions.
- Small functions; server-only modules carry `import "server-only"`.
- No unrelated refactors beyond exporting the two helpers named above from existing modules.

## Security requirements

- `OXY_WSA_USERNAME` / `OXY_WSA_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `PIXCA_ADMIN_SECRET`, `CRON_SECRET` stay server-only; none appear in any response body, log line, or error message.
- Every mutating route requires `x-PIXCA-admin-secret`; the secret is never accepted from the query string.
- `/api/cron/pipeline` is protected by `CRON_SECRET` only, compared in constant time, and must not be callable from a browser in production.
- `CRON_SECRET` is documented in `.env.example` as Vercel-injected and must not be added to `.env.local`.
- No scraping, Oxylabs, or Gemini calls from client components.

## Acceptance criteria

1. `POST /api/oxylabs/schedules` creates exactly one Oxylabs hourly schedule per active source, stores each `schedule_id` as an exact digit string, and is a no-op on the second call.
2. Orphaned Oxylabs schedules (present upstream, absent from `oxylabs_schedules`) are deactivated via `PUT /state`.
3. Stored `oxylabs_schedule_id` and `oxylabs_job_id` values match the digits Oxylabs returned, character for character.
4. Processing uses `/runs`, only `result_status === "done"`, and never fetches results for `pending`/`faulted` jobs.
5. A job is processed at most once — re-running the process route immediately after inserts no new articles and reports jobs as already seen.
6. Processing reuses `runScrapePipeline`; no validation, cleanup, dedupe, or logging logic is duplicated, and a `logs` row is written by `persistRunSummary` as with manual scraping.
7. `GET /api/cron/pipeline` runs analysis even when step one throws.
8. Missing/wrong `CRON_SECRET` in production returns `401`; missing/wrong `x-PIXCA-admin-secret` on the three action routes returns `401`.
9. `vercel.json` registers `/api/cron/pipeline` at `15 * * * *`.
10. `npm run typecheck`, `npm run lint`, and `npm run build` all pass.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (new routes and `vercel.json` affect the build)

## Manual test steps

Start the dev server and watch its terminal — all scheduler, scrape, and analysis progress is logged there:

```bash
npm run dev
```

1. Create the schedules (one-time):

```bash
curl -X POST http://localhost:3000/api/oxylabs/schedules \
  -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET"
```

Expect `created` to equal the number of active sources on the first call, and `created: 0` with `existing: N` on a second call.

2. Confirm the stored rows:

```bash
curl http://localhost:3000/api/oxylabs/schedules
```

Check each `oxylabs_schedule_id` against the digits in the Oxylabs dashboard — no trailing-digit drift.

3. Wait for Oxylabs to run the schedule at the top of the hour, then process the results:

```bash
curl -X POST http://localhost:3000/api/oxylabs/scheduled-results/process \
  -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"limitPerSource": 5}'
```

Expect a summary with `jobsProcessed >= 1` and an embedded scrape summary. Run the same command again immediately — expect `jobsSkippedAlreadySeen` to cover every job and `articlesInserted: 0`.

4. Inspect the recorded runs:

```bash
curl "http://localhost:3000/api/oxylabs/runs?limit=20"
```

5. Exercise the full automatic chain locally (the secret check is skipped outside production):

```bash
curl http://localhost:3000/api/cron/pipeline
```

Expect the terminal to show step one (process scheduled results) then step two (AI analysis), and the response to contain both summaries.

6. Verify auth:

```bash
curl -i -X POST http://localhost:3000/api/oxylabs/schedules            # 401
curl -i -X POST http://localhost:3000/api/oxylabs/scheduled-results/process  # 401
```

7. After deploying, set `CRON_SECRET` in Vercel project settings; Vercel injects it on every cron request. Confirm in the Vercel dashboard that the cron is registered at `15 * * * *`, and that a plain browser request to `/api/cron/pipeline` in production returns `401`.

8. Newly inserted articles appear on the homepage only after analysis sets `analyzed_at` — which the cron route's step two does automatically.
