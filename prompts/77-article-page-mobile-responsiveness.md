# Goal

Fix the article details page mobile responsiveness so it does not horizontally overflow or clip controls at narrow widths. The provided recording `/home/dg/Videos/screenrecording-2026-08-27_20-09-03.mp4` shows the issue at a mobile viewport around `556x724`: the page can scroll sideways, the newsletter subscribe button is clipped, and related article content appears wider than the available viewport when DevTools narrows the page.

# Skills Read

- None required for the prompt draft. This is a scoped UI responsiveness fix using existing Tailwind/shadcn patterns.
- Before implementation, have `requesting-code-review` available for the required review workflow before completion.

# Existing Code Inspected

- `AGENTS.md`
- `app/article/[id]/page.tsx`
- `app/article/[id]/loading.tsx`
- `components/ui/newsletter-subscribe.tsx`
- `components/ui/related-articles.tsx`
- `components/ui/news-card.tsx`
- `components/ui/bias-meter.tsx`
- `app/globals.css`
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`
- Visual reference frames extracted from `/home/dg/Videos/screenrecording-2026-08-27_20-09-03.mp4`

# Visual Interpretation

- The mobile article page uses a dark, compact editorial design with card-based analysis modules, rounded article imagery, and dense but readable typography.
- The recording shows the article body itself mostly readable, but the page has horizontal overflow under mobile resizing.
- The newsletter card is the clearest failure: the form row remains horizontal below `md`, and the fixed/min widths allow the button to run past the right edge.
- Related articles begin below the newsletter and appear constrained by the overflowing page rather than the actual viewport width.
- The article layout should preserve the current design language: dark card surfaces, thin borders, compact labels, no new visual language, no new feature surface.

# Decisions And Assumptions

- Treat the recording as the design reference for the bug.
- Keep the desktop layout unchanged in intent: article content plus a right sidebar at `lg`.
- On mobile, all article page sections must fit within the viewport with no horizontal document scrolling.
- Favor responsive Tailwind class changes over new components or custom CSS.
- Use `min-w-0`, `max-w-full`, smaller mobile padding, wrapping rows, and mobile-first stacked controls where needed.
- Do not change scraping, Supabase, Clerk, AI, scheduler, or article data behavior.

# Files Likely To Change

- `[MODIFY] app/article/[id]/page.tsx`
- `[MODIFY] app/article/[id]/loading.tsx`
- `[MODIFY] components/ui/newsletter-subscribe.tsx`
- `[MODIFY] components/ui/related-articles.tsx` if needed for `min-w-0`/overflow containment
- `[MODIFY] components/ui/news-card.tsx` only if related-card content still creates overflow

# Implementation Requirements

- Add mobile-safe width constraints to the article page grid and columns:
  - Ensure main grid children can shrink with `min-w-0`.
  - Ensure cards, article text, images, related articles, and sidebar widgets use `max-w-full`.
  - Reduce article page horizontal padding on the smallest viewport, e.g. `px-4 sm:px-6`, while preserving desktop spacing.
- Fix the newsletter block:
  - The card should fit the viewport at mobile widths.
  - The `NewsletterSubscribe` form should stack input and button on small screens.
  - The input and submit button should both be `w-full` on small screens.
  - Keep the existing horizontal form behavior on wider screens where space allows.
  - Loading, error, suggestion, and success states must not overflow.
- Fix byline/action row if necessary:
  - Long source names, dates, and the original link should wrap cleanly.
  - `ArticleActionBar` should not force overflow on small screens.
- Fix related articles if necessary:
  - Related article grid and card wrappers should use `min-w-0` and `max-w-full`.
  - News card metadata/title/footer text should truncate or wrap within the card instead of increasing page width.
- Keep accessible semantics intact:
  - Preserve form labels/ARIA state.
  - Preserve link destinations, button behavior, and modal behavior.
- Keep `app/article/[id]/loading.tsx` responsive in the same way as the loaded page so the skeleton does not overflow.

# Security Requirements

- No API, auth, secret, persistence, scraping, or AI route changes.
- Do not expose environment variables or alter Clerk/Supabase behavior.
- Keep external article links as `target="_blank"` with `rel="noopener noreferrer"`.

# Acceptance Criteria

- At mobile widths around `360px`, `390px`, and the recorded `556px`, the article details page has no horizontal document scrolling.
- The newsletter card, input, and subscribe button are fully visible and usable on mobile.
- Related article cards fit within the viewport and do not force horizontal overflow.
- Article headline, byline, action controls, hero image, bias card, article body, newsletter block, related articles, and sidebar widgets remain visually coherent.
- Desktop layout still uses the existing two-column article/sidebar structure at `lg`.
- Loading skeleton matches the responsive behavior of the loaded article page.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Inspect the final diff with `git diff --check` and `git diff`
- If practical, run the app locally and verify the article page at mobile viewport widths using browser DevTools or Playwright screenshot checks.

# Manual Test Steps

1. Start the dev server with `npm run dev`.
2. Open a real article URL such as `http://localhost:3000/article/<article-id>`.
3. In browser DevTools, test responsive widths `360px`, `390px`, and `556px`.
4. Confirm there is no horizontal scrollbar on the document.
5. Scroll to the newsletter block and confirm the email input and Subscribe button are fully visible and usable.
6. Scroll to Related Articles and confirm every card fits within the viewport.
7. Resize back to desktop width and confirm the article/sidebar layout remains intact.
