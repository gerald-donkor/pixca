# 52 — Precision Two-Decimal Billing Price Formatting with Zero Exemption

## Goal

Refactor the pricing display logic across the Pricing page, Pricing Cards, and Checkout Modal to format all non-zero billing amounts with exact two-decimal precision (e.g. `$9.00`, `$86.00`, `$29.00`, `$279.00`, `GH₵120.00`, `GH₵1,150.00`, `GH₵390.00`, `GH₵3,740.00`), while strictly preserving `0` (e.g. `$0`, `GH₵0`) without unnecessary `.00` decimals for the Free Reader tier.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client component formatting patterns.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/ui/pricing-cards.tsx` — Main pricing cards with monthly/annual prices, monthly equivalents, and annual savings.
- `components/ui/checkout-modal.tsx` — Checkout modal displaying header price, submit button label, loading status, and receipt breakdown.
- `app/pricing/page.tsx` — Pricing page JSON-LD Schema.org offers and layout.

---

## Decisions and assumptions

1. **Consistent Decimal Formatting Helper**:
   - Create a clean formatting rule:
     ```ts
     export function formatPrice(price: number, currencySymbol: string): string {
       if (price === 0) return `${currencySymbol}0`;
       return `${currencySymbol}${price.toLocaleString("en-US", {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2,
       })}`;
     }
     ```
2. **Applied Across All Pricing Touchpoints**:
   - **Tier Card Main Heading**: `$9.00` / `$86.00` / `$29.00` / `$279.00` / `GH₵120.00` / `GH₵1,150.00` / `GH₵390.00` / `GH₵3,740.00` (Free card stays `$0` / `GH₵0`).
   - **Annual Equivalent Sub-heading**: `Equivalent to $7.17/mo` / `Equivalent to GH₵95.83/mo`.
   - **Annual Savings Badge**: `Save $22.00/yr` / `Save GH₵290.00/yr`.
   - **Checkout Modal**:
     - Top right header price: `$9.00/mo` or `$86.00/yr`.
     - Submit CTA: `Pay $9.00 & Subscribe to Pixca Pro`.
     - Authorizing spinner: `Authorizing $9.00...`.
     - Success confirmation & receipt: `Your payment of $9.00 (monthly) was processed successfully.`

---

## Files likely to change

- `components/ui/pricing-cards.tsx` [MODIFY] — Apply decimal formatting with `price === 0` exemption.
- `components/ui/checkout-modal.tsx` [MODIFY] — Apply decimal formatting across header, button, status, and receipt.

---

## Implementation requirements

1. **`components/ui/pricing-cards.tsx`**:
   - Update main price display to show 2 decimal places for non-zero prices (`$9.00`, `$86.00`, etc.) and `0` for free tier (`$0`, `GH₵0`).
   - Ensure annual savings (`save`) displays 2 decimal places (`$22.00/yr`, `GH₵290.00/yr`).
   - Ensure monthly equivalent continues displaying 2 decimal places (`$7.17/mo`, `GH₵95.83/mo`).
2. **`components/ui/checkout-modal.tsx`**:
   - Update `formattedPrice` to format non-zero prices with 2 decimal places (`$9.00`, `$86.00`, `GH₵120.00`, `GH₵1,150.00`, etc.) and `0` for free tier.
   - Propagate `formattedPrice` cleanly to the header, submit button, loading spinner, and success receipt.

---

## Security requirements

- Pure presentation formatting; no mutation of backend pricing secrets or payment channels.

---

## Acceptance criteria

1. Free Reader card displays `$0/month` and `GH₵0/month` with single integer zero `0`.
2. Pixca Pro and Enterprise cards display two decimals for all prices (e.g. `$9.00/month`, `$86.00/year`, `GH₵120.00/month`, `GH₵1,150.00/year`).
3. Annual savings calculations display two decimals (e.g. `Save $22.00/yr`, `Save GH₵290.00/yr`).
4. Checkout modal displays two decimals everywhere (`$9.00/mo`, `Pay $9.00 & Subscribe...`, `Authorizing $9.00...`, receipt `$9.00`).
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
   - Verify Free tier card displays `$0/month` (or `GH₵0/month`).
   - Verify Pixca Pro card displays `$9.00/month` (or `GH₵120.00/month`).
   - Switch to Annual billing: verify Pro shows `$86.00/year` (save `$22.00/yr`) and Enterprise shows `$279.00/year` (save `$69.00/yr`).
   - Switch to GHS currency: verify Pro shows `GH₵120.00/month` or `GH₵1,150.00/year` (save `GH₵290.00/yr`).
3. Click "Upgrade to Pixca Pro":
   - Verify modal header shows `$9.00/mo` (or `$86.00/yr`).
   - Verify submit button shows `Pay $9.00 & Subscribe to Pixca Pro`.
   - Submit and verify success receipt shows `$9.00`.
