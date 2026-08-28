# Goal

Harden the `/blindspot` editorial intelligence feed for mobile responsiveness from `320px` through tablet and desktop widths. The page must have no document-level horizontal overflow, while its intelligence hero, spectrum summary, perspective-divergence feature, filter tabs, comparison modal, empty state, and article grid remain legible, tappable, and visually coherent without changing article selection, filtering, comparison, or animation behavior.

# Skills Read

- `.agents/skills/gsap-core/SKILL.md` — retain `gsap.matchMedia()` reduced-motion branches and compositor-friendly tween properties.
- `.agents/skills/gsap-react/SKILL.md` — preserve scoped `useGSAP()` lifecycles and automatic cleanup in client components.
- `.agents/skills/gsap-performance/SKILL.md` — avoid layout-heavy motion changes while applying responsive containment.
- `.agents/skills/requesting-code-review/SKILL.md` — required reviewer-subagent workflow before completing implementation.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — existing App Router Tailwind CSS approach.

# Existing Code Inspected

- `AGENTS.md`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/79-homepage-feed-mobile-responsiveness.md`
- `prompts/82-for-you-page-mobile-responsiveness.md`
- `app/blindspot/page.tsx`
- `components/ui/blindspot-spectrum-summary.tsx`
- `components/ui/blindspot-divergence-card.tsx`
- `components/ui/article-grid.tsx`
- `components/ui/news-card.tsx`
- `components/ui/perspective-comparison-modal.tsx`

# Visual Interpretation And Responsive Behavior

- The Blindspot page is a dense, dark editorial-analysis surface: an intelligence hero, a spectrum-distribution card, a high-contrast Left/Right divergence comparison, a compact filter rail, and the shared article grid.
- At narrow widths, the hero metric cards, spectrum title and distribution indicator, legend, long filter labels, comparison action/tab controls, source metadata, loaded-term chips, and the side-by-side comparison modal are the principal overflow risks.
- Mobile should feel intentionally single-column: compact outer padding; copy, chips, and controls that wrap safely; and only deliberately bounded, touch-scrollable rails. Desktop retains its current spacious hierarchy, three hero metrics, inline filter controls, and two-column comparison panels.

# Decisions And Assumptions

- This is a responsive-hardening pass, not a Blindspot ranking, framing, filtering, or comparison redesign.
- Preserve server-side data retrieval, the `bias` URL search parameter, feature-pair selection, AI-derived display values, empty-state behavior, article links, and metadata.
- Prefer focused Tailwind containment utilities (`min-w-0`, `max-w-full`, `w-full`), responsive padding/gaps, wrapping, and bounded local `overflow-x-auto` regions over global overflow suppression or new abstractions.
- Keep labels readable. If a visual label is compacted at the narrowest widths, retain the complete accessible label through visible text at an appropriate breakpoint or an ARIA label/title.
- Keep ambient hero/card glows clipped by their owning card, never by a broad global rule that would mask intended local scrolling.
- Do not alter Supabase, Clerk, AI, scraping, scheduler, billing, API routes, environment variables, or shared data models.

# Files Likely To Change

- `[MODIFY] app/blindspot/page.tsx`
- `[MODIFY] components/ui/blindspot-spectrum-summary.tsx`
- `[MODIFY] components/ui/blindspot-divergence-card.tsx`
- `[MODIFY] components/ui/perspective-comparison-modal.tsx` only if opening the comparison from Blindspot still overflows or clips at `320px`
- `[MODIFY] components/ui/article-grid.tsx` only if its existing shared mobile containment is insufficient for the Blindspot grid
- `[MODIFY] components/ui/news-card.tsx` only if data displayed in the Blindspot grid still creates width overflow

# Implementation Requirements

1. **Page shell and hero (`app/blindspot/page.tsx`)**
   - Use mobile-first page and main-container containment: `w-full min-w-0 max-w-full`, mobile padding such as `px-4 sm:px-6`, and no document-level horizontal overflow.
   - Keep hero copy and the Perspective Intelligence badge naturally wrapping inside the rounded card.
   - Make the hero metric group fit at `320px`: retain two compact, legible metric cards on the smallest screens and the third card from `sm` upward, without clipped labels or overflow.
   - Preserve current colors, ambient glows, metadata, and server-rendered data/filter behavior.
   - Make the filter/tab row width-safe: tabs may use a locally contained horizontal scroll rail on mobile, with non-shrinking usable touch targets, while the result count wraps/stacks cleanly without moving the document horizontally.

2. **Spectrum summary (`components/ui/blindspot-spectrum-summary.tsx`)**
   - Add width containment to the card, top-row content, title/badge group, dataset-lean indicator, spectrum bar, legend, and metric cards.
   - At narrow widths, allow the long heading/badge and Overall Distribution indicator to wrap or stack without collision. Preserve every displayed statistic and status.
   - Ensure spectrum segment labels never force their percentage segments wider; retain meaningful labels where room permits and preserve the existing title tooltips for all segment values.
   - Make the Left/Center/Right legend fit `320px`, using mobile-safe gaps, wrap behavior, and/or a compact stacked layout while keeping every key distinguishable.
   - Keep mini insight cards as a readable one-column mobile layout and the current three-column layout at `sm` and above; labels and percentage text must wrap or truncate safely.
   - Preserve the existing scoped `useGSAP` spectrum/metric animation, `gsap.matchMedia()` reduced-motion handling, animated values, and transform/opacity-only motion.

3. **Perspective-divergence card (`components/ui/blindspot-divergence-card.tsx`)**
   - Add `min-w-0 max-w-full` containment to the card, heading/copy groups, action/tab region, panels, article columns, metadata rows, framing-notes content, loaded-term chip groups, and full-analysis links.
   - On the smallest widths, stack or wrap the Compare action and tablist without overlap. If the tab labels cannot remain comfortable in one row, provide a locally bounded horizontal-scroll tablist or compact visual labels with complete accessible names; retain tab semantics, focus visibility, and selection behavior.
   - Keep the comparison content single-column below `lg` as today and ensure article source names, sentiment badges, long titles, summaries, meter labels, and call-to-action text stay inside their cards.
   - Ensure the Framing & Rhetoric view has no overflowing long source names, analysis copy, or loaded-term chips. Preserve all analysis data and links.
   - Preserve `useGSAP({ scope: containerRef })`, the active-tab animation, modal state, current transform/`autoAlpha` motion, and reduced-motion branch. Do not animate dimensions, margins, padding, `top`, or `left`.

4. **Comparison modal only if necessary (`components/ui/perspective-comparison-modal.tsx`)**
   - Inspect the existing modal in the Blindspot launch path at `320px`. If it already fits, do not modify it.
   - If it overflows, apply the smallest non-regressive mobile-safe dialog constraints: viewport-bounded width, compact responsive padding, vertical internal scrolling where required, and wrap-safe header/actions/content.
   - Preserve focus management, Escape/backdrop dismissal, read-full-coverage navigation and its existing mobile scroll-to-top behavior, comparison data, and visible focus indicators.

5. **Shared grid/card containment only if required**
   - Reuse the existing shared `ArticleGrid` and `NewsCard` mobile behavior. Make the smallest shared change only if Blindspot-specific rendered content can still widen the document.
   - Retain card appearance and behavior on the home, saved, and For You pages, including bookmarks, entitlement gating, links, card animations, and data rendering.

6. **Accessibility and motion**
   - Preserve semantic links, buttons, tab roles and relationships, keyboard navigation, dialog focus management, and visible `focus-visible` styles.
   - Do not hide data solely because of viewport size unless an equivalent accessible label remains.
   - Do not add dependencies, global CSS hacks, `dangerouslySetInnerHTML`, or unrelated refactors.

# Security Requirements

- No API, authentication, persistence, scraping, AI, billing, scheduler, or environment-variable changes.
- Keep article and AI-analysis fields rendered as normal React text nodes.
- Preserve all existing link destinations and external-link safety attributes.
- Do not expose user data, credentials, or server-only values to client code.

# Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, `/blindspot` has no document-level horizontal scrollbar.
- The hero, metric cards, spectrum title/indicator/bar/legend, insight cards, filter tabs, result count, divergence header, compare action, tablist, both comparison views, and article grid remain fully visible and usable on mobile.
- Any horizontal scrolling is intentionally local to a bounded controls rail; it never scrolls the document.
- `?bias=all`, `?bias=left`, and `?bias=right` retain their existing results and selected styles.
- Perspective modal interaction, tab switching, full-analysis links, article navigation, and all AI framing values remain unchanged.
- Existing GSAP animations remain scoped, performant, and reduced-motion-safe.
- Desktop retains its current three-metric hero, inline desktop controls, two-column comparison panels, and shared article-grid layout.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with no errors.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Exact Manual Test Steps Expected After Implementation

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/blindspot`.
3. In browser DevTools, test `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px` widths.
4. Confirm the document never scrolls horizontally and the hero metric cards, spectrum legend, insight cards, filters, and article cards remain contained.
5. Visit `/blindspot?bias=left`, `/blindspot?bias=right`, and `/blindspot`; use the filter tabs at mobile width and verify only the tab rail can scroll when needed, selections work, and the result count remains visible.
6. When a featured pair exists, switch between Side by Side and Framing & Rhetoric at mobile and desktop widths; inspect long article/source/framing text and loaded terms for clipping or overflow.
7. Open Compare in Modal at `320px`, verify all dialog content and actions are reachable, close with its visible control and Escape, and activate Read Full Coverage to confirm current mobile navigation behavior remains correct.
8. Check the no-results state through a filter/data condition and verify its message stays contained.
9. Enable reduced motion if practical and confirm the spectrum and divergence content remain immediately usable without motion-heavy reveals.
