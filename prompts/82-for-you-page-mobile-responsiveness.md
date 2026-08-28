# Goal

Harden the `/for-you` personalized news feed for mobile responsiveness from `320px` through tablet and desktop widths. The page must have no document-level horizontal overflow, and its hero, adaptive reading profile, onboarding state, tuning controls, topic pills, empty state, article grid, and share action must remain legible, tappable, and visually coherent at narrow widths without changing personalization behavior.

# Skills Read

- `.agents/skills/gsap-core/SKILL.md` — preserve transform/`autoAlpha` animation and `gsap.matchMedia()` reduced-motion patterns.
- `.agents/skills/gsap-react/SKILL.md` — retain scoped `useGSAP()` lifecycle cleanup in existing client components.
- `.agents/skills/gsap-performance/SKILL.md` — avoid layout-heavy animation changes and excessive mobile animation work.
- `.agents/skills/requesting-code-review/SKILL.md` — required reviewer-subagent workflow before completion.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — existing App Router Tailwind styling approach.

# Existing Code Inspected

- `AGENTS.md`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/78-header-navbar-mobile-responsiveness.md`
- `prompts/79-homepage-feed-mobile-responsiveness.md`
- `prompts/80-command-palette-mobile-responsiveness.md`
- `prompts/81-pricing-page-mobile-responsiveness.md`
- `app/for-you/page.tsx`
- `components/ui/for-you-feed.tsx`
- `components/ui/for-you-affinity-summary.tsx`
- `components/ui/for-you-tuning-controls.tsx`
- `components/ui/news-card.tsx`
- `components/ui/reading-diet-share-modal.tsx`

# Visual Interpretation And Responsive Behavior

- The page is a dense, editorial personalized-feed surface: a dark intelligence hero, adaptive reading-profile card or first-visit onboarding card, filter/tuning controls, and a three-column story grid on desktop.
- At mobile widths, its two-column hero feature badges, long tuning labels such as `Echo-Chamber Shield`, the profile balance legend, profile action row, topic pill strip, and card metadata are the principal overflow and clipping risks.
- Mobile should read as an intentional single-column feed: compact outer padding, wrap-safe copy and controls, horizontally scrollable chip groups only inside their own bounded regions, and full-width touch targets. Desktop hierarchy, colors, cards, and animation intent remain unchanged.

# Decisions And Assumptions

- This is a responsive-hardening pass, not a recommendation-system redesign.
- Preserve all existing bookmark-derived affinity calculations, ranking modes, topic filtering, empty-state reset behavior, links, and local-storage behavior.
- Prefer targeted Tailwind containment and responsive utilities (`min-w-0`, `max-w-full`, `w-full`, controlled local `overflow-x-auto`, wrapping and breakpoint-specific labels) over new abstractions.
- Keep long mode and topic labels readable; where a compact label is needed on the narrowest widths, retain an accessible full name with an appropriate label or title.
- Do not alter Supabase reads, server data fetching, Clerk, AI, scraping, billing, API routes, or environment variables.

# Files Likely To Change

- `[MODIFY] app/for-you/page.tsx`
- `[MODIFY] components/ui/for-you-feed.tsx`
- `[MODIFY] components/ui/for-you-affinity-summary.tsx`
- `[MODIFY] components/ui/for-you-tuning-controls.tsx`
- `[MODIFY] components/ui/news-card.tsx` only if shared story-card content still widens the For You grid
- `[MODIFY] components/ui/reading-diet-share-modal.tsx` only if opening Share Profile from this page still overflows at mobile widths

# Implementation Requirements

1. **Page shell and intelligence hero (`app/for-you/page.tsx`)**
   - Use mobile-first page/container containment: `w-full min-w-0 max-w-full`, safe outer padding such as `px-4 sm:px-6`, and no document-level horizontal overflow.
   - Ensure the hero copy wraps naturally and feature badges stay within the card.
   - Keep the two primary feature badges readable at narrow widths; use a single-column badge layout at the smallest breakpoint if two columns cannot stay comfortably contained.
   - Keep ambient decorative glows clipped by the hero itself, never by a broad global rule that masks legitimate local scrolling.

2. **Feed, onboarding, empty state, and story grid (`components/ui/for-you-feed.tsx`)**
   - Add `min-w-0 max-w-full` containment to the feed root, onboarding card, text groups, CTA link, empty state, grid, grid items, links, and story-card wrappers.
   - Make the first-visit onboarding CTA full-width or naturally sized on mobile without overflowing; retain its desktop inline placement.
   - Ensure long empty-state topic/mode copy wraps and the reset action stays fully visible and touch-friendly.
   - Keep the story grid at one column on mobile, two at `md`, and three at `lg`; no grid child may force the page wider than the viewport.
   - Preserve ranking/filtering behavior, `prefetch={false}`, and GSAP card entrance behavior. Keep animation scoped to `containerRef`, preserve `gsap.matchMedia()` reduced-motion handling, and continue to animate only compositor-friendly properties.

3. **Adaptive profile card (`components/ui/for-you-affinity-summary.tsx`)**
   - Add width containment to all header, copy, action, meter, metric-card, and topic-pill wrappers.
   - At narrow widths, permit the profile title/badge, shield indicator, and Share Profile action to wrap or stack without overlap; preserve full labels and accessible button behavior.
   - Make the Left/Center/Right percentage legend fit at `320px`: use responsive text/gaps and, if necessary, a wrapped or compact layout while keeping each percentage distinguishable.
   - Ensure metric cards fit in a two-column mobile grid, their labels wrap/truncate safely, and topic chips remain bounded.
   - Do not change profile statistics, share data, modal state, or current GSAP meter/metric animation behavior.

4. **Tuning mode and topic controls (`components/ui/for-you-tuning-controls.tsx`)**
   - Keep mode controls usable at `320px` without widening the document. A locally contained horizontal scroll region is acceptable for the mode tabs; provide clear focus visibility and preserve touch scrolling.
   - Use compact responsive mode labels on the smallest widths only if needed, while preserving each mode's accessible full label and behavior.
   - Ensure the results count and Reset control wrap or stack gracefully and never collide with the tab strip.
   - Ensure the mode explanation has `min-w-0` and can wrap long descriptions rather than pushing the page width.
   - Keep Topic Focus/Explore Topics and topic pills in their own bounded horizontal scroll region on mobile; badges and buttons must not shrink below usable tap targets or escape the card.
   - Preserve current filtering callbacks and active styling exactly in function.

5. **Shared card/modal containment only if required**
   - If `NewsCard` causes overflow from long title, source, date, or analysis labels in the For You grid, make the smallest shared, non-regressive containment change; retain its appearance elsewhere.
   - If the Reading Diet Share modal opened by Share Profile does not already fit at `320px`, apply the smallest mobile-safe dialog width, padding, and vertical-scroll adjustment without altering export/share content or behavior.

6. **Accessibility and motion**
   - Preserve semantic buttons, links, keyboard focus, modal focus management, and visible focus styles.
   - Do not hide information solely due to viewport size unless an equivalent accessible label is retained.
   - Keep existing `useGSAP({ scope: containerRef })` usage and reduced-motion handling; do not animate width, height, margins, padding, top, or left.

# Security Requirements

- No API, auth, persistence, scraping, AI, billing, or environment-variable changes.
- Do not expose bookmarks or client data beyond existing local behavior.
- Do not add `dangerouslySetInnerHTML`.
- Keep all article links and existing external-link safety attributes unchanged.

# Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, `/for-you` has no document-level horizontal scrollbar.
- The hero, feature badges, onboarding state, adaptive profile, share action, balance legend, metric cards, tuning controls, topic strip, empty state, and article cards fit and remain usable on mobile.
- Any horizontal scrolling is intentionally local to a control strip and does not move the document horizontally.
- Tuning mode changes, topic filtering, reset actions, bookmarking-derived ranking, article navigation, and Share Profile behavior remain unchanged.
- The existing article and profile GSAP animations remain scoped, performant, and reduced-motion-safe.
- Desktop layout retains its current spacious hero, inline desktop controls, and three-column article grid.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with no errors.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Manual Test Steps

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/for-you`.
3. In browser DevTools, test widths `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`.
4. Confirm the document never scrolls horizontally.
5. Test the no-bookmark onboarding state: verify its copy and Explore Top News CTA remain contained.
6. Save one or more articles, reload `/for-you`, and verify the adaptive profile, balance legend, metric cards, and Share Profile action fit cleanly.
7. Switch among all four tuning modes, scroll the mode/topic strips at mobile width, select and reset a topic, and confirm controls remain reachable and results update.
8. Open Share Profile and verify its modal is usable at `320px`; close it with its visible control and Escape.
9. Open multiple resulting articles and verify cards and links remain contained.
10. Enable reduced motion if practical and verify content remains immediately usable without motion-heavy reveals.
