# 51 — Dual Local (Paystack MoMo/GHS) & International (Cards/USD) Pricing Page and Pro Subscription Architecture

## Goal

Implement a comprehensive, dual-currency **Local (Ghana Mobile Money & GHS) and International (Global Cards & USD)** subscription architecture:
1. **Dedicated Pricing Page (`app/pricing/page.tsx`)**: Responsive, theme-aware pricing page featuring **USD ($) vs GHS (GH₵) currency toggle**, **Monthly vs Annual billing toggle (20% discount)**, 3-tier plan grid (*Free Reader*, *Pixca Pro*, *Pixca Enterprise*), comprehensive 18-row feature comparison matrix, and interactive FAQ accordion.
2. **Interactive Pricing Component (`components/ui/pricing-cards.tsx`)**: Dynamic client component supporting instant currency and interval switches, highlighting *Pixca Pro* with gradient badge, feature checklists, and checkout action triggers.
3. **Paystack-Powered Multi-Channel Checkout Modal (`components/ui/checkout-modal.tsx`)**: Interactive checkout modal with:
   - **Local Channel (Ghana & Africa)**: Ghana Mobile Money (MTN MoMo, Telecel/Vodafone Cash, AirtelTigo Money) & Local Bank Cards in GHS (GH₵).
   - **International Channel (Global)**: Visa, Mastercard, AMEX in USD ($) or GHS.
   - Clerk user identity auto-detection (prefilling logged-in user email and Clerk `userId`).
   - Resilient developer test-mode simulation & live Paystack payment initialization.
4. **Global Navigation Integration**: Link to `/pricing` in Desktop Header (`components/layout/header.tsx`), Mobile Drawer (`components/layout/mobile-drawer.tsx`), and Subscribe Modal (`components/ui/subscribe-modal.tsx`).

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router Client Component patterns, Server Components, metadata, and static/dynamic route conventions.
- `.agents/skills/clerk/SKILL.md` — Authentication, user session integration, and prefilling subscriber credentials.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Choreographed entrance animations and micro-interactions.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `components/layout/header.tsx` — Desktop header navigation and subscribe CTA.
- `components/layout/mobile-drawer.tsx` — Mobile drawer navigation items and subscribe button.
- `components/ui/subscribe-modal.tsx` — Subscription dialog modal for free newsletter.
- `components/ui/dialog.tsx` — Base UI accessible dialog primitives.
- `components/ui/button.tsx` — Button component.
- `app/globals.css` — Semantic design tokens for dark and light mode.

---

## Decisions and assumptions

1. **Payment Architecture — Paystack & Clerk Division of Responsibility**:
   - **Clerk**: Handles user identity, authentication, session tokens, and Clerk `userId`.
   - **Paystack**: Handles payment processing (Ghana Mobile Money + Global Visa/Mastercard/AMEX) and payouts in GHS/USD.
   - Clerk user details (`email`, `userId`) are automatically passed into the checkout flow so payments are tagged to the user's account.
2. **Dual Currency & Pricing Tiers**:
   - **USD ($) International**:
     - *Free Reader*: `$0/mo` ($0/yr)
     - *Pixca Pro*: `$9/mo` ($86/yr - Save 20%) [Most Popular]
     - *Pixca Enterprise / Researcher*: `$29/mo` ($279/yr - Save 20%)
   - **GHS (GH₵) Local (Ghana & Africa)**:
     - *Free Reader*: `GH₵0/mo` (GH₵0/yr)
     - *Pixca Pro*: `GH₵120/mo` (GH₵1,150/yr - Save 20%) [Most Popular]
     - *Pixca Enterprise / Researcher*: `GH₵390/mo` (GH₵3,740/yr - Save 20%)
3. **Interactive UI Structure**:
   - **Currency Switcher**: Toggle between `USD ($)` and `GHS (GH₵)` with active currency state.
   - **Billing Interval Switcher**: Toggle between `Monthly` and `Annual (Save 20%)` with dynamic price calculation.
   - **Checkout Modal**:
     - Plan summary with selected interval & currency.
     - Option A: **Mobile Money (GH₵)** — Select network (MTN MoMo, Telecel Cash, AirtelTigo) and input MoMo phone number.
     - Option B: **Credit / Debit Card (USD / Global)** — Card details checkout via Paystack popup or direct link.
     - Handles instant test-mode confirmation and success state.
   - **Feature Comparison Table**: 18 rows grouped into:
     - *Core News & Sentiment*
     - *Advanced AI Analysis & Matrix*
     - *Research, Alerts & Bookmarks*
     - *Developer API & Team Features*
   - **FAQ Accordion**: 6 comprehensive answers covering Mobile Money, international card processing, plan upgrades, cancellation, and AI analysis methodology.
