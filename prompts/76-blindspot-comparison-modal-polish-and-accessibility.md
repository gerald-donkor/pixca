# 76 - Blindspot Comparison Modal Polish And Accessibility

## Goal

Polish the Blindspot perspective comparison experience introduced in prompt 75 by tightening modal accessibility, keyboard/focus behavior, mobile layout resilience, reduced-motion behavior, and interaction affordances without adding a new product surface.

The implementation should make the existing `/blindspot` "Compare in Modal" flow feel stable and production-ready on desktop and mobile while preserving the current Pixca visual language.

---

## Skills read

- `node_modules/next/dist/docs/03-architecture/accessibility.md` - Next.js route announcements, built-in accessibility linting, and reduced-motion guidance.
- `.agents/skills/gsap-core/SKILL.md` - Core GSAP tweens, `autoAlpha`, transform properties, and `gsap.matchMedia()` for reduced-motion handling.
- `.agents/skills/gsap-react/SKILL.md` - `useGSAP()` hook, scoped refs, context cleanup, and SSR-safe React animation patterns.
- `.agents/skills/gsap-performance/SKILL.md` - Compositor-friendly animation properties, avoiding layout thrashing, and limiting unnecessary `will-change`.
- `.agents/skills/requesting-code-review/SKILL.md` - Required pre-completion review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` - Required review feedback evaluation workflow.
- `.agents/skills/caveman-commit/SKILL.md` - Terse Conventional Commit message guidance.

---

## Existing code inspected

- `components/ui/perspective-comparison-modal.tsx` - Existing client modal, target article normalization, mobile tab state, copy summary behavior, GSAP entrance animation, and mobile "Read Full Coverage" navigation.
- `components/ui/blindspot-divergence-card.tsx` - Existing Blindspot feature card, tab switcher, "Compare in Modal" launcher, and mapping from `ArticleWithSourceAndAnalysis` into modal comparison data.
- `prompts/75-blindspot-interactive-perspective-comparison.md` - Prior prompt defining the Blindspot modal launcher and generalized target article shape.
- `prompts/74-fix-mobile-full-coverage-scroll-to-top.md` - Prior prompt defining mobile scroll-to-top behavior from the comparison modal.

---

## Decisions and assumptions

1. **This is a hardening pass, not a new feature**:
   - Keep the work limited to the existing Blindspot comparison modal and card launcher.
   - Do not add URL-addressable modal routes, new pages, new data fetching, or new Supabase queries.

2. **Preserve current data boundaries**:
   - `app/blindspot/page.tsx` remains responsible for server-side data loading.
   - `components/ui/blindspot-divergence-card.tsx` and `components/ui/perspective-comparison-modal.tsx` remain focused client components for interaction and display.
   - UI continues to display stored analysis only.

3. **Accessibility should use existing primitives first**:
   - Preserve the existing `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, and `DialogDescription` primitives.
   - Improve labels, button semantics, focus expectations, and keyboard clarity through props/classes and existing markup rather than replacing the dialog system.

4. **Animation should be small and hygienic**:
   - Keep GSAP usage scoped through `useGSAP({ scope: containerRef })`.
   - Animate `autoAlpha`, `y`, and `scale` only.
   - Respect `prefers-reduced-motion: reduce`.
   - Avoid persistent `will-change` except where an element is actively animated and it can be cleared or contained.

5. **Mobile text and controls must not overflow**:
   - The source labels and mobile tab buttons can contain long outlet names.
   - Buttons and badges must wrap, truncate, or rebalance without overlapping or shifting layout awkwardly.

---

## Files likely to change

- `components/ui/perspective-comparison-modal.tsx` [MODIFY] - Improve accessibility labels, mobile tab semantics, focus-safe copy timeout cleanup, long-label layout behavior, reduced-motion fallback, and modal content sizing.
- `components/ui/blindspot-divergence-card.tsx` [MODIFY] - Improve launcher semantics, tab group accessibility, button labels, mobile wrapping, and optional GSAP hover/click feedback if it can be done without layout churn.
- `components/ui/button.tsx` [MODIFY IF NEEDED] - Only if an existing variant/class pattern needs reuse for consistent focus-visible styles. Do not create new button variants unless already aligned with the component API.

