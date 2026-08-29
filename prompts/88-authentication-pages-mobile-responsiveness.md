# 88 — Authentication Pages Mobile Responsiveness

## Goal

Harden PIXCA’s Clerk-powered `/sign-in` and `/sign-up` routes for reliable use from `320px` through tablet and desktop widths. Keep Clerk’s managed authentication flows, redirects, theme integration, and PIXCA visual treatment intact while ensuring both embedded forms remain centered, readable, and free of document-level horizontal overflow on narrow screens.

## Skills Read

- `.agents/skills/clerk/SKILL.md` — preserve the existing `@clerk/nextjs` v7 hosted-component integration. This is a layout-containment change, not a custom authentication-flow rewrite.
- `.agents/skills/requesting-code-review/SKILL.md` — prepare the mandatory reviewer-subagent workflow before completing the approved implementation.
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — retain the existing App Router Tailwind utility approach and avoid unrelated global styling changes.
- `.agents/skills/gsap-core/SKILL.md` and `.agents/skills/gsap-performance/SKILL.md` — preserve the project convention that any existing motion remains compositor-friendly and reduced-motion-safe. Do not add animation to these static route shells merely for responsive hardening.

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
- `prompts/86-about-page-mobile-responsiveness.md`
- `prompts/87-design-system-mobile-responsiveness.md`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `node_modules/@clerk/shared/dist/types/clerk.d.ts`

## Visual Interpretation And Responsive Behavior

- Both routes are deliberately sparse authentication surfaces: a PIXCA surface-color shell centers Clerk’s complete hosted form while the shared global header and footer retain product context.
- The current wrappers use fixed mobile edge padding around a third-party form whose intrinsic card width can exceed the available content width at `320px`. The narrow layout must make this a contained, comfortable authentication surface rather than allow a horizontal document rail.
- On mobile, preserve a centered single-column card with compact but sufficient outer padding, readable Clerk controls, visible OAuth and password options, and safe vertical space above and below the form. At tablet and desktop widths retain the familiar centered, spacious composition.
- No screenshots, Figma files, or additional assets were supplied. Extend the existing PIXCA tokens and shared Clerk shadcn theme rather than inventing a separate auth visual language.

## Decisions And Assumptions

- This is a focused route-shell responsive-hardening pass, not a Clerk configuration change, custom sign-in/sign-up implementation, auth-policy change, redirect change, or visual redesign.
- Keep both route files as Server Components and continue using the existing `<SignIn />` and `<SignUp />` hosted components from `@clerk/nextjs`.
- Prefer narrow, local Tailwind containment such as `w-full`, `min-w-0`, `max-w-full`, compact mobile padding, and a controlled child wrapper over global overflow suppression or editing generated Clerk styles.
- Do not use unsupported CSS selectors, brittle internal Clerk class names, or local hard-coded card widths. If the Clerk component needs a supported per-instance `appearance` override to honor its container, use only documented public `appearance` APIs and preserve the shared `shadcn` theme from `app/layout.tsx`.
- Keep shared header/footer, `ClerkProvider`, environment configuration, middleware/auth rules, and the provider-level appearance configuration untouched unless an actual, documented requirement makes a local change impossible. The expected targets are the two route files only.

## Files Likely To Change

- `[MODIFY] app/sign-in/[[...sign-in]]/page.tsx`
- `[MODIFY] app/sign-up/[[...sign-up]]/page.tsx`

## Implementation Requirements

1. **Width-safe route shells**
   - Make both route roots and all new intermediate wrappers able to shrink inside the root layout at `320px`; establish `w-full`, `min-w-0`, and `max-w-full` where needed.
   - Use mobile-first horizontal padding that leaves enough usable form width at the smallest supported viewport, with larger spacing restored at `sm` and above.
   - Preserve at least the present vertical breathing room without creating an avoidable viewport-height clipping problem for longer Clerk sign-up or verification steps. Forms must remain normally vertically scrollable with the document.

