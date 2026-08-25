# 58 — Polar Subscription Entitlements, Tier Gating, and User Tier Indicators

## Goal

Implement end-to-end subscription tier resolution and feature entitlements for authenticated Clerk users across **Free Reader**, **Starter ($4.89/mo)**, **Pixca Pro ($10.79/mo)**, and **Enterprise ($24.99/mo)**. Add active tier badges to the header/navigation, enhance the Polar webhook and Supabase queries to resolve plan tiers, expose an authenticated `/api/user/subscription` endpoint with a `useSubscription` client hook, and enforce bookmark limits with responsive upgrade prompts.

---

## Skills read

- `.agents/skills/polar/SKILL.md` — Polar subscription events, product ID mapping, customer sessions, and webhook payload structures.
- `.agents/skills/clerk/SKILL.md` — Clerk user authentication, server session retrieval (`auth()`, `currentUser()`), and client auth boundaries.
- `.agents/skills/supabase/SKILL.md` — `user_subscriptions` table schema updates, typed queries, and RLS policies.
- `node_modules/next/dist/docs/` — Next.js App Router route handlers and client/server component patterns.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `lib/supabase/types.ts` — Supabase database TypeScript definitions including `user_subscriptions`.
- `supabase/schema.sql` — PostgreSQL schema definitions and RLS policies for `user_subscriptions`.
- `lib/supabase/queries/subscriptions.ts` — Server-only query functions `getUserSubscription`, `upsertUserSubscription`, and `updateUserSubscriptionStatus`.
- `app/api/webhook/polar/route.ts` — Polar webhook event receiver (`onSubscriptionActive`, `onSubscriptionUpdated`, `onSubscriptionRevoked`, `onSubscriptionCanceled`).
- `components/layout/header.tsx` — Global desktop utility bar, navigation bar, auth state buttons, and mobile drawer triggers.
- `hooks/use-bookmarks.ts` — Browser localStorage bookmark synchronization hook and state management.
- `app/api/billing/polar/checkout/route.ts` — Programmatic Polar checkout route handling plan metadata.

---

## Decisions and assumptions

1. **Tier Entitlements Model**:
   - **Free Reader** (`free`):
     - Max Bookmarks: `5`
     - Deep Rhetoric Extraction & Bias Metrics: Standard indicators
     - Blindspot Feed: Available with basic indicators
     - Header Badge: Subtle "Upgrade" link pointing to `/pricing`
   - **Pixca Starter** (`starter`):
     - Max Bookmarks: `25`
     - Extended sentiment spectrum & weekly digest eligibility
     - Header Badge: `STARTER` (Emerald/Green pill badge)
   - **Pixca Pro** (`pro`):
     - Max Bookmarks: `Unlimited` (999,999)
     - 100% normalized Left/Center/Right matrix, bias calibration score, loaded rhetoric extraction
     - Unlimited pgvector similarity search & blindspot alerts
     - Header Badge: `PRO` (Blue/Indigo gradient pill badge)
   - **Pixca Enterprise** (`enterprise`):
     - Max Bookmarks: `Unlimited`
     - Developer REST & GraphQL API access, JSON/CSV export, 10-seat workspace
     - Header Badge: `ENTERPRISE` (Purple/Gold gradient pill badge)

2. **Schema & Database Enhancements**:
   - Add `tier` (text, default `'free'`) and `product_id` (text, nullable) columns to `user_subscriptions` in `supabase/schema.sql` and `lib/supabase/types.ts`.
   - Update `upsertUserSubscription` to store `tier` and `product_id`.

3. **Webhook Tier Resolution**:
   - In `app/api/webhook/polar/route.ts`, determine tier from `sub.productId` by checking configured product IDs:
     - Matches `POLAR_STARTER_MONTHLY_PRODUCT_ID` or `POLAR_STARTER_ANNUAL_PRODUCT_ID` -> `'starter'`
     - Matches `POLAR_PRO_MONTHLY_PRODUCT_ID` or `POLAR_PRO_ANNUAL_PRODUCT_ID` -> `'pro'`
     - Matches `POLAR_ENTERPRISE_MONTHLY_PRODUCT_ID` or `POLAR_ENTERPRISE_ANNUAL_PRODUCT_ID` -> `'enterprise'`
     - Fallback: inspect `sub.metadata?.plan` or default to `'pro'`.

4. **API Route & Client Hook**:
   - `app/api/user/subscription/route.ts`: Authenticated `GET` route using Clerk `auth()`. Returns `{ tier, status, currentPeriodEnd, entitlements }`. If unauthenticated or no subscription found, defaults to `free` tier entitlements.
   - `hooks/use-subscription.ts`: React hook that fetches the user's subscription and entitlements, with caching and fallback support.

