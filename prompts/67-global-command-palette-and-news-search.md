# 67 — Global Command Palette & Fast News Search

## Goal

Implement an accessible, high-performance **Global Command Palette & Fast News Search Dialog** (`⌘K` / `Ctrl+K` / `/` shortcut) across PIXCA:
1. **Global Keyboard & Interaction Shortcuts**: Support `⌘K` (macOS), `Ctrl+K` (Windows/Linux), and `/` (when not typing in an input) to instantly open the search palette from anywhere in the app, plus dedicated search buttons in the header and mobile drawer.
2. **Instant Multi-Category Search & Discovery**: Real-time debounced search across analyzed news stories, publisher sources, political perspective filters (Left, Center, Right, Blindspot), and top application navigation destinations.
3. **Dedicated Search API Endpoint**: Create `GET /api/search?q=...` returning matched articles with their framing analysis (bias label, percentages, sentiment) and publisher metadata.
4. **Recent Search History**: Persist recent search queries in `localStorage` so users can quickly revisit previous topics or clear history with one click.
5. **Keyboard Navigation & ARIA Accessibility**: Support full keyboard navigation (`↑`/`↓` selection, `Enter` to navigate, `Escape` to close), focus trapping, and ARIA combobox attributes.
6. **GSAP Micro-Interactions & Fluid Animations**: Incorporate 60fps dialog entrance (`scale: 0.96` to `1`, `y: -10` to `0`, `autoAlpha: 0` to `1`) and backdrop fade using scoped `@gsap/react` `useGSAP()` and `gsap.matchMedia()` adhering to `prefers-reduced-motion`.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js Route Handlers, Client Components, and navigation.
- `.agents/skills/gsap-core/SKILL.md` — Tweens, easings, `matchMedia`, and defaults.
- `.agents/skills/gsap-react/SKILL.md` — Scoped `@gsap/react` `useGSAP()` hook for React 19 safety and cleanup.
- `.agents/skills/gsap-timeline/SKILL.md` — Sequenced dialog and backdrop transitions.
- `.agents/skills/gsap-performance/SKILL.md` — Compositor transforms (`autoAlpha`, `scale`, `x/y`), layout-shift elimination, and reduced motion.
- `.agents/skills/supabase/SKILL.md` — Query patterns, PostgREST filters, and error handling.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `components/layout/header.tsx` — Desktop and mobile header navigation.
- `components/layout/mobile-drawer.tsx` — Mobile navigation drawer.
- `components/ui/dialog.tsx` — Base UI dialog primitive wrapper.
- `lib/supabase/queries/articles.ts` — Article queries and display types.
- `lib/supabase/queries/sources.ts` — Source queries.
- `hooks/use-bookmarks.ts` — Reference for localStorage synchronization with `useSyncExternalStore`.

---

## Decisions and assumptions

1. **Search API (`app/api/search/route.ts`)**:
   - `GET /api/search?q=...&limit=8`:
     - Validate and sanitize the query parameter `q` (min 1 char, max 100 chars, trimmed).
     - Query Supabase for articles matching `title.ilike.%q%` with joined source and analysis, ordered by published date descending.
     - Also query active sources matching `name.ilike.%q%`.
     - Return `{ articles: [...], sources: [...] }` with safe 200 response and defensive try/catch.
2. **Keyboard Shortcut & History Hook (`hooks/use-command-palette.ts`)**:
   - Manage `isOpen` state, `toggle()`, `open()`, `close()`.
   - Listen to `keydown` globally for `(metaKey || ctrlKey) && e.key === 'k'` and `/` (when `!['INPUT', 'TEXTAREA'].includes(target.tagName)`).
   - Manage `recentSearches` array in `localStorage` with `addRecentSearch(query)` and `clearRecentSearches()`.
3. **Command Palette Modal (`components/ui/command-palette.tsx`)**:
   - Dialog overlay with dark/light mode styling and backdrop blur.
   - Search input with search icon, clear button, and `Esc` shortcut badge.
   - Dynamic Sections:
     - **Quick Navigation**: Home, For You, Blindspot, Saved Articles, Pricing, About.
     - **Perspective Filters**: Filter by Left Framing, Center Ground, Right Framing.
     - **Publishers**: Matched news sources with logos/names that link to `/?source=Source+Name`.
     - **Articles**: Matching stories with thumbnail, source pill, published date, and bias badge.
     - **Recent Searches**: Rendered as quick filter chips when query is empty.
   - Keyboard Arrow Navigation (`ArrowDown` / `ArrowUp` / `Enter`) with automatic active index highlighting.
