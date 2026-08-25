# 56 — Update Pricing Tiers and Retail Price Points ($4.89, $10.79, $24.99)

## Goal

Expand PIXCA's pricing model to retain the Free Reader ($0) tier while offering 3 paid subscription tiers with the requested retail price points: **Starter ($4.89/mo)**, **Pixca Pro ($10.79/mo)**, and **Enterprise ($24.99/mo)**, along with corresponding annual rates, Ghana Mobile Money (GHS) local rates, and feature comparison matrix updates.

---

## Skills read

- `.agents/skills/polar/SKILL.md` — Polar products, checkouts, and environment variable configuration.
- `node_modules/next/dist/docs/` — Next.js App Router and responsive component conventions.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/ui/pricing-cards.tsx` — Pricing cards grid, tier definitions (`PLANS`), currency toggles (USD/GHS), interval toggles (Monthly/Annual), and Customer Portal CTA.
- `app/pricing/page.tsx` — Pricing page, comparison matrix (`COMPARISON_SECTIONS`), and Schema.org JSON-LD structured offers.
- `components/ui/checkout-modal.tsx` — Checkout dialog and default price fallback.
- `app/api/billing/polar/checkout/route.ts` — Polar programmatic checkout session creation and product ID auto-resolution.

---

## Decisions and assumptions

1. **Tier Structure & Price Points**:
   - **Free Reader**: `$0` (USD) / `GH₵0` (GHS). Essential daily news reading with standard AI sentiment indicators.
   - **Pixca Starter (New Tier)**:
     - USD: Monthly `$4.89`, Annual `$43.99` (Save `$14.69/yr`, Equivalent to `$3.67/mo`).
     - GHS: Monthly `GH₵64.99`, Annual `GH₵579.99` (Save `GH₵199.89/yr`, Equivalent to `GH₵48.33/mo`).
     - Features: Extended sentiment spectrum, up to 25 saved bookmarks, weekly deep-dive digest, ad-free reading.
   - **Pixca Pro (Most Popular)**:
     - USD: Monthly `$10.79`, Annual `$96.99` (Save `$32.49/yr`, Equivalent to `$8.08/mo`).
     - GHS: Monthly `GH₵139.99`, Annual `GH₵1,249.99` (Save `GH₵429.89/yr`, Equivalent to `GH₵104.17/mo`).
     - Features: 100% normalized Left/Center/Right matrix, bias calibration score, loaded rhetoric extraction, unlimited pgvector similarity search, partisan blindspot alerts, unlimited bookmarks.
   - **Pixca Enterprise (Teams & API)**:
     - USD: Monthly `$24.99`, Annual `$239.99` (Save `$59.89/yr`, Equivalent to `$20.00/mo`).
     - GHS: Monthly `GH₵329.99`, Annual `GH₵3,199.99` (Save `GH₵759.89/yr`, Equivalent to `GH₵266.67/mo`).
     - Features: Developer REST & GraphQL API (100k req/mo), JSON/CSV export, custom news source ingestion queue, 10-seat multi-user workspace, SLA & priority support.
2. **Responsive Layout**:
   - Update `components/ui/pricing-cards.tsx` grid from `grid-cols-1 lg:grid-cols-3` to `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` to present all 4 tiers cleanly across mobile, tablet, and wide desktop screens.
3. **Comparison Matrix**:
   - Update `COMPARISON_SECTIONS` and the table header in `app/pricing/page.tsx` to include the new `Starter` column alongside `Free Reader`, `Pixca Pro`, and `Enterprise`.
4. **Schema.org JSON-LD**:
   - Add the `Pixca Starter (USD)` and `Pixca Starter (GHS)` offers to `jsonLdSchema` in `app/pricing/page.tsx`, and update Pro (`10.79`) and Enterprise (`24.99`) offers.
5. **Polar Checkout Auto-Resolution**:
   - Support `POLAR_STARTER_MONTHLY_PRODUCT_ID` and `POLAR_STARTER_ANNUAL_PRODUCT_ID` in `app/api/billing/polar/checkout/route.ts`.

---

## Files likely to change

- `components/ui/pricing-cards.tsx` [MODIFY] — Add Starter tier, update Pro & Enterprise pricing, adjust responsive 4-column grid.
- `app/pricing/page.tsx` [MODIFY] — Update comparison matrix columns & rows, update JSON-LD schema offers.
- `app/api/billing/polar/checkout/route.ts` [MODIFY] — Add starter plan product ID resolution.

---

## Implementation requirements

1. **Pricing Cards (`components/ui/pricing-cards.tsx`)**:
   - Define all 4 plans in `PLANS`: `free` ($0), `starter` ($4.89/mo), `pro` ($10.79/mo), and `enterprise` ($24.99/mo).
   - Ensure accurate annual prices, savings amounts, and monthly equivalent calculations.
   - Adjust CSS grid layout to `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch`.
2. **Pricing Page (`app/pricing/page.tsx`)**:
   - Update `COMPARISON_SECTIONS` entries to include `starter` feature values.
   - Update table header to render 5 columns (`Features & Capabilities`, `Free Reader`, `Starter`, `Pixca Pro`, `Enterprise`).
   - Update JSON-LD `offers` array with `$4.89`, `$10.79`, and `$24.99`.
3. **Checkout Route (`app/api/billing/polar/checkout/route.ts`)**:
   - Resolve `POLAR_STARTER_MONTHLY_PRODUCT_ID` and `POLAR_STARTER_ANNUAL_PRODUCT_ID` when `planName` matches Starter.

---

## Security requirements

- Maintain server-only resolution of Polar product IDs and access tokens.
- Keep RLS and checkout validation intact.

---

## Acceptance criteria

1. Pricing cards display Free ($0), Starter ($4.89/mo), Pixca Pro ($10.79/mo), and Enterprise ($24.99/mo) in USD and their corresponding GHS local rates.
2. Annual toggle shows 20% savings calculations for Starter ($43.99/yr), Pro ($96.99/yr), and Enterprise ($239.99/yr).
3. Feature comparison matrix displays all 4 tiers with feature breakdowns.
4. Schema.org JSON-LD structured offers include the updated price points.
5. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

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
   - Verify 4 cards rendered: Free Reader ($0), Starter ($4.89/mo), Pixca Pro ($10.79/mo), Enterprise ($24.99/mo).
   - Toggle to "Annual": verify Starter displays `$43.99/year` (`Save $14.69/yr`), Pro displays `$96.99/year` (`Save $32.49/yr`), Enterprise displays `$239.99/year` (`Save $59.89/yr`).
   - Toggle currency to "GHS (GH₵) Local MoMo": verify local price points.
   - Scroll down to "Full Feature Comparison Matrix": verify all 4 columns are displayed with feature markers.
