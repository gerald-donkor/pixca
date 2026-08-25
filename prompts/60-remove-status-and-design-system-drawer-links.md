# 60 — Remove System Status and Design System Links from Sidebar Drawer

## Goal

Remove the "System Status" (`/logs`) and "Design System" (`/design-system`) navigation button links from the sidebar / mobile drawer navigation menu as indicated in the user reference screenshot (`/home/dg/Pictures/screenshot-2026-08-25_20-04-44.png`).

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client layout and navigation components.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `/home/dg/Pictures/screenshot-2026-08-25_20-04-44.png` — User provided screenshot showing the sidebar drawer with "System Status" and "Design System" links circled in red for removal.
- `components/layout/mobile-drawer.tsx` — Navigation drawer component containing `NAV_ITEMS` array with `{ label: "System Status", href: "/logs", icon: Activity, badge: "Live" }` and `{ label: "Design System", href: "/design-system", icon: LayoutTemplate }`.

---

## Decisions and assumptions

1. **Remove from `NAV_ITEMS` in `components/layout/mobile-drawer.tsx`**:
   - Remove `{ label: "System Status", href: "/logs", icon: Activity, badge: "Live" }`.
   - Remove `{ label: "Design System", href: "/design-system", icon: LayoutTemplate }`.
   - Remove unused `Activity` and `LayoutTemplate` imports from `lucide-react`.

2. **Preserve Remaining Navigation Links**:
   - Keep: Home (`/`), For You (`/for-you`), Pricing & Plans (`/pricing`), Local News (`/#local`), Blindspot Feed (`/blindspot`), and Saved Articles (`/saved`).

3. **Leave Pages and Backend Intact**:
   - The `/logs` and `/design-system` routes and pages themselves remain intact and accessible directly or via footer/admin if needed, without cluttering the primary user sidebar menu.

---

## Files likely to change

- `components/layout/mobile-drawer.tsx` [MODIFY] — Remove "System Status" and "Design System" items from `NAV_ITEMS` array and clean up icon imports.

---

## Implementation requirements

1. **Sidebar / Drawer Item Cleanup**:
   - Update `NAV_ITEMS` in `components/layout/mobile-drawer.tsx` so only Home, For You, Pricing & Plans, Local News, Blindspot Feed, and Saved Articles are listed.
   - Clean up unused `Activity` and `LayoutTemplate` icon imports.

2. **Verification**:
   - Run typecheck, lint, and production build to confirm 0 errors and no regressions.

---

## Security requirements

- Purely UI navigation adjustment; no security implications.

---

## Acceptance criteria

1. The sidebar / mobile navigation drawer no longer displays the "System Status" button link.
2. The sidebar / mobile navigation drawer no longer displays the "Design System" button link.
3. All other sidebar menu items (Home, For You, Pricing & Plans, Local News, Blindspot Feed, Saved Articles) remain functional.
4. All checks (`npm run typecheck`, `npm run lint`, `npm run build`) pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Start development server: `npm run dev`.
2. Open `http://localhost:3000` (or `http://localhost:3001`).
3. Click the menu hamburger icon in the header to open the navigation drawer.
4. Verify that "System Status" and "Design System" are no longer present in the menu.
5. Verify the remaining navigation items (Home, For You, Pricing & Plans, Local News, Blindspot Feed, Saved Articles) render cleanly and operate correctly.
