# 73 — Adaptive Read Full Coverage Navigation

## Goal

Enhance the **"Read Full Coverage"** action in the **Perspective Comparison Modal** ([`components/ui/perspective-comparison-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/perspective-comparison-modal.tsx)) with device-adaptive navigation behavior:
1. **Desktop & Tablets (`≥ 768px`)**: Open the compared article in a fresh new tab (`target="_blank" rel="noopener noreferrer"`), preserving the primary article, scroll position, and reading progress intact.
2. **Mobile Phones (`< 768px`)**: Navigate within the same tab via Next.js client routing (`Link`) and dismiss the modal, ensuring native back-swipe gestures (`window.history.back()`) seamlessly return the user to the primary article without creating orphan browser tabs.
3. **Hydration-Safe Client Detection**: Implement media query detection using `useSyncExternalStore` to ensure SSR compatibility without layout shifts or hydration warnings.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client component routing and navigation boundaries.
- `.agents/skills/gsap-core/SKILL.md` — Responsive matchMedia patterns.
- `.agents/skills/requesting-code-review/SKILL.md` — Pre-completion review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- [`components/ui/perspective-comparison-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/perspective-comparison-modal.tsx) — Perspective comparison modal with "Read Full Coverage" button.
- [`components/ui/reading-diet-share-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/reading-diet-share-modal.tsx) — Existing `useSyncExternalStore` media query patterns for native sharing & URL detection.

---

## Decisions and assumptions

1. **Hydration Safety**:
   - Use `useSyncExternalStore` to query `(min-width: 768px)` on the client while defaulting to `true` (or safe desktop default) on server without mismatch warnings.
2. **Link Attributes**:
   - On desktop (`isDesktop === true`), render with `target="_blank"` and `rel="noopener noreferrer"`. Clicking the link opens a new tab and keeps the modal open/ready in the background.
   - On mobile (`isDesktop === false`), render without `target` attribute and trigger `onOpenChange(false)` on click so same-tab navigation operates cleanly with the browser history stack.

---

## Files likely to change

- `components/ui/perspective-comparison-modal.tsx` [MODIFY] — Add `useIsDesktop` hook and update "Read Full Coverage" link to adaptively open in a new tab on desktop/tablet and same tab on mobile.

---

## Implementation requirements

1. **Implement `useIsDesktop` hook in `components/ui/perspective-comparison-modal.tsx`**:
   - Subscribe to `window.matchMedia("(min-width: 768px)")` changes using `useSyncExternalStore`.
2. **Update "Read Full Coverage" Link in Column 2**:
   - When `isDesktop`:
     - `target="_blank"`
     - `rel="noopener noreferrer"`
     - Keep modal open or optional dismiss.
   - When not `isDesktop`:
     - Omit `target` / `rel`.
     - Call `onOpenChange(false)` on click.

---

## Security requirements

- Always include `rel="noopener noreferrer"` when `target="_blank"` is used to protect against reverse tabnabbing and window opener vulnerabilities.

---

## Acceptance criteria

- [ ] On desktop/tablet viewports (≥ 768px), clicking "Read Full Coverage" opens the compared article in a fresh new browser tab.
- [ ] On mobile viewports (< 768px), clicking "Read Full Coverage" navigates in the same tab and closes the modal, preserving native back-swipe gesture support.
- [ ] Zero hydration warnings or SSR mismatch errors.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000/article/<article-id>`.
2. Open the "Compare" modal on any related article.
3. On desktop, click "Read Full Coverage" and verify it opens in a new browser tab with `rel="noopener noreferrer"`.
4. In DevTools, switch to a mobile screen (e.g. 375px width), open the modal, and click "Read Full Coverage".
5. Verify it navigates in the current tab and allows swiping/clicking Back to return to the original article.
