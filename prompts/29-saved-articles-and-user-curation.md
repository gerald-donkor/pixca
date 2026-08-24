# 29 — Saved Articles Reading List, Blindspot Intelligence Feed, and Header Navigation Integration

## Goal

Implement the dedicated user curation and intelligence feeds:
1. **Saved Articles Reading List (`app/saved/page.tsx`)**: A client-rendered bookmark manager hooked into `useBookmarks()`, rendering saved article cards with thumbnails, source tags, saved timestamp, "Clear All" action, empty state illustration, and fluid GSAP removal transitions (`autoAlpha`, `scale`, `y`).
2. **Blindspot Intelligence Feed (`app/blindspot/page.tsx`)**: A server-rendered intelligence feed highlighting stories with asymmetric political coverage or high framing divergence (Left skew vs Right skew), featuring quick filter tabs and staggered GSAP grid entrances via `ArticleGrid`.
3. **Header & Mobile Drawer Route Navigation Integration (`components/layout/header.tsx` & `components/layout/mobile-drawer.tsx`)**: Wire `/saved` and `/blindspot` navigation links with dynamic active route indicator styling (`usePathname()`), and render a dynamic live bookmark counter badge.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Core GSAP tweens, easing, and `gsap.matchMedia()` for motion accessibility.
- `.agents/skills/gsap-react/SKILL.md` — Scoped `@gsap/react` `useGSAP()` lifecycle hooks and cleanup.
- `.agents/skills/gsap-timeline/SKILL.md` — Staggered card entrance timelines and removal sequences.
- `.agents/skills/gsap-performance/SKILL.md` — 60fps GPU compositor acceleration (`transform`, `autoAlpha`, avoiding layout thrashing).
- `.agents/skills/supabase/SKILL.md` — Server-side queries for published articles and bias metrics.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review feedback evaluation.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- `hooks/use-bookmarks.ts` — Client hook providing `bookmarks`, `isBookmarked`, `toggleBookmark`, and `removeBookmark` backed by `localStorage` and `useSyncExternalStore`.
- `components/layout/header.tsx` — Desktop utility bar & header navigation containing static `#blindspot` and home links.
- `components/layout/mobile-drawer.tsx` — Slide-out navigation drawer with `NAV_ITEMS` array.
- `components/ui/article-grid.tsx` — Reusable grid component with GSAP entrance staggers and empty state handling.
- `components/ui/news-card.tsx` — Reusable card component supporting vertical and horizontal layouts with sentiment/bias badges.
- `lib/supabase/queries/articles.ts` — Server-side query functions `getPublishedArticles()`.

---

## Decisions and assumptions

1. **Client/Server Separation**:
   - `app/saved/page.tsx`: Entirely driven by client-side `useBookmarks()` state (since bookmarks reside in `localStorage`). Renders clean saved article items with quick unbookmark buttons and instant visual feedback.
   - `app/blindspot/page.tsx`: Server Component with `await connection()` and `getPublishedArticles({ limit: 30, biasLabel: biasParam })`. Filters to articles analyzed with `left` or `right` framing (or custom divergence criteria).
2. **GSAP Removal Animation**:
   - In `/saved`, unbookmarking an item triggers a smooth shrink-and-fade exit tween (`autoAlpha: 0, scale: 0.92, y: -8, duration: 0.25, ease: "power2.in"`) before committing `removeBookmark(id)` to state.
   - Respects `prefers-reduced-motion: reduce` by performing an immediate state removal without tween delay.
3. **Active Route Indication**:
   - In `components/layout/header.tsx`, compare `usePathname()` with each nav destination (`/`, `/blindspot`, `/saved`) to apply active styles (`border-b-2 border-text-primary text-text-primary font-bold` vs `text-text-secondary hover:text-text-primary`).
   - Saved link renders a subtle numeric badge (e.g. `bookmarks.length`) when `bookmarks.length > 0`.
4. **Blindspot UI Design**:
   - Top banner with clear explanatory text defining what a "Blindspot" is (stories receiving heavily skewed coverage across partisan media).
   - Filter tabs allowing the user to view "All Blindspots", "Left Bias / Coverage", and "Right Bias / Coverage".

