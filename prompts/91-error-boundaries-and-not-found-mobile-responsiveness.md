# 91 — Error Boundaries, Not Found, and Loading States Mobile Responsiveness

## Goal

Harden all application error boundaries (`app/error.tsx`, `app/global-error.tsx`), the 404 Not Found screen (`app/not-found.tsx`), and route loading skeletons (`app/loading.tsx`, `app/article/[id]/loading.tsx`) across PIXCA for seamless, accessible, and balanced display across all viewports from `320px` mobile up to `1440px+` desktop. Ensure viewport containment, prevent horizontal scrolling, optimize touch targets (≥44px), support dark mode in global fallbacks, and guarantee graceful degradation when errors occur or content is loading.

## Skills Read

- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — maintain App Router Tailwind CSS utility patterns and responsive layout constraints.
- `.agents/skills/requesting-code-review/SKILL.md` — prepare the mandatory reviewer-subagent workflow before completing the approved implementation.
- `.agents/skills/receiving-code-review/SKILL.md` — verify and evaluate reviewer feedback with technical rigor.
- `.agents/skills/gsap-core/SKILL.md`, `.agents/skills/gsap-react/SKILL.md`, and `.agents/skills/gsap-performance/SKILL.md` — preserve lightweight DOM hierarchy, compositor performance, and `prefers-reduced-motion` safety in 404 animations.
- `.agents/skills/caveman-commit/SKILL.md` — prepare conventional commit workflow upon completion.

## Existing Code Inspected

- `AGENTS.md`
- `app/error.tsx`
- `app/global-error.tsx`
- `app/not-found.tsx`
- `app/loading.tsx`
- `app/article/[id]/loading.tsx`
- `prompts/89-footer-layout-mobile-responsiveness.md`
- `prompts/90-interactive-modals-and-dialogs-mobile-responsiveness.md`

## Visual Interpretation And Responsive Behavior

- Error boundaries and fallback states are the critical safety net of PIXCA. When a network glitch, API timeout, or missing article occurs on mobile, users must see a polished, branded, non-broken interface that fits their screen cleanly without causing layout blowout or horizontal scrollbars.
- On small mobile viewports (`320px` – `480px`):
  - Card containers must enforce `w-full min-w-0 max-w-md` (or `max-w-lg`) with safe responsive padding (`px-4 sm:px-6 py-12 sm:py-16` outer, `p-6 sm:p-8 md:p-10` inner).
  - Error digest codes (`error.digest`) must use `break-all` or `truncate font-mono` so long strings do not force cards wider than the screen.
  - Action buttons ("Try Again", "Back to Top News", "Top Stories", "Blindspot Feed", "Saved", "Reload Application") must stack cleanly on mobile with minimum 44px touch targets and full width (`w-full sm:w-auto`).
  - `global-error.tsx` is the root fallback when the root layout itself fails. It renders its own `<html>` and `<body>` tags and currently lacks dark mode support, using hardcoded light mode hex values. It must gracefully adapt to light/dark themes and small mobile viewports.
  - Skeleton screens in `app/loading.tsx` and `app/article/[id]/loading.tsx` must maintain width containment (`w-full min-w-0 max-w-full overflow-x-hidden`) to avoid cumulative layout shift (CLS) or horizontal overflow while data streams in.

## Decisions And Assumptions

- Preserve Server/Client Component boundaries:
  - `app/error.tsx` and `app/not-found.tsx` remain `"use client"` components with resilient event handlers and GSAP transitions.
  - `app/global-error.tsx` remains `"use client"` with minimal dependencies to avoid crashing if sub-packages fail.
  - `app/loading.tsx` and `app/article/[id]/loading.tsx` remain lightweight Server Components rendering semantic skeleton HTML with Tailwind `animate-pulse`.
- Use mobile-first Tailwind CSS utility classes (`w-full`, `min-w-0`, `max-w-full`, `break-words`, `break-all`).
- Maintain existing GSAP entrance animation in `app/not-found.tsx`, ensuring `useGSAP` scoping and `prefers-reduced-motion` guards are preserved.
- Do not modify backend error logging logic or alter Next.js error digest contracts.

## Files Likely To Change

