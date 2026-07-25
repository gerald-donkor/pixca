# Supabase Database and Data Access

## Goal

Stand up Supabase as the source of truth for PIXCA (AGENTS.md section 7): the
core schema (`sources`, `articles`, `article_analyses`, `logs`,
`oxylabs_schedules`, `oxylabs_schedule_runs`), a server-only Supabase client,
generated-by-hand TypeScript types, and typed data-access query functions.
This is infrastructure only — no API routes, scraping, AI analysis, or UI
wiring. Those land in separate prompts (`oxylabs-scraping.md`,
`ai-analysis.md`, `oxylabs-scheduler.md`) that will import these query
functions.

The `embedding vector(1536)` column and pgvector are explicitly **out of
scope** here (AGENTS.md section 20 — added only after AI analysis works).

## Skills read

- `.agents/skills/supabase/SKILL.md` — core principles, security checklist,
  CLI/MCP workflow guidance, declarative-vs-imperative schema decision.
- Fetched `https://supabase.com/changelog.md` per the skill's principle 1.
  Relevant finding: **"New tables in the public schema will no longer be
  exposed to the Data API by default"** (cutoff already passed as of today).
  This lines up with the RLS design below — we never grant `anon` /
  `authenticated` access, so this change has no negative effect on us.

## Existing code inspected

- No `supabase/` directory, no `supabase/config.toml`, and no Supabase CLI
  installed (`supabase --version` → not found). No `.mcp.json` / Supabase MCP
  server configured either — I cannot run `execute_sql` or `apply_migration`
  directly against the live project from here.
