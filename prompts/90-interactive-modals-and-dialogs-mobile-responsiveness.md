# 90 — Interactive Modals and Dialogs Mobile Responsiveness

## Goal

Harden all interactive modals and dialog overlays across PIXCA (`DialogContent` primitive in `components/ui/dialog.tsx`, `ShareModal`, `ReadingDietShareModal`, `SubscribeModal`, `UpgradeModal`, and `CheckoutModal`) for seamless, accessible, and balanced display across all viewports from `320px` mobile up to `1440px+` desktop. Ensure dialog width containment, internal scrolling on small viewports, touch target ergonomics, text wrapping, and close button placement are clean, readable, and free of document-level or modal-level horizontal overflow.

## Skills Read

- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — maintain App Router Tailwind CSS utility patterns and responsive layout constraints.
- `.agents/skills/requesting-code-review/SKILL.md` — prepare the mandatory reviewer-subagent workflow before completing the approved implementation.
- `.agents/skills/gsap-core/SKILL.md`, `.agents/skills/gsap-react/SKILL.md`, and `.agents/skills/gsap-performance/SKILL.md` — preserve lightweight DOM hierarchy, compositor performance, and `prefers-reduced-motion` safety in modal animations.

## Existing Code Inspected

- `AGENTS.md`
- `components/ui/dialog.tsx`
- `components/ui/share-modal.tsx`
- `components/ui/subscribe-modal.tsx`
- `components/ui/upgrade-modal.tsx`
- `components/ui/checkout-modal.tsx`
- `components/ui/reading-diet-share-modal.tsx`
- `components/ui/perspective-comparison-modal.tsx`
- `prompts/76-blindspot-comparison-modal-polish-and-accessibility.md`
- `prompts/88-authentication-pages-mobile-responsiveness.md`
- `prompts/89-footer-layout-mobile-responsiveness.md`

## Visual Interpretation And Responsive Behavior

- PIXCA interactive modals provide essential user workflows: sharing articles, exporting personalized reading diets, subscribing to newsletters, upgrading plans, and completing checkouts (Card & MoMo).
- On small mobile viewports (`320px` – `480px`), dialog containers must not exceed screen width or touch screen edges. `DialogContent` must enforce `w-[calc(100vw-2rem)]` (or responsive margin clamp), `max-h-[calc(100dvh-2rem)]`, smooth internal vertical scrolling with `overflow-y-auto`, and responsive padding (`p-4 sm:p-6`).
- Close buttons (`DialogPrimitive.Close`) must remain easily tappable (minimum `44px` effective tap area) and positioned without colliding with dialog titles or status badges.
- Social share grids (in `ShareModal` and `ReadingDietShareModal`) must adapt smoothly from a compact 2-column or 3-column touch-friendly grid on mobile to wider desktop layouts.
- Input fields, copy-to-clipboard buttons, and checkout action buttons must maintain clear contrast, legible text, and full horizontal width on small screens without text clipping.

## Decisions And Assumptions

- Preserve the existing `@base-ui/react/dialog` primitive integration, Sonner toast notifications, Clerk user authentication hooks, and GSAP micro-animations.
- Use mobile-first Tailwind CSS responsive classes (`w-full`, `min-w-0`, `max-w-full`, `break-words`, `p-4 sm:p-6`).
- Do not alter checkout business logic, Polar billing integration, API routes, or database schemas.
- Ensure all modal triggers, backdrops, and close buttons retain keyboard accessibility (`Escape` key, focus trapping, focus rings).

## Files Likely To Change

- `[MODIFY] components/ui/dialog.tsx`
- `[MODIFY] components/ui/share-modal.tsx`
- `[MODIFY] components/ui/subscribe-modal.tsx`
- `[MODIFY] components/ui/upgrade-modal.tsx`
- `[MODIFY] components/ui/checkout-modal.tsx`
- `[MODIFY] components/ui/reading-diet-share-modal.tsx`

## Implementation Requirements

1. **`DialogContent` Primitive Containment & Safety**
   - In `components/ui/dialog.tsx`, update default `DialogContent` classes to enforce `w-[calc(100vw-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto min-w-0 p-4 sm:p-6` so all dialog instances automatically benefit from viewport containment.
   - Adjust close button positioning (`top-3.5 right-3.5 sm:top-4 sm:right-4`) and touch target hit area with accessible focus-visible rings.

2. **`ShareModal` Responsive Refinement**
   - Ensure the article preview card (image + title) shrinks gracefully without shrinking the thumbnail below `48px` or causing title overlap.
   - Make the URL input and "Copy Link" button responsive: stack or wrap cleanly on narrow screens if necessary while keeping the copy button full-sized and tappable.
   - Arrange social share buttons in an ergonomic responsive grid (`grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5`) with accessible `aria-label`s.

3. **`SubscribeModal` & `UpgradeModal` Width & Scroll Polish**
   - Ensure feature highlight cards, price badges, and entitlement indicators wrap cleanly on `320px` without horizontal clipping.
   - Verify that newsletter input and upgrade call-to-action buttons maintain full width and high touch ergonomic fidelity.

4. **`CheckoutModal` MoMo & Card Form Ergonomics**
   - Ensure payment method toggle tabs (MoMo vs. Card) remain balanced and tappable on `320px` screens (`grid-cols-2`).
   - Format MoMo network selector buttons with sufficient touch area and clear selected states.
   - Ensure receipt breakdown and transaction reference codes wrap properly using `break-all` / `break-words`.

5. **`ReadingDietShareModal` Responsive Canvas & Preview**
   - Ensure the visual reading diet preview card scales proportionally on small viewports with `w-full min-w-0`.
   - Maintain full touch accessibility on the "Download Image", "Copy Summary", and social share actions.

6. **Scope Protection**
   - Do not touch Supabase queries, Clerk auth middleware, Oxylabs scrapers, or AI analysis pipelines.

## Security Requirements

- No secrets, API keys, or private environment variables exposed.
- Retain all input validation and sanitization.
- External social share links must include `rel="noopener noreferrer"`.

## Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `768px`, `1024px`, and `1440px`, all dialog modals open cleanly centered with zero horizontal overflow outside or inside the modal.
- Modals on short screens (e.g. landscape mobile or 320x568) scroll vertically without locking or hiding action buttons.
- Touch targets for close buttons, share options, payment tabs, and submit buttons meet mobile ergonomic standards (≥44px tap zone).
- Light and dark themes render with high contrast, legible typography, and consistent PIXCA brand styling.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

## Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

## Exact Manual Test Steps Expected After Implementation

1. Start development server with `npm run dev`.
2. Open `http://localhost:3000` and test the following modals at `320px`, `360px`, `390px`, `480px`, `768px`, and `1440px` in Chrome DevTools:
   - Click "Share" on any news card to open `ShareModal`.
   - Click "Subscribe" in header/footer to open `SubscribeModal`.
   - Open `/saved` and click "Share Diet" to open `ReadingDietShareModal`.
   - Open `/pricing` and click "Subscribe" on any tier to open `CheckoutModal`.
   - Trigger `UpgradeModal` (e.g. clicking upgrade prompt on bookmark limits).
3. Verify that all dialogs stay within the screen bounds with safe margins, no horizontal overflow, readable text, and responsive action buttons.
4. Test opening in both light and dark mode.
5. Run `npm run typecheck`, `npm run lint`, and `npm run build`.
6. Dispatch the code-review subagent per Section 2.1 before committing.
