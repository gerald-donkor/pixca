# 49 — Header Subscribe Modal and Newsletter Wiring

## Goal

Implement an accessible, interactive subscription dialog modal (`SubscribeModal`) triggered by global "Subscribe" CTA buttons across the desktop `Header` (`components/layout/header.tsx`) and `MobileDrawer` (`components/layout/mobile-drawer.tsx`), offering users on any route a direct way to subscribe to Pixca intelligence with live email validation, DNS verification, and GSAP micro-animations.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router Client Component patterns, event propagation, and modal states.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Micro-interaction and entrance animations.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `components/ui/dialog.tsx` — Accessible `@base-ui/react` dialog primitives.
- `components/ui/newsletter-subscribe.tsx` — Client-side subscription component with validation, feedback, and Sonner toast.
- `components/layout/header.tsx` — Global header with static "Subscribe" button in right action cluster.
- `components/layout/mobile-drawer.tsx` — Mobile slide-out navigation drawer with static "Subscribe to Pixca Pro" button.
- `components/ui/share-modal.tsx` — Reference modal implementation using `Dialog`.

---

## Decisions and assumptions

1. **`SubscribeModal` Component (`components/ui/subscribe-modal.tsx`)**:
   - Built on top of accessible `@base-ui/react` primitives in `components/ui/dialog.tsx`.
   - Renders a visually compelling modal with:
     - Badge: `Sparkles` icon with "Pixca Pro Intelligence" badge.
     - Title: "Stay Ahead with AI-Powered Intelligence"
     - Subtitle: "Get balanced multi-perspective news digests, real-time framing analysis, and blindspot alerts delivered to your inbox."
     - Feature highlights: 3 key bullet points (Daily Balanced Digest, Skew & Bias Detection, Breaking Blindspot Alerts) styled with theme-aware borders and icons.
     - Embedded `NewsletterSubscribe` form for direct email entry and feedback.
2. **Desktop Header Integration (`components/layout/header.tsx`)**:
   - Add `const [subscribeOpen, setSubscribeOpen] = React.useState(false);`.
   - Attach `onClick={() => setSubscribeOpen(true)}` to the "Subscribe" CTA `<Button>`.
   - Render `<SubscribeModal open={subscribeOpen} onOpenChange={setSubscribeOpen} />`.
3. **Mobile Drawer Integration (`components/layout/mobile-drawer.tsx`)**:
   - Add `onOpenSubscribe?: () => void` prop to `MobileDrawer`.
   - Attach `onClick={() => { onClose(); onOpenSubscribe?.(); }}` to the "Subscribe to Pixca Pro" `<Button>`.
   - In `components/layout/header.tsx`, pass `onOpenSubscribe={() => setSubscribeOpen(true)}` to `<MobileDrawer />`.

---

## Files likely to change

- `components/ui/subscribe-modal.tsx` [NEW] — Accessible subscription dialog with Pixca Pro highlights and embedded newsletter subscription form.
- `components/layout/header.tsx` [MODIFY] — Wire desktop "Subscribe" button to open `SubscribeModal` and pass handler to `MobileDrawer`.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Add `onOpenSubscribe` prop and connect the "Subscribe to Pixca Pro" button.

---

## Implementation requirements

1. **`components/ui/subscribe-modal.tsx`**:
   - Create client component with `open` and `onOpenChange` props.
   - Use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` from `components/ui/dialog.tsx`.
   - Include clear visual hierarchy, benefits badges, and the interactive `NewsletterSubscribe` component.
   - Ensure full dark mode and light mode contrast using CSS variable design tokens (`bg-card`, `border-border`, `text-text-primary`, `text-text-secondary`).
2. **`components/layout/header.tsx`**:
   - Manage modal open state.
   - Connect desktop subscribe button to open modal.
   - Pass callback to `MobileDrawer` so mobile drawer users can open the modal seamlessly.
3. **`components/layout/mobile-drawer.tsx`**:
   - Add `onOpenSubscribe?: () => void` to interface.
   - Connect "Subscribe to Pixca Pro" button to invoke `onOpenSubscribe` while dismissing drawer.

---

## Security requirements

- Client-side validation and sanitized submission to `/api/newsletter`.
- No sensitive keys or secrets exposed.

---

## Acceptance criteria

1. Clicking "Subscribe" in the global desktop header opens the `SubscribeModal`.
2. Clicking "Subscribe to Pixca Pro" in the mobile drawer closes the drawer and opens the `SubscribeModal`.
3. Submitting an email through the modal validates format, handles suggestions/errors, triggers `/api/newsletter`, and shows green success confirmation.
4. Closing the modal (via X button, backdrop click, or ESC key) dismisses smoothly without layout thrashing.
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
2. Test Desktop Header:
   - Navigate to `http://localhost:3000/`.
   - Click the "Subscribe" button in the top-right of the header.
   - Verify `SubscribeModal` opens with smooth backdrop and card animation.
   - Enter a test email and click "Subscribe".
   - Verify success confirmation appears in the modal and toast notification is displayed.
3. Test Mobile Drawer:
   - Resize browser to mobile width (< 768px).
   - Click hamburger menu icon to open `MobileDrawer`.
   - Click "Subscribe to Pixca Pro" button at the bottom of the drawer.
   - Verify drawer closes and `SubscribeModal` opens cleanly.
