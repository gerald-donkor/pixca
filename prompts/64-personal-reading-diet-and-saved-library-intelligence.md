# 64 — Personal Reading Diet & Saved Library Intelligence

## Goal

Enhance the Saved Articles page ([`app/saved/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/saved/page.tsx)) with a comprehensive **Personal Reading Diet & Perspective Balance Visualizer** and interactive **Saved Library Search, Source & Bias Filtering, and Sorting Controls**:
1. **Personal Reading Diet Visualizer**: Compute and display the user's personal perspective distribution (Left %, Center %, Right %) and source diversity across their saved articles with smooth, responsive GSAP animations.
2. **Interactive Library Filter & Search Bar**: Enable instant client-side search by title/source, filtering by political perspective (All, Left, Center, Right), filtering by publication source, and sorting (Recently Saved, Oldest, Title A-Z, Most Balanced, Most Polarized).
3. **Rich Bookmark Metadata Preservation**: Enhance `useBookmarks` to capture `bias_label`, `left_percentage`, `center_percentage`, `right_percentage`, and `sentiment_label` when articles are bookmarked, with seamless backward-compatibility for existing stored items.
4. **GSAP Micro-Interactions & Fluid Animations**: Incorporate 60fps card reordering, filter transitions, and diet meter reveals with `useGSAP` and `gsap.matchMedia()` adhering to `prefers-reduced-motion`.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client boundaries, dynamic route conventions, and component patterns.
- `.agents/skills/gsap-core/SKILL.md` — Tweens, easings, `matchMedia`, and defaults.
- `.agents/skills/gsap-react/SKILL.md` — Scoped `@gsap/react` `useGSAP()` hook for React 19 safety and cleanup.
- `.agents/skills/gsap-performance/SKILL.md` — Compositor transforms (`autoAlpha`, `scale`, `x/y`), layout-shift elimination, and reduced motion.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `app/saved/page.tsx` — Client component for saved articles list, quota badges, clear-all modal, and single-card removal animations.
- `hooks/use-bookmarks.ts` — LocalStorage bookmark state management with `useSyncExternalStore`.
- `components/ui/news-card.tsx` — News card component with bookmark toggle and analysis props.
- `components/ui/article-action-bar.tsx` — Article detail action bar with bookmark toggle and analysis data.
- `components/ui/blindspot-spectrum-summary.tsx` — Reference implementation for animated multi-segment perspective distribution bars.
- `components/ui/bias-meter.tsx` — Standard 3-segment bias visualization.

---

## Decisions and assumptions

1. **Rich Bookmark Metadata & Backward Compatibility**:
   - Extend `BookmarkedArticle` in `hooks/use-bookmarks.ts` with optional `bias_label`, `left_percentage`, `center_percentage`, `right_percentage`, and `sentiment_label`.
   - When bookmarking from `NewsCard` or `ArticleActionBar`, pass these fields if available.
   - For legacy bookmarks where percentages are missing, compute estimates if `bias_label` is available, or gracefully treat as neutral/center without crashing.
2. **Personal Reading Diet Meter (`components/ui/saved-diet-meter.tsx`)**:
   - Aggregate saved articles to compute:
     - Overall Left %, Center %, Right % distribution.
     - Dominant Diet Lean (e.g., "Balanced Reading Diet", "Left-Leaning Skew", "Right-Leaning Skew", "Centrist Focus").
     - Source Diversity Metric (number of distinct news publishers in library).
     - Total articles analyzed.
   - Use `useGSAP` with `gsap.matchMedia()` to animate the spectrum bar segments (`scaleX: 0` to `1`) and insight metrics on mount/updates.
3. **Saved Library Filters Bar (`components/ui/saved-filters-bar.tsx`)**:
   - Provide:
     - Search query input (instant filtering against title and source).
     - Bias filter chips: "All", "Left", "Center", "Right".
     - Source dropdown selector (dynamically extracted from user's saved articles).
     - Sort dropdown: "Recently Saved", "Oldest Saved", "Title (A–Z)", "Most Balanced", "Most Polarized".
     - Active filters count and quick "Reset Filters" button.
4. **Filtered Grid & Empty States in `app/saved/page.tsx`**:
   - Render the diet meter when bookmarks exist (`bookmarks.length > 0`).
   - Render the filter bar and filtered article cards.
   - Provide a dedicated empty state when filters yield 0 matches with a clear-filters button.
   - Preserve existing plan tier limits, single-item remove animation, and clear-all dialog.

---

## Files likely to change

- `hooks/use-bookmarks.ts` [MODIFY] — Extend `BookmarkedArticle` interface and `toggleBookmark` to accept optional analysis metadata.
- `components/ui/news-card.tsx` [MODIFY] — Pass analysis props to `toggleBookmark`.
- `components/ui/article-action-bar.tsx` [MODIFY] — Pass analysis props to `toggleBookmark`.
- `components/ui/saved-diet-meter.tsx` [NEW] — Client component for personal reading diet & perspective balance meter with GSAP animations.
- `components/ui/saved-filters-bar.tsx` [NEW] — Interactive search, bias filter chips, source selector, and sort controls.
- `app/saved/page.tsx` [MODIFY] — Integrate diet meter, filter bar, search/sort state, and animated filtered card grid.

---

## Implementation requirements

1. **Update `hooks/use-bookmarks.ts`**:
   - Add `bias_label?: BiasLabel`, `left_percentage?: number`, `center_percentage?: number`, `right_percentage?: number`, and `sentiment_label?: SentimentLabel` to `BookmarkedArticle`.
   - Update `toggleBookmark` input parameter to accept these optional fields and persist them.
2. **Update `components/ui/news-card.tsx` & `components/ui/article-action-bar.tsx`**:
   - Pass `framingLabel`, `bias.left`, `bias.center`, `bias.right`, and `sentimentLabel` into `toggleBookmark`.
3. **Create `components/ui/saved-diet-meter.tsx`**:
   - Render an aggregated perspective balance bar (Left % vs Center % vs Right %).
   - Display summary cards: Total Saved, Dominant Lean, and Source Diversity.
   - Animate bar reveal and cards with `@gsap/react` `useGSAP()` and `gsap.matchMedia()`.
4. **Create `components/ui/saved-filters-bar.tsx`**:
   - Search input with clear button.
   - Bias filter chips (`all`, `left`, `center`, `right`).
   - Source select dropdown.
   - Sort selector (`newest`, `oldest`, `alphabetical`, `balanced`, `polarized`).
   - Reset button when any filter is active.
5. **Update `app/saved/page.tsx`**:
   - Connect search query, active bias, selected source, and sort order.
   - Calculate filtered & sorted bookmarks list.
   - Show `SavedDietMeter` at the top when bookmarks exist.
   - Show `SavedFiltersBar` above the grid.
   - Animate card list reordering and appearance with GSAP.
   - Display filtered empty state when query returns no matches.
6. **Verification**:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.

---

## Security requirements

- Client-side storage and parsing must be strictly validated.
- Safely sanitize text strings and escape search regex characters.
- Ensure no sensitive keys or server secrets are referenced.

---

## Acceptance criteria

1. Saving articles from news cards or article details saves analysis metadata (bias label, percentages, sentiment).
2. Navigating to `/saved` with bookmarked articles renders the **Personal Reading Diet & Perspective Balance Meter** with animated GSAP bar expansions.
3. Searching by keyword immediately filters the saved articles list.
4. Filtering by bias ("Left", "Center", "Right") or source narrows the visible cards accurately.
5. Sorting by "Recently Saved", "Oldest", "Title (A–Z)", "Most Balanced", and "Most Polarized" re-orders cards smoothly.
6. When filters return 0 results, an intuitive empty state with a "Clear Filters" button is displayed.
7. Deleting a single bookmark or clearing all bookmarks maintains clean GSAP exit transitions.
8. `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Navigate to `http://localhost:3000/`.
2. Bookmark 2-3 articles from different sources and with different political framing (e.g. Left, Center, Right).
3. Navigate to `http://localhost:3000/saved`.
4. Verify the **Personal Reading Diet & Perspective Balance Meter** renders with animated proportional bars and accurate statistics.
5. Type in the search box to test instant filtering by article title or source name.
6. Click the "Left", "Center", and "Right" bias filter chips to verify instantaneous filtering.
7. Change the sort dropdown to "Title (A–Z)" and "Most Balanced" and verify correct ordering.
8. Remove a bookmark and verify both the card exit animation and the recalculated Reading Diet meter update smoothly.
