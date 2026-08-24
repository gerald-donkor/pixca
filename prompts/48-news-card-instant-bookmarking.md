# 48 — News Card Instant Bookmarking

## Goal

Implement an instant bookmarking UI button on all news cards (`NewsCard` / `ArticleGrid` / `ForYouFeed` / `RelatedArticles`) allowing users to bookmark or unbookmark any news article directly from any feed or card view with springy GSAP micro-animations and feedback toasts, without triggering link navigation.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router Client Component patterns and event handling.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Micro-interaction bounce animations.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `/home/dgk/Pictures/Screenshots/Screenshot_20260824_210919.png` — User provided design screenshot showing `/for-you` card grid layout.
- `components/ui/news-card.tsx` — Card component currently rendering an overlay info icon on the image container.
- `hooks/use-bookmarks.ts` — Client-side `useBookmarks()` hook for state and localStorage synchronization.
- `components/ui/article-grid.tsx` & `components/ui/for-you-feed.tsx` — Parent grid components wrapping `NewsCard` in `<Link href="/article/[id]">`.
- `components/ui/article-action-bar.tsx` — Reference implementation for bookmark toggle with GSAP bounce and Sonner toast.

---

## Decisions and assumptions

1. **Overlay Bookmark Button on `NewsCard` (`components/ui/news-card.tsx`)**:
   - Add `"use client"` to `components/ui/news-card.tsx`.
   - Add `articleId?: string` (or `id?: string`) to `NewsCardProps`.
   - Place a dedicated bookmark button on the top-right overlay of the article image (replacing the static placeholder info icon or augmenting it with an interactive bookmark action).
   - When `articleId` (or `id`) is present, check bookmark state via `useBookmarks()`.
   - If bookmarked: render an active filled bookmark icon with blue accent background (`bg-blue-600 text-white`).
   - If not bookmarked: render a subtle translucent dark backdrop (`bg-black/50 hover:bg-black/80 text-white/90 hover:text-white`).
2. **Event Propagation Protection**:
   - The bookmark button handles `onClick`:
     ```ts
     e.preventDefault();
     e.stopPropagation();
     ```
     This prevents triggering the parent Next.js `<Link href="...">` navigation.
3. **Micro-Interaction & Feedback**:
   - On click, trigger a GSAP spring bounce animation on the bookmark icon (`scale: 1.35` -> `1`, `duration: 0.35`, `ease: "back.out(2)"`), respecting `prefers-reduced-motion`.
   - Display Sonner toast feedback (`toast.success("Saved to bookmarks")` / `toast.info("Removed from bookmarks")`).
4. **Prop Wiring in Grids**:
   - Update `components/ui/article-grid.tsx`, `components/ui/for-you-feed.tsx`, and `components/ui/related-articles.tsx` to pass `articleId={article.id}` (and ensure `sourceName` and `imageUrl` are passed) to `NewsCard`.

---

## Files likely to change

- `components/ui/news-card.tsx` [MODIFY] — Add `"use client"`, `articleId` prop, interactive overlay bookmark button, GSAP bounce, and Sonner toast.
- `components/ui/article-grid.tsx` [MODIFY] — Pass `articleId={article.id}` to `NewsCard`.
- `components/ui/for-you-feed.tsx` [MODIFY] — Pass `articleId={article.id}` to `NewsCard`.
- `components/ui/related-articles.tsx` [MODIFY] — Pass `articleId={article.id}` to `NewsCard`.

---

## Implementation requirements

1. **`components/ui/news-card.tsx`**:
   - Convert to Client Component (`"use client"`).
   - Add `articleId?: string` to `NewsCardProps`.
   - Use `useBookmarks()` to determine `isBookmarked(articleId)`.
   - Render accessible `<button aria-label={bookmarked ? "Remove bookmark" : "Save article bookmark"} ...>` on top-right of image.
   - Prevent default and stop propagation on click.
   - Animate icon bounce with GSAP.
   - Emit toast notification.
2. **Parent Grids (`article-grid.tsx`, `for-you-feed.tsx`, `related-articles.tsx`)**:
   - Pass `articleId={article.id}`.

---

## Security requirements

- Client-side bookmark storage in localStorage without sensitive data exposure.

---

## Acceptance criteria

1. An interactive bookmark button is visible on every article card image overlay across the application.
2. Clicking the bookmark button saves/unsaves the article without navigating to the article details page.
3. The bookmark icon state reflects current saved status (filled blue when saved, outline when not saved).
4. Saving an article immediately updates the Saved count in the header and updates the `/for-you` recommendations.
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
2. Test card bookmarking in browser:
   - Navigate to `http://localhost:3000/` or `http://localhost:3000/for-you`.
   - Click the bookmark icon on any card image overlay.
   - Verify toast notification appears and the button turns blue/filled.
   - Verify page URL does not navigate away.
   - Verify the Saved counter in the global header increments.
   - Navigate to `/saved` to verify the bookmarked article appears in the list.
