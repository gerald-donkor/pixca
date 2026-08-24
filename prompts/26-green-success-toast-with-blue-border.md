# 26 — Green Success Toast with Complementary Blue Border

## Goal

Customize the success toast notification (such as when saving an article to bookmarks or copying links) so that:
1. The toast background is a rich, vibrant green (e.g. `bg-emerald-600 dark:bg-emerald-700`) instead of black or dark charcoal.
2. The outer border / margin around the toast is a complementary blue stroke (e.g. `border-2 border-blue-400 dark:border-blue-400` with subtle blue shadow glow) that aesthetically pairs with the green background.
3. The typography and checkmark icon remain crisp, high-contrast pure white for optimal legibility.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Animation and responsive motion standards.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review feedback verification.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit guidelines.

---

## Existing code inspected

- `/home/dgk/Pictures/Screenshots/Screenshot_20260824_133034.png` — Screenshot provided by the user showing the saved bookmark toast with a dark background.
- `components/ui/toaster.tsx` — Sonner wrapper configuring global toast styles, classes, and status variant overrides (`success`, `error`, `info`).
- `components/ui/article-action-bar.tsx` — Dispatches `toast.success("Saved to bookmarks")` and `toast.success("Link copied to clipboard!")`.
- `components/ui/share-modal.tsx` — Dispatches `toast.success("Link copied to clipboard!")`.

---

## Decisions and assumptions

1. **Success Toast Color Palette**:
   - Background: Rich, vibrant emerald green (`bg-emerald-600 dark:bg-emerald-700` / `#059669`).
   - Outer Border / Stroke: Complementary bright blue border (`border-2 border-blue-400 dark:border-blue-400` with subtle elevation glow `shadow-[0_8px_25px_rgba(59,130,246,0.3)]`).
   - Foreground Text: Pure white (`text-white font-semibold text-sm`).
   - Icon / Description: Pure white icon (`[&_[data-icon]]:!text-white`) and light emerald description (`[&_[data-description]]:!text-emerald-100`).
2. **Scoping**:
   - Apply the green background and complementary blue border specifically to the `success` toast class in `components/ui/toaster.tsx` so all success actions (bookmarking, link copying) automatically inherit the new theme.
   - Maintain the standard neutral opaque styling for default and info toasts, and red styling for error toasts.

---

## Files likely to change

- `components/ui/toaster.tsx` [MODIFY] — Update `success` class definition in Sonner `toastOptions.classNames`.

---

## Implementation requirements

### `components/ui/toaster.tsx`
- Must be a client component (`"use client"`).
- Target `toastOptions.classNames.success` with:
  ```tsx
  success:
    "group-[.toaster]:!bg-emerald-600 dark:group-[.toaster]:!bg-emerald-700 group-[.toaster]:!text-white group-[.toaster]:!border-2 group-[.toaster]:!border-blue-400 dark:group-[.toaster]:!border-blue-400 group-[.toaster]:!shadow-[0_8px_25px_rgba(59,130,246,0.3)] [&_[data-icon]]:!text-white [&_[data-description]]:!text-emerald-100",
  ```
- Retain high contrast, solid opacity, and responsive padding.

---

## Security requirements

- Pure styling change; no sensitive variables, external APIs, or data mutations involved.

---

## Acceptance criteria

1. Clicking "Save" on an article details page triggers a toast with:
   - Green background (`emerald-600` / `emerald-700`).
   - Complementary blue border around the toast (`border-blue-400`).
   - Crisp white text ("Saved to bookmarks") and checkmark icon.
2. Clicking "Copy Link" in the share modal or action bar displays the same green-and-blue success toast.
3. Light and dark modes render the toast with high contrast and zero background bleed-through.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Start dev server: `npm run dev`.
2. Open an article at `http://localhost:3000/article/[id]`.
3. Click "Save" in the action bar:
   - Verify the toast renders with a vibrant green background.
   - Verify the complementary blue border outlines the toast.
   - Verify the text and checkmark are crisp white.
4. Click "Share", then "Copy":
   - Verify "Link copied to clipboard!" appears in the same green & blue toast styling.
