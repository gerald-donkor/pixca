# UI Design System Implementation

## Goal
Implement the app design system based on the provided reference image (`01-ui-design-system.png`), which includes typography, colors, spacing, and specific UI elements (Buttons, Chips, Bias Meter, and News Card). Integrate `shadcn/ui` as specified in the project's tech stack.

## Skills Read
- `node_modules/next/dist/docs/` (implied for App Router and Tailwind patterns)
- `Tailwind CSS` docs
- `shadcn/ui` docs

## Existing Code Inspected
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `package.json`

## Decisions or Assumptions
- The tech stack in `AGENTS.md` strictly requires `Tailwind CSS` and `shadcn/ui`.
- `shadcn/ui` will need to be initialized if not present, and the default Button component should be installed to act as a base, then customized to match the "biasly" brand.
- `lucide-react` will be installed (it is the standard icon library for `shadcn/ui` and matches the design).
- The font "Poppins" will be imported via `next/font/google` and configured as the primary sans font.
- Specific custom variables for semantic biases (`bias-left`, `bias-center`, `bias-right`) and core branding (`text-primary`, `bg-primary`, etc.) will be added to the CSS theme variables.
- We will build the showcase page on `app/page.tsx` to visually verify the design system against the reference.

## Files Likely to Change
- `package.json` / `package-lock.json` (installing dependencies)
- `components.json` (shadcn/ui configuration)
- `app/globals.css` (adding CSS variables and utility classes)
- `app/layout.tsx` (font configuration)
- `app/page.tsx` (design system showcase)
- `components/ui/button.tsx` (shadcn/ui component)
- `components/ui/chip.tsx` (custom)
- `components/ui/bias-meter.tsx` (custom)
- `components/ui/news-card.tsx` (custom)
- `tailwind.config.ts` or equivalent postcss config (if modified by shadcn)

## Implementation Requirements
- **Colors:** Match HEX values exactly (#0D0D0F for Text Primary, #B42318 for Left Bias, etc.).
- **Typography:** Poppins font family. Exact font sizes, weights, and line-heights for H1-H4, Body Large/Medium/Small, and Caption.
- **Spacing/Grid:** Base unit 4px. Container max-width 1280px with 24px gutters/margins.
- **Shadows & Borders:** Implement Small, Medium, Large shadows and border radii precisely.
- **Components:**
  - `Button`: Primary, Secondary, Outline, Text variants with Hover and Disabled states.
  - `Chip`: Pill shape with label and '+' icon.
  - `BiasMeter`: Three-segment progress bar with percentage labels matching the visual spec.
  - `NewsCard`: Responsive layout mimicking the "Trump Sends Iran Revised Peace Proposal..." example.
- **Responsiveness:** Ensure UI elements adapt cleanly to smaller screens.

## Security Requirements
- N/A for pure UI implementation.

## Acceptance Criteria
- `npm run dev` displays a design system showcase page matching `01-ui-design-system.png` visually.
- Typography, colors, and layout scale properly.
- All custom components are reusable and adhere to the project's Tailwind config.

## Checks to Run
- `npm run typecheck`
- `npm run lint`

## Exact Manual Test Steps
1. Run `npm run dev`.
2. Open `http://localhost:3000` in the browser.
3. Visually compare the rendered typography, buttons, chip, bias meter, and news card against `01-ui-design-system.png` to confirm spacing, colors, and font weights are exact.
