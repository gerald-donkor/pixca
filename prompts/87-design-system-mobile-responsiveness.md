# 87 — Design System Page Mobile Responsiveness

## Goal

Harden the internal `/design-system` reference page for reliable use from `320px` through tablet and desktop widths. Preserve the existing PIXCA token showcase, component examples, dark-mode treatment, and static server-rendered architecture while eliminating document-level horizontal overflow and cramped, unreadable comparison layouts on narrow screens.

## Skills Read

- `.agents/skills/requesting-code-review/SKILL.md` — prepare the mandatory reviewer-subagent workflow before completing the approved implementation.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — retain the App Router Tailwind utility approach and avoid unrelated global styling changes.
- `.agents/skills/gsap-core/SKILL.md` and `.agents/skills/gsap-performance/SKILL.md` — preserve the project convention that any existing or required motion remains compositor-friendly and reduced-motion-safe. This static reference page does not need new motion for responsive hardening.

## Existing Code Inspected

- `AGENTS.md`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/78-header-navbar-mobile-responsiveness.md`
- `prompts/79-homepage-feed-mobile-responsiveness.md`
- `prompts/81-pricing-page-mobile-responsiveness.md`
- `prompts/82-for-you-page-mobile-responsiveness.md`
- `prompts/83-blindspot-page-mobile-responsiveness.md`
- `prompts/84-saved-library-mobile-responsiveness.md`
- `prompts/85-logs-dashboard-mobile-responsiveness.md`
- `prompts/86-about-page-mobile-responsiveness.md`
- `app/design-system/page.tsx`
- `app/globals.css`
- `components/ui/button.tsx`
- `components/ui/chip.tsx`
- `components/ui/bias-meter.tsx`
- `components/ui/news-card.tsx`

## Visual Interpretation And Responsive Behavior

- `/design-system` is PIXCA’s practical visual reference surface: a three-column desktop bento grid presents brand, token, typography, icon, grid, button, chip, bias-meter, news-card, shadow, and radius specimens, followed by a compact dark identity footer.
- On mobile it must become a calm, readable one-column reference sheet with compact but sufficient page padding, clear card boundaries, retained type hierarchy, and every token/component example visible without a horizontal page rail.
- The principal narrow-width risks are the three- and four-column swatch grids, fixed-width typography labels and pixel-value columns, the four-column button comparison, the five-column icon grid, 12-column grid specimen, two-column shadows/radius cards, full-width `NewsCard`, and both dense footer rows. These should reflow, reduce column count, or stack deliberately rather than clipping or shrinking text to illegibility.
- Desktop must retain the existing bento composition: three columns at `lg`, two at `md`, familiar card spacing, token colors, and the side-by-side comparison affordances wherever adequate width exists.

## Decisions And Assumptions

- This is a focused responsive-hardening pass, not a design-system content rewrite, token redesign, route-access change, component API change, or animation initiative.
- Preserve the route as a Server Component; preserve metadata, all showcase copy and values, imported PIXCA components, existing dark-mode colors, card hierarchy, and static sample data.
- Prefer small, local Tailwind containment and breakpoint changes such as `min-w-0`, `max-w-full`, mobile-first `px-4 sm:px-6`, responsive grid columns/gaps, wrap-safe text, and local `overflow-x-auto` only for a genuinely tabular visual specimen that must remain horizontally comparable. Do not hide content, globally suppress overflow, or use scaling that makes controls or labels unreadable.
- Keep changes scoped to `app/design-system/page.tsx` unless implementation proves a shared component causes a demonstrable overflow that cannot safely be contained by the route. The expected target is the route only.
- No screenshots, Figma files, or added design assets were supplied; extend the existing PIXCA token language rather than inventing a new visual direction.

## Files Likely To Change

- `[MODIFY] app/design-system/page.tsx`

## Implementation Requirements

1. **Route shell and bento structure**
   - Make the route root, main container, and every bento column width-safe at `320px`. Use compact mobile edge padding such as `px-4 sm:px-6`, preserve the `max-w-[1400px]` desktop composition, and retain the 1-column/mobile, 2-column/`md`, 3-column/`lg` bento progression.
   - Ensure cards can shrink within their grid tracks using local containment; never add a page-wide horizontal-overflow mask to conceal a defective child.
   - Preserve card background, borders, radii, shadows, semantic spacing, visual ordering, and dark-mode styles.

2. **Brand, color, and spacing specimens**
   - Keep the Pixca News lockup, badge, and tagline entirely visible at narrow widths. The badge may wrap/compact with its wordmark if necessary, but must not overlap or leave the card.
   - Reflow the Primary and Semantic three-swatch groups, and the four-neutral group, at a suitable small breakpoint so swatches and their names/values remain readable. Preserve their desktop three/four-column comparisons when space permits.
   - Keep CSS variable labels visible and safely wrap/break only unbroken technical strings that otherwise exceed their owning swatch.
   - Preserve the spacing-scale visual at mobile. Its bars and `4px`–`64px` labels must stay fully visible, with smaller safe gaps or a deliberate compact layout rather than clipping.

3. **Typography, icons, and grid reference**
   - Maintain readable type-scale rows. At narrow widths, stack or otherwise reflow the H1/Body label, example, and pixel-value columns so the fixed label/value widths do not force overflow; restore aligned multi-column comparison at adequate width.
   - Preserve the icon set and visual rhythm with a responsive icon grid that remains touch/scan friendly and has no clipped columns.
   - Keep the 12-column grid illustration perceptible. It may use a locally-contained, labelled overflow treatment only if reflow would no longer demonstrate twelve columns; it must never create a document-level scrollbar or conceal the visual without an accessible indication.
   - Preserve the container/columns/gutter metrics and stack or reflow those metric items at the narrowest widths without losing values.

4. **UI component examples**
   - Make the button state matrix usable at mobile. Reflow its four-column label/default/hover/outline comparison into a readable narrow layout while retaining side-by-side comparison on sufficiently wide screens; preserve visible labels and the imported `Button` semantics.
   - Keep chips wrapping naturally and preserve the BiasMeter’s full distribution display.
   - Ensure the NewsCard sample is constrained by its owning card and preserves its content, image, metadata, bias data, links/actions, and any existing responsive behavior. Do not change `NewsCard` data or its public API merely for this route.
   - Reflow the shadow and border-radius examples from two cards to one at narrow widths, preserving every label, sample box, and RGBA/pixel value.

5. **Footer, accessibility, and scope**
   - Keep the dark footer’s brand/tagline group and version/date/message group readable. At mobile, stack or wrap content with deliberate alignment and no clipped separator or text; preserve the existing desktop row at `sm` and above where it fits.
   - Retain semantic headings/labels, text contrast, logical source order, keyboard behavior of imported controls, and existing focus-visible treatments. Do not turn sample buttons into inert markup or add unnecessary client state.
   - Do not introduce GSAP, convert the page to a Client Component, alter global CSS, change the shared header/footer, add dependencies, or make changes to APIs, Supabase, Clerk, scraping, AI analysis, scheduler, or environment variables.

## Security Requirements

- Do not change authorization, Clerk behavior, Supabase access, application data, API routes, pipeline logic, security headers, or environment variables.
- Keep all design-system content rendered as React text and components. Do not introduce `dangerouslySetInnerHTML`, client-side content fetching, external requests, tracking, or user-data transmission.
- Preserve the existing static route and component imports; do not expose any application secrets or server-only data.

## Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, `/design-system` has no document-level horizontal scrollbar.
- Every current specimen remains visible and readable: brand lockup; color swatches and values; spacing scale; typography rows; icons; 12-column grid; metrics; button-state examples; chips; BiasMeter; NewsCard; shadow/radius cards; and footer metadata.
- Narrow layouts reflow intentionally; no important values or controls are reduced to unreadably tiny text, clipped, overlapped, or hidden. Any essential local horizontal visual treatment is contained and discoverable without affecting the document width.
- Desktop retains the existing bento hierarchy, wide token comparisons, two-column `md` and three-column `lg` layout, colors, card treatments, static metadata, and dark-mode support.
- The route remains a static Server Component and does not change shared components, product data, authentication, APIs, persistence, pipeline behavior, or animation architecture.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with no errors.

## Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

## Exact Manual Test Steps Expected After Implementation

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/design-system` and test at `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px` in browser DevTools.
3. Confirm there is no document-level horizontal scrollbar at every width. Inspect the brand lockup, Primary/Semantic/Neutral color grids, and spacing scale at `320px`; confirm labels, values, and bars remain fully visible.
4. Check every typography scale row, icon grid, 12-column specimen, and metrics section at narrow widths. Confirm labels/examples/values are readable and no visual is clipped; if a local scroll treatment is used for the 12-column specimen, confirm it is contained to that specimen and does not widen the page.
5. Verify the buttons, chips, BiasMeter, and NewsCard sample remain usable and legible at mobile widths, then ensure shadow and radius examples reflow without losing any sample/value.
6. Inspect the footer at `320px` and `390px`; verify the brand, tagline, version, date, and message wrap or stack cleanly. Toggle light/dark theme and confirm all specimens retain contrast and intended token colors.
7. At `768px`, `1024px`, and `1440px`, confirm the bento grid returns to its intended two- and three-column comparison layout with no unnecessary stacking.
8. Run the listed verification commands and review the final diff before dispatching the mandatory code-review subagent.
