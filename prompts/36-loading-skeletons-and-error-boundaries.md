# 36 — Loading Skeletons, Error Boundaries, and Custom Not Found

## Goal

Implement comprehensive Next.js App Router streaming skeletons (`app/loading.tsx`, `app/article/[id]/loading.tsx`), custom branded 404 Not Found pages (`app/not-found.tsx`), and error boundaries (`app/error.tsx`, `app/global-error.tsx`) to ensure seamless UX, zero Cumulative Layout Shift (CLS), and graceful recovery across all PIXCA views.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router loading states (`loading.tsx`), error boundaries (`error.tsx`, `global-error.tsx`), and custom 404 (`not-found.tsx`).
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Smooth entrance animations for error and not-found states.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit standards.

---

## Existing code inspected

- `app/layout.tsx` — Root layout containing providers and global navigation.
- `app/page.tsx` — Homepage data fetching with dynamic `connection()`, filter bar, and `ArticleGrid`.
- `app/article/[id]/page.tsx` — Article detail page with metadata generation, reading progress, bias meter, and sidebar widgets.
- `components/ui/news-card.tsx` — Horizontal and vertical card structures used for skeleton dimension mirroring.
- `components/ui/bias-meter.tsx` — Bias meter structure.
- `components/ui/button.tsx` — Accessible button primitive for recovery actions.

---

## Decisions and assumptions

1. **Pixel-Perfect Loading Skeletons**:
   - `app/loading.tsx`: Mirror the homepage layout exactly (source pills bar placeholder, heading placeholder, search/filter bar placeholder, and a 6-card responsive grid of horizontal/vertical skeleton news cards with pulse animations) to prevent Cumulative Layout Shift (CLS).
   - `app/article/[id]/loading.tsx`: Mirror the article detail layout (back nav bar, 2-column grid on desktop with left column headline, metadata, hero image, bias distribution card, paragraph blocks, newsletter block; right column bias analysis and AI summary widget skeletons).
2. **Branded 404 Not Found (`app/not-found.tsx`)**:
   - Clean editorial presentation consistent with PIXCA design tokens (`--surface`, `--card`, `--text-primary`, `--border`).
   - Friendly explanation that the article or page was not found or was archived.
   - Action buttons to navigate to "Top Stories", "Blindspot", and "Saved".
3. **Route Error Boundary (`app/error.tsx`)**:
   - Must be a Client Component (`"use client"`).
   - Receives `{ error, reset }` props from Next.js.
   - Logs errors to `console.error` without rendering raw internal error messages or API keys to the end-user.
   - Offers a "Try Again" button calling `reset()` and a secondary "Return to Top News" link.
4. **Root Error Boundary (`app/global-error.tsx`)**:
   - Catches uncaught errors in the root layout.
   - Defines its own `<html>` and `<body>` tags as required by Next.js App Router conventions.
   - Provides minimal styled fallback with reset button.

---

## Files likely to change

- `app/loading.tsx` [NEW] — Homepage and feed skeleton loading state.
- `app/article/[id]/loading.tsx` [NEW] — Article detail page skeleton loading state.
- `app/not-found.tsx` [NEW] — Custom branded 404 page.
- `app/error.tsx` [NEW] — Route-level client error boundary.
- `app/global-error.tsx` [NEW] — Root layout error boundary.

---

## Implementation requirements

1. **`app/loading.tsx`**:
   - Container with `min-h-screen bg-[var(--surface)]`.
   - Top pills bar skeleton with animated pulse tags.
   - Main container (`max-w-[1400px] px-6 py-8 space-y-6`).
   - Title placeholder (`h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse`).
   - Search/filter bar placeholder with pulse styling.
   - Grid with 6 news card skeletons (3 columns on xl, 2 on md, 1 on sm) featuring thumbnail block, title line, bias meter placeholder, and footer metadata placeholder.
   - Add `aria-busy="true"` and `aria-label="Loading news feed"`.
2. **`app/article/[id]/loading.tsx`**:
   - Container with `min-h-screen bg-[var(--surface)] pb-16`.
   - Back nav placeholder bar.
   - Main 2-column grid (`grid-cols-1 lg:grid-cols-[1fr_350px] gap-8`).
   - Left column: breadcrumb placeholder, headline placeholder (2 lines), byline row, hero image aspect ratio skeleton (`aspect-[16/9] bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse`), bias distribution card placeholder, and multi-paragraph skeletons.
   - Right column: 2 sidebar widget skeletons with title, progress bars, and text pulse blocks.
   - Add `aria-busy="true"` and `aria-label="Loading article details"`.
3. **`app/not-found.tsx`**:
   - Centered card layout in `min-h-[80vh] flex items-center justify-center px-6`.
   - Clean newspaper / compass icon or subtle badge `404 — Story Not Found`.
   - Clear description: "The article or page you're looking for doesn't exist, may have been removed, or is currently unavailable."
   - Button group:
     - Primary button linking to `/` ("Back to Top News").
     - Secondary button linking to `/blindspot` ("Explore Blindspot").
     - Ghost button linking to `/saved` ("Saved Articles").
4. **`app/error.tsx`**:
   - `"use client"`.
   - Accepts `{ error: Error & { digest?: string }, reset: () => void }`.
   - Error card with alert icon, clear message "Something went wrong loading this page", digest ID if present.
   - "Try Again" button calling `reset()`, plus "Go to Home" button.
5. **`app/global-error.tsx`**:
   - `"use client"`.
   - Minimal standalone HTML/body with dark/light mode font and background styling, error card, and `reset()` button.

---

## Security requirements

- Never render raw unhandled stack traces, database schemas, or API keys in the error boundary UI.
- All user-facing text must be sanitized and static.

---

## Acceptance criteria

1. Navigating between routes displays smooth loading skeletons that match real content geometry without layout shift.
2. Visiting an unknown URL (e.g. `/article/non-existent-id` or `/random-404`) renders the custom PIXCA 404 page.
3. Errors triggered during rendering are caught by `app/error.tsx` with a functioning retry mechanism.
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
2. Test loading and error states in browser:
   - Visit `http://localhost:3000/article/invalid-slug` to verify the 404 page.
   - Check loading skeleton styling and theme compliance in light and dark mode.
