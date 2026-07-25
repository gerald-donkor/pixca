# Spacing and Details Page Background Fix

## Goal
Resolve the background color and spacing issues on the News Details page to match the correct reference design (`Screenshot_20260723_130848-1.png` and `03-news-details-page.png`). Standardize the page background to white (`#FFFFFF`) and simplify container wrappers to ensure an elegant, seamless presentation across all devices.

## Skills Read
- Next.js App Router patterns
- Tailwind CSS container and spacing utilities

## Existing Code Inspected
- `app/article/[id]/page.tsx` (has `bg-[#F6F6F6]` page background and uses nested bordered cards that don't match the clean seamless white background of the spec)

## Decisions or Assumptions
- **Page Background:** The article details page mockup (`03-news-details-page.png`) has a solid white page background (`#FFFFFF`), unlike the homepage which uses a Bento-style grey background (`#F6F6F6`). Setting the details page to `bg-white` will make the entire canvas seamless and eliminate any vertical grey margin bars on mobile/tablets.
- **Hero Image Card Removal:** In the bug screenshot, the hero image is enclosed inside an outer bordered container card. In the correct spec, the hero image is placed directly on the page, with its own rounded corners (`rounded-xl`). Removing the outer border card will ensure correct spacing and visual alignment.
- **Widgets Sizing and Contrast:** 
  - Sidebar widgets and the "Bias Distribution" card should have white card backgrounds (`bg-white`) with thin borders to stand out cleanly on the white page.
  - The newsletter subscription block at the bottom should have a light secondary background (`bg-zinc-50` or `bg-[#F6F6F6]`) to create a professional contrast section on the white details page.

## Files Likely to Change
- `app/article/[id]/page.tsx`

## Implementation Requirements
- **Page Background:** Update the outermost container div of `ArticleDetailsPage` to use `bg-white` instead of `bg-[#F6F6F6]`.
- **Hero Image:** Remove the outer padding card wrapper `div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white p-2 shadow-sm"` from the hero image. Render the `<img />` directly inside the article flow, adding the caption underneath. Use `className="w-full aspect-[16/9] object-cover rounded-xl border border-[var(--border)]"` for the image itself.
- **Newsletter Card:** Change the newsletter subscription box background from `bg-white` to `bg-zinc-50` (or `bg-[#F6F6F6]`) to keep its contrast and structure clean.

## Security Requirements
- N/A

## Acceptance Criteria
- Accessing the news details page `/article/1` shows a clean white page background with perfectly proportioned spacing.
- The hero image is rendered directly in the content flow with rounded corners, matching the spacing of `Screenshot_20260723_130848-1.png`.
- The newsletter box has a subtle grey contrast background.
- No typecheck or linting errors.

## Checks to Run
- `npm run typecheck`
- `npm run lint`

## Exact Manual Test Steps
1. Run `npm run dev`.
2. Visit `http://localhost:3000/article/1` in browser.
3. Verify that the background is seamless white and the hero image matches the spacing shown in `Screenshot_20260723_130848-1.png`.
