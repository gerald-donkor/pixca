# Seed Initial Sources

## Goal

Populate the `sources` table (currently empty) with the initial set of real
news sources so scraping has active sources to select from (AGENTS.md
section 8: "Before implementing or running scraping behavior, inspect the
active sources stored in Supabase"). This is a one-time data seed, not a
schema change and not scraping logic.

## Skills read

- `.agents/skills/supabase/SKILL.md` — already read in full for the prior
  `supabase-database.md` prompt; no new Supabase feature is touched here
  (plain `insert` statements against an existing table), so no re-fetch of
  the changelog was needed.

## Existing code inspected

- `supabase/schema.sql` — confirms `sources` columns: `id` (default
  `gen_random_uuid()`), `name`, `listing_url` (`unique`), `parser_strategy`
  (nullable), `is_active` (default `true`), `logo_url` (nullable),
  `created_at`/`updated_at` (defaulted).
- `lib/supabase/queries/sources.ts` — `getActiveSources()` selects
  `is_active = true` ordered by `name`; confirms seeded rows just need
  `is_active` left at its default `true` to be picked up.
- Confirmed with the user which sources to seed (AGENTS.md section 8: do not
  invent source URLs) — the five outlets already used as URL-pattern
  examples in AGENTS.md section 11.

## Decisions / assumptions

1. **Five sources, homepage URLs only** (per AGENTS.md section 9: "Source
   URLs from Supabase are homepage entry pages only"):
   - Reuters — `https://www.reuters.com`
   - NPR — `https://www.npr.org`
   - Fox News — `https://www.foxnews.com`
   - BBC News — `https://www.bbc.com/news` (the news homepage, not the
     general `bbc.com` portal, since AGENTS.md section 11 calls out
     BBC sport/category/live pages as non-article — the news-specific
     homepage is the correct entry point)
   - The Guardian (US edition) — `https://www.theguardian.com/us` (matches
     the `/us/environment` section example already in AGENTS.md section 11)
2. `parser_strategy` and `logo_url` are left `null` for all five rows — no
   source-specific parser is needed yet (generic homepage extraction per
   section 11 applies until a future scraping prompt proves otherwise), and
   no logo asset URLs were provided or found in the repo, so none are
   invented.
3. `is_active` is left at its schema default (`true`) for all five —
   omitted from the `insert` column list rather than stating `true`
   explicitly, so the seed still works unchanged if the schema default ever
   changes.
4. Written as `supabase/seed.sql`, applied by hand via Supabase Dashboard →
   SQL Editor, matching how `supabase/schema.sql` was applied (no Supabase
   CLI or MCP server available in this project).
5. Uses `insert ... on conflict (listing_url) do nothing` so the file is
   safe to re-run without creating duplicates or erroring on the second run.

## Files likely to change

- `supabase/seed.sql` (new) — five `insert` statements (or one multi-row
  `insert`) into `sources`, with the conflict-safe clause from decision 5.

## Implementation requirements

1. One `insert into public.sources (name, listing_url) values (...), (...), ...`
   statement covering all five rows, each with an explicit `name` matching
   the list above.
2. `on conflict (listing_url) do nothing` so re-running the file is a no-op
   for rows that already exist.
3. No other tables are touched. No `parser_strategy`, `logo_url`, or
   `is_active` values are set explicitly — they take the column defaults
   (`null`, `null`, `true`).

## Security requirements

- None beyond what already applies to `supabase/schema.sql` — this is
  static SQL run by hand in the Supabase Dashboard under the project
  owner's own credentials, not executed by application code.

## Acceptance criteria

- `supabase/seed.sql` contains exactly five `insert` rows for the sources
  listed in decision 1, with correct `name` and `listing_url` values.
- Re-running the file after the first run inserts zero additional rows
  (verified by row count staying at 5).
- `getActiveSources()` (`lib/supabase/queries/sources.ts`) returns all five
  rows once applied, since they default to `is_active = true`.

## Checks to run

- No `npm run typecheck` / `lint` / `build` needed — this prompt adds a
  `.sql` file only, no application code changes.

## Manual test steps

1. Open the Supabase Dashboard → SQL Editor for the project in
   `.env.local`'s `NEXT_PUBLIC_SUPABASE_URL`.
2. Paste and run the full contents of `supabase/seed.sql`.
3. In the Table Editor, open `sources` and confirm 5 rows exist with the
   correct `name` / `listing_url` values and `is_active = true`.
4. Re-run the same SQL and confirm the row count stays at 5 (no duplicates).
5. From the project root, run the same smoke test used for
   `supabase-database.md`, updated to show the seeded rows:
   ```bash
   npx tsx -e "
   import { getActiveSources } from './lib/supabase/queries/sources';
   getActiveSources().then(r => console.log(r));
   "
   ```
   and confirm it prints all 5 seeded sources.
</content>