5. **User Interface & Upgrade Feedback**:
   - `components/layout/header.tsx`: Render the active tier pill badge next to the user profile button for signed-in users, or an "Upgrade to Pro" badge when on the free tier.
   - `hooks/use-bookmarks.ts`: Provide `maxBookmarks` and `canAddMore` helpers, preventing bookmarks exceeding the user's tier limit.
   - `components/ui/upgrade-modal.tsx`: Aesthetic modal dialog informing the user when a limit is reached with direct CTA buttons to upgrade.

---

## Files likely to change

- `supabase/schema.sql` [MODIFY] — Add `tier` and `product_id` to `user_subscriptions`.
- `lib/supabase/types.ts` [MODIFY] — Update `user_subscriptions` table types with `tier` and `product_id`.
- `lib/supabase/queries/subscriptions.ts` [MODIFY] — Update upsert types and add `getUserTierAndEntitlements` helper.
- `app/api/webhook/polar/route.ts` [MODIFY] — Resolve product IDs to tier strings and save during webhook processing.
- `app/api/user/subscription/route.ts` [NEW] — Authenticated API endpoint returning current user subscription and entitlements.
- `hooks/use-subscription.ts` [NEW] — Client hook for subscription state and feature entitlement gating.
- `components/layout/header.tsx` [MODIFY] — Display active subscription badge or upgrade CTA for authenticated users.
- `hooks/use-bookmarks.ts` [MODIFY] — Respect tier bookmark limits and return feedback on limit exceeded.
- `components/ui/upgrade-modal.tsx` [NEW] — Upgrade modal dialog with feature highlights and checkout triggers.

---

## Implementation requirements

1. **Database Schema & Types (`supabase/schema.sql`, `lib/supabase/types.ts`)**:
   - Add `tier` (`text not null default 'free'`) and `product_id` (`text`) to `user_subscriptions`.
   - Update TypeScript interfaces in `lib/supabase/types.ts`.
2. **Subscription Queries (`lib/supabase/queries/subscriptions.ts`)**:
   - Export `SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise'`.
   - Export `TierEntitlements` interface defining limits and capabilities.
   - Provide `getTierEntitlements(tier: SubscriptionTier)` helper.
3. **Polar Webhook Handler (`app/api/webhook/polar/route.ts`)**:
   - Parse `productId` from subscription payload and resolve tier against environment variables.
   - Pass `tier` and `product_id` to `upsertUserSubscription`.
4. **Subscription API (`app/api/user/subscription/route.ts`)**:
   - Verify caller with Clerk `auth()`.
   - Fetch subscription record from Supabase via `getUserSubscription(userId)`.
   - Return `{ authenticated, tier, status, currentPeriodEnd, entitlements }`.
5. **Subscription Hook (`hooks/use-subscription.ts`)**:
   - Use Clerk `useAuth()` to trigger fetch when authenticated.
   - Return `{ tier, status, entitlements, isLoading, isSubscribed, mutate }`.
6. **Header Tier Badge (`components/layout/header.tsx`)**:
   - Display a responsive badge for signed-in users:
     - `Starter` -> Emerald badge
     - `Pro` -> Blue badge
     - `Enterprise` -> Purple badge
     - `Free` -> "Upgrade" link pointing to `/pricing`
7. **Bookmark Limit Gating (`hooks/use-bookmarks.ts`, `components/ui/upgrade-modal.tsx`)**:
   - Enforce bookmark limits based on active tier (Free: 5, Starter: 25, Pro/Enterprise: unlimited).
   - Render `UpgradeModal` when user attempts to exceed their tier's bookmark capacity.

---

## Security requirements

- `app/api/user/subscription/route.ts` must use Clerk `auth()` for user verification.
- Supabase queries must run via service-role admin client with server-only protection.
- Polar webhook handler must verify `POLAR_WEBHOOK_SECRET`.

---

## Acceptance criteria

1. Supabase schema and types updated with `tier` and `product_id`.
2. Webhook properly resolves and stores subscriber tier (`starter`, `pro`, `enterprise`).
3. `/api/user/subscription` accurately returns tier and entitlements for authenticated Clerk users.
4. `useSubscription` hook provides clean, reactive entitlement data to client components.
5. Header displays tier badge (`STARTER`, `PRO`, `ENTERPRISE`) or `Upgrade` button next to the User button.
6. Bookmarking enforces tier limits (5 for Free, 25 for Starter) and displays the Upgrade Modal when limit is exceeded.
7. Verification checks (`npm run typecheck`, `npm run lint`, `npm run build`) pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Run `npm run typecheck` and `npm run lint` to verify zero type or lint errors.
2. Start local server with `npm run dev` and navigate to `http://localhost:3000`.
3. Sign in with a Clerk user account and verify the header shows the tier badge / upgrade prompt.
4. Verify `/api/user/subscription` returns `{ tier: "free", entitlements: { maxBookmarks: 5, ... } }`.
5. Save 5 bookmarks and verify saving a 6th bookmark opens the Upgrade Modal with direct links to upgrade.
