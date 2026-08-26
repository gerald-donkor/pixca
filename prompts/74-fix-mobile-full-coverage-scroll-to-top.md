# 74 — Fix Mobile Full Coverage Scroll To Top

## Goal

Fix the mobile navigation behavior when clicking **"Read Full Coverage"** inside the **Perspective Comparison Modal** ([`components/ui/perspective-comparison-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/perspective-comparison-modal.tsx)) so the user is immediately taken to the **top of the target article page** (`scrollY: 0`) instead of being left at the bottom of the page where the Related Articles / Compare trigger was located.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js router navigation, `<Link scroll={true}>`, and dynamic route parameter transitions.
- `.agents/skills/gsap-core/SKILL.md` — Responsive matchMedia and scroll management.
- `.agents/skills/requesting-code-review/SKILL.md` — Pre-completion review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- [`components/ui/perspective-comparison-modal.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/perspective-comparison-modal.tsx) — Perspective comparison modal and "Read Full Coverage" link handling.
- [`app/article/[id]/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/article/[id]/page.tsx) — Article detail page and related articles layout.
- [`components/ui/reading-progress.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/reading-progress.tsx) — Top reading progress bar on article pages.

---

## Decisions and assumptions

1. **Root Cause Analysis**:
   - On mobile, when "Read Full Coverage" is clicked, the dialog closes and the underlying dialog primitive attempts to restore focus to the originating trigger element (the "Compare" button on the related article card near the bottom of the page).
   - In addition, Next.js soft-routing between dynamic routes (`/article/[id]`) of the same layout structure does not always force `scrollY = 0` if focus restoration pulls the viewport back to the bottom.
2. **Multi-Layer Scroll Reset Solution**:
   - **Modal Click Handler**: In `components/ui/perspective-comparison-modal.tsx`, when navigating on mobile (`!isDesktop`), blur `document.activeElement` so the dialog does not restore focus down to the trigger button, call `window.scrollTo({ top: 0, left: 0, behavior: "instant" })`, and use Next.js `router.push(url, { scroll: true })` / `<Link scroll={true}>`.
   - **Article Page Scroll Reset Component**: Add a dedicated client component [`components/ui/article-scroll-reset.tsx`](file:///home/dg/Projects/nextjs/pixca/components/ui/article-scroll-reset.tsx) that listens to changes in `articleId` and guarantees `window.scrollTo({ top: 0, left: 0, behavior: "instant" })` executes on mount and whenever the active article ID changes.

---

## Files likely to change

- `components/ui/perspective-comparison-modal.tsx` [MODIFY] — Add explicit mobile navigation click handler with active element blurring, modal dismissal, and instant scroll-to-top.
- `components/ui/article-scroll-reset.tsx` [NEW] — Lightweight client component that guarantees scroll reset to top on article navigation.
- `app/article/[id]/page.tsx` [MODIFY] — Mount `ArticleScrollReset` with `article.id`.

---

## Implementation requirements

1. **Create `components/ui/article-scroll-reset.tsx`**:
   - Client component (`"use client"`).
   - Accepts `articleId: string`.
   - `useEffect` triggers `window.scrollTo({ top: 0, left: 0, behavior: "instant" })` on initial mount and whenever `articleId` changes.
2. **Mount `ArticleScrollReset` in `app/article/[id]/page.tsx`**:
   - Place `<ArticleScrollReset articleId={article.id} />` at the top of the article container.
3. **Enhance "Read Full Coverage" in `components/ui/perspective-comparison-modal.tsx`**:
   - Use Next.js `useRouter` for mobile client-side navigation.
   - On mobile click:
     - Prevent default anchor behavior.
     - Blur `document.activeElement` to cancel bottom focus restoration.
     - Call `onOpenChange(false)`.
     - Execute `window.scrollTo({ top: 0, left: 0, behavior: "instant" })`.
     - Call `router.push(`/article/${targetArticle.article_id}`, { scroll: true })`.

---

## Security requirements

- Desktop navigation must continue to use `target="_blank"` with `rel="noopener noreferrer"` to prevent reverse tabnabbing.

---

## Acceptance criteria

- [ ] On mobile viewport, clicking "Read Full Coverage" navigates to the target article and lands at the very top of the page (`scrollY: 0`).
- [ ] No focus snapping back to the bottom of the page.
- [ ] Desktop tab-opening behavior remains unaffected (`target="_blank" rel="noopener noreferrer"`).
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
2. Open DevTools in mobile device emulation mode (e.g. 390px width).
3. Scroll down to the bottom of the article to the Related Articles section.
4. Click "Compare" on a related article card to open the perspective comparison modal.
5. In the modal, click "Read Full Coverage".
6. Verify the page navigates to the selected article and displays from the very top (headline, metadata, hero image), NOT scrolled to the bottom.
