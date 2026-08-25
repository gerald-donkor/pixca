# 63 — Blindspot Perspective Divergence Visualizer

## Goal

Enhance `/blindspot` ([`app/blindspot/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/blindspot/page.tsx)) by introducing an interactive **Blindspot Perspective Divergence Visualizer** and Cross-Spectrum Narrative Comparison tool:
1. **Perspective Divergence Clusters**: Group and showcase divergent stories where Left, Right, and Center sources report on similar high-salience themes with contrasting framing, sentiment, and loaded rhetoric.
2. **Interactive Spectrum Distribution Bar**: Provide a live, aggregated framing breakdown chart that visually displays the proportion of Left, Center, and Right coverage across the current blindspot dataset with GSAP bar expand animations.
3. **Side-by-Side Framing Comparison Card**: Create an interactive comparison component showing opposing viewpoint summaries, key framing angles, and loaded terms side-by-side for matched/related news topics.
4. **Fluid UI & GSAP Micro-Interactions**: Incorporate 60fps spring transitions, filter transitions, and tabbed comparison views adhering to `prefers-reduced-motion`.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js Server Components, client boundaries, and dynamic route data fetching.
- `.agents/skills/supabase` — Supabase queries, joins, and pgvector cosine similarity matching.
- `.agents/skills/gsap-core` — GSAP tweens, easings, and timelines.
- `.agents/skills/gsap-react` — Scoped `@gsap/react` `useGSAP()` hook for cleanup and React 19 safety.
- `.agents/skills/gsap-performance` — GPU transforms, autoAlpha, and reducing layout shifts.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `app/blindspot/page.tsx` — Server component for the Blindspot page, searchParams handling, and article list rendering.
- `lib/supabase/queries/articles.ts` — Query functions including `getPublishedArticles` and `getRelatedArticles`.
- `components/ui/bias-meter.tsx` — Proportional bar visualization for Left/Center/Right framing.
- `components/ui/article-grid.tsx` — Staggered GSAP animated grid wrapper for news cards.
- `components/ui/news-card.tsx` — Article card rendering source, sentiment, and bias labels.

---

## Decisions and assumptions

1. **Divergence Discovery Strategy**:
   - In `app/blindspot/page.tsx`, compute an aggregated spectrum overview from all fetched blindspot articles (total Left %, Center %, Right % breakdown and average confidence).
   - Identify high-divergence story pairs/clusters among fetched articles with contrasting bias labels (e.g. Left vs Right articles) sharing related topics or keywords, or high framing divergence.
2. **Aggregated Spectrum Breakdown Header**:
   - Add a `components/ui/blindspot-spectrum-summary.tsx` client component that presents an aggregated visual distribution meter (Left % vs Center % vs Right %) across all analyzed blindspot stories with animated GSAP bar reveals.
3. **Side-by-Side Perspective Divergence Card**:
   - Add `components/ui/blindspot-divergence-card.tsx` to highlight stories covering the same underlying event with opposing framing, contrasting their:
     - Framing angles & framing notes
     - Sentiment divergence (e.g., negative vs positive emphasis)
     - Key loaded rhetoric & terms
     - Direct links to full article analyses
4. **URL & Navigation Preservation**:
   - Preserve existing `?bias=left`, `?bias=right`, and `?bias=all` filter behavior while augmenting the view with the visualizer and interactive breakdown.

---

## Files likely to change

- `components/ui/blindspot-spectrum-summary.tsx` [NEW] — Aggregated framing distribution header component with GSAP animations.
- `components/ui/blindspot-divergence-card.tsx` [NEW] — Interactive cross-spectrum story comparison component.
- `app/blindspot/page.tsx` [MODIFY] — Integrate spectrum distribution summary and perspective divergence visualizer into the layout.

---

## Implementation requirements

1. **Create `components/ui/blindspot-spectrum-summary.tsx`**:
   - Compute and render the aggregated framing proportion across all displayed articles (Left %, Center %, Right %).
   - Use `useGSAP` to smoothly animate the spectrum bar on mount and filter changes.
   - Display key perspective metrics: total blindspot stories, average partisan skew, and dominant framing lean.
2. **Create `components/ui/blindspot-divergence-card.tsx`**:
   - Render a side-by-side or tabbed comparison of contrasting perspectives for divergent articles.
   - Show opposing headline comparisons, source logos, bias labels, sentiment badges, and loaded terms.
   - Include interactive toggles ("Side by Side", "Framing Breakdown", "Loaded Terms").
3. **Update `app/blindspot/page.tsx`**:
   - Pass loaded articles and computed summary metrics to `BlindspotSpectrumSummary`.
   - Render the `BlindspotDivergenceCard` when contrasting story pairs exist in the dataset.
   - Ensure clean responsive styling across mobile, tablet, and desktop viewports.
4. **Verification**:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build` to verify 0 errors.

---

## Security requirements

- Server-side data fetching only using Supabase query patterns.
- No sensitive keys or tokens exposed to client components.
- Sanitize and format all text strings safely.

---

## Acceptance criteria

1. Navigating to `/blindspot` renders the updated Perspective Intelligence header with the aggregated **Blindspot Spectrum Distribution Summary**.
2. Switching between "All Blindspots", "Left Coverage", and "Right Coverage" updates both the spectrum summary and the article grid smoothly with GSAP transitions.
3. Divergent story perspectives display contrasting viewpoints, framing differences, and loaded rhetoric in clean, responsive cards.
4. `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Navigate to `http://localhost:3000/blindspot`.
2. Verify the **Blindspot Spectrum Distribution Summary** renders with smooth bar animations and statistics.
3. Click "Left Coverage / Skew" and verify the view filters to left-leaning coverage with updated counts and animated transitions.
4. Click "Right Coverage / Skew" and verify the view filters to right-leaning coverage.
5. Click "All Blindspots" and inspect the Perspective Divergence cards for cross-spectrum comparison.
