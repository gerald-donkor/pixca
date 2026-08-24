# 33 — Cron Pipeline & API Error Formatter Unification

## Goal

Unify error handling and formatting across all API and pipeline entry points (`app/api/cron/pipeline/route.ts`, `app/api/logs/route.ts`, `app/api/oxylabs/runs/route.ts`, `app/api/oxylabs/schedules/route.ts`, `app/api/sources/route.ts`, `app/api/scrape/route.ts`, `app/api/analyze/route.ts`, `app/api/oxylabs/scheduled-results/process/route.ts`) by replacing fragmented, naive `error instanceof Error ? error.message : "Unknown error"` implementations with the enriched, shared `toMessage()` utility from `lib/pipeline/run-logger.ts`.

---

## Skills read

- `.agents/skills/supabase/SKILL.md` — Database queries and error properties (`details`, `hint`, `code`).
- `.agents/skills/ai-sdk/SKILL.md` — AI SDK error handling and model failures.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review request protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review evaluation protocol.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- `lib/pipeline/run-logger.ts` — Shared `toMessage(error: unknown)` utility handling `Error` objects, PostgREST error objects with `message`/`details`/`hint`/`code`, plain strings, and safe JSON serialization.
- `app/api/cron/pipeline/route.ts` — Local `toSafeMessage` function in hourly cron pipeline execution.
- `app/api/logs/route.ts` — Local `toSafeMessage` function in logs query endpoint.
- `app/api/oxylabs/runs/route.ts` — Local `toSafeMessage` function in Oxylabs run query endpoint.
- `app/api/oxylabs/schedules/route.ts` — Local `toSafeMessage` function in schedule sync and list endpoints.
- `app/api/sources/route.ts` — Local `toSafeMessage` function in sources query endpoint.
- `app/api/scrape/route.ts` — Inline ternary error stringifier in scrape execution route.
- `app/api/analyze/route.ts` — Inline ternary error stringifier in analysis execution route.
- `app/api/oxylabs/scheduled-results/process/route.ts` — Inline ternary error stringifier in scheduled results process route.

---

## Decisions and assumptions

1. **Centralized Error Serialization**:
   - Every API route and pipeline runner must import `toMessage` from `@/lib/pipeline/run-logger`.
   - Remove redundant local `toSafeMessage` helper definitions in route files.
   - Replace inline `error instanceof Error ? error.message : "Unknown error"` patterns across API catch blocks with `toMessage(error)`.
2. **PostgREST & Upstream Detail Preservation**:
   - Ensures that PostgREST connection errors, schema mismatches, and Oxylabs/AI SDK custom error objects preserve their full context (`details`, `hint`, `code`) in server logs without exposing internal stacks or secrets to public JSON error responses.

---

## Files likely to change

- `app/api/cron/pipeline/route.ts` [MODIFY] — Import `toMessage` and remove local `toSafeMessage`.
- `app/api/logs/route.ts` [MODIFY] — Import `toMessage` and remove local `toSafeMessage`.
- `app/api/oxylabs/runs/route.ts` [MODIFY] — Import `toMessage` and remove local `toSafeMessage`.
- `app/api/oxylabs/schedules/route.ts` [MODIFY] — Import `toMessage` and remove local `toSafeMessage`.
- `app/api/sources/route.ts` [MODIFY] — Import `toMessage` and remove local `toSafeMessage`.
- `app/api/scrape/route.ts` [MODIFY] — Import `toMessage` and replace inline error stringifier.
- `app/api/analyze/route.ts` [MODIFY] — Import `toMessage` and replace inline error stringifier.
- `app/api/oxylabs/scheduled-results/process/route.ts` [MODIFY] — Import `toMessage` and replace inline error stringifier.

---

## Implementation requirements

1. In each of the target route files:
   - Import `{ toMessage }` from `@/lib/pipeline/run-logger`.
   - Replace calls to `toSafeMessage(error)` or inline `error instanceof Error ? error.message : "Unknown error"` with `toMessage(error)`.
   - Remove dead local `toSafeMessage` helper declarations.
2. In `app/api/cron/pipeline/route.ts`:
   - Set `summary.scrapeError = toMessage(error);` and `summary.analysisError = toMessage(error);`.

---

## Security requirements

- Server-side error logs may contain enriched operational details (`details`, `hint`, `code`), but public client HTTP responses must continue to return generic, safe error messages (e.g. `{ error: "Analysis run failed." }`) with appropriate 4xx/5xx HTTP status codes.
- No auth tokens or secrets may be formatted into error strings.

---

## Acceptance criteria

1. All target API routes and the hourly cron route use `toMessage` from `@/lib/pipeline/run-logger`.
2. No duplicate `toSafeMessage` helper declarations remain in `app/api/`.
3. `npm run typecheck`, `npm run lint`, and `npm run build` pass cleanly with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Query sources endpoint:
   ```bash
   curl -s "http://localhost:3000/api/sources" | jq .
   ```
2. Query logs endpoint:
   ```bash
   curl -s "http://localhost:3000/api/logs?limit=5" | jq .
   ```
3. Query schedules endpoint:
   ```bash
   curl -s "http://localhost:3000/api/oxylabs/schedules" | jq .
   ```
4. Test cron pipeline execution locally:
   ```bash
   curl -s "http://localhost:3000/api/cron/pipeline" | jq .
   ```
