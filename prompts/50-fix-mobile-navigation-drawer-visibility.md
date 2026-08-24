# 50 — Fix Mobile Navigation Drawer Visibility

## Goal

Fix the mobile navigation drawer visibility issue where clicking the hamburger menu button only shows the backdrop blur effect without displaying the drawer panel, caused by conflicting inline JSX transform styles and CSS opacity classes overriding GSAP animation states.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router Client Component lifecycle, DOM hydration, and modal/drawer overlay patterns.
- `.agents/skills/gsap-core/SKILL.md` — Core tween transitions, fromTo, and matchMedia.
- `.agents/skills/gsap-react/SKILL.md` — `useGSAP()` hook scoping, dependency tracking, and animation cleanup.
- `.agents/skills/gsap-performance/SKILL.md` — 60fps GPU compositor performance and `prefers-reduced-motion` compliance.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- `components/layout/mobile-drawer.tsx` — Mobile drawer component with `useGSAP()` animations, backdrop overlay, and drawer panel.
- `components/layout/header.tsx` — Global header containing the hamburger menu button and drawer state management.
- `/home/dgk/Videos/Screencasts/Screencast_20260824_212906.webm` — User screencast demonstrating the issue (backdrop blur appears on hamburger click, but drawer panel remains hidden).

---

## Decisions and assumptions

1. **Root Cause Analysis**:
   - In `components/layout/mobile-drawer.tsx`, the drawer panel element had hardcoded inline `style={{ transform: "translateX(-100%)" }}` and `className="... opacity-0"`.
   - On component re-render (triggered by child hook updates such as theme, bookmarks, or Clerk), React's JSX DOM reconciliation was re-applying `style.transform = "translateX(-100%)"` directly over GSAP's animated transform state, forcing the panel completely offscreen.
   - Similarly, static `opacity-0` utility classes on the backdrop and panel interfered with GSAP's `autoAlpha` opacity calculations.
2. **GSAP & DOM Reconciliation Fix (`components/layout/mobile-drawer.tsx`)**:
   - Remove hardcoded `style={{ transform: "translateX(-100%)" }}` from the drawer panel JSX.
   - Remove `opacity-0` from backdrop and drawer panel `className`s, delegating initial opacity and transform management entirely to GSAP.
   - In `useGSAP()`, use explicit `gsap.fromTo` transitions for opening:
     - Backdrop: `fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" })`
     - Drawer panel: `fromTo(panelRef.current, { x: "-100%", autoAlpha: 1 }, { x: "0%", duration: 0.35, ease: "power3.out" })`
   - In `useGSAP()`, use clean closing animations:
     - Backdrop: `to(backdropRef.current, { autoAlpha: 0, duration: 0.25, ease: "power2.in" })`
     - Drawer panel: `to(panelRef.current, { x: "-100%", duration: 0.25, ease: "power3.in", onComplete: () => setIsMounted(false) })`
   - For `prefers-reduced-motion: reduce`, use instant/fade animations without translation.

---

## Files likely to change

- `components/layout/mobile-drawer.tsx` [MODIFY] — Remove conflicting inline styles and classes, refine GSAP animation handling.

---

## Implementation requirements

1. **`components/layout/mobile-drawer.tsx`**:
   - Ensure `panelRef` and `backdropRef` JSX do not contain conflicting inline `style` or `opacity-0` classes.
   - Ensure opening animation slides the panel in from `-100%` to `0%` while fading the backdrop in to full visibility (`autoAlpha: 1`).
   - Ensure closing animation slides the panel out to `-100%` while fading backdrop out (`autoAlpha: 0`), unmounting only upon animation completion (`setIsMounted(false)`).
   - Ensure keyboard (`Escape` key), backdrop clicks, close button clicks, and navigation link clicks properly trigger `onClose`.
   - Maintain full compatibility with `onOpenSubscribe` callback for the "Subscribe to Pixca Pro" button.

---

## Security requirements

- No security implications; purely client-side UI animation and accessibility fix.

---

## Acceptance criteria

1. Clicking the hamburger menu button in the header smoothly slides the drawer panel into view from the left with the backdrop blur behind it.
2. All drawer contents (Pixca News header, menu navigation items with badges, theme mode selector, auth button, subscribe CTA button) are clearly visible and interactive.
3. Clicking the backdrop, close `X` button, or pressing `Escape` smoothly slides the drawer out and restores body scroll.
4. Clicking "Subscribe to Pixca Pro" closes the drawer and opens the `SubscribeModal`.
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
2. Test Mobile Drawer:
   - Start the development server (`npm run dev`) and visit `http://localhost:3000`.
   - Click the hamburger menu icon (top left).
   - Verify that the mobile drawer panel slides in cleanly from the left and is fully visible and interactive.
   - Verify theme switcher, navigation links, and "Subscribe to Pixca Pro" buttons operate properly.
   - Click the backdrop or `X` button and verify smooth dismissal.
