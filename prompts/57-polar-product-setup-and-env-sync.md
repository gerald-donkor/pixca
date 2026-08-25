# 57 — Polar Subscription Products Setup & Env Variables Configuration Sync

## Goal

Create all 6 subscription products (Starter Monthly/Annual, Pro Monthly/Annual, Enterprise Monthly/Annual) in the connected Polar organization (`Antenix Inc.` / `antenix-inc`) via the Polar MCP server, retrieve their generated product IDs, and write the complete Polar configuration block to `.env.local` and `.env.example`.

---

## Skills read

- `.agents/skills/polar/SKILL.md` — Polar products, checkouts, and environment variable configuration.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code & tools inspected

- Polar MCP Server tools: `polar_products_create`, `polar_products_list`, `polar_organizations_list`.
- `.env.local` — Current local environment configuration.
- `.env.example` — Environment variable documentation template.
- `app/api/billing/polar/checkout/route.ts` — Polar programmatic checkout route and product ID auto-resolution.

---

## Decisions and assumptions

1. **Polar Products to Create**:
   - **Pixca Starter Monthly**:
     - Name: `Pixca Starter (Monthly)`
     - Recurring interval: `month`
     - Price: `$4.89` (489 cents USD)
     - Description: `Extended sentiment spectrum, 25 bookmarks, weekly digest, and ad-free news reading.`
   - **Pixca Starter Annual**:
     - Name: `Pixca Starter (Annual)`
     - Recurring interval: `year`
     - Price: `$43.99` (4399 cents USD)
     - Description: `Extended sentiment spectrum, 25 bookmarks, weekly digest, and ad-free news reading (Save $14.69/yr).`
   - **Pixca Pro Monthly**:
     - Name: `Pixca Pro (Monthly)`
     - Recurring interval: `month`
     - Price: `$10.79` (1079 cents USD)
     - Description: `100% normalized Left/Center/Right matrix, bias calibration score, loaded rhetoric extraction, and unlimited similarity search.`
   - **Pixca Pro Annual**:
     - Name: `Pixca Pro (Annual)`
     - Recurring interval: `year`
     - Price: `$96.99` (9699 cents USD)
     - Description: `100% normalized Left/Center/Right matrix, bias calibration score, loaded rhetoric extraction, and unlimited similarity search (Save $32.49/yr).`
   - **Pixca Enterprise Monthly**:
     - Name: `Pixca Enterprise (Monthly)`
     - Recurring interval: `month`
     - Price: `$24.99` (2499 cents USD)
     - Description: `Developer REST & GraphQL API (100k req/mo), JSON/CSV export, custom news source ingestion, and 10 seats.`
   - **Pixca Enterprise Annual**:
     - Name: `Pixca Enterprise (Annual)`
     - Recurring interval: `year`
     - Price: `$239.99` (23999 cents USD)
     - Description: `Developer REST & GraphQL API (100k req/mo), JSON/CSV export, custom news source ingestion, and 10 seats (Save $59.89/yr).`
2. **Environment Configuration**:
   - Organization Slug: `antenix-inc`
   - Write all generated product IDs to `.env.local`.
   - Update `.env.example` with the latest keys and documentation.

---

## Files likely to change

- `.env.local` [MODIFY] — Add Polar organization slug, server mode, and product IDs.
- `.env.example` [MODIFY] — Ensure all Polar product IDs and variables are documented.

---

## Implementation requirements

1. Use Polar MCP `polar_products_create` to create each of the 6 recurring products in `Antenix Inc.`.
2. Verify all 6 products using `polar_products_list`.
3. Append/update `.env.local` with:
   - `NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG=antenix-inc`
   - `POLAR_SERVER=production`
   - `POLAR_STARTER_MONTHLY_PRODUCT_ID=<id>`
   - `POLAR_STARTER_ANNUAL_PRODUCT_ID=<id>`
   - `POLAR_PRO_MONTHLY_PRODUCT_ID=<id>`
   - `POLAR_PRO_ANNUAL_PRODUCT_ID=<id>`
   - `POLAR_ENTERPRISE_MONTHLY_PRODUCT_ID=<id>`
   - `POLAR_ENTERPRISE_ANNUAL_PRODUCT_ID=<id>`
4. Ensure `.env.example` has all matching variable names.

---

## Acceptance criteria

1. All 6 products created and listed in Polar organization.
2. `.env.local` contains all resolved product IDs and organization slug.
3. Verification checks (`npm run typecheck`, `npm run lint`, `npm run build`) pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```
