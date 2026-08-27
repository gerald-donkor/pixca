# 75 — Blindspot Interactive Perspective Comparison

## Goal

Enable instant, interactive side-by-side perspective comparison directly from **The Blindspot Feed** ([`app/blindspot/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/blindspot/page.tsx)) and the **Blindspot Divergence Card** ([`components/ui/blindspot-divergence-card.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/blindspot-divergence-card.tsx)), allowing readers to launch the full **Perspective Comparison Modal** ([`components/ui/perspective-comparison-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/perspective-comparison-modal.tsx)) for high-contrast Left vs. Right editorial pairs with full metrics, framing notes, loaded terms, and responsive navigation.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js router navigation, `<Link scroll={true}>`, and server/client component boundaries.
- `.agents/skills/gsap-core/SKILL.md` — Core tweens, transforms, responsive matchMedia, and autoAlpha transitions.
- `.agents/skills/gsap-react/SKILL.md` — `useGSAP()` hook, scoped refs, and React 19 lifecycle management.
- `.agents/skills/requesting-code-review/SKILL.md` — Pre-completion review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- [`components/ui/perspective-comparison-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/perspective-comparison-modal.tsx) — Dual-perspective comparison modal, delta calculations, and responsive modal actions.
- [`components/ui/blindspot-divergence-card.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/blindspot-divergence-card.tsx) — Featured left vs. right divergence card in the Blindspot feed with side-by-side and framing matrix tabs.
- [`app/blindspot/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/blindspot/page.tsx) — The Blindspot Feed page server component.
- [`components/ui/related-articles.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/related-articles.tsx) — Related articles section on article detail pages invoking the comparison modal.

---

## Decisions and assumptions

1. **Generalized Target Article Schema in `PerspectiveComparisonModal`**:
   - Currently, `PerspectiveComparisonModalProps` expects `targetArticle: RelatedArticleRow | null` (which requires `similarity: number` and `article_id: string`).
   - Define a generalized `TargetArticleComparisonData` interface that accommodates both `RelatedArticleRow` (from pgvector similarity search on article details) and `ArticleWithSourceAndAnalysis` (from Blindspot or manual pairing).
   - Normalize field access (`article_id` or `id`, `source_name` or `source.name`, etc.) and provide optional `similarity` (falling back gracefully to `"Divergence Pair"` or a calculated divergence index if semantic similarity is not present).

2. **Divergence Card Modal Launcher**:
   - In [`components/ui/blindspot-divergence-card.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/blindspot-divergence-card.tsx), add a prominent "Open Full Comparison" / "Compare in Modal" action button with an `ArrowRightLeft` icon in the card header and quick-launch triggers.
   - When clicked, open `PerspectiveComparisonModal` with `leftArticle` as `primaryArticle` and `rightArticle` as `targetArticle`.

3. **Smooth GSAP Micro-Interactions**:
   - Add hover scale (`scale: 1.04`) and click feedback to the comparison launcher button.
   - Ensure all animations respect `prefers-reduced-motion: reduce`.

4. **Mobile Navigation Consistency**:
   - Maintain the scroll-to-top behavior (`window.scrollTo({ top: 0, left: 0, behavior: "instant" })` and `router.push(..., { scroll: true })`) when "Read Full Coverage" is clicked inside the modal on mobile viewports.

---

## Files likely to change

- `components/ui/perspective-comparison-modal.tsx` [MODIFY] — Generalize target article interface to accept both `RelatedArticleRow` and `TargetArticleComparisonData`, supporting summary and framing notes on both sides.
- `components/ui/blindspot-divergence-card.tsx` [MODIFY] — Add modal comparison state, trigger button in top banner, and mount `PerspectiveComparisonModal`.
- `app/blindspot/page.tsx` [MODIFY] — Ensure article analysis records passed to `BlindspotDivergenceCard` have complete metadata.

---

## Implementation requirements

1. **Update `components/ui/perspective-comparison-modal.tsx`**:
   - Export `TargetArticleComparisonData` interface:
     ```ts
     export interface TargetArticleComparisonData {
       id?: string;
       article_id?: string;
       title: string;
       source_name?: string;
       sourceName?: string;
       published_at?: string;
       publishedAt?: string;
       image_url?: string;
       imageUrl?: string;
       bias_label?: BiasLabel;
       biasLabel?: BiasLabel;
       left_percentage?: number;
       leftPercentage?: number;
       center_percentage?: number;
       centerPercentage?: number;
       right_percentage?: number;
       rightPercentage?: number;
       sentiment_label?: SentimentLabel;
       sentimentLabel?: SentimentLabel;
       sentiment_score?: number;
       sentimentScore?: number;
       confidence?: number;
       similarity?: number;
       summary?: string;
       framing_notes?: string | null;
       framingNotes?: string | null;
       loaded_terms?: string[];
       loadedTerms?: string[];
     }
     ```
   - Update `PerspectiveComparisonModalProps` to accept `targetArticle: TargetArticleComparisonData | RelatedArticleRow | null`.
   - Normalize target property helper getters (`targetArticleId`, `targetSourceName`, `targetBiasLabel`, `targetLeft`, `targetCenter`, `targetRight`, `targetSentiment`, `targetSummary`, `targetFramingNotes`, `targetLoadedTerms`).
   - If `similarity` is provided, display `Similarity: X%`. If omitted or undefined, display `Divergence Delta: X%`.
   - Render target summary and loaded terms if present.

2. **Enhance `components/ui/blindspot-divergence-card.tsx`**:
   - Import `PerspectiveComparisonModal`, `PrimaryArticleComparisonData`, and `TargetArticleComparisonData`.
   - Add state: `const [compareModalOpen, setCompareModalOpen] = React.useState(false);`
   - Map `leftArticle` to `PrimaryArticleComparisonData` and `rightArticle` to `TargetArticleComparisonData`.
   - Add a "Compare in Modal" button in the top action header alongside "Side by Side" and "Framing & Rhetoric" tabs.
   - Render `<PerspectiveComparisonModal>` with `leftArticle` as primary and `rightArticle` as target.

3. **Verify `app/blindspot/page.tsx`**:
   - Ensure the server component supplies the needed fields to `BlindspotDivergenceCard`.

---

## Security requirements

- External links or tab navigation on desktop must use `target="_blank"` with `rel="noopener noreferrer"`.
- All client-side dialog interactions must sanitize inputs and avoid XSS vulnerabilities.

---

## Acceptance criteria

- [ ] Readers on `/blindspot` can click "Compare in Modal" on the Blindspot Divergence Card to open the full side-by-side comparison modal.
- [ ] Modal displays accurate left vs. right metrics, bias distributions, tone, framing notes, and loaded terms for both outlets.
- [ ] Clipboard link copying formats the comparison summary properly.
- [ ] Mobile "Read Full Coverage" action resets the viewport scroll to top cleanly.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000/blindspot`.
2. Locate the "Perspective Divergence" feature card at the top of the feed.
3. Click the new "Compare in Modal" button.
4. Verify the perspective comparison modal opens with the Left and Right articles side-by-side.
5. Check that bias distribution meters, sentiment badges, summaries, and loaded terms render cleanly for both articles.
6. Click "Copy Comparison" and verify toast notification.
7. Click "Read Full Coverage" on mobile emulation and verify smooth navigation to the top of the article.
