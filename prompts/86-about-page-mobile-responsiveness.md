# 86 — About Page Mobile Responsiveness

## Goal

Harden the `/about` methodology and transparency page for responsive use from `320px` through tablet and desktop widths. The page must have no document-level horizontal overflow while preserving the existing PIXCA editorial visual language, full methodology content, metadata, links, dark-mode treatment, and static server-rendered architecture.

## Skills Read

- `.agents/skills/requesting-code-review/SKILL.md` — prepare the required reviewer-subagent workflow before completion.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — use the existing App Router Tailwind utility approach and avoid route-specific global CSS changes.
- `.agents/skills/gsap-core/SKILL.md` and `.agents/skills/gsap-performance/SKILL.md` — preserve the project standard that any existing or newly necessary motion uses compositor-friendly transforms/`autoAlpha` and reduced-motion-safe behavior. This page is currently a Server Component with no GSAP; do not introduce animation merely for responsive work.

## Existing Code Inspected

- `AGENTS.md`
- `prompts/77-article-page-mobile-responsiveness.md`
- `prompts/78-header-navbar-mobile-responsiveness.md`
- `prompts/79-homepage-feed-mobile-responsiveness.md`
- `prompts/81-pricing-page-mobile-responsiveness.md`
- `prompts/82-for-you-page-mobile-responsiveness.md`
- `prompts/83-blindspot-page-mobile-responsiveness.md`
- `prompts/84-saved-library-mobile-responsiveness.md`
- `prompts/85-logs-dashboard-mobile-responsiveness.md`
- `app/about/page.tsx`
- `components/layout/header.tsx`
- `components/layout/footer.tsx`
- `app/globals.css`

## Visual Interpretation And Responsive Behavior

- `/about` is PIXCA’s long-form editorial transparency surface: a dark, luminous hero introduces the product; four technical pipeline cards explain its flow; a six-item framing matrix clarifies labels; an amber disclosure card establishes limitations; and three destination cards provide the next reading action.
- The mobile layout should read as a clear vertical narrative with compact but generous edge padding, readable headings, distinct card boundaries, and enough space for the icon-and-copy hierarchy. Desktop should retain the existing wide 2-column pipeline, 3-column matrix, and 3-column CTA layouts.
- The key narrow-width risks are the hero’s ambient glow elements, the long neutrality badge, both hero CTA labels, pipeline title/badge flex rows, technical formula and model-token `<code>` content, matrix headers, the disclaimer icon/copy layout, and CTA title/subtitle/icon rows. These must wrap, stack, or use local technical-token breaking without truncating the methodology.

## Decisions And Assumptions

- This is a focused responsive-hardening pass, not a content rewrite, methodology redesign, API/data-flow change, or animation initiative.
- Preserve the page as a Server Component; preserve static metadata, internal `Link` destinations, all copy, the existing icons, visual color system, card hierarchy, hover affordances, and dark-mode classes.
- Prefer small, local Tailwind containment adjustments such as `min-w-0`, `max-w-full`, `w-full`, responsive outer padding/gaps, wrap-safe text, `break-words`, and `break-all` only for genuinely unbroken technical tokens. Do not suppress overflow globally to mask a layout defect.
- Do not alter `components/layout/header.tsx`, `components/layout/footer.tsx`, `app/globals.css`, dependencies, Supabase, API routes, authentication, scraping, AI, scheduler, or environment variables unless a demonstrated shared root cause cannot be safely contained in `app/about/page.tsx`. The expected implementation target is the route only.
- No screenshots, Figma files, or additional visual assets were supplied; use the existing PIXCA token and component language rather than inventing a new visual direction.

## Files Likely To Change

- `[MODIFY] app/about/page.tsx`

## Implementation Requirements

1. **Route shell and hero**
   - Make the page root and `main` width-safe with mobile-first containment and compact edge padding such as `px-4 sm:px-6`, without changing the route’s `max-w-[1200px]` desktop composition or vertical narrative spacing.
   - At `320px`, keep the hero card, border radius, background gradient, and ambient orbs visually intentional but bounded. Decorative glows may remain clipped by the hero itself; they must never create document-level scrolling.
   - Ensure the editorial-neutrality badge has a stable icon/text relationship at narrow widths. It may wrap or use a compact alignment, but both the shield icon and label must remain visible and readable.
   - Keep the hero headline legible without clipping and ensure the explanatory copy wraps within the card.
   - Stack the two hero calls to action when necessary, retaining readable labels, visible icons, usable touch targets, focus-visible behavior, and the inline desktop presentation at sufficient width.

