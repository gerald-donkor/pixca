# 20 — Header Interactive Navigation & Mobile Drawer

## Goal

Make the global header and utility bar fully interactive, animated, responsive, and accessible:
1. **Dynamic Client Date (`components/layout/dynamic-date.tsx`)**: Render client-side live formatted date (e.g., `Monday, August 24, 2026`) with hydration mismatch protection.
2. **Accessible Mobile Drawer (`components/layout/mobile-drawer.tsx`)**: Slide-out navigation drawer with GSAP spring animation (`xPercent: -100` to `0`), backdrop overlay, ESC key listener, and body scroll lock.
3. **Edition Selector Popover (`components/layout/edition-selector.tsx`)**: Accessible popover dropdown for selecting international editions (e.g., Global, US, UK, Europe) with persistent selection state.
4. **Location Selector Popover (`components/layout/location-selector.tsx`)**: Interactive popover dropdown for setting / detecting user location.
5. **Choreographed GSAP Entrance & Integration (`components/layout/header.tsx`)**: Wire all new subcomponents, animate header items on mount using `useGSAP()` (`y: -8, autoAlpha: 0, stagger: 0.04`), and respect `prefers-reduced-motion`.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Core GSAP tween and matchMedia patterns.
- `.agents/skills/gsap-react/SKILL.md` — `useGSAP()` hook scoping, React 19 lifecycle management, and automatic context cleanup.
- `.agents/skills/gsap-timeline/SKILL.md` — Choreographed sequential entrance timelines.
- `.agents/skills/gsap-performance/SKILL.md` — GPU compositor optimization (`autoAlpha`, `transform`, `will-change`).
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/layout/header.tsx` — Current header with hardcoded date string, static drawer button, static edition & location triggers.
- `components/ui/popover.tsx` — Base UI accessible popover primitives (`Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverClose`).
- `components/ui/button.tsx` — Button UI component.
- `components/layout/theme-provider.tsx` — Theme context and hook (`useTheme()`).
- `lib/gsap/index.ts` — Registered GSAP plugins (`useGSAP`, `ScrollTrigger`).
- `app/globals.css` — Semantic design tokens for light and dark modes.

---

## Decisions and assumptions

1. **Hydration-Safe Dynamic Date**: Use a two-pass render pattern (`mounted` state in `useEffect`) for `DynamicDate` so the server renders a neutral fallback (or empty placeholder) and the client hydrates with the user's localized date format without hydration mismatch errors.
2. **GSAP Drawer Lifecycle**: Animate the mobile drawer with `@gsap/react` `useGSAP()` or context-safe timeline. When opened, animate backdrop opacity (`0` -> `1`) and drawer panel (`xPercent: -100` -> `0`, ease `power3.out`). When closing, play reverse animation before unmounting/hiding.
3. **Focus & Scroll Management**: When the mobile drawer is open, lock body scroll (`document.body.style.overflow = 'hidden'`) and support closing via backdrop click, close icon, or `Escape` key.
4. **Accessible Popovers**: Use the existing `@/components/ui/popover` primitive for Edition and Location selectors, styled with PIXCA semantic theme tokens (`bg-card`, `border-border`, `text-text-primary`).
5. **Reduced Motion Accessibility**: Use `gsap.matchMedia()` inside `useGSAP()` so users with `prefers-reduced-motion: reduce` receive instant fade transitions (`opacity: 0` to `1`) without motion translation.

---

## Files likely to change

- `components/layout/dynamic-date.tsx` [NEW] — Client-only live formatted date with weekday, month, day, and year.
- `components/layout/mobile-drawer.tsx` [NEW] — Animated mobile navigation drawer with navigation links, theme toggle, and edition picker.
- `components/layout/edition-selector.tsx` [NEW] — Popover menu to choose international editions with checkmark indicator.
- `components/layout/location-selector.tsx` [NEW] — Popover to select or view location setting.
- `components/layout/header.tsx` [MODIFY] — Integrate GSAP entrance animation, dynamic date, mobile drawer, and popover selectors.

---

## Implementation requirements

### 1. `components/layout/dynamic-date.tsx`
- Must be a client component (`"use client"`).
- Uses `useState` and `useEffect` to safely mount on the client.
- Formats current date using `Intl.DateTimeFormat` with options `{ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }`.
- Renders with subtle opacity transition once mounted to avoid layout shift.

### 2. `components/layout/mobile-drawer.tsx`
- Must be a client component (`"use client"`).
- Accepts `isOpen: boolean` and `onClose: () => void`.
- Contains:
  - Semi-transparent backdrop (`bg-black/60 backdrop-blur-xs`).
  - Drawer panel fixed to left side (`w-[300px] max-w-[85vw] h-full bg-card border-r border-border p-6`).
  - Header with Pixca logo and Close button (`X` icon).
  - Navigation links: Home (`/`), For You (`/#for-you`), Saved (`/saved`), Blindspot (`/blindspot`), Design System (`/design-system`).
  - Section dividers with theme selector buttons (Light, Dark, System) and Edition selector.
  - Auth status / action buttons.
