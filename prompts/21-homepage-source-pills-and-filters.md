# 21 — Homepage Source Pills, Interactive Filters, and GSAP Article Grid

## Goal

Transform the PIXCA homepage into an interactive, responsive, animated, and URL-driven news discovery interface:
1. **Scrollable Source Pills Bar (`components/ui/source-pills-bar.tsx`)**: Smooth chevron scrolling, boundary fade indicators, and active source URL filtering (`?source=<source-name-or-id>`).
2. **Interactive Filter & Search Bar (`components/ui/filter-bar.tsx`)**: Debounced search query input (`?q=...`), Political Framing chips (All, Left, Center, Right, Mixed), Sentiment chips (All, Positive, Neutral, Negative), and active filter reset.
3. **Animated Article Grid (`components/ui/article-grid.tsx`)**: Client grid wrapper with `useGSAP()` staggered card entrance animations (`y: 20, autoAlpha: 0, stagger: 0.05`), `ScrollTrigger.batch` viewport reveals, and interactive empty states.
4. **Filtered Supabase Queries (`lib/supabase/queries/articles.ts`)**: Extend `getPublishedArticles` to support server-side filtering by source, political framing label, sentiment label, and search text.
5. **Homepage Integration (`app/page.tsx`)**: Wire Next.js `searchParams`, pass filtered data to `SourcePillsBar`, `FilterBar`, and `ArticleGrid`, preserving server-side rendering and URL bookmarking.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — GSAP core tweens, easing, and `gsap.matchMedia()` for reduced-motion accessibility.
- `.agents/skills/gsap-react/SKILL.md` — `@gsap/react` `useGSAP()` hook scoping, dependency arrays, and React 19 lifecycle cleanup.
- `.agents/skills/gsap-scrolltrigger/SKILL.md` — `ScrollTrigger.batch` for efficient card viewport reveals.
- `.agents/skills/gsap-performance/SKILL.md` — 60fps GPU compositor acceleration (`autoAlpha`, `transform`, zero layout thrashing).
- `.agents/skills/supabase/SKILL.md` — Safe server-side database querying and filtering patterns.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit format.

---

## Existing code inspected

- `app/page.tsx` — Server component rendering static category pills and article cards.
- `components/ui/chip.tsx` — Chip component used for category/source pills.
- `components/ui/news-card.tsx` — NewsCard component for rendering vertical/horizontal article previews with bias meters.
- `lib/supabase/queries/articles.ts` — `getPublishedArticles()` query fetching analyzed articles.
- `lib/supabase/queries/sources.ts` — `getActiveSources()` query fetching available sources.
- `lib/gsap/index.ts` — Registered GSAP plugins (`useGSAP`, `ScrollTrigger`).
- `app/globals.css` — Semantic tokens for light and dark themes.

---

## Decisions and assumptions

1. **URL as State of Truth**: All filter criteria (`source`, `bias`, `sentiment`, `q`) are read from Next.js URL `searchParams`. Filter interactions update the URL via `useRouter().push(..., { scroll: false })` or `useSearchParams()`, making filter views bookmarkable and shareable.
2. **Debounced Search**: Text search in `FilterBar` uses a 300ms debounce before pushing to the URL to prevent excessive navigation triggers while typing.
3. **Server-Side Data Filtering**: `app/page.tsx` awaits `searchParams` and queries filtered articles server-side via Supabase. If search or bias filters match joined table attributes, the query handles them cleanly without breaking PostgREST joined-filter constraints.
4. **GSAP Viewport Reveals**: In `ArticleGrid`, cards animate in with `useGSAP()` on initial mount and when filter criteria change. Staggered reveal uses `y: 20, autoAlpha: 0, duration: 0.4, ease: "power2.out"`. `ScrollTrigger.batch()` handles smooth progressive reveal for scrolling through larger lists.
5. **Reduced-Motion Support**: All animations are wrapped in `gsap.matchMedia()` so users with `prefers-reduced-motion: reduce` receive instant opacity transitions (`autoAlpha: 0` to `1`) without motion translation.
6. **Smooth Horizontal Scrolling**: `SourcePillsBar` tracks scroll position to disable left/right chevron buttons at container boundaries and applies gradient masks to indicate overflow.

---

## Files likely to change

- `components/ui/source-pills-bar.tsx` [NEW] — Client component for horizontal scrolling pills with active source state and chevron navigation.
- `components/ui/filter-bar.tsx` [NEW] — Client component for search input, political framing chips, sentiment chips, and active filters reset.
- `components/ui/article-grid.tsx` [NEW] — Client component wrapping the article grid with `useGSAP()` entrance and `ScrollTrigger.batch()` reveals.
- `lib/supabase/queries/articles.ts` [MODIFY] — Add `source`, `biasLabel`, `sentimentLabel`, and `query` parameters to `getPublishedArticles()`.
- `app/page.tsx` [MODIFY] — Read `searchParams`, fetch filtered data, and render `SourcePillsBar`, `FilterBar`, and `ArticleGrid`.

---

## Implementation requirements

