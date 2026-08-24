# 38 — System Health and Service Status API

## Goal

Provide a lightweight, public-safe `GET /api/health` endpoint that checks Supabase database connectivity, reports database response latency, verifies environment variable configuration status without exposing sensitive credentials, and provides standard health check status (`ok` / `degraded`) for uptime monitors, status dashboards, and deployment verification.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js Route Handlers and dynamic response generation.
- `.agents/skills/supabase/SKILL.md` — Database queries, service role client access, and connection error handling.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit standards.

---

## Existing code inspected

- `lib/supabase/admin.ts` — `getSupabaseAdminClient` initialization.
- `lib/supabase/queries/sources.ts` — Source queries and database interactions.
- `app/api/sources/route.ts` — Public GET route pattern.
- `app/api/logs/route.ts` — Log querying and error handling.
- `lib/pipeline/run-logger.ts` — `toMessage` error formatting utility.

---

## Decisions and assumptions

1. **HTTP Method & Routing**:
   - `GET /api/health` is a read/status route conforming strictly to `AGENTS.md` Section 14.
   - Set `export const dynamic = "force-dynamic"` to guarantee real-time probing without static route caching.
2. **Zero Credential / Secret Exposure**:
   - The endpoint must never return raw tokens, passwords, database connection strings, or admin secrets.
   - Environment status is reported strictly as boolean flags (e.g. `supabase: true`, `clerk: true`, `gemini: true`, `oxylabs: true`, `cron: true`, `adminSecret: true`).
3. **Low-Latency Database Health Probe**:
   - Implement `checkDatabaseHealth()` in `lib/supabase/queries/health.ts`.
   - Probe database with a lightweight `select('count', { count: 'exact', head: true })` on `sources`.
   - Measure query round-trip latency in milliseconds (`latencyMs`).
   - Timeout protection: abort query if it exceeds 3000ms.
4. **Structured Status & HTTP Status Codes**:
   - Response schema:
     ```json
     {
       "status": "ok" | "degraded",
       "timestamp": "2026-08-24T18:00:00.000Z",
       "uptime": 123.45,
       "checks": {
         "database": {
           "status": "connected" | "error",
           "latencyMs": 42,
           "activeSources": 5,
           "error": null
         },
         "environment": {
           "supabase": true,
           "clerk": true,
           "gemini": true,
           "oxylabs": true,
           "cron": true,
           "adminSecret": true
         }
       }
     }
     ```
   - If database is connected and core environment variables are present, return HTTP 200 with status `"ok"`.
   - If database query fails or throws, return HTTP 503 with status `"degraded"` and safe error message.

---

## Files likely to change

- `lib/supabase/queries/health.ts` [NEW] — Database health probe querying `sources` count and timing latency.
- `app/api/health/route.ts` [NEW] — `GET /api/health` route handler assembling health check payload.

---

## Implementation requirements

1. **`lib/supabase/queries/health.ts`**:
   - Export `async function checkDatabaseHealth(): Promise<{ status: "connected" | "error"; latencyMs: number; activeSources?: number; error?: string }>`
   - Use `getSupabaseAdminClient()` to query active sources with exact count or limit 1.
   - Wrap in `try/catch` and calculate duration with `performance.now()`.
2. **`app/api/health/route.ts`**:
   - Define `export const dynamic = "force-dynamic"`.
   - Inspect environment variable presence:
     - `NEXT_PUBLIC_SUPABASE_URL` && `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` && `CLERK_SECRET_KEY`
     - `GOOGLE_GENERATIVE_AI_API_KEY`
     - `OXY_WSA_USERNAME` && `OXY_WSA_PASSWORD`
     - `CRON_SECRET`
     - `PIXCA_ADMIN_SECRET`
   - Compute `process.uptime()` or timestamp.
   - Return formatted JSON response with status 200 or 503 depending on database reachability.

---

## Security requirements

- Never return env var strings or sensitive secrets in the response payload.
- No mutating database operations.
- Ensure error messages sanitized via `toMessage` do not expose connection strings with passwords.

---

## Acceptance criteria

1. Calling `GET /api/health` returns HTTP 200 with JSON payload containing `status: "ok"`, `checks.database.status: "connected"`, and latency metrics.
2. No sensitive credentials, keys, or URLs are present in the response.
3. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run verification checks:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
2. Test health check endpoint:
   ```bash
   curl -s "http://localhost:3000/api/health" | jq .
   ```
3. Confirm response has:
   - `status: "ok"`
   - `checks.database.status: "connected"`
   - `checks.database.latencyMs` as positive number
   - `checks.environment` with boolean flags only
