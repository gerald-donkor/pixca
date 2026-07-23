# News Details Page UI Implementation

## Goal
Implement the Pixca News Details Page UI based on the reference design (`03-news-details-page.png`). Ensure pixel-perfect matching of the two-column layout, sidebar widgets, and article content. Ensure all "biasly" artifacts are replaced with "Pixca". Extract shared layout elements (Header, Footer, Utility Bar) to avoid code duplication.

## Skills Read
- Next.js App Router (`node_modules/next/dist/docs/`)
- Tailwind CSS

## Existing Code Inspected
- `app/page.tsx` (contains the currently hardcoded Header, Utility Bar, and Footer)
- `app/layout.tsx` (root layout)
- `components/ui/bias-meter.tsx`
- `components/ui/news-card.tsx`

## Decisions or Assumptions
- The Utility Bar, Header, and Footer are identical to the homepage. I will extract them into reusable components (e.g., `components/layout/header.tsx` and `components/layout/footer.tsx`) and place them in `app/layout.tsx` to automatically wrap all pages.
- The new page will be built at `app/article/[id]/page.tsx` to simulate a dynamic news detail route.
- Mock data will be used to populate the article text, AI summary, bias analysis, and related stories exactly as shown in the screenshot.
- Sidebar progress bars (for Left/Center/Right breakdowns) are individual linear bars, not a combined segment meter. I will build a simple linear progress utility or write custom HTML/Tailwind for them to match the exact visual style.
- "Related Stories" uses small horizontal news cards. I'll reuse the `NewsCard` component with the `variant="horizontal"` configuration, tweaking sizing if necessary.

## Files Likely to Change
- `components/layout/header.tsx` (new)
- `components/layout/footer.tsx` (new)
- `app/layout.tsx` (wrap `{children}` with the new header and footer)
- `app/page.tsx` (remove the hardcoded header and footer, keeping only the main content)
- `app/article/[id]/page.tsx` (new: the article detail page)

## Implementation Requirements
- **Global Layout Refactoring:**
  - Create `Header` (includes the top black utility bar + white navbar).
  - Create `Footer`.
  - Update `app/layout.tsx` to include them. Clean up `app/page.tsx`.
- **Article Page Layout:**
  - A responsive 2-column layout (CSS Grid or Flexbox). Left main content (~65-70%), Right sidebar (~30-35%).
- **Left Column (Main Content):**
  - Meta header: "Politics • United States"
  - Headline: "Trump Sends Iran Revised Peace Proposal With Tougher Terms: Report"
  - Sub-meta: Author, Date, Read Time.
  - Action items: Save, Share, More (...) icons.
  - Hero image with small caption text below.
  - Inline "Bias Distribution" card matching the combined `BiasMeter` with "12 sources".
  - Article text: Beautifully spaced, readable typography (`text-body-lg` or equivalent) matching the screenshot's paragraphs.
  - **Related Stories:** A 2-column grid of smaller horizontal cards.
  - **Newsletter Block:** "Stay Informed. Stay Balanced." box spanning the content width at the bottom.
- **Right Column (Sidebar Widgets):**
  - **Bias Analysis:** Header with info icon. Overall bias ("Right 49%"). 3 individual linear progress bars for Left, Center, Right percentages. Explanatory text. "How We Analyze Bias" outline button.
  - **AI Summary:** Header with info icon. Meta ("Generated May 31..."). A styled bulleted list of summary points. Disclaimer text. "Provide Feedback" button.
  - **Source Breakdown:** Header with info icon. "12 Total Sources". 3 linear progress bars with counts ("Left 2 (20%)"). A "Top Sources" text table/list mapping source names to their bias labels. "View All Sources" button.
- **Visuals:** Follow the strict design system. Use correct hex colors (`#B42318` for left, `#1D4ED8` for right, etc.). Rounded corners (`rounded-xl` for cards, `rounded-md` for buttons).

## Security Requirements
- N/A (UI only).

## Acceptance Criteria
- Visiting `http://localhost:3000/article/1` displays a pixel-perfect representation of `03-news-details-page.png`.
- The homepage (`/`) still functions and renders perfectly without duplicating code.
- Layout scales responsibly to mobile/tablet views (sidebar drops below main content).
- No TypeScript or ESLint errors.

## Checks to Run
- `npm run typecheck`
- `npm run lint`

## Exact Manual Test Steps
1. Run `npm run dev`.
2. Visit `http://localhost:3000/article/1` and verify the article UI matches the screenshot.
3. Visit `http://localhost:3000/` and verify the homepage layout wasn't broken by the layout refactor.
