# 61 — Post-Checkout Success UX, Optimistic Subscription Refresh, and Portal State

## Goal

Enhance the post-checkout user experience on `/pricing` when returning from Polar or completing checkout:
1. Automatically trigger `refetch()` from `useSubscription()` when `?status=success` is detected in the URL so that the header active tier badge (Starter / Pro / Enterprise) updates immediately without needing a full page reload.
2. Upgrade the success feedback banner with a smooth celebratory GSAP entrance animation, dismiss action, and automatic URL cleanup (`window.history.replaceState`) after acknowledgement.
3. Add a dedicated subscription status card on the `/pricing` page for currently subscribed users showing their active plan, renewal date, and quick action to manage their subscription or open the Polar Customer Portal.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client routing, `useSearchParams`, and component state.
- `.agents/skills/polar` — Polar subscription management, checkout redirects, and customer portal integration.
- `.agents/skills/gsap-core` — Micro-interactions and entrance tweens.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/ui/pricing-cards.tsx` — StatusBannerContent component, pricing cards grid, and customer portal link.
- `hooks/use-subscription.ts` — Client hook providing `tier`, `status`, `currentPeriodEnd`, `entitlements`, and `refetch()`.
- `components/layout/header.tsx` — Header component displaying active tier badges (`Starter`, `Pro`, `Enterprise`, `Upgrade`).
- `components/ui/checkout-modal.tsx` — Local MoMo / simulation checkout modal with post-payment success screen.

---

## Decisions and assumptions

1. **Optimistic Subscription Refetch**:
   - In `components/ui/pricing-cards.tsx`, when `status === "success"` is present in the search params, invoke `refetch()` from `useSubscription()` in a `useEffect` to ensure the client state is synchronized immediately.
2. **Interactive Banner with Dismiss & URL Cleanup**:
   - Make the success banner dismissible. Upon dismissal, clean up the `?status=success` query parameter from the URL using `window.history.replaceState` so refreshing doesn't keep showing the banner indefinitely.
3. **Active Subscription Summary Section**:
   - If the user is currently subscribed (`isSubscribed === true` or `tier !== "free"`), display a personalized "Current Plan" badge on their active plan card with customized CTA ("Current Active Plan").
4. **Preserve SSR & Client Separation**:
   - Keep search params reading inside `<React.Suspense>` boundary to maintain Next.js SSR build compatibility.

---

## Files likely to change

- `components/ui/pricing-cards.tsx` [MODIFY] — Add `useSubscription` integration, refetch on success, dismissible banner with URL cleanup, and active plan indicator.

---

## Implementation requirements

1. **Auto-Refetch on Success**:
   - Import `useSubscription` in `PricingCards` / `StatusBannerContent`.
   - On `status === "success"`, call `refetch()`.
2. **Celebratory Banner & Dismiss Action**:
   - Style the success banner with a celebratory check icon, clear congratulations copy, and an "X" dismiss button that clears the query param.
3. **Active Tier Highlight on Cards**:
   - For the card matching the user's active tier, show a "Current Plan" badge and disable/modify the CTA to "Current Active Plan" or "Manage Subscription".
4. **Verification**:
   - Run typecheck, lint, and production build to confirm 0 errors.

---

## Security requirements

- Purely UI/client UX enhancement; all billing verification and webhooks remain authenticated on the server.

---

## Acceptance criteria

1. Navigating to `/pricing?status=success` triggers `refetch()` to refresh active subscription entitlements.
2. The success banner renders with celebratory styling and can be dismissed, cleanly removing the search param from the address bar.
3. When subscribed, the pricing page displays the user's current active plan clearly.
4. `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Run `npm run dev` and navigate to `http://localhost:3000/pricing?status=success`.
2. Verify that the success banner renders cleanly.
3. Dismiss the banner and verify `?status=success` is removed from the URL without a page reload.
4. Verify that when a user is signed in with a subscription, their current active tier is highlighted appropriately.
