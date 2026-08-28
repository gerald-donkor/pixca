# Goal

Fix the pricing page and subscription checkout mobile responsiveness so the public pricing surface is stable from `320px` mobile through tablet and desktop widths. Pricing cards, currency and billing toggles, trust badges, status banners, the feature comparison matrix, FAQ cards, bottom CTA, and checkout modal content must not horizontally overflow, clip labels, or force document-level horizontal scrolling.

# Skills Read

- `.agents/skills/polar/SKILL.md` - Polar billing, checkout, customer portal, Merchant of Record behavior, and development fallback expectations.
- `.agents/skills/gsap-core/SKILL.md` - Core GSAP tween behavior, `autoAlpha`, `transform`, stagger, and reduced-motion `matchMedia()` handling.
- `.agents/skills/gsap-react/SKILL.md` - `useGSAP()` scoping and cleanup patterns for Next.js/React client components.
- `.agents/skills/gsap-performance/SKILL.md` - Compositor-friendly animation rules and avoiding layout-heavy animated properties.
- `.agents/skills/requesting-code-review/SKILL.md` - Required code review workflow before finishing implementation.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` - Next.js App Router CSS and Tailwind usage.

# Existing Code Inspected

- `AGENTS.md`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/78-header-navbar-mobile-responsiveness.md`
- `prompts/79-homepage-feed-mobile-responsiveness.md`
- `prompts/80-command-palette-mobile-responsiveness.md`
- `app/pricing/page.tsx`
- `components/ui/pricing-cards.tsx`
- `components/ui/pricing-faq.tsx`
- `components/ui/checkout-modal.tsx`

# Visual Interpretation And Responsive Behavior

- The pricing page is a dense subscription surface with a centered editorial hero, trust badges, animated plan cards, a comparison table, FAQ accordion, and final CTA.
- The current layout already uses responsive padding in places, but it still has several mobile risk points:
  - Hero trust badges include long labels such as `Polar (Global Cards, Apple Pay & MoR Tax)` and `MTN MoMo ... (Paystack)` that can widen the page unless constrained.
  - Currency and interval segmented controls use long labels such as `GHS (GH...) Local MoMo` and `Save up to 25%`, which can clip or force overflow at `320px`.
  - Pricing cards display large prices, annual savings rows, plan badges, and long feature labels that need `min-w-0`, wrapping, and smaller mobile spacing.
  - The comparison matrix uses `min-w-[700px]`, which can be acceptable only if horizontal scrolling is contained inside the table wrapper and never creates page-level overflow.
  - Checkout modal rows include long plan names, payment method labels, receipt values, payment-channel text, Clerk IDs, and security footer labels that need to wrap cleanly inside the dialog.
- Mobile should feel like a deliberate single-column subscription flow:
  - The hero copy remains centered and readable without clipped badges.
  - Pricing controls stack or wrap predictably with full-width or contained segmented groups.
  - Plan cards are full-width, touch-friendly, and do not shift width on hover/active states.
  - The comparison table either scrolls within its own rounded container or presents a mobile-safe alternative, without body overflow.
  - Checkout modal content fits within the viewport and remains scrollable vertically when needed.
- Desktop intent should remain unchanged: centered hero, four-card pricing grid at `lg`, comparison table, FAQ accordion, and bottom CTA.

# Decisions And Assumptions

- Treat this as a responsive hardening pass, not a billing redesign.
- Preserve all pricing tiers, prices, currency behavior, billing interval behavior, CTA labels, checkout opening behavior, simulated Paystack/MoMo behavior, Polar references, customer portal behavior, and subscription entitlement logic.
- Do not change API routes, Polar product IDs, webhook behavior, Supabase schema, Clerk auth, or environment variables.
- Prefer Tailwind utility changes and local component containment over new abstractions.
- Keep the existing visual language: elevated surfaces, compact editorial typography, thin borders, restrained blue/emerald/amber/purple accents, and existing dark/light theme variables.
- Do not add dependencies.
- If the comparison table keeps horizontal scrolling, ensure the scroll is isolated to the table container with `max-w-full`, `min-w-0`, and no body-level horizontal scrollbar.