4. **GSAP Micro-Interactions**:
   - Use `useGSAP()` scoped to `modalRef` to choreograph backdrop opacity (`0 -> 1`) and modal scale/translation (`y: -12 -> 0`, `scale: 0.96 -> 1`, `autoAlpha: 0 -> 1`).
   - Revert on close or unmount.
   - Handle `prefers-reduced-motion: reduce` with instant cross-fade.
5. **Header & Drawer Integration**:
   - Add a search button in `components/layout/header.tsx` (with `⌘K` badge on desktop and search icon on mobile) that triggers the command palette.
   - Add a "Quick Search" item in `components/layout/mobile-drawer.tsx`.

---

## Files likely to change

- `app/api/search/route.ts` [NEW] — Search API route for articles and sources.
- `hooks/use-command-palette.ts` [NEW] — Global shortcut listener and search history hook.
- `components/ui/command-palette.tsx` [NEW] — Accessible Command Palette modal component with GSAP animations.
- `components/layout/header.tsx` [MODIFY] — Add search button trigger and render `CommandPalette`.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Add quick search action to mobile drawer.

---

## Implementation requirements

1. **Create `app/api/search/route.ts`**:
   - Handle `GET` requests with `q` search parameter.
   - If `q` is empty or shorter than 1 character, return `{ articles: [], sources: [] }`.
   - Fetch up to 8 matching articles with `analysis` and `source` using `getSupabaseAdminClient()`.
   - Fetch matching active sources.
   - Return clean JSON payload.
2. **Create `hooks/use-command-palette.ts`**:
   - Provide `useCommandPalette()` hook tracking open state, toggle/open/close functions, and recent searches.
   - Register global keydown handlers for `⌘K`, `Ctrl+K`, `/`, and `Escape`.
   - Prevent default behavior when triggering shortcuts.
3. **Create `components/ui/command-palette.tsx`**:
   - Implement accessible modal dialog using `@base-ui/react/dialog` or custom portal with focus trapping.
   - Debounce search input queries (200ms).
   - Render categorized results with active keyboard highlight index.
   - Animate open/close with GSAP `useGSAP()` and `gsap.matchMedia()`.
   - Deep link on selection to `/article/[id]`, `/?source=...`, `/?bias=...`, or navigation paths.
4. **Update `components/layout/header.tsx`**:
   - Add search button trigger in the header navbar.
   - Mount `<CommandPalette />`.
5. **Update `components/layout/mobile-drawer.tsx`**:
   - Add "Search News & Sources" action button in the drawer list.

---

## Security requirements

- Public read route (`GET /api/search`), no admin secret required.
- Query inputs sanitized and capped at 100 characters.
- Supabase queries parameterized via supabase-js client to prevent SQL injection.

---

## Acceptance criteria

- [ ] Pressing `⌘K` (macOS) or `Ctrl+K` (Windows/Linux) opens the Command Palette.
- [ ] Pressing `/` outside of text fields opens the Command Palette.
- [ ] Clicking the Search button in the header or mobile drawer opens the Command Palette.
- [ ] Typing in the search input queries `/api/search` and displays matching articles and sources.
- [ ] Quick navigation items and perspective filters allow instant navigation.
- [ ] Keyboard arrows (`↑` / `↓`) navigate between items, and `Enter` selects the active item.
- [ ] Recent searches are stored in `localStorage` and can be clicked or cleared.
- [ ] Pressing `Escape` or clicking the backdrop closes the modal.
- [ ] GSAP entrance and exit animations run at 60fps with reduced-motion support.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000`.
2. Press `⌘K` or `Ctrl+K` on desktop and verify the Command Palette smoothly opens.
3. Type a keyword (e.g., "economy", "election", "tech", or "Reuters") and verify results appear.
4. Use arrow keys (`↑` / `↓`) to highlight a result and press `Enter` to navigate.
5. Open the Command Palette again, verify the recent search chip appears, and click it.
6. Open mobile drawer and click "Quick Search" to confirm mobile drawer integration works.
7. Test with `prefers-reduced-motion: reduce` in browser devtools to verify accessibility compliance.