---

## Files likely to change

- `app/saved/page.tsx` [NEW] — Client-side saved articles page with GSAP removal animations and empty state.
- `app/blindspot/page.tsx` [NEW] — Server-side curated blindspot feed with bias filters.
- `components/layout/header.tsx` [MODIFY] — Active navigation link indicators, dynamic bookmark count badge, and route linking.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Route updates and dynamic bookmark badge count in mobile drawer.

---

## Implementation requirements

### 1. `app/saved/page.tsx`
- Must be a client component (`"use client"`).
- Uses `useBookmarks()` to access the list of bookmarked articles.
- Includes a page header: "Saved Articles", subtitle explaining the personal reading list, and total count.
- Provides a "Clear all" button (when bookmarks > 0) with toast confirmation.
- Each saved item renders:
  - Thumbnail image (or placeholder).
  - Source name and relative/formatted saved date.
  - Article title linking to `/article/[id]`.
  - Unbookmark / trash button with tooltip.
  - Attached to a ref or DOM element for GSAP exit animations.
- When `bookmarks.length === 0`:
  - Render an empty state card with a `Bookmark` icon, descriptive text, and a primary button linking to `/` ("Discover Top Stories").

### 2. `app/blindspot/page.tsx`
- Server Component that calls `await connection()` and receives `searchParams`.
- Supported search params: `bias?: "left" | "right" | "all"`.
- Queries Supabase for analyzed articles with non-center bias:
  - If `bias === "left"`, fetch `biasLabel: "left"`.
  - If `bias === "right"`, fetch `biasLabel: "right"`.
  - If `bias === "all"` or undefined, fetch analyzed articles and filter to `bias_label !== "center"` or fetch both left and right articles.
- Renders an informative header banner with an eye/radar icon explaining the Blindspot concept.
- Filter pill chips for "All Blindspots", "Left Coverage", "Right Coverage".
- Renders `<ArticleGrid articles={articles} />` with animated cards.

### 3. `components/layout/header.tsx` & `components/layout/mobile-drawer.tsx`
- In `Header`:
  - Replace static `/#blindspot` with `/blindspot`.
  - Add `Saved` link pointing to `/saved`.
  - Use `usePathname()` to highlight the active route.
  - Integrate `useBookmarks()` to show a badge with `bookmarks.length` next to "Saved" when greater than 0.
- In `MobileDrawer`:
  - Ensure `/saved` and `/blindspot` links are active and display the bookmark badge count.

---

## Security requirements

- Server-side data fetching uses `getPublishedArticles()` with parameter validation.
- No direct user input executed in database SQL.
- LocalStorage bookmark operations safely handle JSON parsing errors with fallback to empty array.

---

## Acceptance criteria

1. Navigating to `/saved` displays all bookmarked articles from `localStorage`.
2. Unbookmarking a card on `/saved` animates out smoothly with GSAP before removal.
3. When no articles are saved, `/saved` renders a clean empty state with a link back to `/`.
4. Navigating to `/blindspot` displays articles categorized with political framing skew, with functioning bias filter tabs.
5. Header and mobile drawer navigation links highlight the active route based on the current URL.
6. The "Saved" navigation link displays a dynamic badge with the current bookmark count.
7. `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

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
2. Visit `http://localhost:3000/saved`:
   - Verify empty state displays when no bookmarks exist.
3. Visit an article details page (`http://localhost:3000/article/[id]`) and click the Bookmark button.
4. Return to `http://localhost:3000/saved`:
   - Verify the saved article appears with its thumbnail, title, and source.
   - Click the remove/unbookmark button on the card: verify it smoothly fades and shrinks out via GSAP.
   - Verify the bookmark count in the header updates immediately.
5. Visit `http://localhost:3000/blindspot`:
   - Verify the Blindspot header banner and filter pills are displayed.
   - Click "Left Coverage" and "Right Coverage" filters: verify the grid updates with matching skewed articles.
6. Check navigation bar on all pages:
   - Verify active route indicator (underline and highlight) reflects the current page (`/`, `/blindspot`, `/saved`).
