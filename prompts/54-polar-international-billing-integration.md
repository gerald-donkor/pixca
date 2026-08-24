# 54 — Official Polar (polar.sh) Merchant of Record (MoR) & Dual-Billing Integration

## Goal

Integrate Polar ([polar.sh](https://polar.sh)) as Pixca's official international Merchant of Record (MoR) billing provider using the official Polar Next.js SDK (`@polar-sh/nextjs`, `@polar-sh/sdk`, `@polar-sh/checkout`), paired with Paystack for local Ghana Mobile Money (GHS). Implement full App Router checkout routes, webhook signature verification handlers, singleton client utilities, client-side embedded/redirect checkout flows, and update the Pricing page, Checkout Modal, and FAQ according to official Polar documentation.

---

## Skills read

- `.agents/skills/polar/SKILL.md` — Official Polar Next.js, SDK, Checkout, Webhooks, and MoR guidelines.
- `node_modules/next/dist/docs/` — Next.js App Router route handlers, server/client boundaries, and environment patterns.
- `.agents/skills/clerk/SKILL.md` — Clerk user session, metadata, and authentication integration.
- `.agents/skills/supabase/SKILL.md` — Database logging and subscription status updates.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/ui/checkout-modal.tsx` — Checkout dialog, payment method selection, authorizing flow, and trust badges.
- `components/ui/pricing-cards.tsx` — Pricing cards, footer captions, currency selector, and plan action dispatchers.
- `app/pricing/page.tsx` — Pricing Hero trust bar, Schema.org metadata, and comparison matrix.
- `components/ui/pricing-faq.tsx` — FAQ accordion explaining billing, tax compliance, and payment methods.
- `.env.example` — Environment variables documentation.

---

## Decisions and assumptions

1. **Official Polar Architecture**:
   - **Packages**: Install `@polar-sh/sdk`, `@polar-sh/nextjs`, and `@polar-sh/checkout`.
   - **Singleton API Client (`lib/polar.ts`)**: Initialize typed `Polar` instance supporting both `production` and `sandbox` environments.
   - **App Router Checkout Route (`app/api/checkout/polar/route.ts`)**: Implement official `@polar-sh/nextjs` `Checkout()` handler supporting query parameters (`products`, `customerEmail`, `customerName`, `customerExternalId`, `metadata`).
   - **Programmatic Checkout API (`app/api/billing/polar/checkout/route.ts`)**: `POST` endpoint creating Polar checkout sessions with prefilled Clerk user information and resilient local simulation fallback when API keys are pending setup.
   - **App Router Webhook Handler (`app/api/webhook/polar/route.ts`)**: Implement official `@polar-sh/nextjs` `Webhooks()` handler with cryptographic signature verification via `POLAR_WEBHOOK_SECRET` and granular handlers (`onSubscriptionActive`, `onSubscriptionRevoked`, `onSubscriptionCanceled`, `onOrderPaid`, `onCheckoutCreated`, `onPayload`).
2. **Dual-Billing User Experience**:
   - **International USD ($)**:
     - Provider: **Polar** (Merchant of Record).
     - Features: Visa, Mastercard, AMEX, Apple Pay, Google Pay, automated global VAT/sales tax compliance, EU reverse-charge validation, and PDF receipts.
     - Checkout Label: `Card & Digital Wallets (Polar MoR)`.
     - Security Badge: `Secured by Polar (Merchant of Record — Global VAT & Taxes Included)`.
   - **Local Ghana GHS (GH₵)**:
     - Provider: **Paystack**.
     - Features: Instant USSD push notifications to MTN MoMo, Telecel Cash, AirtelTigo Money, and Ghana local bank cards.
     - Checkout Label: `Mobile Money (GH₵)`.
     - Security Badge: `Secured by Paystack (Ghana Mobile Money)`.
3. **Pricing Page & FAQ Alignment**:
   - Update Hero trust bar to feature `Polar (Global Cards, Apple Pay & MoR Tax)` and `MTN MoMo • Telecel • AirtelTigo (Paystack)`.
   - Update FAQ with detailed explanations on Polar's Merchant of Record benefits (automated tax compliance, zero foreign tax liabilities, global invoicing) and Mobile Money USSD authorization.

---

## Files likely to change

- `package.json` [MODIFY] — Add `@polar-sh/sdk`, `@polar-sh/nextjs`, and `@polar-sh/checkout`.
- `lib/polar.ts` [NEW] — Polar SDK client singleton.
- `app/api/checkout/polar/route.ts` [NEW] — Polar Next.js App Router checkout redirect handler.
- `app/api/billing/polar/checkout/route.ts` [NEW] — Custom POST checkout creation API.
- `app/api/webhook/polar/route.ts` [NEW] — Polar cryptographic webhook handler.
- `components/ui/checkout-modal.tsx` [MODIFY] — Add Polar branding, payment method tabs, receipt channel, and security indicators.
- `components/ui/pricing-cards.tsx` [MODIFY] — Add Polar & Paystack footer captions.
- `app/pricing/page.tsx` [MODIFY] — Update Hero trust badges with Polar and Paystack.
- `components/ui/pricing-faq.tsx` [MODIFY] — Update FAQ items to detail Polar MoR and Mobile Money.
- `.env.example` [MODIFY] — Document Polar environment variables (`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SERVER`, `NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG`).

---

## Implementation requirements

1. **Dependencies**:
   - Install `@polar-sh/sdk`, `@polar-sh/nextjs`, and `@polar-sh/checkout`.
2. **`lib/polar.ts`**:
   - Export singleton `polar = new Polar({ accessToken, server })`.
3. **`app/api/checkout/polar/route.ts`**:
   - Export `GET = Checkout({ accessToken, successUrl, returnUrl, server, theme })`.
4. **`app/api/billing/polar/checkout/route.ts`**:
   - Handle `POST` requests. Read Clerk user session, attach `customerExternalId` and `metadata: { clerk_user_id }`. If Polar credentials are present, invoke `polar.checkouts.create`; if not configured in local environment, provide graceful checkout response.
5. **`app/api/webhook/polar/route.ts`**:
   - Export `POST = Webhooks({ webhookSecret, onSubscriptionActive, onSubscriptionRevoked, onOrderPaid, onPayload })`.
6. **`components/ui/checkout-modal.tsx`**:
   - Update Card payment tab to `Card & Digital Wallets (Polar MoR)`.
   - Update footer security text to `Secured by Polar (Merchant of Record) & Paystack (Ghana MoMo)`.
   - In the receipt view, display `Polar (Merchant of Record / Global Card)` for card payments.
7. **`components/ui/pricing-cards.tsx`**:
   - Update card footer caption to emphasize Polar for USD ("Billed via Polar • Global VAT included") and Paystack for GHS ("Pay with MTN MoMo, Telecel, AirtelTigo or Card").
8. **`app/pricing/page.tsx`**:
   - Update Hero trust bar to feature Polar and Paystack badges.
9. **`components/ui/pricing-faq.tsx`**:
   - Update payment method FAQ and add details on Polar's international VAT/tax compliance.
10. **`.env.example`**:
    - Add complete Polar configuration section with all standard keys and environment descriptors.

---

## Security requirements

- Server-side only access tokens (`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`); never exposed in client bundles.
- All webhook requests cryptographically verified against `POLAR_WEBHOOK_SECRET`.

---

## Acceptance criteria

1. `@polar-sh/sdk`, `@polar-sh/nextjs`, and `@polar-sh/checkout` installed and integrated without type errors.
2. `lib/polar.ts`, `/api/checkout/polar`, `/api/billing/polar/checkout`, and `/api/webhook/polar` implemented according to official Polar documentation.
3. Checkout modal displays Polar as the Merchant of Record provider for Card/USD payments and Paystack for Mobile Money/GHS.
4. Pricing Hero trust bar clearly displays Polar and Paystack badges.
5. Pricing FAQ explains Polar's global tax handling and Mobile Money workflows.
6. `.env.example` documents Polar configuration parameters.
7. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

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
2. Navigate to `http://localhost:3000/pricing`:
   - Inspect Hero trust bar: confirm Polar (Global Cards & MoR) and Paystack (MoMo) badges.
   - Inspect FAQ: confirm Polar and Mobile Money explanations.
3. Test Checkout Modal:
   - Open Pro tier modal.
   - Select Card tab: verify "Card & Digital Wallets (Polar MoR)" and footer "Secured by Polar (Merchant of Record)".
   - Select Mobile Money tab: verify "Mobile Money (GH₵)" and footer "Secured by Paystack".
   - Submit payment simulation and verify receipt payment channel displays `Polar (Merchant of Record / Global Card)` for card payments.
4. Test API Routes:
   - Verify `/api/checkout/polar` and `/api/billing/polar/checkout` compile cleanly.
