# Mobile Responsiveness Fix

## Goal
Resolve the responsive layout squishing and overlapping issues on mobile viewports as shown in the screenshot (`Screenshot_20260723_125449.png`). Ensure that the Utility Bar, Navbar/Header, and page layouts are fully responsive, elegant, and professional across all screen sizes (small, medium, tablet, laptop, desktop).

## Skills Read
- Next.js App Router patterns
- Tailwind CSS responsive variants (`sm:`, `md:`, `lg:`)

## Existing Code Inspected
- `components/layout/header.tsx` (Utility bar is crowded and navbar buttons squish logo on mobile)
- `app/article/[id]/page.tsx` (standard details layout)
- `app/page.tsx` (homepage layout)

## Decisions or Assumptions
- **Utility Bar:** The top black utility bar contains desktop-centric features (browser extensions, theme toggles, edition selectors). Stacking these vertically on mobile takes up too much vertical screen space and causes text overlapping. We will completely hide this bar on mobile/tablet viewports (`hidden md:block`), matching standard UX practices for major publishers (NYT, BBC).
- **Navbar Layout Spacing:** On mobile screens, the Menu icon, Pixca Logo, and the two action buttons (Subscribe and Login) are crowded. We will apply responsive sizing:
  - Decrease Navbar padding on mobile (`px-4 py-3 sm:px-6 sm:py-4`).
  - Set responsive text size on the logo (`text-xl sm:text-2xl`).
  - Shrink the gap between the menu button and the logo (`gap-2 sm:gap-4`).
  - Make the action buttons responsive: smaller height, smaller font-size, and narrower padding on mobile, scaling up to standard size on desktop (`text-[10px] sm:text-xs h-8 sm:h-9 px-2.5 sm:px-4`).
- **All Pages Review:** Check that both `/` (homepage) and `/article/[id]` (details page) grids, newsletters, and related stories scale elegantly on all devices.

## Files Likely to Change
- `components/layout/header.tsx`

## Implementation Requirements
- **Utility Bar:** Add `hidden md:block` class to the utility bar wrapper div.
- **Navbar Responsive Updates:**
  - Wrap the inner container in responsive padding: `px-4 py-3 sm:px-6 sm:py-4`.
  - Scale Pixca Logo with `text-xl sm:text-2xl` and make gap `gap-2 sm:gap-4`.
  - Scale Subscribe Button: `text-[10px] sm:text-xs h-8 sm:h-9 px-2.5 sm:px-4`.
  - Scale Login Button: `text-[10px] sm:text-xs h-8 sm:h-9 px-2.5 sm:px-4`.

## Security Requirements
- N/A

## Acceptance Criteria
- Accessing any route on a mobile viewport (e.g., width <= 480px) displays a perfectly spaced navbar with no text overlaps, clipping, or spilling outside the bounds.
- The black utility bar is cleanly hidden on mobile/tablet and only appears on desktop size (`md` and up).
- No compilation or ESLint errors.

## Checks to Run
- `npm run typecheck`
- `npm run lint`

## Exact Manual Test Steps
1. Run `npm run dev`.
2. Open `http://localhost:3000` or `http://localhost:3000/article/1` in browser.
3. Turn on DevTools device emulation (e.g. iPhone SE / iPhone 12 Pro) and verify the header is fully balanced, spaced out, and there are no cramped or clipped elements.
4. Scale up to tablet, laptop, and desktop to ensure the top utility bar is restored beautifully on larger screens.
