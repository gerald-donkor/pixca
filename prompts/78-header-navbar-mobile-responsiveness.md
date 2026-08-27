# Goal

Make the Pixca navigation header and utility bar fully responsive across all viewport sizes (mobile 320px–556px, tablet 768px–1024px, and desktop 1280px+). Ensure no horizontal overflow, no clipping or overlapping of navigation links, search triggers, subscription CTAs, user tier badges, or utility selectors, while maintaining smooth GSAP animations and accessible touch targets.

# Skills Read

- `.agents/skills/gsap-core`
- `.agents/skills/gsap-react`
- Before finishing implementation, have `requesting-code-review` available for the code review workflow.

# Existing Code Inspected

- `AGENTS.md`
- `components/layout/header.tsx`
- `components/layout/mobile-drawer.tsx`
- `components/layout/dynamic-date.tsx`
- `components/layout/edition-selector.tsx`
- `components/layout/location-selector.tsx`
- `components/ui/command-palette.tsx`
- `components/ui/subscribe-modal.tsx`
- `hooks/use-command-palette.ts`
- `hooks/use-subscription.ts`
- `hooks/use-bookmarks.ts`

# Visual Interpretation & Responsive Behavior

- **Mobile Viewports (320px – 640px)**:
  - Left: Hamburger menu toggle + compact Pixca News logo (`text-lg sm:text-2xl`).
  - Center: Main desktop links hidden (`hidden md:flex`), fully accessible via the animated slide-out `MobileDrawer`.
  - Right:
    - Global search trigger icon button (`sm:hidden`).
    - Subscribe button responsive: on compact screens (<480px or <sm), hide the standalone header subscribe button (`hidden sm:inline-flex` or `hidden xs:inline-flex`) since Subscribe is prominently placed at the bottom of the `MobileDrawer` and in page content, or display a compact variant to avoid squeezing user profile and search controls.
    - Auth section: Sign In button (`text-xs h-8 px-2.5 sm:px-4`) or User Profile (avatar + responsive tier badge that gracefully hides or shrinks on <480px).
    - Header height remains fixed and stable (`py-2.5 sm:py-4`) with zero element wrapping or overflow.
- **Tablet / Small Laptop Viewports (768px – 1024px)**:
  - Utility top bar: Responsive layout where Theme toggles, dynamic date (or compact date), and Location/Edition selectors fit without wrapping or truncation (`overflow-x-hidden`, adaptive gaps).
  - Main navbar:
    - Nav links use responsive scaling (`gap-3 lg:gap-5 xl:gap-6`, `text-xs lg:text-sm`).
    - Search button uses compact icon + ⌘K badge (`sm:flex lg:hidden`), expanding to full `"Search news..."` text at `lg` (`1024px+`).
    - Subscribe and Auth controls fit comfortably without crowding center navigation links.
- **Desktop (1280px+)**:
  - Full utility bar with date and dropdown selectors.
  - Generous spacing for all 5 nav links (Home, For You, Blindspot, Saved, Pricing).
  - Full-width search bar trigger with shortcut badge.

# Decisions And Assumptions

- Preserve all existing routes, navigation destinations, command palette triggers, modal dialogs, and GSAP choreographed entrance animations.
- Use mobile-first Tailwind responsive utilities without introducing breaking changes or external dependencies.
- Keep the `MobileDrawer` as the primary navigation hub on mobile and ensure its drawer panel is fully responsive on narrow screens (`w-[280px] sm:w-[320px] max-w-[85vw]`).
- Do not mutate backend data, Clerk auth, or Supabase pipeline state.

# Files Likely To Change

- `[MODIFY] components/layout/header.tsx`
- `[MODIFY] components/layout/mobile-drawer.tsx`

# Implementation Requirements

1. **Navbar Layout & Spacing (`components/layout/header.tsx`)**:
   - Container padding: `px-3 sm:px-6 py-2.5 sm:py-3.5` with `min-w-0 max-w-full`.
   - Left branding: Logo text scale `text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight shrink-0`.
   - Center navigation:
     - Adaptive gap: `gap-2.5 md:gap-4 lg:gap-6 text-xs lg:text-sm`.
     - Badges on nav links (e.g. Saved count, Pro badge, For You dot) stay aligned without layout shift.
   - Right action cluster:
     - Flex container with `flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0`.
     - Search button: compact icon on mobile (`p-2 sm:hidden`), icon+shortcut on tablet (`hidden sm:flex lg:hidden`), and expanded search trigger on desktop (`hidden lg:flex`).
     - Subscribe button: `hidden sm:inline-flex` (or `hidden xs:inline-flex`) to prevent header clutter on viewports <480px/640px where Mobile Drawer and page CTAs already provide subscription access.
     - Auth controls:
       - Signed-out: Responsive Sign In button (`h-8 sm:h-9 px-2.5 sm:px-4 text-xs font-bold`).
       - Signed-in: UserButton + Tier Badge (`hidden xs:inline-flex` or compact font size on mobile).
2. **Utility Bar Responsiveness (`components/layout/header.tsx`)**:
   - Wrap containers in `min-w-0 max-w-full overflow-x-hidden`.
   - Dynamic Date: `hidden lg:block` or `truncate` so it doesn't cause overflow on medium tablet viewports (768px–1024px).
   - Selectors: `gap-2 sm:gap-4` with compact triggers.
3. **Mobile Drawer Polish (`components/layout/mobile-drawer.tsx`)**:
   - Ensure panel width scales down safely on ultra-narrow viewports (`w-[280px] sm:w-[320px] max-w-[85vw]`).
   - Maintain full touch target accessibility (minimum 44px height for interactive items).
   - Keep theme selector, navigation items, billing link, and subscribe CTA aligned and visible.

# Security Requirements

- No changes to Clerk authentication rules, middleware, or secrets.
- External links retain `target="_blank"` and `rel="noopener noreferrer"`.
- No sensitive keys or tokens exposed.

# Acceptance Criteria

- At all mobile widths (`320px`, `360px`, `390px`, `480px`, `556px`), the header remains a single row with no wrapping, clipping, or horizontal overflow.
- At tablet widths (`768px` to `1024px`), navigation links and right action buttons do not collide or wrap onto a second line.
- At desktop widths (`1280px`+), full navigation and expanded search input remain intact.
- GSAP entrance animation remains smooth with `prefers-reduced-motion` compliance.
- Mobile Drawer opens and closes smoothly with ESC key and backdrop click support.
- All checks pass (`npm run typecheck`, `npm run lint`, `npm run build`).

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Manual Test Steps

1. Start dev server: `npm run dev`.
2. Open `http://localhost:3000` in browser.
3. In DevTools, test responsive widths:
   - `320px` (iPhone SE ultra-narrow)
   - `375px` / `390px` (standard mobile)
   - `556px` (large mobile)
   - `768px` / `820px` (tablet portrait)
   - `1024px` (tablet landscape / small laptop)
   - `1440px` (standard desktop)
4. Confirm navbar does not wrap, items do not overlap, and no horizontal scrollbar appears.
5. On mobile, tap the menu button and verify the Mobile Drawer opens cleanly with all links, theme buttons, and subscribe CTA visible.
