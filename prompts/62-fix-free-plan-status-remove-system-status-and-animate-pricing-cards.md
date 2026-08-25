# 62 — Fix Free Plan Status, Remove System Status Header Button, and Animate Pricing Cards

## Goal

Resolve user-reported UX and visual feedback from screen recordings and screenshots:
1. **Fix Free Plan Active State**: When a user is signed in on the Free Reader tier, the Free Reader card on `/pricing` should correctly reflect their active plan status with the `"Current Plan"` badge and `"Current Active Plan"` CTA button.
2. **Remove System Status Header Button**: Remove the `"System Status"` pulsating link from the header top utility bar per the visual reference in `screenshot-2026-08-25_20-38-30.png`.
3. **Animate Pricing Cards with Magnification, Jump & Complementary Glow**:
   - Add rich hover interactions on all 4 billing cards (`/home/dg/Pictures/screenshot-2026-08-25_20-36-22.png`) such that hovering causes them to smoothly magnify (`scale-[1.025]`), jump upwards (`-translate-y-3`), and cast a vibrant glow with a complementary color outline:
     - **Free Reader**: Emerald glow (`shadow-emerald-500/20`) & emerald border.
     - **Pixca Starter**: Sky / Cyan glow (`shadow-sky-500/25`) & sky border.
     - **Pixca Pro**: Royal Blue / Indigo glow (`shadow-blue-600/30`) & blue border/ring.
     - **Pixca Enterprise**: Purple / Fuchsia glow (`shadow-purple-600/25`) & purple border.
   - Add GSAP entrance choreography with responsive reduced-motion safety.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client routing and component lifecycle.
- `.agents/skills/gsap-core` — Easing, duration, and transforms.
- `.agents/skills/gsap-react` — `@gsap/react` `useGSAP` hook for scoped entrance animations and cleanup.
- `.agents/skills/gsap-performance` — GPU acceleration (`transform-gpu`, `will-change-transform`), avoiding layout thrashing.
- `.agents/skills/clerk` — Auth state integration (`isSignedIn`).
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/ui/pricing-cards.tsx` — Pricing cards grid, hover styles, plan badges, and subscription state handling.
- `hooks/use-subscription.ts` — Subscription state hook providing `tier`, `status`, `isLoading`, and `refetch`.
- `components/layout/header.tsx` — Header component containing the top utility bar with the System Status link.
- Visual references:
  - Video `/home/dg/Videos/screenrecording-2026-08-25_20-42-24.mp4`
  - Screenshot `/home/dg/Pictures/screenshot-2026-08-25_20-38-30.png`
  - Screenshot `/home/dg/Pictures/screenshot-2026-08-25_20-36-22.png`

---

## Decisions and assumptions

1. **Authentication & Active Plan Logic**:
   - In `hooks/use-subscription.ts`, expose `isSignedIn: boolean` directly from `useAuth()`.
   - In `components/ui/pricing-cards.tsx`, evaluate `isCurrentPlan = !isLoading && (isSignedIn ? tier === plan.id : false)`.
   - For signed-in users on Free tier (`tier === "free"`), the Free Reader card will display `"Current Plan"` badge and `"Current Active Plan"` CTA button.
   - For guest/unauthenticated users (`isSignedIn === false`), no card is marked as current, enabling them to click `"Get Started Free"` or any tier CTA.
2. **Header Utility Bar Cleanup**:
   - In `components/layout/header.tsx`, remove the `<Link href="/logs">... System Status</Link>` and the left border separator, leaving the Theme switcher cleanly aligned on the left.
3. **Hover Magnification, Jump, and Complementary Glow Styling**:
   - Add theme-specific hover glow and outline classes to each card in `components/ui/pricing-cards.tsx`.
   - Use `transform-gpu transition-all duration-300 ease-out will-change-transform hover:-translate-y-3 hover:scale-[1.025]` for 60fps compositor smoothness.
   - Add GSAP entrance animation (`useGSAP`) with `.pricing-card-item` stagger.

---

## Files likely to change

- `hooks/use-subscription.ts` [MODIFY] — Expose `isSignedIn` in `SubscriptionState`.
- `components/layout/header.tsx` [MODIFY] — Remove System Status link from top utility bar.
- `components/ui/pricing-cards.tsx` [MODIFY] — Update active plan computation, add hover magnification/jump/glow, and entrance animation.

---

## Implementation requirements

1. **Update `use-subscription.ts`**:
   - Add `isSignedIn: boolean` to `SubscriptionState` and return `isSignedIn: Boolean(isSignedIn)`.
2. **Update `header.tsx`**:
   - Remove the System Status link and separator from the utility bar.
3. **Update `pricing-cards.tsx`**:
   - Use `isSignedIn` to evaluate `isCurrentPlan`.
   - Add complementary hover glow, outline, scale, and jump transitions to each pricing card.
   - Add GSAP entrance animation with `prefers-reduced-motion` support.
4. **Verification**:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build` to verify 0 errors.

---

## Security requirements

- All billing validation and webhooks remain authenticated on the server side.
- No sensitive user tokens or secrets exposed.

---

## Acceptance criteria

1. When a signed-in user visits `/pricing`, their active plan (including Free Reader) displays `"Current Plan"` with a disabled `"Current Active Plan"` button.
2. Unauthenticated visitors can click `"Get Started Free"` without obstruction.
3. The System Status button is removed from the top utility bar in the header.
4. Hovering on any pricing card causes it to smoothly magnify, jump upward, and emit a vibrant complementary glow with a colored outline.
5. `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Navigate to `http://localhost:3000` and inspect the header utility bar: verify "System Status" is removed and the Theme selector is clean.
2. Navigate to `http://localhost:3000/pricing`:
   - Hover over each of the 4 billing cards: verify they jump upward, magnify, and show glowing complementary outlines (Emerald, Sky, Royal Blue, Purple).
   - If signed in as a Free user: verify Free Reader displays "Current Plan" and "Current Active Plan".
   - If signed out / guest: verify Free Reader displays "Get Started Free" and opens the modal.