# Files Likely To Change

- `[MODIFY] app/pricing/page.tsx`
- `[MODIFY] components/ui/pricing-cards.tsx`
- `[MODIFY] components/ui/pricing-faq.tsx`
- `[MODIFY] components/ui/checkout-modal.tsx`
- `[MODIFY] components/ui/subscribe-modal.tsx` only if shared modal sizing or button containment affects the pricing flow

# Implementation Requirements

1. **Pricing page shell and hero (`app/pricing/page.tsx`)**
   - Add mobile-safe width constraints to the page and main container: `w-full`, `min-w-0`, `max-w-full`, and `overflow-x-hidden` where appropriate.
   - Keep mobile-first horizontal padding such as `px-4 sm:px-6`.
   - Ensure the hero badge, heading, and paragraph can wrap naturally without widening the page.
   - Update the payment trust bar so each trust badge uses `max-w-full`, `min-w-0`, wrapped text, and non-shrinking icons.
   - Keep trust badges visually compact at mobile widths without changing their meaning.

2. **Pricing controls (`components/ui/pricing-cards.tsx`)**
   - Ensure the currency and billing interval switchers fit at `320px`.
   - Allow segmented controls to stack, wrap, or become full-width on mobile while retaining the existing desktop inline layout.
   - Prevent long labels and badges (`GHS ... Local MoMo`, `Save up to 25%`) from clipping or forcing overflow.
   - Preserve all state transitions for `currency` and `interval`.

3. **Pricing card grid (`components/ui/pricing-cards.tsx`)**
   - Ensure the grid wrapper uses `w-full min-w-0 max-w-full`.
   - Keep one column on mobile, two columns at `md`, and four columns at `lg` unless implementation proves a minor breakpoint adjustment is necessary to prevent tablet collisions.
   - Add containment to every card with `min-w-0`, `max-w-full`, and mobile-safe padding.
   - Ensure plan names, descriptions, badges, prices, annual-equivalent rows, feature labels, and CTA buttons wrap or truncate professionally inside the card.
   - Ensure hover transforms (`hover:-translate-y-4`, `hover:scale-[1.03]`) do not create persistent layout overflow; use `overflow-visible` only where it does not create document scrolling.
   - Preserve current plan disabled state, subscription modal opening for the free plan, and checkout modal opening for paid plans.

4. **Status banners (`components/ui/pricing-cards.tsx`)**
   - Make `status=success`, `status=no_active_subscription`, and `status=simulated_portal` banners fit mobile.
   - Ensure icon, message, code text, and dismiss button wrap cleanly with `min-w-0`.
   - Keep dismiss behavior and URL cleanup unchanged.

5. **Feature comparison matrix (`app/pricing/page.tsx`)**
   - Prevent page-level horizontal overflow caused by the `min-w-[700px]` table.
   - Either:
     - keep the table horizontally scrollable within its own rounded container with clear containment, or
     - add a mobile-specific stacked comparison view while retaining the desktop table.
   - Do not remove existing comparison content or change tier values.
   - Ensure section header rows, feature names, and value cells remain readable.
   - Keep the Pixca Pro highlight styling intact.

6. **FAQ and bottom CTA (`components/ui/pricing-faq.tsx`, `app/pricing/page.tsx`)**
   - Ensure FAQ buttons and answers use `min-w-0`, wrap long answers, and do not cause overflow.
   - Ensure the bottom CTA stacks cleanly on mobile, with the button contained at `320px`.
   - Preserve accordion accessibility attributes and existing FAQ state behavior.

7. **Checkout modal (`components/ui/checkout-modal.tsx`)**
   - Ensure `DialogContent` fits at narrow widths with mobile-safe padding, `max-w-[calc(100vw-...)]`, `w-full`, `min-w-0`, and `max-h-[90vh] overflow-y-auto`.
   - Make dialog header rows wrap cleanly: plan price, instant activation badge, title, and description.
   - Make payment method selector buttons fit on mobile. Stack them on very narrow screens or shorten/wrap labels without losing meaning.
   - Make MoMo network buttons fit at `320px`; use one-column or wrapped layout if the current `grid-cols-3` clips labels.
   - Ensure phone, email, card number, expiry, and CVC inputs fit within their containers.
   - Ensure error messages and loading button text wrap without clipping.
   - Ensure success receipt rows wrap long values such as payment channel, email, and transaction reference.
   - Ensure the security footer stacks or wraps cleanly on mobile without squeezing labels together.
   - Preserve all form validation, status transitions, generated reference behavior, and close/reset behavior.

