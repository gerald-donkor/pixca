# Goal

Harden the `/logs` System Status & Pipeline Logs dashboard for mobile responsiveness from `320px` through tablet and desktop widths. The route must have no document-level horizontal overflow while the status header, health metrics, filter controls, log feed, empty state, refresh controls, footer summary, and JSON inspector remain legible, tappable, and fully functional without changing health/log fetching, polling, filtering, animation, or dialog behavior.

# Skills Read

- `.agents/skills/gsap-core/SKILL.md` — preserve `gsap.matchMedia()` reduced-motion handling and transform/`autoAlpha` animation semantics.
- `.agents/skills/gsap-react/SKILL.md` — retain the scoped `useGSAP()` lifecycle and cleanup for the client logs viewer.
- `.agents/skills/gsap-performance/SKILL.md` — keep log-list motion compositor-friendly and avoid layout-heavy animation changes.
- `.agents/skills/requesting-code-review/SKILL.md` — prepare the required reviewer-subagent workflow before completion.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — use the existing App Router Tailwind utility approach; avoid route-specific global CSS changes.

# Existing Code Inspected

- `AGENTS.md`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/79-homepage-feed-mobile-responsiveness.md`
- `prompts/80-command-palette-mobile-responsiveness.md`
- `prompts/81-pricing-page-mobile-responsiveness.md`
- `prompts/82-for-you-page-mobile-responsiveness.md`
- `prompts/83-blindspot-page-mobile-responsiveness.md`
- `prompts/84-saved-library-mobile-responsiveness.md`
- `app/logs/page.tsx`
- `components/ui/logs-viewer.tsx`
- `components/ui/dialog.tsx`

# Visual Interpretation And Responsive Behavior

- The logs route is a compact operational console: an editorial status header, four high-signal health metric cards, a control toolbar, and a dense but readable time/level/message/context event stream.
- At small widths, the `System Status & Logs` heading and Live Feed badge, long health error values, latency status, four filter buttons, search input, auto-refresh toggle, manual refresh action, log timestamps/messages/context actions, footer timestamp, and JSON inspector are the main overflow risks.
- Mobile should retain an intentional card-based console layout: compact outer padding; a stacked status header; a one-column health grid; filter controls that are either safely wrapping or intentionally locally scrollable; and log rows that expose their metadata without a document-wide horizontal scrollbar. Desktop retains its existing four-card grid and tabular log-column hierarchy.

# Decisions And Assumptions

- This is a responsive-hardening pass, not a pipeline dashboard redesign or API/data-flow change.
- Preserve initial server-side data loading, public read endpoints, manual refresh behavior, 10-second auto-refresh behavior, search and severity filtering, log-context selection, clipboard copy, toast feedback, date formatting, and GSAP entrance behavior.
- Prefer narrow Tailwind containment adjustments (`min-w-0`, `max-w-full`, `w-full`, responsive padding/gaps, wrap-safe text, and bounded local `overflow-x-auto`) over global overflow suppression, global CSS hacks, or new abstractions.
- Do not shorten, hide, or remove operational data merely to make it fit. Use wrapping, truncation only with a complete accessible title/label where appropriate, or a stack on narrow viewports.
- Decorative card clipping remains local to the owning component. Do not apply broad `overflow-x-hidden` to conceal a layout defect or interfere with the log feed's intentional vertical scroll.
- Do not modify Supabase tables/queries, API routes, authentication, scraping, analysis, scheduler, or environment variables.

# Files Likely To Change

- `[MODIFY] app/logs/page.tsx`
- `[MODIFY] components/ui/logs-viewer.tsx`
- `[MODIFY] components/ui/dialog.tsx` only if the shared dialog primitive is the demonstrated root cause of JSON inspector overflow; keep any change non-regressive for all callers

# Implementation Requirements

1. **Route shell and status header (`app/logs/page.tsx`)**
   - Make the outer route shell and `main` mobile-first and width-safe using `w-full min-w-0 max-w-full`, compact padding such as `px-4 sm:px-6`, and no document-level horizontal overflow.
   - At `320px`, allow the terminal icon, title, and Live Feed badge to wrap or stack cleanly. The title must remain readable, the badge must retain its icon/text, and the descriptive copy must not escape the viewport.
   - Preserve server-side `connection()`, parallel initial health/log reads, error fallbacks, metadata, visual language, and desktop hierarchy.

2. **Health metrics (`components/ui/logs-viewer.tsx`)**
   - Add width containment to the viewer, metric grid, cards, labels, values, status badges, and health/error descriptions.
   - Preserve the existing one-column mobile, two-column small-screen, and four-column large-screen grid. Long database error messages or status values must wrap/break safely without widening the card or hiding the signal.
   - Keep status dots, status labels, latency figures, latency category badge, and active-source values readable and distinct at every target width.

3. **Log toolbar and empty state**
   - Keep all severity filters (`All Logs`, `Info`, `Warn`, `Error`) reachable at `320px`, with distinct active/focus states and their count badges. A bounded, touch-scrollable local filter rail is acceptable if wrapping harms usability; it must never widen the document.
   - Make search full-width on the smallest screens, retaining the search icon, clear action, visible focus treatment, and accessible name. It may use a compact placeholder only if needed without changing the accessible purpose.
   - Stack or wrap the search, auto-refresh toggle, and manual Refresh action with usable touch targets at narrow widths; retain the current inline desktop arrangement.
   - Keep the no-results illustration and search-derived text contained, including long quoted queries, and preserve filtering behavior.

4. **Log event stream and footer**
   - Preserve the existing desktop table header and `md` 12-column layout. On smaller viewports, keep each log as a deliberate stacked event card/row: timestamp/date, level badge, message, and context action/no-context label must be visible, ordered clearly, and contained.
   - Ensure unbroken IDs, long messages, serialized-context search matches, dates, and large context-key counts cannot force the feed wider. Use `min-w-0`, `break-words`/`break-all` only where appropriate for technical tokens, and no clipping of selectable message text.
   - Keep the feed's vertical `max-h` and `overflow-y-auto` behavior; do not make the page itself horizontally scrollable.
   - Allow the footer event count and last-refreshed timestamp to wrap/stack safely while retaining both values.
   - Preserve the scoped `useGSAP({ scope: containerRef })` entry animation, `gsap.matchMedia()` reduced-motion branches, filters as animation dependencies, and compositor-friendly `y`/`autoAlpha` animation only. Do not animate width, height, margins, padding, `top`, or `left`.

5. **JSON inspector dialog only if necessary**
   - Exercise a long-message log with a deeply nested or long-string context at `320px`. If the existing dialog fits, do not modify the shared primitive.
   - If it overflows, make the smallest non-regressive adjustment in `LogsViewer` or, only if proven necessary, `components/ui/dialog.tsx`: viewport-bounded width and height, responsive padding, wrap-safe header metadata/footer actions, and an internally scrollable JSON panel.
   - Preserve Base UI focus management, backdrop/Escape dismissal, close button, Copy JSON Payload behavior, clipboard/toast feedback, selectable JSON, desktop layout, and visible focus indicators.

6. **Accessibility and scope**
   - Preserve semantic buttons/inputs, visible `focus-visible` states, keyboard operation for filters, refresh controls, and dialog actions, and existing ARIA labels/titles.
   - Do not add dependencies, unsafe HTML rendering, global CSS hacks, or unrelated refactors.

# Security Requirements

- No changes to API authorization, Supabase access, logging data, health-check implementation, polling endpoint behavior, scheduler, AI, or environment variables.
- Continue rendering every log field and JSON payload as React text within the existing `<pre>`; do not introduce `dangerouslySetInnerHTML` or execute/interpret context values.
- Preserve existing clipboard behavior and do not transmit selected log context anywhere beyond the explicit user-initiated copy action.

# Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, `/logs` has no document-level horizontal scrollbar.
- The header, Live Feed badge, all four health cards, severity filters, search, auto-refresh toggle, Refresh action, empty state, event metadata/level/message/context controls, footer summary, and JSON inspector remain visible, legible, and usable.
- Any horizontal scrolling is intentionally local to a bounded toolbar rail and never moves the document.
- Health/log loading fallbacks, search, severity filtering, auto-refresh, manual refresh, selected context display, copying, toast feedback, and Escape/backdrop close behavior retain their existing behavior.
- Existing GSAP animations remain scoped, performant, and reduced-motion-safe.
- Desktop retains the existing four-column metric grid, inline desktop toolbar, table header, and 12-column event-row hierarchy.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with no errors.

# Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

# Exact Manual Test Steps Expected After Implementation

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/logs` and test at `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px` in browser DevTools.
3. Confirm the status header, Live Feed badge, long health error/status values, and all four metric cards fit at each viewport with no document-level horizontal scrolling.
4. At mobile width, activate every severity filter; verify each count stays visible, the active state changes, matching entries update, and only a deliberately local filter rail scrolls if one is used.
5. Search for a long string, log ID fragment, severity, and context value. Confirm the input, clear control, result rows, and no-results state remain contained.
6. Turn Auto-Refresh on and off; verify its state label/indicator remains readable and polling behavior is unchanged. Use Refresh and verify the button, disabled/spinner state, updated timestamp, and toast behavior.
7. Inspect entries with long messages, long identifiers, and context actions at `320px`; verify metadata, level, message, and JSON/no-context state are all reachable without horizontal document scrolling.
8. Open a JSON context inspector at `320px`, inspect a long message and payload, use Copy JSON Payload, close with the visible control, Escape, and backdrop, and confirm all controls remain usable.
9. Enable reduced motion if practical; change a filter and confirm the log list remains immediately usable without motion-heavy transitions.
