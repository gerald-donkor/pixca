# 69 — Update For You "New" Badge and Dot Indicator to Green

## Goal

Update the **"New" badge color** and **indicator dot** for the **For You** navigation items from red to green (emerald) across the UI as requested in the design reference screenshot (`screenshot-2026-08-26_09-33-37.png`):
1. **Mobile Drawer Navigation** ([`components/layout/mobile-drawer.tsx`](file:///home/dg/Projects/nextjs/pixca/components/layout/mobile-drawer.tsx)): Update the "New" badge next to "For You" from red to green (`bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`), and ensure the "Pro" badge uses the blue badge styling (`bg-blue-500/15 text-blue-600 dark:text-blue-400`).
2. **Desktop Header Navigation** ([`components/layout/header.tsx`](file:///home/dg/Projects/nextjs/pixca/components/layout/header.tsx)): Update the "For You" status dot indicator from red (`bg-red-600`) to green (`bg-emerald-500`).
3. **Command Palette Quick Navigation** ([`components/ui/command-palette.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/command-palette.tsx)): Ensure the "New" badge in the command palette uses green emerald styling.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client component conventions.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `screenshot-2026-08-26_09-33-37.png` — User provided design reference highlighting the "New" badge on mobile drawer in red to be changed to green.
- `components/layout/mobile-drawer.tsx` — Mobile drawer navigation items and badge styling logic.
- `components/layout/header.tsx` — Desktop header navigation items and status dot.
- `components/ui/command-palette.tsx` — Command palette quick navigation badge styles.

---

## Decisions and assumptions

1. **Emerald Green Styling Token**:
   - Use `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400` for the "New" badge pills in dark and light modes, consistent with the green design system tokens used for active status.
2. **Header Dot Indicator**:
   - Update `<span className="w-1.5 h-1.5 bg-red-600 rounded-full" />` to `<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />` for visual harmony between desktop header and mobile drawer.
3. **Pro Badge Refinement**:
   - Ensure `badge === "Pro"` explicitly renders with `bg-blue-500/15 text-blue-600 dark:text-blue-400` in the mobile drawer.

---

## Files likely to change

- `components/layout/mobile-drawer.tsx` [MODIFY] — Update badge color logic to render "New" as green emerald.
- `components/layout/header.tsx` [MODIFY] — Update "For You" dot indicator to green emerald.
- `components/ui/command-palette.tsx` [MODIFY] — Update "New" badge styling to green emerald.

---

## Implementation requirements

1. **Update `components/layout/mobile-drawer.tsx`**:
   - In badge class matching:
     - `isSaved ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"`
     - `badge === "Live" || badge === "New" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"`
     - `badge === "Pro" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"`
     - `fallback: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"`
2. **Update `components/layout/header.tsx`**:
   - Change `bg-red-600` on the "For You" dot indicator to `bg-emerald-500`.
3. **Update `components/ui/command-palette.tsx`**:
   - Update `item.badge === "New"` to use emerald green styling (`bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`).

---

## Acceptance criteria

- [ ] "New" badge in mobile navigation drawer displays in emerald green (`bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`).
- [ ] "For You" status dot indicator in the desktop header displays in emerald green (`bg-emerald-500`).
- [ ] "New" badge in command palette displays in emerald green.
- [ ] All verification checks (`npm run typecheck`, `npm run lint`, `npm run build`) pass with 0 errors.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000`.
2. Inspect the "For You" link in the desktop header and verify the dot indicator is green.
3. Open the mobile menu drawer (or responsive mobile view) and verify the "New" badge next to "For You" is green.
4. Press `⌘K` or `Ctrl+K` and verify the "New" badge next to "For You Feed" in the Command Palette is green.
