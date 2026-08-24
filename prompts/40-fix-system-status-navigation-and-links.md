# 40 — Fix System Status Navigation & Multi-Location Links

## Goal

Ensure all "System Status" links and indicators across the application (Header utility bar, Mobile Drawer navigation menu, and Global Footer) reliably navigate to the `/logs` System Status & Pipeline Logs dashboard page.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router navigation, `<Link>` component behavior, and Client/Server component integration.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Animation preservation and layout cleanliness.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `components/layout/header.tsx` — Desktop utility bar currently renders static `<span>` with indicator dot for "Browser Extension" without a navigable link for System Status.
- `components/layout/mobile-drawer.tsx` — `NAV_ITEMS` array lacks a dedicated "System Status" link for mobile and drawer navigation.
- `components/layout/footer.tsx` — "System Status" item in "Help & Status" column needs block-level hit area so clicks across the entire row navigate to `/logs`.

---

## Decisions and assumptions

1. **Header Utility Bar**:
   - Replace the static "Browser Extension" text in the top utility bar with an interactive live status badge linking to `/logs`:
     ```tsx
     <Link
       href="/logs"
       className="cursor-pointer hover:text-white transition-colors flex items-center gap-1.5"
     >
       <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
       System Status
     </Link>
     ```
2. **Mobile Navigation Drawer**:
   - Add `{ label: "System Status", href: "/logs", icon: Activity, badge: "Live" }` to `NAV_ITEMS` in `components/layout/mobile-drawer.tsx` so users on mobile devices or in the drawer menu can directly navigate to `/logs`.
3. **Global Footer**:
   - Make the "System Status" link in the footer full-width (`block`) within the `<li>` element to guarantee that any click on the row triggers navigation.

---

## Files likely to change

- `components/layout/header.tsx` [MODIFY] — Add clickable "System Status" link with live pulsating indicator dot in top utility bar.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Add "System Status" item to `NAV_ITEMS` with `Activity` icon and "Live" badge.
- `components/layout/footer.tsx` [MODIFY] — Ensure full-row clickable hit area for "System Status" link.

---

## Implementation requirements

1. **`components/layout/header.tsx`**:
   - In the utility bar left section, convert the static indicator into a Next.js `<Link href="/logs">` with a green pulsating live dot (`bg-emerald-500 animate-pulse`).
2. **`components/layout/mobile-drawer.tsx`**:
   - Import `Activity` from `lucide-react`.
   - Add `{ label: "System Status", href: "/logs", icon: Activity, badge: "Live" }` to `NAV_ITEMS`.
3. **`components/layout/footer.tsx`**:
   - Ensure the link is `<Link href="/logs" className="block hover:text-white transition-colors">System Status</Link>`.

---

## Security requirements

- Standard client-side routing with Next.js App Router `<Link>`; no secret exposure.

---

## Acceptance criteria

1. Clicking "System Status" in the top desktop utility bar navigates directly to `/logs`.
2. Clicking "System Status" in the mobile drawer menu navigates to `/logs` and closes the drawer.
3. Clicking "System Status" anywhere on the footer link row navigates to `/logs`.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

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
2. In browser at `http://localhost:3000`:
   - Click the green **System Status** indicator in the top utility bar → verify instant navigation to `/logs`.
   - Open the hamburger menu drawer, click **System Status** → verify drawer closes and navigates to `/logs`.
   - Scroll to footer and click **System Status** under Help & Status → verify navigation to `/logs`.