- `.env.local` already has real values for `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, so a
  Supabase project already exists. `.env.local` also has
  `BIASLY_ADMIN_SECRET` (leftover from the pre-rename "Skew"/"Biasly" name) —
  not touched by this prompt since admin-secret-protected routes don't exist
  yet; flagging it so the first route-adding prompt renames it to
  `PIXCA_ADMIN_SECRET`.
- `.env.example` currently only documents Clerk vars — Supabase vars are
  missing and need adding per AGENTS.md section 21's table.
- `@supabase/supabase-js` is not in `package.json` or `node_modules` — needs
  installing. `server-only` **is** already installed and used elsewhere is
  not yet true, but the package exists in `node_modules` so it's available.
- `app/page.tsx` (home feed) and `app/article/[id]/page.tsx` (details page)
  currently render hardcoded mock arrays (`ARTICLES`, `RELATED_STORIES`) —
  confirms the shape UI code will eventually expect: `title`, `category`
  (not a stored field — derived from... actually not present in schema),
  `location`, `imageUrl`, `sourcesCount`, `bias: {left, center, right}`,
  `timeAgo`, `readTime`. These pages are **not** rewired to real data in this
  prompt (that's a future UI-wiring prompt); noting the shape only so the
  query return types are usable later without rework.
- `app/article/[id]/page.tsx` is an async Server Component already using
  `await auth.protect()` (Clerk) — confirms Server Components are the
  intended place to call Supabase queries directly (no client-side fetch
  layer needed for reads).
- `tsconfig.json` has the `@/*` path alias — new modules use it.

## Decisions / assumptions

1. **No Supabase CLI / MCP available**, so schema changes are authored by
   hand in `supabase/schema.sql` and applied by the user via the Supabase
   Dashboard → SQL Editor, exactly as AGENTS.md section 7 already prescribes
   ("run the corresponding ALTER SQL in Supabase Dashboard → SQL Editor
   before testing"). This is an imperative, hand-maintained single-file
   schema — not the CLI's declarative/migration workflow.
2. **Access model / RLS**: this app has no per-user rows and no Supabase
   Auth (explicitly forbidden). All reads happen from Server Components /
   route handlers using the service-role client; all writes happen from
   server-only pipeline code, also service-role. Nothing in the browser ever
   talks to Supabase directly. So: enable RLS on all 6 tables (required
   whenever a table sits in an exposed schema, per the skill's security
   checklist) and add **zero** policies for `anon`/`authenticated` — default
   deny. `service_role` bypasses RLS entirely regardless of policies, so the
   pipeline is unaffected. This also means the Data API auto-exposure change
   in the changelog doesn't matter to us — we never intend `anon` to reach
   these tables.
3. **IDs**: `uuid primary key default gen_random_uuid()` for all tables
   (Postgres 13+ has `gen_random_uuid()` built in via `pgcrypto`/`pgcrypto`
   is preloaded on Supabase — no extension needed).
4. **`oxylabs_schedule_id` and future Oxylabs job IDs are stored as `text`,
   never `integer`/`bigint`**, per AGENTS.md section 18's large-integer
   precision warning — these columns only ever receive strings extracted
   from raw HTTP response text, never `JSON.parse`'d numbers.
5. **`oxylabs_schedules`/`oxylabs_schedule_runs` are minimal placeholders**
   for this prompt — one row per active source with a `schedule_config
   jsonb` column to hold whatever payload/response fields Oxylabs' live
   Scheduler API actually needs. AGENTS.md section 18 requires fetching that
   API's current docs before implementing Scheduler behavior, so I'm not
   guessing field names now; the future `oxylabs-scheduler.md` prompt may
   `ALTER TABLE` to add specific columns once those docs are read. This
   prompt only guarantees the tables, PK/FK shape, and the large-integer-safe
   `text` ID columns exist.
6. **`article_analyses.article_id` is `unique`** (one analysis per article),
   which is what makes the LEFT JOIN pending-analysis check in AGENTS.md
   section 19 well-defined.
7. **Dedupe columns**: `articles.original_url` and `articles.canonical_url`
   are both `unique` — AGENTS.md section 10 says dedupe on both.
8. **Percentage sum constraint**: a `CHECK` constraint enforces
   `left_percentage + center_percentage + right_percentage = 100` on
   `article_analyses`, matching AGENTS.md section 19.
9. **Query functions return joined, UI-shaped data** where natural (e.g.
   article + source name + analysis in one call for the details page) since
   `.eq('foreignTable.column', …)` is broken in supabase-js per AGENTS.md's
   Supabase joined-table filter gotcha — joins are fetched unfiltered and
   any additional filtering happens in JS after the query returns.
10. Types are hand-written in `lib/supabase/types.ts` (no CLI `gen types`
    available) as a `Database` type plus per-table `Row`/`Insert`/`Update`
    aliases, kept in sync with `supabase/schema.sql` per AGENTS.md section 7.

## Files likely to change

- `supabase/schema.sql` (new) — full DDL: tables, constraints, indexes, RLS
  enable statements, `updated_at` triggers for `sources`/`oxylabs_schedules`.
- `lib/supabase/types.ts` (new) — `Database` type + Row/Insert/Update types
  per table.
- `lib/supabase/admin.ts` (new) — `import "server-only"`; exports
  `getSupabaseAdminClient()`, a memoized service-role `SupabaseClient<Database>`
  factory using `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL`.
- `lib/supabase/queries/sources.ts` (new) — `getActiveSources()`,
  `getSourceById(id)`.
- `lib/supabase/queries/articles.ts` (new) — `getPublishedArticles({limit,
  offset})` (analyzed articles for the home feed, joined to source + latest
  analysis, ordered by `published_at desc`), `getArticleWithAnalysis(id)`
  (single article + source + analysis for the details page),
  `findExistingOriginalUrls(urls)` (the chunked-≤15 **URL existence check**
  from AGENTS.md section 9), `insertArticle(article)` (single append-only
  insert), `getPendingAnalysisArticles({limit})` (LEFT JOIN
  `articles`→`article_analyses` where no analysis row exists — the
  **pending-analysis check** from section 19).
- `lib/supabase/queries/analyses.ts` (new) — `insertArticleAnalysis(data)`,
  `markArticleAnalyzed(articleId)`.
- `lib/supabase/queries/logs.ts` (new) — `insertLog(entry)`,
  `getRecentLogs({limit})`.
- `lib/supabase/queries/oxylabs.ts` (new) — `upsertScheduleForSource(...)`,
  `listSchedules()`, `deactivateSchedule(oxylabsScheduleId)`,
  `insertScheduleRun(...)`, `listUnprocessedDoneRuns()`,
  `markScheduleRunProcessed(id)`.
- `.env.example` — add the Supabase rows from AGENTS.md section 21's table
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`).
- `package.json` — add `@supabase/supabase-js`.

## Implementation requirements

1. Install `@supabase/supabase-js` (latest) as a real dependency (pinned
   version + committed lockfile, per the skill's supply-chain guidance).
2. `supabase/schema.sql` creates, in order: `sources`, `articles` (FK →
   `sources`), `article_analyses` (FK → `articles`, unique), `logs`,
   `oxylabs_schedules` (FK → `sources`, unique), `oxylabs_schedule_runs` (FK
   → `oxylabs_schedules`). Every table gets `enable row level security`
   immediately after creation and a comment noting "service_role only — no
   anon/authenticated policies by design." Add `updated_at` trigger function
   + triggers for `sources` and `oxylabs_schedules` (the only tables with an
   `updated_at` column).
3. `lib/supabase/admin.ts` must not be importable from a Client Component —
   guard with `import "server-only"` at the top so any accidental client
   import fails the build.
4. Query functions take/return typed values from `lib/supabase/types.ts`,
   never `any`. Each function is small and single-purpose (no combined
   read+write helpers).
5. `findExistingOriginalUrls(urls: string[])` must chunk into groups of ≤15
   before each `.in('original_url', chunk)` call, per the **URL existence
   check** rule, and return a `Set<string>` of URLs that already exist.
6. `getPendingAnalysisArticles` must implement the LEFT JOIN semantics
   exactly: articles with **no** `article_analyses` row, not articles where
   `analyzed_at is null`. Use a `!inner`/left-join Supabase select with a
   post-query JS filter for `article_analyses === null` if PostgREST's
   embedded-resource filter syntax can't express "no matching row" directly.
7. `insertArticle` performs a plain insert (append-only, per section 10) and
   surfaces a unique-violation (Postgres code `23505`) as a distinguishable
   return value/error rather than throwing an opaque error, so future
   scraping code can treat "duplicate" as expected, not a failure.
8. No table is ever truncated, deleted from, or reset by any query function
   in this prompt.

## Security requirements

- `SUPABASE_SERVICE_ROLE_KEY` is read only inside `lib/supabase/admin.ts`,
  which is `server-only`-guarded. It must never reach a Client Component,
  route handler response body, or log line.
- RLS enabled on all 6 tables with no `anon`/`authenticated` policies
  (default deny) — service-role access is unaffected since it bypasses RLS.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is declared in `.env.example` per the
  section 21 table but is **not used by any code in this prompt** — there is
  no browser Supabase client, since nothing in the current UI needs
  client-side Supabase reads.

## Acceptance criteria

- `supabase/schema.sql` contains the full DDL for all 6 tables matching
  AGENTS.md section 7 field lists (minus the deferred `embedding` column),
  with RLS enabled and no permissive policies.
- `lib/supabase/types.ts` types match the schema exactly (column names,
  nullability, unions for `sentiment_label`/`bias_label`).
- `getSupabaseAdminClient()` in `lib/supabase/admin.ts` throws a clear error
  if `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_URL` is missing,
  rather than silently constructing a broken client.
- All query functions listed above exist, are typed, and contain no `any`.
- `.env.example` and the AGENTS.md section 21 table stay in sync (Supabase
  rows added to `.env.example`).
- `npm run typecheck` and `npm run lint` pass.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` is **not** required for this prompt alone (no routes/pages
  change), but I'll run it anyway since new server-only modules can
  occasionally surface bundling issues — flag if it's slow/unnecessary and
  I'll skip it next time.

## Manual test steps

1. Open the Supabase Dashboard → SQL Editor for the project referenced by
   `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`.
2. Paste and run the full contents of `supabase/schema.sql`.
3. In the Table Editor, confirm all 6 tables exist with RLS marked "Enabled"
   and no policies listed.
4. From the project root, run:
   ```bash
   npm run typecheck
   npm run lint
   ```
   and confirm both pass.
5. As a smoke test of the client wiring (temporary, not committed), run:
   ```bash
   npx tsx -e "
   import { getSupabaseAdminClient } from './lib/supabase/admin';
   getSupabaseAdminClient().from('sources').select('*').then(r => console.log(r));
   "
   ```
   and confirm it returns `{ data: [], error: null }` (empty since no
   sources are inserted yet) rather than an auth/connection error.
</content>
