# 39 — Pipeline Logs and System Status Dashboard UI

## Goal

Implement a responsive, accessible System Status and Pipeline Logs dashboard page at `app/logs/page.tsx` and interactive log inspector component `components/ui/logs-viewer.tsx` that displays live service health metrics, database latency, and pipeline execution logs with real-time log-level filtering (`info`, `warn`, `error`), text search, expandable JSON context inspector, auto-refresh polling toggle, and GSAP-animated entry transitions.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router, Server and Client Component boundaries, dynamic rendering with `await connection()`.
- `.agents/skills/supabase/SKILL.md` — Database queries, service role client access, and schema alignment with `logs` and `sources`.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Scoped `useGSAP()` transitions for log cards, status badges, and expandable drawers.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `lib/supabase/queries/logs.ts` — `getRecentLogs({ limit, level })` server query function.
- `lib/supabase/queries/health.ts` — `checkDatabaseHealth()` measuring latency and active source counts.
- `app/api/logs/route.ts` — `GET /api/logs` read/status endpoint with `limit` and `level` query parameters.
- `app/api/health/route.ts` — `GET /api/health` system health endpoint.
- `components/layout/footer.tsx` — Global footer navigation links.
- `components/ui/` — Existing design tokens, chips, badges, buttons, and animations.

---

## Decisions and assumptions

1. **Page Structure & Server/Client Boundaries**:
   - `app/logs/page.tsx` is an async Server Component with `await connection()` for read-at-request-time execution.
   - It fetches initial data directly on the server via `getRecentLogs({ limit: 100 })` and `checkDatabaseHealth()`.
   - Passes initial logs, health data, and timestamp down to `components/ui/logs-viewer.tsx` (Client Component).
2. **Client-Side Interactivity**:
   - **Level Filter Tabs**: `All`, `Info`, `Warn`, `Error` with active count badges.
   - **Text Search**: Real-time filtering across log messages and context JSON keys/values.
   - **Auto-Refresh Toggle**: Optional live polling toggle (e.g. every 10s) fetching fresh logs from `GET /api/logs` with animated refresh indicator.
   - **Expandable Context Inspector**: Modal or accordion drawer to inspect structured `context` JSON payloads with copy-to-clipboard functionality.
   - **Clear Status Card**: Header summary card showing Database status (`connected` / `error`), Query Latency (e.g., `24ms`), and Active Sources count.
3. **GSAP Micro-Animations**:
   - Use `useGSAP` with scoped `containerRef` to animate log item arrivals (`autoAlpha: 0, y: 10, stagger: 0.03`).
   - Respect `prefers-reduced-motion`.
4. **Zero Sensitive Credential Exposure**:
   - Only operational metadata, sanitized messages, and public status are displayed.
5. **Footer Navigation**:
   - Connect the footer link to `/logs` with title "System Status".

---

## Files likely to change

- `app/logs/page.tsx` [NEW] — Status and logs dashboard page (Server Component with metadata & initial SSR data).
- `components/ui/logs-viewer.tsx` [NEW] — Interactive logs inspector Client Component (filtering, search, JSON explorer, GSAP animations).
- `components/layout/footer.tsx` [MODIFY] — Link "Help Center" or "Status" in footer to `/logs`.

---

## Implementation requirements

1. **`app/logs/page.tsx`**:
   - Define page metadata with title `"System Status & Pipeline Logs — Pixca News"`.
   - Call `await connection()` before querying.
   - Concurrently fetch `getRecentLogs({ limit: 100 })` and `checkDatabaseHealth()`.
   - Render page layout with breadcrumb/header, health metrics summary cards, and `<LogsViewer />`.
2. **`components/ui/logs-viewer.tsx`**:
   - Client Component (`"use client"`).
   - Accept `initialLogs: LogEntry[]` and `initialHealth: DatabaseHealthCheck`.
   - State for `filterLevel` (`'all' | 'info' | 'warn' | 'error'`), `searchQuery`, `autoRefresh`, and `selectedLog` for detail modal.
   - Include refresh button with spinner and timestamp of last check.
   - Style log rows with distinct badges:
     - `info`: Slate/Blue badge with `Info` icon.
     - `warn`: Amber badge with `AlertTriangle` icon.
     - `error`: Rose/Red badge with `XCircle` icon.
   - Format timestamps nicely (relative time + absolute ISO on hover).
   - Render JSON viewer inside a clean collapsible drawer or popover with formatted syntax styling.
3. **`components/layout/footer.tsx`**:
   - Update footer navigation to include `<Link href="/logs">Status</Link>`.

---

## Security requirements

- Server-side queries must use `server-only` safe queries.
- Client component only interacts with public `GET /api/logs` or initial props; never touches private environment variables or secrets.

---

## Acceptance criteria

1. Navigating to `/logs` renders the System Status & Pipeline Logs dashboard with real-time health metrics.
2. Filter tabs (`All`, `Info`, `Warn`, `Error`) dynamically filter logs instantly.
3. Text search filters logs by message text or context.
4. Expanding a log entry displays formatted context JSON with a functional copy button.
5. Manual refresh button fetches the latest logs without full page reload.
6. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

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
2. Navigate to `http://localhost:3000/logs` in the browser:
   - Verify health cards display database status, active sources, and latency.
   - Switch between `All`, `Info`, `Warn`, and `Error` tabs.
   - Type a query into the search bar to filter log messages.
   - Click on a log with context to view the formatted JSON inspector.
3. Click the "Status" link in the footer to verify navigation.
