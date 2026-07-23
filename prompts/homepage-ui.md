# Homepage UI Implementation

## Goal
Implement the Pixca homepage UI based on the reference design (`02-homepage.png`). Ensure all elements match the design perfectly, and replace "biasly" and any "Skew" references with "Pixca". Maintain a clean, professional, and responsive presentation while avoiding over-building.

## Skills Read
- Next.js App Router and rendering patterns (`node_modules/next/dist/docs/`)
- Tailwind CSS styling and responsiveness

## Existing Code Inspected
- `app/page.tsx` (redirects to `/design-system`, will be rewritten)
- `components/ui/news-card.tsx` (horizontal layout, needs extension to support vertical layout and source counts)
- `components/ui/button.tsx` (existing shadcn base button)
- `components/ui/chip.tsx` (existing category chips)
- `components/ui/bias-meter.tsx` (existing responsive bias meter)

## Decisions or Assumptions
- The homepage will replace the `/` page, and the redirect in `app/page.tsx` will be removed.
- `NewsCard` will be enhanced to support a `variant?: "horizontal" | "vertical"` prop.
- `NewsCard` will support showing sources count (`sourcesCount?: number`) instead of time metadata where needed.
- A fully responsive utility bar, header/navbar, category scroll bar, layout grid of vertical cards, and footer will be implemented.
- "biasly" logo and copyrights in the visual spec will be replaced with "Pixca" logo and "Pixca News" references.
- Mock news data will be populated for the 12 news stories depicted in `02-homepage.png` so the page feels complete, high-fidelity, and ready to be later connected to the Supabase backend database.

## Files Likely to Change
- `components/ui/news-card.tsx` (extend to support vertical variant and source count metadata)
- `app/page.tsx` (re-implement homepage instead of redirecting)

## Implementation Requirements
- **Utility Bar (Top-most Strip):** Black bar, white/grey text. Left side: "Browser Extension", "Theme: Light Dark Auto". Center: Date. Right side: "Set Location", "International Edition" dropdown.
- **Navbar/Header:** 
  - Logo on left: Pixca News (using the "Pixca" + small black "News" badge style from the design system).
  - Center nav links: Home (active), For You (with dynamic red dot indicator), Local, Blindspot.
  - Right buttons: Subscribe (solid dark button), Login (outline button).
- **Category Pills:** A scrollable row of Category chips (`World Cup +`, `IPL +`, `Social Media +`, `Business & Markets +`, etc.) with left and right arrow navigation selectors.
- **Top News Section:** Heading text "Top News". Responsive 3-column grid on desktop, 1 or 2 columns on mobile/tablet.
- **Grid Cards:** Render 12 vertical-style cards with images, categories, locations, bold titles, responsive bias meters, and footer source counts (e.g. "12 sources").
- **Footer:** 
  - Brand Logo: "Pixca News" with custom black "News" badge, descriptive text "Balanced news coverage powered by AI."
  - Column 1: Company (About, Careers, Press, Contact).
  - Column 2: Help (Help Center, Guides, Privacy Policy, Terms of Service).
  - Column 3: Connect (social media icon links to Twitter/X, LinkedIn, Instagram, YouTube).
  - Bottom row: "© 2026 Pixca News. All rights reserved."

## Visual & Aesthetic Expectations
- **Typography:** Primary font "Poppins" via globals.css with exact heading sizes.
- **Colors:** Light grey background `#F6F6F6` (or light secondary/surface) and card-white backgrounds (`#FFFFFF`) with thin borders `#E5E7EB`.
- **Layout/Spacing:** Proper margins, max-width container `1400px` with responsive padding `px-6` (gutter).
- **Responsiveness:** Ensure navbar collapses on mobile, grids fold gracefully, and content scales beautifully.

## Security Requirements
- N/A for pure frontend UI presentation.

## Acceptance Criteria
- Accessing `http://localhost:3000/` displays the complete, high-fidelity homepage.
- All references to "biasly" are replaced with "Pixca" or "Pixca News".
- Cards render vertically on a 3-column desktop grid.
- No TypeScript compiler errors or ESLint warnings.

## Checks to Run
- `npm run typecheck`
- `npm run lint`

## Exact Manual Test Steps
1. Run `npm run dev`.
2. Open `http://localhost:3000` in the browser.
3. Verify the layout: Utility Bar, Navbar with Pixca logo, Category Pills, "Top News" section, 3-column Grid, and the structured Footer.
4. Scale screen sizes to ensure fully responsive presentation.