- Implements GSAP animation with `useGSAP()` targeting the drawer container and panel.
- Locks `body` scroll when `isOpen` is true and restores upon close/unmount.
- Listens for `keydown` (Escape key) to trigger `onClose`.

### 3. `components/layout/edition-selector.tsx`
- Must be a client component (`"use client"`).
- Uses `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`.
- Available editions:
  - `Global Edition` (default)
  - `US Edition`
  - `UK & Europe`
  - `Asia Pacific`
- Stores active edition in `useState` (synced with `localStorage` key `pixca_edition`).
- Displays a checkmark icon next to the active edition.
- Styled to seamlessly match the dark utility bar or light theme tokens.

### 4. `components/layout/location-selector.tsx`
- Must be a client component (`"use client"`).
- Uses `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`.
- Allows selecting predefined regions or detecting location:
  - `Automatic (IP)`
  - `New York, US`
  - `London, UK`
  - `Toronto, CA`
  - `Berlin, DE`
- Stores active selection in `useState` (synced with `localStorage` key `pixca_location`).

### 5. `components/layout/header.tsx`
- Integrates `DynamicDate`, `MobileDrawer`, `EditionSelector`, `LocationSelector`.
- Uses `useGSAP()` scoped to `headerRef` to animate entrance of navigation elements:
  - Selectors: `.header-anim-item`
  - Tween: `gsap.from(".header-anim-item", { y: -8, autoAlpha: 0, stagger: 0.04, duration: 0.45, ease: "power2.out" })`
  - Wrapped in `gsap.matchMedia()` to skip translation when `prefers-reduced-motion: reduce` is active.
- Mobile menu button (`<button onClick={() => setDrawerOpen(true)}>`) opens `MobileDrawer`.

---

## Security requirements

- Client components must not expose private API keys or admin secrets.
- Sanitize and safely handle any user-selected edition/location inputs.
- Safe navigation routing with Next.js `Link`.

---

## Acceptance criteria

1. **Dynamic Date**: The utility bar displays the accurate live formatted date on the client without React hydration warning or error in the console.
2. **Mobile Drawer**:
   - Clicking the hamburger button on mobile or desktop smoothly opens the slide-out drawer.
   - Clicking the backdrop, close button, or pressing Escape smoothly closes the drawer.
   - Background page scrolling is disabled while drawer is open.
   - All navigation links in the drawer function correctly.
3. **Edition & Location Selectors**:
   - Clicking "International Edition" or "Set Location" opens a clean, theme-aware popover.
   - Selecting an option updates the display label and persists the choice in `localStorage`.
   - Clicking outside closes the popover properly.
4. **GSAP Animations**:
   - Header entrance animation runs smoothly at 60fps without layout shifts.
   - Zero React warnings or memory leaks on hot reloads and page transitions.
   - Animations respect `prefers-reduced-motion`.
5. **Type & Lint Checks**:
   - `npm run typecheck` passes with zero errors.
   - `npm run lint` passes with zero errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
```

---

## Exact manual test steps expected after implementation

1. Start dev server: `npm run dev`.
2. Open `http://localhost:3000` in the browser.
3. Verify the date in the top utility bar matches today's date and inspect console to ensure 0 hydration warnings.
4. Click on "International Edition" in the utility bar:
   - Verify popover opens.
   - Select "US Edition" -> verify the label updates to "US Edition" and persists upon page refresh.
5. Click on "Set Location" in the utility bar:
   - Verify popover opens and lets you select a location.
6. Click the hamburger menu icon (left of the Pixca logo):
   - Verify the mobile drawer smoothly slides in from the left with a backdrop blur.
   - Test clicking backdrop or pressing `Escape` -> verify smooth exit animation.
   - Open drawer again and test clicking navigation links.
7. Test switching themes (Light/Dark/Auto) from both the utility bar and the mobile drawer.
8. Run `npm run typecheck` and `npm run lint`.
