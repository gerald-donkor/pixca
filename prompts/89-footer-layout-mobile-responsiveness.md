# 89 — Footer Layout Mobile Responsiveness

## Goal

Harden PIXCA’s global `Footer` component for seamless, accessible, and balanced display across all viewports from `320px` mobile up to `1440px+` desktop. Ensure column stacking, touch target sizes, link contrast, social icon affordances, and the bottom legal/copyright row remain cleanly aligned, readable, and free of horizontal document overflow.

## Skills Read

- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — maintain App Router Tailwind utility conventions and responsive container constraints.
- `.agents/skills/requesting-code-review/SKILL.md` — prepare the mandatory reviewer-subagent workflow before completing the approved implementation.
- `.agents/skills/gsap-core/SKILL.md` and `.agents/skills/gsap-performance/SKILL.md` — preserve lightweight DOM structure, compositor performance, and zero runtime layout thrashing.

## Existing Code Inspected

- `AGENTS.md`
- `components/layout/footer.tsx`
- `prompts/78-header-navbar-mobile-responsiveness.md`
- `prompts/86-about-page-mobile-responsiveness.md`
- `prompts/88-authentication-pages-mobile-responsiveness.md`
- `app/layout.tsx`
- `app/globals.css`

## Visual Interpretation And Responsive Behavior

- The PIXCA footer is the dark-themed grounding element (`#0D0D0F` / `zinc-900`) across all routes with brand identity, product navigation links, help/status resources, social links, and copyright/legal information.
- On narrow mobile viewports (`320px` – `480px`), the 4-column grid should collapse gracefully into a clean, well-spaced vertical stack or balanced 2-column groupings with comfortable touch targets (minimum `44px` height/width tap area for links and icons).
- The social icon links currently have small hit targets (`w-8 h-8`) that should be hardened for accessibility and mobile touch ergonomics.
- The bottom copyright and legal links row should stack neatly on small screens (`flex-col items-center gap-3` with center alignment) and expand horizontally on tablet/desktop (`md:flex-row md:justify-between`).
- Ensure all links have accessible attributes, readable contrast against the dark background, and smooth hover/active transitions.

## Decisions And Assumptions

- Preserve the Server/Client Component boundary: `Footer` remains a simple, performant component with zero unnecessary client state or scripts.
- Use mobile-first Tailwind CSS responsive classes (`w-full`, `min-w-0`, `max-w-full`, `gap-6` on mobile to `gap-8` on desktop, `px-4 sm:px-6`).
- Social icon links should include proper `aria-label`s, `rel="noopener noreferrer"`, and accessible touch target padding.
- Do not alter existing route destinations, branding copy, or color tokens.

## Files Likely To Change

- `[MODIFY] components/layout/footer.tsx`

## Implementation Requirements

1. **Width-Safe and Responsive Layout Container**
   - Apply `w-full min-w-0 max-w-full` containment to prevent horizontal overflow at `320px`.
   - Use mobile-first horizontal padding: `px-4 sm:px-6` within `max-w-[1400px]`.
   - Set adaptive vertical spacing: `py-8 sm:py-12` and top margin `mt-12 sm:mt-16`.

2. **Column Grid Hierarchy and Typography**
   - Configure the grid: single-column stack on extra-small mobile (`grid-cols-1`), balanced 2 columns on small tablets (`sm:grid-cols-2`), and 4 columns on desktop (`md:grid-cols-4`).
   - Maintain clear typographic hierarchy with accessible contrast for headings (`text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500`) and links (`text-xs text-zinc-400 hover:text-white transition-colors`).
   - Increase vertical spacing between links (`space-y-2.5` to `space-y-3`) to prevent accidental taps on touch devices.

3. **Touch Targets and Social Icons Ergonomics**
   - Increase social icon button sizes or hit areas to at least `36px` to `40px` (`w-9 h-9 sm:w-10 sm:h-10`) with `flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-white`.
   - Add descriptive `aria-label` attributes to each social link (e.g., `aria-label="Follow Pixca on X"`, `aria-label="Pixca on LinkedIn"`).

4. **Bottom Copyright and Legal Links Alignment**
   - Structure bottom row to center-align text on mobile (`flex-col items-center text-center gap-3`) and switch to side-by-side layout on desktop (`md:flex-row md:justify-between md:text-left`).
   - Ensure legal text and footer links wrap naturally without clipping or overflowing at `320px`.

5. **Scope Protection**
   - Do not modify header navigation, database queries, route handlers, authentication flows, or AI analysis logic.

## Security Requirements

- External links must include `rel="noopener noreferrer"` where applicable.
- No secrets, tokens, or sensitive variables exposed.
- No `dangerouslySetInnerHTML` or third-party tracking scripts.

## Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `768px`, `1024px`, and `1440px`, the footer renders cleanly with zero horizontal overflow.
- All footer links and social buttons are easily tappable with adequate spacing and clear hover/active feedback.
- Brand logo, company links, help links, and social links are logically stacked and aligned across all viewport breakpoints.
- Bottom copyright notice and legal links wrap properly without truncation or visual overlap.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

## Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

## Exact Manual Test Steps Expected After Implementation

1. Run `npm run dev` and open `http://localhost:3000`.
2. Inspect the global footer in Chrome DevTools responsive mode at `320px`, `360px`, `390px`, `480px`, `768px`, `1024px`, and `1440px`.
3. Verify that there is no horizontal scrollbar at any viewport width.
4. Verify column stacking from 1 column on mobile to 2 columns on `sm` and 4 columns on `md+`.
5. Tap/click social icon buttons and links; verify touch target comfort, focus rings, and hover states.
6. Verify bottom copyright and legal links alignment at mobile and desktop widths.
7. Run `npm run typecheck`, `npm run lint`, and `npm run build`.
8. Dispatch the code-review subagent per Section 2.1 before committing.
