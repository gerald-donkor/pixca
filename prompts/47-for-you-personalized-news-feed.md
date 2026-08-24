# 47 — For You Personalized News Feed

## Goal

Implement a dedicated **"For You" Personalized News Feed** (`/for-you`) that dynamically curates personalized recommendations and balanced viewpoint suggestions based on the user's bookmarked articles and sources, provides high-confidence balanced stories for new visitors, includes a dynamic OpenGraph card (`/for-you/opengraph-image.tsx`), updates navigation links in the header and mobile drawer, and indexes the route in `app/sitemap.ts`.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router Server Component patterns, connection() read-at-request-time, metadata generation, and ImageResponse dynamic OG card conventions.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Client UI component patterns, `useGSAP` scoping, and responsive animations.
- `.agents/skills/supabase/SKILL.md` — Published articles queries and data typing.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `hooks/use-bookmarks.ts` — LocalStorage bookmark hook with `useSyncExternalStore` for client-side bookmark state.
- `app/blindspot/page.tsx` & `app/blindspot/opengraph-image.tsx` — Feed layout patterns, headers, and OG card generation.
- `app/page.tsx` — Server Component data fetching and schema patterns.
- `components/ui/article-grid.tsx` — GSAP staggered card grid component.
- `components/layout/header.tsx` & `components/layout/mobile-drawer.tsx` — Global navigation links and active route matching.
- `app/sitemap.ts` — Dynamic sitemap generator.

---

## Decisions and assumptions

1. **Client/Server Architecture**:
   - `app/for-you/page.tsx` is an async Server Component that calls `await connection()` and fetches a rich pool of recent analyzed articles (e.g. 50 articles) from Supabase via `getPublishedArticles({ limit: 50, offset: 0 })`.
   - `components/ui/for-you-feed.tsx` is an interactive Client Component that consumes the article pool and reads the user's bookmarks via `useBookmarks()`.
   - When bookmarks exist:
     - Extracts preferred sources (sources the user bookmarked most).
     - Identifies preferred/dominant political framing or topics.
     - Calculates a relevance score for each article: higher weights for matching sources, balanced/center perspectives that prevent ideological echo chambers ("Counter-Perspective Suggestions"), and high-confidence analyses.
     - Renders personalized tabs/filters: "Recommended For You", "Counter-Perspective" (expanding viewpoints beyond user's bookmarked bias), and "Top Balanced".
   - When no bookmarks exist (new visitors):
     - Displays an engaging "Discover Balanced News" view with curated top stories across all framing categories (Left, Center, Right).
     - Renders a helpful onboarding banner explaining how bookmarking articles tailors the feed.
2. **Dynamic OpenGraph Social Card (`app/for-you/opengraph-image.tsx`)**:
   - Generate standard 1200x630 `ImageResponse` with Sparkles badge, "For You — Personalized Intelligence", and branded styling.
3. **Navigation Integration**:
   - Update `components/layout/header.tsx` and `components/layout/mobile-drawer.tsx`:
     - Change `/#for-you` to `/for-you`.
     - Highlight active state when `pathname === "/for-you"`.
4. **Sitemap Integration (`app/sitemap.ts`)**:
   - Add `{ url: `${baseUrl}/for-you`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 }`.

---

## Files likely to change

- `app/for-you/page.tsx` [NEW] — For You feed page.
- `app/for-you/opengraph-image.tsx` [NEW] — Dynamic OG card for `/for-you`.
- `components/ui/for-you-feed.tsx` [NEW] — Interactive personalized feed client component.
- `components/layout/header.tsx` [MODIFY] — Link to `/for-you` and active route styling.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Link to `/for-you`.
- `app/sitemap.ts` [MODIFY] — Add `/for-you` entry.

---

## Implementation requirements

1. **`app/for-you/page.tsx`**:
   - Define metadata with title "For You — Pixca News", description, openGraph, and twitter tags.
   - Call `await connection()` and fetch published articles.
   - Render hero section with badge (`Sparkles`), title ("Your Curated News Intelligence"), and subtitle.
   - Mount `<ForYouFeed initialArticles={articles} />`.
2. **`components/ui/for-you-feed.tsx`**:
   - Manage filter mode ("recommended", "counter-perspective", "balanced").
   - Compute personalized article rankings using bookmark source/bias affinity.
   - Animate card changes with GSAP staggers.
   - Provide clear empty/onboarding states.
3. **`app/for-you/opengraph-image.tsx`**:
   - Generate crisp 1200x630 card with Next.js `ImageResponse`.
4. **`components/layout/header.tsx` & `mobile-drawer.tsx`**:
   - Update `href="/#for-you"` to `href="/for-you"`.
   - Update active pathname comparison.
5. **`app/sitemap.ts`**:
   - Add `/for-you` static route entry.

---

## Security requirements

- Server-side read-at-request-time; no sensitive keys exposed.
- Bookmarks read purely on client via `useBookmarks()` (no PII transmitted to server).

---

## Acceptance criteria

1. Navigating to `/for-you` renders the personalized feed page with hero header and recommendation tabs.
2. When bookmarks exist, articles from user's favorite sources and balancing viewpoints are highlighted.
3. When no bookmarks exist, a curated discovery feed with onboarding guidance is rendered.
4. Header and mobile drawer "For You" links cleanly navigate to `/for-you` and display active indicators.
5. `/for-you/opengraph-image` renders a valid 1200x630 image response.
6. `app/sitemap.ts` includes `/for-you`.
7. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

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
2. Test `/for-you` page and OG image:
   ```bash
   curl -s -I http://localhost:3000/for-you
   curl -s -I http://localhost:3000/for-you/opengraph-image
   ```
3. Verify sitemap includes `/for-you`:
   ```bash
   curl -s http://localhost:3000/sitemap.xml | grep "/for-you"
   ```
