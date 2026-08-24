# 30 — Pipeline Logs API Route and Observability Endpoint

## Goal

Implement the read/status `GET /api/logs` API endpoint (as required by `AGENTS.md` §1 and §14) to enable querying and inspecting recorded scraping, analysis, and system pipeline logs stored in Supabase with limit and level filtering.

---

## Skills read

- `.agents/skills/supabase/SKILL.md` — Server-side Supabase queries, service role client usage, and schema alignment.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review feedback evaluation.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.
- `node_modules/next/dist/docs/` — Route handlers, server runtime, query parameter extraction, and JSON responses.

---

## Existing code inspected

- `lib/supabase/queries/logs.ts` — Existing `getRecentLogs({ limit })` and `insertLog(entry)` functions.
- `lib/supabase/types.ts` — `LogEntry`, `LogLevel` (`'info' | 'warn' | 'error'`), and `Database` type definitions.
- `lib/config/limits.ts` — Centralized project limits (`DEFAULT_SCHEDULE_RUNS_LIMIT`, `MAX_SCHEDULE_RUNS_LIMIT`, etc.).
- `app/api/sources/route.ts` & `app/api/oxylabs/runs/route.ts` — Thin GET route handler patterns for unauthenticated status/read endpoints.

---

## Decisions and assumptions

1. **API Method & Scoping**:
   - `GET /api/logs`: In accordance with `AGENTS.md` §14 ("Use `GET` only for read/status routes: `GET /api/logs`").
   - Unauthenticated read/status endpoint (like `GET /api/sources`, `GET /api/oxylabs/schedules`, and `GET /api/oxylabs/runs`), returning only system log messages, levels, timestamps, and context JSON without exposing credentials or secrets (`AGENTS.md` §15).
2. **Query Parameters & Validation**:
   - `limit` (optional): Defaults to `DEFAULT_LOGS_LIMIT = 50`. Clamped to integer between `1` and `MAX_LOGS_LIMIT = 200`. Invalid limits return HTTP 400.
   - `level` (optional): Filter to `'info' | 'warn' | 'error'`. Invalid levels return HTTP 400.
3. **Database Query Extension**:
   - Update `lib/supabase/queries/logs.ts` to accept optional `level?: LogLevel` alongside `limit: number` and order rows by `created_at desc`.
4. **Limits Centralization**:
   - Export `DEFAULT_LOGS_LIMIT = 50` and `MAX_LOGS_LIMIT = 200` in `lib/config/limits.ts`.

---

## Files likely to change

- `lib/config/limits.ts` [MODIFY] — Add `DEFAULT_LOGS_LIMIT` and `MAX_LOGS_LIMIT`.
- `lib/supabase/queries/logs.ts` [MODIFY] — Extend `getRecentLogs` to filter by optional `level`.
- `app/api/logs/route.ts` [NEW] — Route handler for `GET /api/logs` with parameter validation and JSON response.

---

## Implementation requirements

### 1. `lib/config/limits.ts`
- Add constants:
  ```typescript
  /** Stored logs returned by GET /api/logs by default. */
  export const DEFAULT_LOGS_LIMIT = 50;

  /** Upper bound the logs route will accept for ?limit=. */
  export const MAX_LOGS_LIMIT = 200;
  ```

### 2. `lib/supabase/queries/logs.ts`
- Update `getRecentLogs` signature and implementation:
  ```typescript
  export async function getRecentLogs({
    limit,
    level,
  }: {
    limit: number;
    level?: LogLevel;
  }): Promise<LogEntry[]> {
    let query = getSupabaseAdminClient()
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (level) {
      query = query.eq("level", level);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }
  ```

### 3. `app/api/logs/route.ts`
- Export `export const dynamic = "force-dynamic"`.
- Implement `GET(request: NextRequest): Promise<Response>`:
  - Extract and validate `limit` search parameter (default `50`, max `200`).
  - Extract and validate `level` search parameter (`info`, `warn`, `error`).
  - Fetch logs via `getRecentLogs({ limit, level })`.
  - Return JSON payload:
    ```typescript
    {
      logs: [
        {
          id: string,
          level: LogLevel,
          message: string,
          context: Record<string, unknown> | null,
          createdAt: string
        }
      ],
      count: number
    }
    ```
  - Catch errors safely and return 500 JSON `{ error: "Failed to load logs." }`.

---

## Security requirements

- Server-side only query execution via `lib/supabase/queries/logs.ts` with `getSupabaseAdminClient()`.
- Log context sanitized: pipeline logger only stores operational metrics, no raw secret tokens or credentials.
- `limit` bounded to max 200 to prevent database query exhaustion.

---

## Acceptance criteria

1. Calling `GET /api/logs` returns HTTP 200 with the recent logs array and `count`.
2. Calling `GET /api/logs?limit=10` returns up to 10 log entries.
3. Calling `GET /api/logs?level=info` returns only log entries where `level === 'info'`.
4. Calling `GET /api/logs?limit=invalid` or `GET /api/logs?level=invalid` returns HTTP 400 with descriptive error.
5. `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Start dev server: `npm run dev`.
2. Test default logs retrieval:
   ```bash
   curl -s "http://localhost:3000/api/logs" | jq .
   ```
3. Test limit parameter:
   ```bash
   curl -s "http://localhost:3000/api/logs?limit=5" | jq .
   ```
4. Test level filter parameter:
   ```bash
   curl -s "http://localhost:3000/api/logs?level=info" | jq .
   ```
5. Test invalid limit handling (expect HTTP 400):
   ```bash
   curl -s -i "http://localhost:3000/api/logs?limit=999"
   ```
