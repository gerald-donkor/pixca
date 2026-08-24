# 37 — UUID Validation and Graceful 404 Fallback for Article Routes

## Goal

Add UUID validation and PostgREST `22P02` syntax error handling across Supabase query functions to prevent database runtime crashes when querying invalid or non-UUID identifiers, ensuring invalid article routes seamlessly render the custom `app/not-found.tsx` 404 page without console errors or server 500 exceptions.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router dynamic route parameters and `notFound()` handling.
- `.agents/skills/supabase/SKILL.md` — PostgREST error codes, safe querying, and database integrity.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit standards.

---

## Existing code inspected

- `lib/supabase/queries/articles.ts` — `getArticleWithAnalysis(id)` and `getRelatedArticles(articleId, embedding)`.
- `lib/supabase/queries/sources.ts` — `getSourceById(id)`.
- `app/article/[id]/page.tsx` — `generateMetadata` and `ArticleDetailsPage` consuming `getArticleWithAnalysis`.
- `lib/utils.ts` — Common helper utilities.

---

## Decisions and assumptions

1. **Upfront UUID Validation (`isValidUuid`)**:
   - Create a type-safe `isValidUuid` helper checking standard 36-character hexadecimal UUID format (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`).
   - If an invalid UUID is passed to single-record lookups (`getArticleWithAnalysis`, `getSourceById`, `getRelatedArticles`), return `null` (or empty array for related articles) immediately without firing a doomed network request to Supabase.
2. **Postgres Error Code Resilience (`22P02`)**:
   - If PostgreSQL ever returns error code `22P02` (`invalid input syntax for type uuid`) or `PGRST116` (`Results contain 0 rows`), treat it as not found and return `null` instead of throwing an unhandled exception.
3. **Smooth 404 Rendering in `app/article/[id]/page.tsx`**:
   - When `getArticleWithAnalysis(id)` returns `null`, `generateMetadata` returns clean fallback metadata (`"Article Not Found — Pixca News"`) without throwing or logging to console error.
   - `ArticleDetailsPage` calls `notFound()` cleanly, rendering `app/not-found.tsx`.

---

## Files likely to change

- `lib/utils.ts` [MODIFY] — Add `isValidUuid` type guard helper.
- `lib/supabase/queries/articles.ts` [MODIFY] — Integrate UUID check and `22P02` handling in `getArticleWithAnalysis` and `getRelatedArticles`.
- `lib/supabase/queries/sources.ts` [MODIFY] — Integrate UUID check in `getSourceById`.

---

## Implementation requirements

1. **`lib/utils.ts`**:
   - Export `function isValidUuid(value: unknown): value is string`.
2. **`lib/supabase/queries/articles.ts`**:
   - In `getArticleWithAnalysis(id: string)`:
     - Check `if (!isValidUuid(id)) return null`.
     - In error handling, if `error.code === "22P02"`, return `null` instead of throwing.
   - In `getRelatedArticles(articleId: string, embedding: string | number[])`:
     - Check `if (!isValidUuid(articleId)) return []`.
3. **`lib/supabase/queries/sources.ts`**:
   - In `getSourceById(id: string)`:
     - Check `if (!isValidUuid(id)) return null`.
     - If `error.code === "22P02"`, return `null`.

---

## Security requirements

- Reject malformed user input early before database execution.
- Prevent denial-of-service or database log flooding caused by arbitrary strings passed into UUID SQL columns.

---

## Acceptance criteria

1. Navigating to `http://localhost:3000/article/non-existent-article-id` returns the custom `app/not-found.tsx` page with HTTP 404 status.
2. No Postgres `22P02` runtime crashes or console errors in `generateMetadata`.
3. Valid article IDs continue to load and display article details, analysis, and metadata normally.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass cleanly with 0 errors.

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
2. Test non-UUID and non-existent IDs:
   - Visit `http://localhost:3000/article/non-existent-article-id` -> Should display custom 404 without console error or runtime crash.
   - Visit `http://localhost:3000/article/00000000-0000-0000-0000-000000000000` (valid UUID format, but absent in DB) -> Should display custom 404.