---

## Implementation requirements

1. **Improve modal accessibility in `components/ui/perspective-comparison-modal.tsx`**:
   - Ensure the dialog title and description provide a meaningful accessible name and purpose.
   - Add explicit `aria-label` values where icon-heavy or ambiguous controls need them.
   - Treat mobile view buttons as a tab-like control:
     - Use `role="tablist"` on the wrapper.
     - Use `role="tab"` on each button.
     - Set `aria-selected` according to `mobileTab`.
     - Keep keyboard tab order predictable.
   - Preserve Escape-to-close and overlay click behavior provided by the dialog primitive.

2. **Make copy feedback cleanup safe**:
   - Replace bare `setTimeout(() => setCopied(false), 2500)` with timeout cleanup using a ref/effect so no state update can fire after unmount.
   - Keep current toast copy behavior and comparison text content, but remove non-ASCII symbols from generated copy text if touching that string.

3. **Harden mobile layout and text behavior**:
   - Ensure long source names in the top comparison bar and mobile tab buttons do not overlap or force horizontal page scrolling.
   - Keep modal content within viewport height and width on narrow screens.
   - Use stable dimensions or responsive constraints for the mobile tab switcher and action buttons.
   - Avoid nested cards beyond the existing modal/card structure; do not introduce decorative wrappers.

4. **Normalize animation behavior**:
   - Keep entrance animation inside scoped `useGSAP`.
   - Add a reduced-motion branch that sets final visible state without animated movement if needed.
   - Do not animate layout properties such as width, height, margin, padding, top, or left.
   - Do not run any GSAP code during SSR.

5. **Improve Blindspot card controls in `components/ui/blindspot-divergence-card.tsx`**:
   - Add accessible labels to the "Compare in Modal" button and tab buttons where the visible text is not enough for screen reader context.
   - Mark the Side-by-Side / Framing & Rhetoric control group with appropriate tab semantics or an accessible grouped label.
   - Ensure button wrapping works at narrow widths without obscuring card title or feature badge.
   - Preserve existing card visual hierarchy, blue/red perspective colors, and current links to article details.

6. **Do not broaden scope**:
   - Do not change Supabase schemas, query logic, API routes, billing, authentication, scraping, analysis, or routing.
   - Do not add new dependencies.
   - Do not rename exported comparison interfaces unless required by type safety.

---

## Security requirements

- Preserve `target="_blank"` with `rel="noopener noreferrer"` on desktop links opened in a new tab.
- Do not use `dangerouslySetInnerHTML`.
- Keep all rendered article fields as normal React text nodes.
- Do not expose secrets, environment variables, or server-only data in client components.

---

## Acceptance criteria

- [ ] `/blindspot` comparison launcher opens the modal with the correct left/right article data.
- [ ] Modal can be operated by keyboard: open trigger, tab through mobile tabs/actions, close with Escape, and activate "Read Full Coverage".
- [ ] Mobile tab buttons expose selected state with ARIA and remain visually stable for long outlet names.
- [ ] Long source names, badges, and action buttons do not overlap or create horizontal scrolling at 320px, 390px, 768px, and desktop widths.
- [ ] Copy feedback timeout is cleaned up on unmount.
- [ ] Reduced-motion users receive the final visible state without movement-heavy GSAP animation.
- [ ] Desktop "Read Full Coverage" links still open in a new tab with `noopener noreferrer`.
- [ ] Mobile "Read Full Coverage" still closes the modal, blurs active focus, scrolls to top, and navigates to the article.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev`.
2. Open `http://localhost:3000/blindspot`.
3. Tab to the "Compare in Modal" button and press Enter.
4. Verify the modal opens, focus remains inside the dialog, and Escape closes it.
5. Reopen the modal at mobile width (`390px`) and use the mobile comparison tabs.
6. Verify tab selected states are visible and keyboard reachable.
7. Check `320px`, `390px`, `768px`, and desktop widths for horizontal overflow, overlapping text, or clipped buttons.
8. Click "Copy Comparison" and verify the toast appears and the copied text is readable.
9. On desktop width, click "Read Full Coverage" and verify it opens in a new tab.
10. On mobile width, click "Read Full Coverage" and verify the app navigates to the article from the top of the page.
