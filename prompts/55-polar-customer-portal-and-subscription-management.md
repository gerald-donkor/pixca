# 55 — Polar Customer Portal & Self-Service Subscription Management

## Goal

Implement Polar ([polar.sh](https://polar.sh)) self-service Customer Portal integration (`/api/portal/polar`), user subscription state persistence in Supabase, and client-side subscription management access across the Pricing page, Header, and Mobile Navigation Drawer.

---

## Skills read

- `.agents/skills/polar/SKILL.md` — Official Polar Next.js, SDK, Customer Portal, and Webhooks documentation.
- `node_modules/next/dist/docs/` — Next.js App Router route handlers, server/client boundaries, and redirect flows.
- `.agents/skills/clerk/SKILL.md` — Clerk session resolution and server-side auth validation.
- `.agents/skills/supabase/SKILL.md` — Database queries and declarative schema updates.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `lib/polar.ts` — Polar SDK client singleton and configuration helpers.
- `app/api/webhook/polar/route.ts` — Polar cryptographic webhook handler.
- `components/ui/pricing-cards.tsx` — Pricing cards, tier action triggers, and interval controls.
- `components/layout/header.tsx` — Global desktop header and navigation.
- `components/layout/mobile-drawer.tsx` — Slide-out mobile drawer and account section.
- `supabase/schema.sql` — Database tables and schema definitions.
- `lib/supabase/types.ts` — Supabase TypeScript interfaces.

---

## Decisions and assumptions

1. **Polar Customer Portal Architecture**:
   - **App Router Route (`app/api/portal/polar/route.ts`)**: Implement `@polar-sh/nextjs` `CustomerPortal()` wrapper with dynamic `getCustomerId` resolution.
   - **Customer Resolution**: Query Supabase `user_subscriptions` using the authenticated Clerk `userId`. If no customer ID is found or if Polar is in local mock/simulation mode, gracefully redirect back to `/pricing?status=no_active_subscription` with helpful context.
   - **Return URL**: Return the user to `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`.
2. **Database Persistence**:
   - Define `user_subscriptions` table in `supabase/schema.sql` with columns `id`, `user_id`, `polar_customer_id`, `polar_subscription_id`, `status`, `current_period_end`, `created_at`, `updated_at`.
   - Update `lib/supabase/types.ts` with matching TypeScript interfaces.
   - Implement `lib/supabase/queries/subscriptions.ts` providing `getUserSubscription(userId)` and `upsertUserSubscription(...)` using the service-role admin client.
3. **Webhook Reconciliation**:
   - Update `app/api/webhook/polar/route.ts` to persist active, canceled, and revoked subscription events to `user_subscriptions`.
4. **UI & Navigation Wiring**:
   - In `components/ui/pricing-cards.tsx`, provide clean links to the Customer Portal (`/api/portal/polar`) for subscribers.
   - In `components/layout/mobile-drawer.tsx`, add a "Billing & Subscriptions" link under account options for signed-in users.

---

## Files likely to change

- `supabase/schema.sql` [MODIFY] — Add `user_subscriptions` table definition and RLS policies.
- `lib/supabase/types.ts` [MODIFY] — Add `UserSubscription` type definitions.
- `lib/supabase/queries/subscriptions.ts` [NEW] — Service-role query helpers for user subscriptions.
- `lib/polar.ts` [MODIFY] — Add customer portal session helper methods.
- `app/api/portal/polar/route.ts` [NEW] — Polar Next.js App Router customer portal handler.
- `app/api/webhook/polar/route.ts` [MODIFY] — Connect webhook events to Supabase subscription upserts.
- `components/ui/pricing-cards.tsx` [MODIFY] — Add Customer Portal management action.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Add Billing & Subscription portal link.

---

## Implementation requirements

1. **Schema & Types**:
   - Add `user_subscriptions` table to `supabase/schema.sql` with `user_id` as unique key.
   - Update `lib/supabase/types.ts` with `UserSubscription`, `UserSubscriptionInsert`, and `UserSubscriptionUpdate`.
2. **`lib/supabase/queries/subscriptions.ts`**:
   - Export `getUserSubscription(userId: string): Promise<UserSubscription | null>`.
   - Export `upsertUserSubscription(data: UserSubscriptionInsert): Promise<UserSubscription>`.
3. **`app/api/portal/polar/route.ts`**:
   - Implement `@polar-sh/nextjs` `CustomerPortal` handler with dynamic `getCustomerId` callback resolving the user's Polar Customer ID from Supabase.
   - Support development fallback redirect when Polar is unconfigured.
4. **`app/api/webhook/polar/route.ts`**:
   - Update `onSubscriptionActive` to upsert active subscription record.
   - Update `onSubscriptionRevoked` and `onSubscriptionCanceled` to update status.
5. **UI Updates**:
   - In `components/ui/pricing-cards.tsx`, add support for managing active subscriptions via `/api/portal/polar`.
   - In `components/layout/mobile-drawer.tsx`, display "Manage Billing" shortcut for authenticated users.

---

## Security requirements

- Server-side only access tokens (`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`).
- `user_subscriptions` table protected by RLS with service-role access only.
- Authentication required via Clerk before querying portal sessions.

---

## Acceptance criteria

1. `user_subscriptions` table and types added to schema and type definitions.
2. `/api/portal/polar` route created with `@polar-sh/nextjs` `CustomerPortal` handler and fallback.
3. Polar webhook updates `user_subscriptions` records on subscription events.
4. "Manage Billing" / Customer portal link integrated into navigation and pricing interfaces.
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
2. Navigate to `http://localhost:3000/api/portal/polar` in browser:
   - When unauthenticated or without active Polar customer session, confirm clean fallback redirect to `/pricing?status=no_active_subscription`.
3. Inspect `MobileDrawer`:
   - Open drawer and verify "Manage Billing" / "Subscription" links are rendered cleanly for signed-in users.
