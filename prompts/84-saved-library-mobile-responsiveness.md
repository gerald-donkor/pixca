# Goal

Harden the `/saved` personal library for mobile responsiveness from `320px` through tablet and desktop widths. The page must have no document-level horizontal overflow while its library header and plan quota, reading-diet summary, filters, saved-story cards, removal controls, empty states, upgrade flow, clear-library confirmation, and share-diet dialog remain legible, tappable, and visually coherent without changing bookmark, entitlement, filtering, sorting, sharing, or animation behavior.

# Skills Read

- `.agents/skills/gsap-core/SKILL.md` — preserve transform/`autoAlpha` tween behavior and the existing `gsap.matchMedia()` reduced-motion branches.
- `.agents/skills/gsap-react/SKILL.md` — retain scoped `useGSAP()` lifecycles and cleanup in client components.
- `.agents/skills/gsap-performance/SKILL.md` — keep motion compositor-friendly and avoid layout-heavy animation changes.
- `.agents/skills/requesting-code-review/SKILL.md` — use the required reviewer-subagent workflow before completion.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — follow the existing App Router Tailwind styling approach; do not introduce broad global CSS for a route-specific responsiveness fix.

# Existing Code Inspected

- `AGENTS.md`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/79-homepage-feed-mobile-responsiveness.md`
- `prompts/82-for-you-page-mobile-responsiveness.md`
- `prompts/83-blindspot-page-mobile-responsiveness.md`
- `app/saved/page.tsx`
- `components/ui/saved-filters-bar.tsx`
- `components/ui/saved-diet-meter.tsx`
- `components/ui/reading-diet-share-modal.tsx`
- `components/ui/article-grid.tsx`

# Visual Interpretation And Responsive Behavior

- Saved is a compact editorial-library surface: a title and account-quota header, personal reading-diet intelligence, query/filter/sort controls, and rich saved article cards. The dark cards and blue/red perspective signals must retain their existing hierarchy.
- At small widths, the header badge cluster, Upgrade/Clear actions, long Reading Diet title and status indicator, three-part spectrum legend, four diet metrics, search/sort/results group, framing chips, source selector, story metadata, and confirmation/share dialogs are the primary overflow risks.
- Mobile should feel deliberately single-column with compact outer padding, wrapping text and controls, and local horizontal scrolling only for a bounded control rail when it is genuinely more usable than wrapping. Desktop retains the current spacious inline control rows and multi-column metrics.

# Decisions And Assumptions

- This is a responsive-hardening pass, not a saved-library, bookmark, entitlement, or reading-diet feature redesign.
- Preserve local bookmark storage and removal/clear behavior, subscription entitlement checks and upgrade modal triggering, filtering/search/sort calculations, source lists, article navigation, share/export behavior, toasts, and existing visual language.
- Prefer narrow Tailwind containment changes (`min-w-0`, `max-w-full`, `w-full`, responsive padding/gaps, wrapping, safe truncation, and bounded local `overflow-x-auto`) over global overflow suppression, global CSS hacks, or new abstractions.
- Do not shorten or hide meaningful information solely to make a layout fit. Where an extremely narrow presentation needs a compact visual label, retain the complete accessible name through visible copy at an appropriate breakpoint or an ARIA label/title.
- Decorative card effects remain clipped by the owning card; no broad `overflow-x-hidden` rule may mask a document overflow defect or disable intentional local rails.
- Do not alter Supabase, Clerk, AI, scraping, scheduler, billing API routes, environment variables, or shared data models.

# Files Likely To Change

- `[MODIFY] app/saved/page.tsx`
- `[MODIFY] components/ui/saved-filters-bar.tsx`
- `[MODIFY] components/ui/saved-diet-meter.tsx`
- `[MODIFY] components/ui/reading-diet-share-modal.tsx` only if the Saved launch path still overflows or clips at `320px`
- `[MODIFY] components/ui/upgrade-modal.tsx` only if the Saved upgrade launch path still overflows or clips at `320px`
- `[MODIFY] components/ui/dialog.tsx` only if the shared dialog primitive is the demonstrated source of the Saved confirmation-dialog issue; keep the change non-regressive for all callers

# Implementation Requirements

1. **Page shell, header, and states (`app/saved/page.tsx`)**
   - Make the outer page and `main` mobile-first and width-safe with `w-full min-w-0 max-w-full`, compact outer padding such as `px-4 sm:px-6`, and no document-level horizontal overflow.
   - Keep the bookmark icon, `Saved Articles` title, article count, and Free/Starter/Pro quota badge readable at `320px`; allow the badge group to wrap cleanly without collision.
   - Stack or wrap the Upgrade for Unlimited and Clear all actions below the header content on narrow widths, with usable touch targets and no clipped button text. Retain their current desktop placement and actions.
   - Contain the no-bookmark and filtered-empty states. At the smallest widths, keep their copy, icons, Reset Filters, and Discover Top Stories CTA fully visible and naturally sized.
   - Contain each saved article card and its action row: long titles, source names, dates, summary/framing copy, sentiment/bias badges, bias meters, external/source links, and Remove action may wrap or truncate only where the full information remains available. Preserve article links and removal behavior.
   - Preserve the scoped `useGSAP({ scope: containerRef })` card entrance animation and animated removal. Keep transform/`autoAlpha` motion and reduced-motion behavior; do not animate width, height, margins, padding, `top`, or `left`.

2. **Reading-diet card (`components/ui/saved-diet-meter.tsx`)**
   - Add `min-w-0 max-w-full` containment to the card, header/copy group, dominant-lean indicator, Share Diet control, spectrum, legend, and metric-card grid.
   - At narrow widths, stack or safely wrap the long `Personal Reading Diet & Perspective Balance` heading, story-count badge, status indicator, and Share Diet action. Preserve all labels and button behavior.
   - Keep the Left/Center/Right spectrum inside the card at `320px`; segment labels must never force their proportional segments wider. Preserve every percentage via current tooltips and/or the legend when an in-segment label has insufficient room.
   - Make the three-part legend and `Calculated across your saved stories` caption fit by wrapping or stacking with mobile-safe gaps; all perspective values must remain distinct.
   - Use one metric column at the smallest width, two columns from `sm`, and four from `lg` unless the existing design already demonstrates a more legible width-safe layout. Metric labels and percentage text must remain readable.
   - Preserve the current statistics, share-modal state, `useGSAP` scope, `gsap.matchMedia()` branches, animated spectrum values, and transform/opacity-only animations.

3. **Search, filters, sort, and source controls (`components/ui/saved-filters-bar.tsx`)**
   - Give the root, both control rows, search field, sort/result group, framing controls, and source selector width containment.
   - At `320px`, keep the search field full width with an unclipped search icon and clear button; its placeholder may be compacted only if needed, with no loss of the field's accessible purpose.
   - Let sort, result count, and Reset controls wrap or stack cleanly. The select must be usable, remain inside the viewport, and not cause the document to widen.
   - Keep every framing option (`All Framing`, `Left`, `Center`, `Right`) reachable, with visible active and focus states. Use a bounded local horizontal rail only if wrapping would make the controls substantially less usable; never make the document horizontally scrollable.
   - Ensure long source names stay within their select/control boundary and do not grow the page. Preserve all existing callback behavior and selected styles.

4. **Saved dialogs only if necessary**
   - Exercise the Share Diet, upgrade, and Clear all flows at `320px`. If each existing dialog fits, do not modify it.
   - If a dialog overflows, make the smallest non-regressive adjustment in its owning component (or the shared primitive only when it is the proven root cause): viewport-bounded width, responsive padding, wrap-safe header/footer/actions, and internally scrollable content when necessary.
   - Preserve dialog focus management, backdrop/Escape dismissal, copy/share/download actions, subscription checkout navigation, clear-library confirmation, existing desktop layout, and visible focus indicators.

5. **Accessibility and motion**
   - Preserve semantic links, buttons, inputs, selects, dialog behavior, keyboard interaction, and visible `focus-visible` styles.
   - Avoid clipping selectable text or controls behind `overflow-hidden`; apply clipping only to intentional visual effects/spectrum segments.
   - Do not add dependencies, `dangerouslySetInnerHTML`, global CSS hacks, or unrelated refactors.

# Security Requirements

- No API, authentication, persistence, subscription entitlement, checkout, scraping, AI, scheduler, or environment-variable changes.
- Retain client-local bookmark data handling and do not expose it to server code or third parties beyond existing share/download behavior explicitly invoked by the user.
- Render bookmark and analysis values as normal React text; do not introduce unsafe HTML rendering.
- Preserve all existing internal/external link destinations and external-link safety attributes.

# Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, `/saved` has no document-level horizontal scrollbar.
- The library title, count/quota badges, Upgrade/Clear actions, no-bookmark state, reading-diet header/status/share control, spectrum, legend, metrics, search, sort, framing/source filters, result/reset controls, filtered-empty state, and saved cards remain visible, legible, and usable.
- Any horizontal scrolling is intentionally local to a bounded control rail and never scrolls the document.
- Search, framing/source filtering, all sorting modes, Reset Filters, removal animation, Clear all confirmation, upgrade gating, article links, and Share Diet actions retain existing behavior.
- Existing GSAP animations remain scoped, performant, and reduced-motion-safe.
- Desktop retains its current hierarchy, inline desktop actions/filters, and multi-column metric layout.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with no errors.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Exact Manual Test Steps Expected After Implementation

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/saved` and test at `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px` in browser DevTools.
3. With no bookmarks, confirm the empty-state copy and Discover Top Stories action are contained and the document does not scroll horizontally.
4. Save several articles with long titles and source names, return to `/saved`, and confirm the header badges/actions, reading-diet card, spectrum, legend, metric cards, filters, and saved cards remain contained.
5. At mobile width, search by title/source; exercise every framing option, source select, and every sort option; reset filters and confirm counts/results update without layout overflow.
6. Remove one saved article, confirm the existing animation/toast behavior, then open Clear all; verify the confirmation dialog fits, closes via its visible control and Escape, and clearing still works.
7. If the account is at its bookmark limit, open Upgrade for Unlimited and verify the upgrade dialog is fully usable on mobile without changing its checkout behavior.
8. Open Share Diet at `320px`; verify the dialog, copy/share/download controls, and close/Escape behavior all remain reachable and functional.
9. Enable reduced motion if practical; confirm cards and diet content remain immediately usable without motion-heavy transitions.