- `[MODIFY] app/error.tsx`
- `[MODIFY] app/global-error.tsx`
- `[MODIFY] app/not-found.tsx`
- `[MODIFY] app/loading.tsx`
- `[MODIFY] app/article/[id]/loading.tsx`

## Implementation Requirements

1. **Route Error Boundary (`app/error.tsx`)**
   - Refine outer padding to `px-4 sm:px-6 py-10 sm:py-16` to provide sufficient breathing room on 320px screens.
   - Adjust inner card padding to `p-6 sm:p-8 md:p-10` and wrap `error.digest` in `break-all font-mono text-[10px] text-zinc-500 max-w-full` to prevent container overflow.
   - Ensure the action buttons ("Try Again" and "Back to Top News") take full width on mobile (`w-full sm:w-auto`), have ergonomic touch targets (min-height 44px), and clear active/hover/focus states.

2. **Global Root Error Fallback (`app/global-error.tsx`)**
   - Add dark mode support using CSS variables or Tailwind dark mode media query styles so users in dark mode do not experience jarring bright flashes during critical failures.
   - Add responsive padding (`p-4 sm:p-6`) and width safety (`w-full max-w-md min-w-0`).
   - Add `break-all` to `error.digest` and ensure the "Reload Application" button has a 44px touch target.

3. **404 Not Found Page (`app/not-found.tsx`)**
   - Refine container padding to `px-4 sm:px-6 py-10 sm:py-16`.
   - Update action buttons: stack or wrap cleanly on narrow screens (`flex-col sm:flex-row w-full`), ensuring each link has a minimum 44px touch target and clear tap feedback.
   - Preserve `useGSAP` scoped animation with `matchMedia` for reduced motion.

4. **Feed Loading Skeleton (`app/loading.tsx`)**
   - Verify category pills skeleton bar container has `w-full min-w-0 max-w-full overflow-hidden` with no horizontal overflow at `320px`.
   - Ensure filter bar skeleton and article card grid maintain strict `min-w-0` width safety.
   - Ensure skeletons mirror the exact dimensions of actual cards to avoid layout shift.

5. **Article Details Loading Skeleton (`app/article/[id]/loading.tsx`)**
   - Ensure the 2-column layout (`grid-cols-1 lg:grid-cols-[1fr_350px]`) collapses cleanly on small screens without horizontal clipping.
   - Ensure the byline row, hero image skeleton (`aspect-[16/9] w-full`), and sidebar widgets have `min-w-0 max-w-full` constraints.

6. **Scope Protection**
   - Do not touch Supabase queries, Clerk auth middleware, Oxylabs scrapers, or AI analysis pipelines.

## Security Requirements

- Do not expose database connection strings, API keys, or private environment variables in error digest displays or console messages.
- Maintain safe error boundaries without leaking sensitive exception stack traces to the client UI.

## Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `768px`, and `1440px`:
  - `app/error.tsx` renders centered, without horizontal overflow, and with tappable 44px action buttons.
  - `app/global-error.tsx` renders cleanly in both light and dark environments with zero horizontal scrollbars.
  - `app/not-found.tsx` renders with fluid GSAP entrance, responsive text, and touch-friendly navigation buttons.
  - Skeletons in `app/loading.tsx` and `app/article/[id]/loading.tsx` render without horizontal shift or overflow on any viewport width.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

## Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

## Exact Manual Test Steps Expected After Implementation

1. Run `npm run dev` to launch the local development server.
2. Test the 404 page by navigating to `http://localhost:3000/non-existent-article-id-12345` in Chrome DevTools:
   - Verify layout at `320px`, `375px`, `768px`, and `1440px`.
   - Verify entrance animation and tap all 3 navigation links ("Top Stories", "Blindspot Feed", "Saved").
3. Test the route error boundary:
   - Temporarily trigger an error or inspect the rendered boundary component to ensure responsive card wrapping, legible text, and full-width buttons at `320px`.
4. Inspect loading skeletons in slow 3G simulation:
   - Navigate to `/` and `/article/[valid-id]`, verifying that skeleton pulses fill the screen without causing horizontal scrollbars.
5. Run verification checks: `npm run typecheck`, `npm run lint`, and `npm run build`.
6. Dispatch the code-review subagent per Section 2.1 before committing.