4. **Navigation Integration**:
   - Add `/pricing` to the Desktop Header navigation bar.
   - Add "Pricing & Plans" to the Mobile Drawer with a "Pro" badge.
   - Update `SubscribeModal` with a Pro upgrade banner directing users to `/pricing`.

---

## Files likely to change

- `app/pricing/page.tsx` [NEW] — Dedicated Pricing page with SEO metadata, Schema.org JSON-LD, Hero, feature matrix, and FAQs.
- `components/ui/pricing-cards.tsx` [NEW] — Client pricing cards component with currency and billing interval toggles.
- `components/ui/checkout-modal.tsx` [NEW] — Multi-channel checkout dialog (Mobile Money + Global Cards).
- `components/layout/header.tsx` [MODIFY] — Add "Pricing" navigation link.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Add "Pricing & Plans" link with badge.
- `components/ui/subscribe-modal.tsx` [MODIFY] — Add Pro upgrade teaser linking to `/pricing`.

---

## Implementation requirements

1. **`app/pricing/page.tsx`**:
   - Server Component with exportable `Metadata` (OpenGraph, Twitter cards) and Schema.org JSON-LD structured data (`OfferCatalog` / `Product`).
   - Theme-aware styling (`var(--surface)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--border)`).
   - Renders Hero, `PricingCards`, 18-row Feature Comparison Table, and interactive FAQ accordion.
2. **`components/ui/pricing-cards.tsx`**:
   - Client Component with state for `currency` (`"USD"` | `"GHS"`) and `interval` (`"monthly"` | `"annual"`).
   - Renders 3 tier cards (*Free Reader*, *Pixca Pro*, *Enterprise / Researcher*).
   - Dynamic pricing math displaying monthly equivalent during annual billing.
   - Highlights *Pixca Pro* card with gradient border, `Most Popular` badge, and prominent CTA.
   - Clicking "Get Started" (Free) opens the Free Newsletter Modal or routes to `/sign-up`.
   - Clicking "Upgrade to Pro" or "Get Enterprise" triggers the `CheckoutModal` with pre-selected plan, currency, and interval.
3. **`components/ui/checkout-modal.tsx`**:
   - Accessible Dialog modal leveraging `@base-ui/react` primitives from `components/ui/dialog.tsx`.
   - Displays plan summary and price breakdown.
   - Tab / method switch between:
     - **Mobile Money (GH₵)**: Network selector (MTN, Telecel, AirtelTigo) + Phone Number input.
     - **Credit / Debit Card (USD / Global)**: International card billing with Paystack badge.
   - Auto-populates email from Clerk user session (`useUser()`) if signed in.
   - Handles submission with live feedback, loading spinner, and success confirmation modal state.
4. **`components/layout/header.tsx`**:
   - Add `Pricing` nav link with active pathname indicator.
5. **`components/layout/mobile-drawer.tsx`**:
   - Add `Pricing & Plans` to `NAV_ITEMS` with `CreditCard` or `Sparkles` icon and `Pro` badge.
6. **`components/ui/subscribe-modal.tsx`**:
   - Add a subtle Pro upgrade footer with link to `/pricing`.

---

## Security requirements

- No private API keys or secret tokens exposed on client.
- Input sanitization for email and phone numbers.
- Safe integration with Clerk authentication.

---

## Acceptance criteria

1. Navigating to `/pricing` displays the full pricing page with responsive layout, dark/light theme support, and working currency/interval toggles.
2. Toggling currency switches between USD ($) and GHS (GH₵) with correct exchange rates ($9 vs GH₵120).
3. Toggling billing interval switches between Monthly and Annual with 20% discount math applied.
4. Clicking "Upgrade to Pro" opens the `CheckoutModal` displaying plan details, Mobile Money network options, and Card checkout.
5. The 18-row feature comparison matrix renders clearly with checkmarks, labels, and dashes.
6. FAQ accordion allows clicking to expand and collapse questions smoothly.
7. Header and Mobile Drawer include active `/pricing` links.
8. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run verification checks:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
2. Test Pricing Page & Currency Switches:
   - Navigate to `http://localhost:3000/pricing`.
   - Switch currency between **USD ($)** and **GHS (GH₵)** and verify prices update across all 3 cards.
   - Switch interval between **Monthly** and **Annual (Save 20%)** and verify annual prices and discount badges.
3. Test Checkout Modal:
   - Click **"Upgrade to Pro"** on the Pixca Pro card.
   - Verify the **Checkout Modal** displays the selected plan, price, and payment methods.
   - Test switching between **Mobile Money (MTN, Telecel, AirtelTigo)** and **Credit/Debit Card**.
   - Test submitting test payment and verify success confirmation.
4. Test Navigation & Drawer:
   - Click **"Pricing"** in desktop header and verify active tab indicator.
   - Open mobile drawer and click **"Pricing & Plans"**.
   - Open Subscribe modal and click the Pro upgrade link.