8. **Shared subscribe modal if needed (`components/ui/subscribe-modal.tsx`)**
   - Only edit if the free-plan CTA opens a modal that still overflows at mobile widths after pricing changes.
   - Keep newsletter/subscription behavior unchanged.

9. **Animation and accessibility**
   - Keep GSAP usage scoped through `useGSAP({ scope: containerRef })`.
   - Keep `gsap.matchMedia()` reduced-motion behavior.
   - Animate only compositor-friendly properties such as `y`, `scale`, and `autoAlpha`; do not animate layout properties such as width, height, margin, padding, top, or left.
   - Preserve semantic buttons, links, labels, inputs, dialog roles, focus behavior, keyboard dismissal, and touch targets.

# Security Requirements

- No API route changes.
- No changes to Clerk authentication, Supabase persistence, Polar webhook handling, Polar product configuration, or environment variables.
- Do not expose `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, Clerk secrets, Supabase service role keys, or any server-only variable to client code.
- Do not change the pricing data values or product mapping behavior.
- Do not add `dangerouslySetInnerHTML`.
- External links, if touched, must keep `target="_blank"` with `rel="noopener noreferrer"`.

# Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, `/pricing` has no document-level horizontal scrollbar.
- Hero trust badges fit cleanly and remain readable at mobile widths.
- Currency and billing interval controls remain usable without clipped labels.
- Pricing cards fit the viewport on mobile, retain the existing grid behavior on tablet/desktop, and do not clip plan badges, prices, savings text, features, or CTA buttons.
- Status banners render cleanly for `?status=success`, `?status=no_active_subscription`, and `?status=simulated_portal`.
- The feature comparison matrix does not widen the document and remains usable/readable on mobile.
- FAQ accordion items and the bottom CTA do not overflow or overlap.
- Checkout modal is fully usable at `320px` and `390px`, including payment method selection, MoMo network selection, card inputs, submit button, security footer, and success receipt.
- Existing checkout/subscription state behavior remains unchanged.
- GSAP pricing card reveal animation still works and respects reduced motion.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Manual Test Steps

1. Start the dev server with `npm run dev`.
2. Open `http://localhost:3000/pricing`.
3. In browser DevTools, test widths:
   - `320px`
   - `360px`
   - `390px`
   - `480px`
   - `556px`
   - `768px`
   - `1024px`
   - `1440px`
4. Confirm there is no document-level horizontal scrollbar at any width.
5. Toggle `USD ($) Global` and `GHS (GH...) Local MoMo`; confirm controls remain contained and pricing updates.
6. Toggle monthly and annual billing; confirm savings rows fit inside cards.
7. Open paid-plan checkout from Starter, Pixca Pro, and Enterprise.
8. At `320px` and `390px`, test both payment methods:
   - Select Mobile Money, switch MoMo networks, enter a Ghana phone number, and confirm the form remains contained.
   - Select Card & Wallets, enter cardholder name, card number, expiry, and CVC, and confirm inputs remain contained.
9. Submit a valid simulated payment and confirm the success receipt fits on mobile.
10. Visit:
    - `http://localhost:3000/pricing?status=success`
    - `http://localhost:3000/pricing?status=no_active_subscription`
    - `http://localhost:3000/pricing?status=simulated_portal`
    Confirm each status banner fits and dismisses correctly.
11. Scroll the feature comparison matrix on mobile and confirm any horizontal scrolling is contained inside the matrix wrapper only.
12. Open and close FAQ items and confirm long answers wrap within the card.
13. Enable reduced motion if practical and confirm the pricing card reveal remains accessible without movement-heavy animation.