2. **Pipeline section and technical cards**
   - Preserve the one-column mobile and two-column `md` pipeline grid. Each card must have width containment, responsive padding, and a clear icon/title/badge/body hierarchy.
   - At narrow widths, stack or safely wrap each card’s title and technology badge rather than allowing `justify-between` to force a horizontal overflow. Keep title and badge content visible.
   - Keep long technical copy and inline code—including `(Right% − Left%) / 100`, `gemini-embedding-001`, and `1536-dim IVFFlat`—inside their owning cards. Use a mono-safe break strategy only where an unbroken technical token otherwise exceeds the available width; do not hide or replace the information.
   - Preserve the desktop card geometry, icon color treatments, hover borders, and spacing.

3. **Framing matrix and disclosure**
   - Preserve the matrix’s one-column mobile, two-column `sm`, and three-column `lg` grid. Give matrix cards and header rows `min-w-0`/wrap-safe sizing so labels, colored dots, and paragraphs stay contained at `320px`.
   - Keep the amber disclaimer as a clearly differentiated disclosure. Its icon and copy must stack or align safely at mobile widths while retaining the existing desktop horizontal layout and all warning text.

4. **Destination cards and accessibility**
   - Preserve the three quick links and their destinations. On mobile, each card must safely contain the title, subtitle, and trailing icon; long descriptions must wrap without pushing the icon outside the card. Maintain the three-column `sm` layout.
   - Retain semantic links, keyboard navigation, focus visibility, text contrast, source order, icon labels implied by adjacent link copy, and all existing hover/focus affordances.
   - Do not introduce a horizontal page rail, clipped selectable content, new client-side state, unsafe HTML rendering, or unnecessary new abstractions/dependencies.

5. **Scope and performance**
   - Do not add GSAP or convert the page to a Client Component for this task. If an implementation encounters pre-existing project motion, retain reduced-motion behavior and avoid layout-property animation.
   - Keep decorative overflow local to the hero/card that owns it. Do not add broad `overflow-x-hidden` to `html`, `body`, route shells, or global CSS.

## Security Requirements

- Do not change API authorization, Clerk behavior, Supabase access, article/pipeline data, scraping, AI analysis, scheduler logic, headers, or environment variables.
- Keep static methodology content rendered as React text. Do not add `dangerouslySetInnerHTML`, client-side content fetching, or external requests.
- Preserve internal navigation as Next.js `Link` components and do not add tracking or transmit user data.

## Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, `/about` has no document-level horizontal scrollbar.
- The hero, badge, title, explanatory copy, both CTAs, all four pipeline cards, inline technical formulae/tokens, all six classification cards, disclaimer, and all three destination cards remain visible, readable, and usable.
- Decorative hero effects are visually preserved and locally contained; no global overflow suppression conceals defects.
- The existing desktop hierarchy remains: wide hero, two-column pipeline at `md`, three-column matrix at `lg`, three-column quick links at `sm`, color treatments, dark-mode support, metadata, and navigation destinations.
- The page remains a static Server Component with no change to product content, API behavior, persistence, authentication, or animation architecture.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with no errors.

## Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

## Exact Manual Test Steps Expected After Implementation

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/about` and test at `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px` in browser DevTools.
3. Confirm no document-level horizontal scrollbar appears at any viewport. Inspect the hero glow, badge, headline, copy, and both CTAs at `320px`; confirm nothing clips or overlaps and both links navigate correctly.
4. Inspect every pipeline card at narrow widths, especially title/badge rows and the bias formula, model name, and vector-index token. Confirm technical text remains available and cards do not widen the page.
5. Verify all six framing classification cards retain their dots, headings, and explanatory copy at mobile/tablet/desktop breakpoints.
6. Confirm the disclaimer icon and copy remain readable at `320px`, then verify the quick-link cards preserve their text and trailing icons and navigate to `/`, `/blindspot`, and `/logs`.
7. Toggle the project light/dark theme, tab through every hero CTA and quick link, and confirm visible focus treatment, contrast, and keyboard activation remain intact.
8. Run the listed verification commands and review the final diff before dispatching the mandatory code-review subagent.
