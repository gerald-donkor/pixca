# 53 — Specific Retail Pricing and Realistic Cent Points

## Goal

Update Pixca's subscription tiers from integer amounts with artificial `.00` endings to specific, realistic SaaS retail price points (e.g. `$9.99/mo`, `$89.99/yr`, `$29.99/mo`, `$289.99/yr`, `GH₵129.99/mo`, `GH₵1,199.99/yr`, `GH₵399.99/mo`, `GH₵3,799.99/yr`). Update all derived calculations (monthly equivalents, annual savings) and Schema.org JSON-LD while strictly keeping the Free Reader tier as `$0` / `GH₵0`.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client component state and formatting patterns.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/ui/pricing-cards.tsx` — Tier definitions in `PLANS`, default state `selectedPlan`, monthly equivalent, and annual savings calculations.
- `components/ui/checkout-modal.tsx` — Default price prop fallback (`price = 9.99`) and checkout dialog.
- `app/pricing/page.tsx` — Schema.org JSON-LD offers metadata.

---

## Decisions and assumptions

1. **Specific Retail Price Schedule**:
   - **Free Reader**:
     - USD: Monthly `$0`, Annual `$0`, Monthly Eq `$0`, Save `$0`
     - GHS: Monthly `GH₵0`, Annual `GH₵0`, Monthly Eq `GH₵0`, Save `GH₵0`
   - **Pixca Pro**:
     - USD: Monthly `$9.99`, Annual `$89.99`, Monthly Eq `$7.50`, Save `$29.89` ($119.88 − $89.99)
     - GHS: Monthly `GH₵129.99`, Annual `GH₵1,199.99`, Monthly Eq `GH₵100.00`, Save `GH₵359.89` (GH₵1,559.88 − GH₵1,199.99)
   - **Pixca Enterprise**:
     - USD: Monthly `$29.99`, Annual `$289.99`, Monthly Eq `$24.17`, Save `$69.89` ($359.88 − $289.99)
     - GHS: Monthly `GH₵399.99`, Annual `GH₵3,799.99`, Monthly Eq `GH₵316.67`, Save `GH₵999.89` (GH₵4,799.88 − GH₵3,799.99)
2. **Schema.org Structured Data Alignment**:
   - Update `app/pricing/page.tsx` JSON-LD offers:
     - `Pixca Pro (USD)`: `"9.99"`
     - `Pixca Pro (GHS)`: `"129.99"`
     - `Pixca Enterprise (USD)`: `"29.99"`
3. **Preserve Zero Exemption**:
   - Free Reader remains `$0` and `GH₵0` without `.00` decimals via `formatPrice`.

---

## Files likely to change

- `components/ui/pricing-cards.tsx` [MODIFY] — Update `PLANS` prices and default `selectedPlan` price.
- `components/ui/checkout-modal.tsx` [MODIFY] — Update default `price` prop fallback to `9.99`.
- `app/pricing/page.tsx` [MODIFY] — Update Schema.org `offers` price strings.

---

## Implementation requirements

1. **`components/ui/pricing-cards.tsx`**:
   - Update `PLANS` with the new specific cent amounts for Pro and Enterprise across USD and GHS.
   - Update `selectedPlan` default state to `price: 9.99`.
2. **`components/ui/checkout-modal.tsx`**:
   - Update default `price` prop to `9.99`.
3. **`app/pricing/page.tsx`**:
   - Synchronize JSON-LD Schema.org offer prices to match the updated specific retail points.

---

## Security requirements

- Pure client presentation and SEO metadata; no backend secrets or transaction verification logic modified.

---

## Acceptance criteria

1. Pixca Pro displays `$9.99/month` and `$89.99/year` with `Save $29.89/yr` and `Equivalent to $7.50/mo`.
2. Pixca Pro in GHS displays `GH₵129.99/month` and `GH₵1,199.99/year` with `Save GH₵359.89/yr` and `Equivalent to GH₵100.00/mo`.
3. Pixca Enterprise displays `$29.99/month` and `$289.99/year` (GHS: `GH₵399.99/month` and `GH₵3,799.99/year`).
4. Free Reader continues displaying `$0/month` and `GH₵0/month`.
5. Checkout modal reflects the specific price points in header, CTA, authorization spinner, and receipt.
6. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

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
   - Verify Free tier card displays `$0/month`.
   - Verify Pixca Pro card displays `$9.99/month` (Monthly) or `$89.99/year` (Annual) with `Save $29.89/yr` and `Equivalent to $7.50/mo`.
   - Switch to GHS currency: verify Pro displays `GH₵129.99/month` or `GH₵1,199.99/year` with `Save GH₵359.89/yr`.
   - Switch to Enterprise: verify `$29.99/month` and `$289.99/year` (or `GH₵399.99/month` and `GH₵3,799.99/year`).
3. Click "Upgrade to Pixca Pro":
   - Verify checkout modal header and CTA display `Pay $9.99 & Subscribe to Pixca Pro`.
   - Complete checkout and verify receipt shows `$9.99`.
