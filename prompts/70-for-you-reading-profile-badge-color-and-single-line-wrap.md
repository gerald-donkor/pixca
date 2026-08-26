# 70 — For You Reading Profile Badge Color & Single-Line Wrap Fix

## Goal

Update the **"Balanced Exploration"** dominant lean badge in the **Adaptive Reading Profile** ([`components/ui/for-you-affinity-summary.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/for-you-affinity-summary.tsx)) per the user's design reference screenshot (`screenshot-2026-08-26_10-07-37.png`):
1. **Complementary Badge Color**: Change the "Balanced Exploration" badge styling from green (`emerald`) to purple (`text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20`) to eliminate color duplication with the "Echo-Chamber Shielded" green status pill directly beneath it and match the balanced/center purple tone from the political spectrum meter.
2. **Strict Single-Line Text Display**: Add `whitespace-nowrap shrink-0` and responsive `flex-wrap` layout to the badge container so the text ("Balanced Exploration") never awkwardly wraps across multiple lines on mobile screens.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client component styling and responsive layout.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `screenshot-2026-08-26_10-07-37.png` — User provided design reference highlighting the "Balanced Exploration" pill badge wrapping onto two lines with redundant green color next to the green shield pill.
- `components/ui/for-you-affinity-summary.tsx` — Adaptive reading profile header, dominant lean calculations, and badge markup.

---

## Decisions and assumptions

1. **Color Choice**:
   - Purple (`text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20`) is the canonical complementary accent in Pixca representing balanced/centrist multi-perspective reading, creating clear visual hierarchy against the emerald green Echo-Chamber Shield score pill.
2. **Text Wrap Prevention**:
   - Apply `whitespace-nowrap shrink-0` directly to the badge `<span>`.
   - Update the heading row to `flex flex-wrap items-center gap-2` to allow the pill to position cleanly alongside the title without squeezing or breaking words.

---

## Files likely to change

- `components/ui/for-you-affinity-summary.tsx` [MODIFY] — Update dominant lean color token for "Balanced Exploration" and add `whitespace-nowrap shrink-0`.

---

## Implementation requirements

1. **Update `components/ui/for-you-affinity-summary.tsx`**:
   - Set `dominantColor = "text-purple-600 dark:text-purple-400"` and `dominantBg = "bg-purple-500/10 border-purple-500/20"` for `"Balanced Exploration"`.
   - Add `whitespace-nowrap shrink-0` and ensure responsive flex wrapping in the badge container.

---

## Acceptance criteria

- [ ] "Balanced Exploration" badge displays in complementary purple (`text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20`).
- [ ] Badge text remains strictly on a single line on all mobile screen widths (down to 320px).
- [ ] All verification checks (`npm run typecheck`, `npm run lint`, `npm run build`) pass with 0 errors.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000/for-you` on mobile viewport emulation.
2. Verify the "Balanced Exploration" badge renders in purple and the text stays on one line.
3. Confirm clean visual contrast against the green "Echo-Chamber Shielded" badge below.
