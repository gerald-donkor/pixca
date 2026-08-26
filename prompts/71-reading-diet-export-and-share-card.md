# 71 — Reading Diet Export and Share Card

## Goal

Provide users on both the **Saved Library** ([`app/saved/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/saved/page.tsx)) and **For You** ([`app/for-you/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/for-you/page.tsx)) pages with an interactive **"Share Reading Diet"** feature:
1. **Share Reading Diet Modal** ([`components/ui/reading-diet-share-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/reading-diet-share-modal.tsx)): An accessible modal featuring an aesthetic, branded visual card displaying the user's political balance (Left / Center / Right percentages), Echo-Chamber Shield score, saved article count, and source breadth.
2. **Visual Export & Share Options**:
   - One-click copy formatted text summary & share link to clipboard.
   - Native Web Share API integration (mobile & desktop where supported).
   - Direct social share shortcuts (X / Twitter, LinkedIn, Reddit).
   - High-resolution SVG / Canvas visual card download as PNG for sharing on social platforms.
3. **Integration Points**:
   - Add a "Share Diet" / "Share Profile" button to [`components/ui/for-you-affinity-summary.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/for-you-affinity-summary.tsx) and [`components/ui/saved-diet-meter.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/saved-diet-meter.tsx).
   - GSAP micro-interactions on button hover/click and modal entry transitions.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client components and state boundaries.
- `.agents/skills/gsap-core/SKILL.md` — GSAP tweens, easing, and micro-interactions.
- `.agents/skills/gsap-react/SKILL.md` — `useGSAP()` hook lifecycle and scoping.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- [`components/ui/for-you-affinity-summary.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/for-you-affinity-summary.tsx) — Reading diet affinity calculations, resilience shield metrics, and perspective breakdown.
- [`components/ui/saved-diet-meter.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/saved-diet-meter.tsx) — Saved library perspective breakdown and topic affinity.
- [`components/ui/share-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/share-modal.tsx) — Existing article share modal architecture with clipboard fallback and social links.
- [`components/ui/dialog.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/dialog.tsx) — Base UI accessible dialog primitive.

---

## Decisions and assumptions

1. **Client-Side Generation & Privacy**:
   - All visual card rendering (SVG/Canvas to PNG) and metric summaries are generated 100% locally in the browser. No user reading history or bookmarks are transmitted to third-party endpoints.
2. **Design Language & Visual Card**:
   - The share card inside the modal mirrors Pixca's editorial aesthetic: dark/light adaptive container with a clean brand badge ("PIXCA Reading Diet"), spectrum bar with percentage labels, Echo-Chamber Shield score, and publisher diversity statistics.
3. **Canvas / PNG Export**:
   - Use standard HTML5 Canvas drawing / SVG data URL conversion for instant, dependency-free PNG image generation and download.
4. **Trigger Micro-Interactions**:
   - The "Share Diet" trigger buttons use GSAP subtle bounce micro-animations and clean icon styling with Tooltip assistance.

---

## Files likely to change

- `components/ui/reading-diet-share-modal.tsx` [NEW] — Share reading diet modal with live visual card preview, copy text, social share links, and PNG image download.
- `components/ui/for-you-affinity-summary.tsx` [MODIFY] — Add Share Diet action button opening the modal.
- `components/ui/saved-diet-meter.tsx` [MODIFY] — Add Share Diet action button opening the modal.

---

## Implementation requirements

1. **Create `components/ui/reading-diet-share-modal.tsx`**:
   - Accept `open`, `onOpenChange`, and computed `stats` (or `bookmarks` + `topTopics`).
   - Render an accessible Dialog modal with:
     - Header: "Share Your Reading Diet".
     - Visual Card: A sleek editorial card featuring Pixca logo/branding, Dominant Lean badge, 3-segment Perspective Balance meter (Left / Center / Right), Shield score, and source count.
     - Action Bar: "Copy Summary", "Download Card (PNG)", Native Share (if supported), and Social links (X, LinkedIn, Reddit).
     - Provide immediate toast feedback with Sonner upon copying or downloading.
2. **Update `components/ui/for-you-affinity-summary.tsx`**:
   - Add a compact "Share Profile" button in the header or action row.
   - Wire state to open `ReadingDietShareModal`.
3. **Update `components/ui/saved-diet-meter.tsx`**:
   - Add a compact "Share Diet" button in the header or action row.
   - Wire state to open `ReadingDietShareModal`.

---

## Security requirements

- Zero telemetry or private bookmark transmission during sharing or card generation.
- Sanitize all text before generating social share URLs.

---

## Acceptance criteria

- [ ] "Share Profile" button appears on `/for-you` and "Share Diet" appears on `/saved`.
- [ ] Clicking the button opens the `ReadingDietShareModal` with an accurate visual preview of the user's reading balance.
- [ ] "Copy Summary" puts a formatted markdown/text summary and link onto the clipboard with toast confirmation.
- [ ] "Download Card (PNG)" renders and triggers a browser download of the visual card image.
- [ ] Social share links (X, LinkedIn, Reddit) open prefilled share dialogues with proper URL encoding.
- [ ] Keyboard navigation (Tab, Escape) works seamlessly.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` succeed with 0 errors.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000/saved` and `http://localhost:3000/for-you`.
2. Click the "Share Diet" / "Share Profile" button.
3. Verify the modal opens smoothly and renders the perspective balance and shield score.
4. Test "Copy Summary", "Download Card", and social share links.
5. Test responsive layout on mobile screen widths.