### 1. `components/ui/source-pills-bar.tsx`
- Must be a client component (`"use client"`).
- Props: `sources: Source[]`, `activeSource?: string`.
- Renders horizontal scrollable list of source pills with "All Sources" as the first pill.
- Includes Left and Right scroll chevron buttons that smoothly scroll the container by ~240px.
- Listens to container scroll events to automatically enable/disable chevron buttons at scroll bounds (`scrollLeft === 0` and `scrollLeft + clientWidth >= scrollWidth - 1`).
- Highlights the active pill with prominent styling (`bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs`).
- Clicking a pill updates the `source` search param in the URL (or removes it when "All Sources" is clicked), preserving other active query params (`bias`, `sentiment`, `q`).

### 2. `components/ui/filter-bar.tsx`
- Must be a client component (`"use client"`).
- Props: `activeBias?: string`, `activeSentiment?: string`, `searchQuery?: string`, `totalResults: number`.
- Contains:
  - **Search Input**: Text input with search icon, clear button (`X`), and placeholder `"Search news articles or topics..."`. Updates URL query param `q` with 300ms debounce.
  - **Bias Framing Filter Group**: Toggle chips for `All`, `Left`, `Center`, `Right`, `Mixed`.
  - **Sentiment Filter Group**: Toggle chips for `All`, `Positive`, `Neutral`, `Negative`.
  - **Filter Summary & Reset**: Shows count of matched articles and a "Reset filters" button when any filter is active.
- Updates URL search parameters on selection while preserving existing unrelated parameters.

### 3. `components/ui/article-grid.tsx`
- Must be a client component (`"use client"`).
- Props: `articles: ArticleWithSourceAndAnalysis[]`, `emptyMessage?: string`.
- Renders responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
- Implements `useGSAP()` scoped to `gridRef`:
  - Animates `.news-card-item` elements with `gsap.fromTo` using `y: 24, autoAlpha: 0, duration: 0.45, ease: "power2.out", stagger: 0.05`.
  - Uses `ScrollTrigger.batch(".news-card-item", ...)` for elements entering viewport on scroll.
  - Uses `gsap.matchMedia()` to disable `y` translation when `(prefers-reduced-motion: reduce)` matches.
- Shows a styled empty state card if `articles.length === 0` with a message and reset button.

### 4. `lib/supabase/queries/articles.ts`
- Update `getPublishedArticles`:
  ```typescript
  export interface GetPublishedArticlesOptions {
    limit: number;
    offset: number;
    sourceId?: string;
    sourceName?: string;
    biasLabel?: BiasLabel;
    sentimentLabel?: SentimentLabel;
    query?: string;
  }
  ```
- If `sourceId` or `sourceName` is provided, filter articles matching the source.
- If `query` is provided, search `title` using `.ilike('title', `%${query}%`)`.
- If `biasLabel` or `sentimentLabel` is provided, filter matching articles.
- Returns filtered array of `ArticleWithSourceAndAnalysis`.

### 5. `app/page.tsx`
- Updates page signature to accept `searchParams`:
  ```typescript
  interface HomePageProps {
    searchParams: Promise<{
      source?: string;
      bias?: string;
      sentiment?: string;
      q?: string;
    }>;
  }
  ```
- Awaits `searchParams` and `connection()`.
- Fetches active sources and filtered articles concurrently.
- Renders `SourcePillsBar`, `FilterBar`, and `ArticleGrid`.

---

## Security requirements

- Server-side queries execute exclusively in Server Components and server-only query files.
- No database credentials or service role keys exposed to browser code.
- Input parameters sanitized and safely passed to Supabase query builders.

---

## Acceptance criteria

1. **Source Filtering**: Clicking any source pill filters articles by that source and updates the URL to `?source=<name>`.
2. **Search**: Typing in search bar updates `?q=<term>` with debounce and filters article titles.
3. **Bias & Sentiment Filters**: Clicking bias chips (Left, Center, Right, etc.) or sentiment chips updates the grid instantly.
4. **GSAP Animations**: Article cards enter with smooth staggered fade/slide transitions on initial load and filter transitions.
5. **Chevron Scroll Navigation**: Source pills scroll smoothly with left/right buttons and bound detection.
6. **Mobile Friendly**: Full responsiveness on mobile, tablet, and desktop viewports.
7. **Typecheck & Lint**: Zero TypeScript errors (`npm run typecheck`) and zero ESLint errors (`npm run lint`).

---

## Checks to run

```bash
npm run typecheck
npm run lint
```

---

## Exact manual test steps expected after implementation

1. Open `http://localhost:3000/`.
2. Click on different source pills in the top bar (e.g. "Reuters", "BBC News", "All Sources") and verify URL updates to `?source=...` and grid reflects the chosen source.
3. Use the left and right chevron buttons on the source pills bar and verify smooth scrolling.
4. Type a search term in the search bar and verify debounced URL update `?q=...` and filtered results.
5. Click Bias filter chips (e.g., "Left", "Center", "Right") and verify filtering and URL parameters.
6. Click Sentiment filter chips (e.g., "Positive", "Neutral") and verify combined filtering.
7. Click "Reset filters" and verify all filters clear and URL resets.
8. Inspect card entrance animations on filter transitions.
