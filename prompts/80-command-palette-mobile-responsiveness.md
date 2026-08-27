# Goal

Fix the Command Palette and Global Search modal mobile responsiveness so that the search input placeholder is not clipped on narrow mobile viewports, and the footer helper shortcuts/branding text does not wrap or crumble together on small screens (as identified in user screenshot `/home/dg/Pictures/screenshot-2026-08-27_21-16-32.png`).

# Skills Read

- `.agents/skills/gsap-core/SKILL.md` - Core GSAP tween behavior, autoAlpha, and matchMedia reduced-motion handling.
- `.agents/skills/gsap-react/SKILL.md` - useGSAP() scoping and cleanup patterns in Next.js/React client components.
- `.agents/skills/gsap-performance/SKILL.md` - Animation compositor performance rules.
- `.agents/skills/requesting-code-review/SKILL.md` - Required code review workflow before completing tasks.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` - Next.js Tailwind and responsive styling.

# Existing Code Inspected

- `AGENTS.md`
- `components/ui/command-palette.tsx`
- `hooks/use-command-palette.ts`
- `components/layout/header.tsx`
- `/home/dg/Pictures/screenshot-2026-08-27_21-16-32.png`

# Visual Interpretation & Responsive Behavior

- In the user's screenshot (`/home/dg/Pictures/screenshot-2026-08-27_21-16-32.png`):
  1. **Search Input Placeholder (Top)**: The placeholder text `"Search news, topics, publishers, or perspectives..."` is ~52 characters long. In mobile viewports (~320px–390px), with the modal padding and search icon, it gets clipped as `"Search news, topics, publishers, o..."`.
  2. **Footer Shortcuts & Branding (Bottom)**: On small mobile screens, the footer displays `↑ ↓ Navigate` and `↵ Select` side-by-side with `Pixca Intelligence Search`. In a narrow flex container (~296px width), the right-hand text wraps onto two lines (`Pixca Intelligence\nSearch`) and crumbles right into the keyboard shortcut indicators.
- **Mobile Responsive Target**:
  - The search input placeholder should be responsive or concise (e.g. `"Search news, topics, or sources..."` on narrow screens or concise `"Search news, topics, perspectives..."` with `placeholder:truncate` and `min-w-0`), remaining fully legible and unclipped from `320px` upwards.
  - The footer helper bar should adapt cleanly on mobile touch screens:
    - On mobile (`< sm` / touch screens), hide the physical keyboard shortcuts (`↑ ↓ Navigate`, `↵ Select`) or provide touch guidance (`Tap item to open`), and render the branding (`Pixca Intelligence Search`) cleanly on a single line with `whitespace-nowrap shrink-0` and proper spacing.
    - On desktop (`sm+`), retain the full keyboard navigation helpers (`↑ ↓ Navigate`, `↵ Select`) alongside `Pixca Intelligence Search`.

# Decisions And Assumptions

- Treat this as a mobile responsiveness and typography polish pass for `CommandPalette` (`components/ui/command-palette.tsx`).
- Do not alter search API integration (`/api/search`), debouncing, keyboard navigation logic, GSAP entrance/exit transitions, recent searches storage, or routing behavior.
- Prefer Tailwind responsive utility classes (`sm:`, `hidden`, `truncate`, `min-w-0`, `whitespace-nowrap`).
- Keep all existing features intact: quick navigation links, editorial perspective filters, publisher filters, matching stories, recent searches history, and keyboard shortcuts on desktop.

# Files Likely To Change

- `[MODIFY] components/ui/command-palette.tsx`

# Implementation Requirements

1. **Responsive Search Placeholder & Input Header (`components/ui/command-palette.tsx`)**
   - Provide a responsive placeholder that avoids clipping on mobile (e.g., `"Search news, topics, perspectives..."` or responsive placeholder adapting to screen width).
   - Ensure the input element has `min-w-0 flex-1 placeholder:truncate` and proper responsive text sizing (`text-sm sm:text-base`).
   - Ensure search icon and clear button have `shrink-0` and do not constrain text width unnecessarily.

2. **Responsive Footer Helper Bar (`components/ui/command-palette.tsx`)**
   - Update the footer container with `px-3 sm:px-4 py-2 min-w-0 flex items-center justify-between`.
   - Hide keyboard navigation hints (`↑ ↓ Navigate`, `↵ Select`) on small mobile screens (`hidden sm:flex items-center gap-3 shrink-0`) or display compact touch guidance on mobile (`flex sm:hidden items-center gap-1 text-[10px] text-zinc-400`).
   - Ensure the branding text `Pixca Intelligence Search` has `whitespace-nowrap shrink-0 text-[10px] text-zinc-500` so it never wraps or crumbles into adjacent text on any viewport size (from `320px` to `4K`).

3. **Results Item Containment**
   - Verify that quick navigation items, perspective filter items, sources, and story items maintain `min-w-0`, `truncate`, and `line-clamp` rules so the modal body remains stable at `320px`.

# Security Requirements

- No API changes.
- No auth or billing changes.
- No environment variables exposed.
- Render all user-derived text safely without `dangerouslySetInnerHTML`.

# Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `768px`, and `1440px`, the Command Palette search placeholder is clean, legible, and unclipped.
- At narrow mobile viewports, the footer text `Pixca Intelligence Search` sits cleanly on a single line without wrapping, overlap, or crumbling into shortcut badges.
- Desktop and tablet screens continue to show full keyboard shortcut hints (`↑ ↓ Navigate`, `↵ Select`) and `ESC` badge.
- Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape) and click/touch selection continue to function seamlessly.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Manual Test Steps

1. Start the dev server with `npm run dev`.
2. Open `http://localhost:3000`.
3. Open the Command Palette using `Cmd+K` / `Ctrl+K` or by clicking the Search button in the header / mobile navigation drawer.
4. Set browser DevTools to `320px` and `375px` widths.
5. Verify the search placeholder fits neatly without clipping.
6. Verify the footer at the bottom renders cleanly on a single line without text crumbling.
7. Switch to desktop width (`1024px`+) and verify keyboard shortcuts (`↑ ↓ Navigate`, `↵ Select`, `ESC`) remain visible and functional.
