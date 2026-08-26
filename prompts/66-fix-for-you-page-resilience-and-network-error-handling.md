# 66 — Fix For You Page Resilience & Network Error Handling

## Goal

Harden the **"For You" personalized news feed** ([`app/for-you/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/for-you/page.tsx)), **Supabase query layer** ([`lib/supabase/queries/articles.ts`](file:///home/dg/Projects/nextjs/pixca/lib/supabase/queries/articles.ts) and [`lib/supabase/queries/sources.ts`](file:///home/dg/Projects/nextjs/pixca/lib/supabase/queries/sources.ts)), and **route pages** against transient network failures, database connection errors (`ECONNREFUSED` / `fetch failed`), and unhandled PostgREST exceptions:
1. **Supabase Query Layer Exception Shielding**: Wrap queries in `getPublishedArticles`, `getArticleWithAnalysis`, `getRelatedArticles`, `getActiveSources`, and `getSourceById` in `try/catch` blocks that log diagnostic context server-side and return safe fallbacks (`[]` or `null`) instead of bubbling unhandled exceptions.
2. **For You Server Component Graceful Fallback**: Ensure [`app/for-you/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/for-you/page.tsx) catches data fetching errors and provides a safe empty array fallback, allowing `ForYouFeed` to seamlessly display its built-in interactive onboarding and discovery mode without crashing into `app/error.tsx`.
3. **Route Resilience across Top Pages**: Add defensive fallbacks in [`app/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/page.tsx) and [`app/blindspot/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/blindspot/page.tsx).

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js server components, dynamic connection handling, and error boundary patterns.
- `.agents/skills/supabase/SKILL.md` — Safe error handling, null guards, and query resilience.
- `.agents/skills/clerk/SKILL.md` — Clerk provider error resilience and client boundaries.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `app/for-you/page.tsx` — Server Component calling `getPublishedArticles({ limit: 80, offset: 0 })`.
- `lib/supabase/queries/articles.ts` — Database query functions for articles and analyses.
- `lib/supabase/queries/sources.ts` — Database query functions for active sources.
- `app/page.tsx` — Main homepage Server Component.
- `app/blindspot/page.tsx` — Blindspot feed Server Component.
- `app/error.tsx` — Global route error boundary component.

---

## Decisions and assumptions

1. **Defensive Query Layer (`lib/supabase/queries/articles.ts` & `sources.ts`)**:
   - Wrap all database queries in `try / catch`.
   - If PostgREST returns `{ error }` or fetch rejects (e.g. `connect ECONNREFUSED` or timeout), log `console.error` and return `[]` (for list queries) or `null` (for single entity queries).
   - This ensures the UI server components never crash abruptly due to transient database or network hiccups.
2. **For You Feed Resilience (`app/for-you/page.tsx`)**:
   - Wrap `getPublishedArticles` inside a `try/catch` with a fallback `articles = []`.
   - When `articles` is empty, `ForYouFeed` displays its onboarding hero banner and sample exploration topics ("geopolitics", "economy", "technology", "climate", "healthcare", "election"), providing a rich interactive experience even in offline/empty database conditions.
3. **Homepage & Blindspot Pages**:
   - Guarantee `sources = []` and `articles = []` fallbacks in `app/page.tsx` and `app/blindspot/page.tsx` when database queries fail.

---

## Files likely to change

- `lib/supabase/queries/articles.ts` [MODIFY] — Add defensive `try/catch` and safe fallbacks to `getPublishedArticles`, `getArticleWithAnalysis`, and `getRelatedArticles`.
- `lib/supabase/queries/sources.ts` [MODIFY] — Add defensive `try/catch` to `getActiveSources` and `getSourceById`.
- `app/for-you/page.tsx` [MODIFY] — Wrap article fetching in defensive `try/catch`.
- `app/page.tsx` [MODIFY] — Add defensive error handling for `sources` and `articles`.
- `app/blindspot/page.tsx` [MODIFY] — Add defensive error handling for `articles`.

---

## Implementation requirements

1. **Update `lib/supabase/queries/articles.ts`**:
   - In `getPublishedArticles`: Wrap execution in `try { ... } catch (err) { ... }`, return `[]` on error.
   - In `getArticleWithAnalysis`: Wrap in `try/catch`, return `null` on error.
   - In `getRelatedArticles`: Wrap in `try/catch`, return `[]` on error.
2. **Update `lib/supabase/queries/sources.ts`**:
   - In `getActiveSources`: Wrap in `try/catch`, return `[]` on error.
   - In `getSourceById`: Wrap in `try/catch`, return `null` on error.
3. **Update `app/for-you/page.tsx`**:
   - Wrap `getPublishedArticles` in `try/catch`, default `articles` to `[]`.
4. **Update `app/page.tsx` & `app/blindspot/page.tsx`**:
   - Ensure safe fallbacks when database calls fail.
5. **Verification**:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.

---

## Security requirements

- Do not expose database error details or environment keys to browser error boundaries.
- Log error context strictly server-side using standard sanitized logs.

---

## Acceptance criteria

1. Navigating to `/for-you` renders smoothly without crashing into `app/error.tsx` even if the database is unreachable or network fetch fails.
2. `getPublishedArticles`, `getArticleWithAnalysis`, and `getActiveSources` gracefully return safe empty/null values on connection errors rather than crashing RSC execution.
3. `ForYouFeed` cleanly presents discovery topics and onboarding guidance when no articles are loaded.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Run verification checks (`npm run typecheck && npm run lint && npm run build`).
2. Start the dev server (`npm run dev`).
3. Navigate to `http://localhost:3000/for-you`.
4. Verify the page loads cleanly with the hero banner and feed controls.
5. Test with network offline / empty database simulation: verify the page renders gracefully without error boundaries.
