# Goal

Fix the homepage news feed mobile responsiveness so the source pills bar, search/filter controls, empty state, loading skeleton, and article card grid do not horizontally overflow or clip content at narrow widths. The implementation should preserve the existing Pixca editorial UI while making the homepage stable from `320px` mobile through tablet and desktop widths.

# Skills Read

- `.agents/skills/gsap-core/SKILL.md` - Core GSAP tween behavior, `autoAlpha`, `gsap.matchMedia()`, and reduced-motion handling.
- `.agents/skills/gsap-react/SKILL.md` - `useGSAP()` scoping and cleanup patterns for React/Next.js client components.
- `.agents/skills/gsap-performance/SKILL.md` - Compositor-friendly animation guidance and avoiding layout-heavy animation properties.
- `.agents/skills/requesting-code-review/SKILL.md` - Required review workflow before finishing implementation.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` - Next.js App Router CSS and Tailwind usage.
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` - Next.js `<Link>` behavior and supported anchor attributes.

# Existing Code Inspected

- `AGENTS.md`
- `app/page.tsx`
- `app/loading.tsx`
- `components/ui/article-grid.tsx`
- `components/ui/news-card.tsx`
- `components/ui/filter-bar.tsx`
- `components/ui/source-pills-bar.tsx`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/78-header-navbar-mobile-responsiveness.md`

# Visual Interpretation & Responsive Behavior

- The homepage uses a compact editorial dashboard pattern: a sticky-feeling source rail, a carded search/filter panel, and a dense responsive article grid.
- The current layout is already close, but several containers use fixed desktop padding (`px-6`), fixed or generous gaps, and non-shrinking rows that can create overflow on very narrow mobile screens.
- Mobile should feel like a deliberate single-column news feed:
  - Source pills remain horizontally scrollable inside their own rail, not by widening the whole document.
  - Search and filters stack cleanly with full-width controls and wrapped chips.
  - Article cards retain their image, source/date metadata, title, bias meter, and analysis footer without forcing long text beyond the card.
  - Empty and loading states match the same width constraints as the loaded page.
- Tablet and desktop layouts should preserve the existing visual hierarchy: two-column grid at `md`, three-column grid at `lg`, expanded spacing on desktop, and no change to stored data rendering.

# Decisions And Assumptions

- Treat this as a homepage/feed responsiveness hardening pass, not a product redesign.
- Do not change article fetching, Supabase query behavior, search parameter semantics, scraping, analysis, authentication, billing, or pipeline state.
- Preserve the URL as the filter/search state source of truth (`source`, `bias`, `sentiment`, `q`).
- Prefer Tailwind utility changes over new components or global CSS.
- Keep all GSAP animation scoped to existing client components and limited to transform/opacity properties.
- Do not add dependencies.

# Files Likely To Change

- `[MODIFY] app/page.tsx`
- `[MODIFY] app/loading.tsx`
- `[MODIFY] components/ui/article-grid.tsx`
- `[MODIFY] components/ui/news-card.tsx`
- `[MODIFY] components/ui/filter-bar.tsx`
- `[MODIFY] components/ui/source-pills-bar.tsx`

# Implementation Requirements

1. **Homepage container sizing (`app/page.tsx`)**
   - Add mobile-safe width constraints to the top-level page and main container with `w-full`, `min-w-0`, `max-w-full`, and `overflow-x-hidden` where appropriate.
   - Reduce smallest-screen horizontal padding from `px-6` to a mobile-first scale such as `px-4 sm:px-6`.
   - Ensure heading and subheading text can wrap naturally without creating document overflow.

2. **Source pills rail (`components/ui/source-pills-bar.tsx`)**
   - Ensure the outer rail and inner container cannot expand past viewport width.
   - Use mobile-first padding such as `px-3 sm:px-6`.
   - Keep chevron buttons stable and non-shrinking.
   - Keep the pills container horizontally scrollable while preventing page-level horizontal scrolling.
   - Ensure long source names truncate or remain contained within pill boundaries.
   - Preserve existing URL query update behavior and scroll button behavior.

3. **Filter/search panel (`components/ui/filter-bar.tsx`)**
   - Ensure the card, rows, search input, result summary, reset action, and chip groups all fit at `320px`.
   - Add `min-w-0` and `max-w-full` to shrinkable flex children.
   - Keep the search input full-width on mobile.
   - Allow result count and reset action to wrap without clipping.
   - Keep filter chips accessible with stable touch targets and wrapped rows.
   - Preserve debounced search and URL parameter behavior.

4. **Article grid (`components/ui/article-grid.tsx`)**
   - Ensure the grid wrapper is `w-full min-w-0 max-w-full`.
   - Keep the one/two/three-column responsive behavior, but use mobile-safe gaps such as `gap-4 sm:gap-5 lg:gap-6` if needed.
   - Ensure each grid item and link wrapper can shrink with `min-w-0`.
   - Harden the empty state with mobile padding (`p-6 sm:p-12`), `max-w-full`, and wrapping text/button behavior.
   - Preserve the existing GSAP reveal animation and reduced-motion branch.

5. **News card containment (`components/ui/news-card.tsx`)**
   - Ensure long titles, source names, dates, AI framing labels, confidence text, and footer chips never widen the card.
   - Add `min-w-0` and `max-w-full` to metadata/footer rows where needed.
   - Use wrapping or truncation in places where long outlet names or AI labels can create overflow.
   - Keep bookmark click behavior, entitlement gating, toast behavior, and GSAP bookmark bounce unchanged.
   - Preserve existing vertical and horizontal variants.

6. **Loading skeleton parity (`app/loading.tsx`)**
   - Match homepage container padding and width constraints so loading does not overflow before content appears.
   - Ensure skeleton filter chips wrap on mobile instead of forcing a wide row.
   - Ensure skeleton cards use the same grid and card containment rules as the loaded state.

7. **Animation and accessibility**
   - Do not animate layout properties such as width, height, margin, padding, top, or left.
   - Keep GSAP selector usage scoped through `useGSAP({ scope: gridRef })`.
   - Preserve `prefers-reduced-motion` handling.
   - Preserve semantic buttons, labels, link destinations, and keyboard behavior.

# Security Requirements

- No API route changes.
- No auth, Clerk, Supabase, scraping, AI, scheduler, or billing changes.
- Do not expose environment variables or secrets.
- Keep article fields rendered as normal React text nodes.
- Do not use `dangerouslySetInnerHTML`.

# Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, and `556px`, the homepage has no document-level horizontal scrollbar.
- Source pills scroll inside their own rail and do not widen the page.
- Search input, result count, reset action, framing chips, and sentiment chips remain fully visible and usable on mobile.
- Empty state content and the reset button fit within the viewport.
- Article cards fit within the viewport, including long source names, long titles, AI framing labels, confidence text, and bookmark controls.
- Loading skeleton matches the same responsive behavior and does not overflow.
- Tablet widths (`768px` and `1024px`) retain clean two-column layout without card or filter collisions.
- Desktop widths (`1280px` and above) retain the existing three-column homepage grid and visual rhythm.
- Existing GSAP reveal and bookmark animations still work and respect reduced motion.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Manual Test Steps

1. Start the dev server with `npm run dev`.
2. Open `http://localhost:3000`.
3. In browser DevTools, test widths:
   - `320px`
   - `360px`
   - `390px`
   - `480px`
   - `556px`
   - `768px`
   - `1024px`
   - `1440px`
4. Confirm there is no page-level horizontal scrollbar at any width.
5. Scroll the source pills rail left and right and confirm only the rail scrolls horizontally.
6. Type in the search input and confirm the debounced query update works.
7. Toggle framing and sentiment filters and confirm chips wrap cleanly without clipping.
8. Use a filter combination that returns no articles and confirm the empty state fits on mobile.
9. Inspect several article cards with long titles/source names and confirm metadata and footer labels stay within the cards.
10. Enable reduced motion in the OS/browser if practical and confirm homepage card reveal remains accessible without movement-heavy animation.