2. **Managed Clerk form containment**
   - Render the existing `<SignIn />` and `<SignUp />` flows exactly once and preserve their default routing, redirects, OAuth options, inputs, CAPTCHA/verification steps, links between flows, keyboard behavior, and accessibility semantics.
   - Constrain each hosted component through a local, semantic wrapper so its rendered root cannot widen the document. Do not hide overflow in a way that clips inputs, error messages, legal copy, or focus outlines.
   - If public Clerk appearance configuration is necessary to make the root/card responsive, use only typed, documented component `appearance` support; merge with rather than replace the provider-level shared theme. Avoid any third-party DOM assumptions.
   - Do not change Clerk component settings, sign-in/sign-up URL configuration, callback/redirect URLs, authentication methods, or security-sensitive provider options.

3. **Visual consistency and accessibility**
   - Preserve the `var(--surface)` route background, centered composition, light/dark theme behavior, Poppins/PIXCA typography inherited from the layout, and existing shared header/footer.
   - Keep Clerk controls at a comfortable readable/tappable scale. Do not use transforms, zooming, or font-size reduction to force the form inside the viewport.
   - Ensure the keyboard focus ring, validation errors, external-provider buttons, password controls, legal/footer text, and sign-in/sign-up switch link remain visible, readable, and reachable at narrow widths.
   - Retain natural source order and document scrolling. Do not add new client state, GSAP, scripts, custom form handling, data fetching, or custom authentication UI.

4. **Scope protection**
   - Avoid changes to `app/layout.tsx`, `app/globals.css`, shared layout components, server actions, API routes, middleware, Clerk environment variables, Supabase, Polar, scraping, AI analysis, and pipeline code.
   - Keep the changes limited to responsive layout utilities unless a reproducible hosted-component containment issue requires the documented local Clerk appearance override described above.

## Security Requirements

- Preserve Clerk-managed authentication, session handling, redirects, CSRF protections, and all existing provider configuration.
- Do not expose Clerk secret keys, Supabase credentials, billing secrets, pipeline secrets, or any other environment value to browser code.
- Do not replace hosted Clerk authentication with client-managed credential handling, add custom token storage, log authentication data, or send authentication information to new endpoints.
- Do not add `dangerouslySetInnerHTML`, external requests, trackers, or user-data persistence.

## Acceptance Criteria

- At `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`, both `/sign-in` and `/sign-up` have no document-level horizontal scrollbar.
- The Clerk sign-in and sign-up forms remain fully visible within the viewport: headings, identifiers, password fields, OAuth controls, validation errors, recovery/verification steps, legal text, and cross-flow links are neither clipped nor overlapped.
- At narrow widths, form controls stay readable and tappable and the page scrolls vertically normally for long multi-step auth content.
- Desktop and tablet retain the current centered form composition, PIXCA surface colors, dark-mode behavior, shared header/footer, and Clerk shadcn theme.
- Clerk routing, redirects, authentication methods, session behavior, security posture, and global provider configuration are unchanged.
- The route pages remain Server Components and no unrelated product UI, APIs, persistence, animation architecture, global CSS, or dependencies change.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass with no errors.

## Checks To Run

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `git diff`

## Exact Manual Test Steps Expected After Implementation

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000/sign-in` in browser DevTools and test at `320px`, `360px`, `390px`, `480px`, `556px`, `768px`, `1024px`, and `1440px`.
3. Repeat those widths at `http://localhost:3000/sign-up`.
4. At every width, confirm the document has no horizontal scrollbar and that the Clerk card, all inputs, password affordances, OAuth controls, error states, cross-flow link, and any legal copy remain fully visible and usable.
5. Exercise the available non-destructive UI transitions such as switching between sign-in/sign-up and selecting recovery or verification options if configured; confirm tall form states scroll vertically and do not clip focused controls or messages.
6. Toggle the site light/dark theme and confirm the route surface and Clerk shadcn controls remain legible and consistent with PIXCA.
7. At tablet and desktop widths, confirm the original centered, spacious form composition remains intact.
8. Run the listed verification commands, inspect their real output, review the final diff, then dispatch the mandatory code-review subagent before committing.
