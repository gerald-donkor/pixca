# Clerk Authentication

## Goal

Add Clerk authentication to PIXCA. The home feed stays fully public. Opening a
full article's news-details page (`/article/[id]`) requires the reader to be
signed in — signed-out visitors are redirected to `/sign-in` and returned to
the article after authenticating. Add minimal Sign In / Sign Up / UserButton
UI to the header.

## Skills read

- `.agents/skills/clerk/SKILL.md` (router)
- `clerk-setup` skill (provisioning, quickstart, shadcn theme guidance)
- `clerk-nextjs-patterns` skill, `references/middleware-strategies.md`
  (public-first proxy pattern, `auth.protect()`)
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` — this
  Next.js version (16.2.10) renamed `middleware.ts` to `proxy.ts`; the
  `clerkMiddleware` API and behavior are unchanged, only the filename and
  default export name differ.

## Existing code inspected

- `package.json` — `@clerk/nextjs@7.6.0` (current SDK, not Core 2) and
  `next@16.2.10` are already installed. `@clerk/ui` is present in
  `node_modules` (not yet in `package.json` dependencies — needs adding).
- `.env.local` already has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
  `CLERK_SECRET_KEY` for an existing Clerk dev instance. No sign-in/sign-up
  URL env vars set yet. `.env.example` exists but is empty.
- No `proxy.ts` or `middleware.ts` exists yet. No `app/sign-in` or
  `app/sign-up` routes exist.
- `app/layout.tsx` — root layout renders `<Header />` / `<Footer />` around
  `{children}` inside `<body>`; no provider wraps it yet.
- `components/layout/header.tsx` — navbar already has a placeholder "Login"
  `Button` (outline variant) next to a "Subscribe" button, both plain
  `<Button>` elements with no auth wiring.
- `app/article/[id]/page.tsx` — this is the actual news-details route
  (`/article/[id]`, not `/news/[id]`). It's a Server Component rendering the
  full analysis, related stories, etc.
- `app/page.tsx:166` — the only place that links into the details page:
  `<Link href={`/article/${art.id}`}>`.
- `components.json` — shadcn/ui is configured (`style: "base-nova"`,
  `baseColor: "neutral"`), so the Clerk shadcn appearance theme applies.
- `components/ui/button.tsx` — button variants use CSS vars
  (`--text-primary`, `--border`, `--bg-secondary`, `--bias-right`) that the
  rest of the app themes off; new UI should reuse these, not hardcode colors.

## Decisions / assumptions

- Protect exactly `/article/(.*)` via `proxy.ts`, public-first strategy:
  everything else (home feed, design-system, sign-in, sign-up, all API
  routes) stays public at the Clerk layer. API routes keep their existing
  independent `x-PIXCA-admin-secret` / `CRON_SECRET` protection (section 15
  and 18 of AGENTS.md) — Clerk does not gate them.
- Use Clerk's built-in `<SignIn />` / `<SignUp />` components on dedicated
  catch-all routes (`app/sign-in/[[...sign-in]]/page.tsx`,
  `app/sign-up/[[...sign-up]]/page.tsx`) rather than a custom flow — no
  custom-UI requirement was given, and the shadcn appearance theme makes the
  prebuilt components match the app already.
- Use `<Show when="signed-in">` / `<Show when="signed-out">` in the header
  (current SDK v7, per `clerk-nextjs-patterns`), not `<SignedIn>`/`<SignedOut>`
  (Core 2 only).
- On sign-in/up success, fall back to redirecting the user back to `/` by
  default (`NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`), except when
  `auth.protect()` sent them from a specific article — Clerk's built-in
  `redirect_url` round-trip handles returning them to that article
  automatically; no custom logic needed.
- `@clerk/ui` gets added to `package.json` dependencies (it's already in
  `node_modules` but undeclared) so the shadcn theme import
  (`@clerk/ui/themes/shadcn.css` and `shadcn` theme object) resolves cleanly.

## Files likely to change

- `app/layout.tsx` — wrap children in `<ClerkProvider>` (inside `<body>`,
  with `dynamic` prop and shadcn `appearance` theme).
- `app/globals.css` — add `@import '@clerk/ui/themes/shadcn.css';`.
- `proxy.ts` (new, project root) — `clerkMiddleware` + `createRouteMatcher`
  protecting `/article(.*)`.
- `app/sign-in/[[...sign-in]]/page.tsx` (new)
- `app/sign-up/[[...sign-up]]/page.tsx` (new)
- `components/layout/header.tsx` — replace the placeholder "Login" button
  with `<Show when="signed-out">` (Sign In button → `/sign-in`) and
  `<Show when="signed-in">` (`<UserButton />`).
- `.env.local` — add `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`,
  `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`,
  `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`,
  `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`.
- `.env.example` — document the same Clerk vars (no real values) per
  AGENTS.md section 21's env table.
- `package.json` — add `@clerk/ui` as a declared dependency.

## Implementation requirements

1. `proxy.ts` at the project root (not `middleware.ts` — this Next.js
   version uses the Proxy convention):
   ```ts
   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

   const isProtectedRoute = createRouteMatcher(['/article(.*)']);

   export default clerkMiddleware(async (auth, req) => {
     if (isProtectedRoute(req)) await auth.protect();
   });

   export const config = {
     matcher: [
       '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
       '/(api|trpc)(.*)',
     ],
   };
   ```
2. `ClerkProvider` goes inside `<body>` in `app/layout.tsx`, wrapping the
   existing `<Header />` / `{children}` / `<Footer />` tree, with `dynamic`
   set and `appearance={{ theme: shadcn }}` from `@clerk/ui/themes`.
3. Header auth UI must not change layout/spacing of the existing navbar —
   swap only the "Login" button's contents based on auth state; keep sizing
   consistent with the neighboring "Subscribe" button (`h-8 sm:h-9`, same
   font weight/size classes) so nothing jumps.
4. Sign-in/up pages are minimal centered layouts (no custom form), just the
   Clerk component centered on the page within the app's existing
   background (`bg-[#F6F6F6]`), inside the normal `<Header />`/`<Footer />`
   chrome from the root layout.
5. Do not add any account/profile pages, webhooks, or Supabase user sync —
   out of scope for this request.
6. Server Components needing auth state (none currently besides the
   proxy-level gate) must use `await auth()` from `@clerk/nextjs/server`.

## Security requirements

- `CLERK_SECRET_KEY` stays server-only; never imported into a Client
  Component.
- `proxy.ts` matcher must include API routes so Clerk's context is available
  app-wide, but must not call `auth.protect()` on any `/api/*` path — those
  keep their existing `x-PIXCA-admin-secret` / `CRON_SECRET` protection
  (sections 15 and 18) and must not be double-gated or broken by Clerk.
- `/article/(.*)` must reject unauthenticated requests server-side via
  `auth.protect()` in `proxy.ts` — do not rely on client-side hiding of
  content, since that would leak the analysis in the initial HTML/RSC
  payload to signed-out users.

## Visual interpretation (header + auth pages)

- Header: the "Login" button's position, size (`h-8 sm:h-9`, `text-[10px]
  sm:text-xs`, `font-bold`, `rounded-md`, outline variant border/hover
  colors) stay exactly as today for signed-out users, just relabeled "Sign
  In" and linked to `/sign-in`. Signed-in state replaces it with Clerk's
  `<UserButton />` at a comparable size (roughly the button's height) so the
  header doesn't visibly shift.
- Sign-in/up pages: centered vertically and horizontally in the content
  area between header and footer, generous padding, background matches the
  app (`#F6F6F6`), no extra copy or branding beyond what Clerk's component
  renders with the shadcn theme applied.
- Responsive: header change must not break the existing `md:` breakpoints
  already in `header.tsx`; auth pages must be usable at mobile widths (the
  Clerk component is responsive by default).

## Acceptance criteria

- Visiting `/` and `/design-system` works without signing in.
- Visiting `/article/[id]` while signed out redirects to `/sign-in`; after
  signing in, the user lands back on that same `/article/[id]` page.
- Visiting `/article/[id]` while signed in renders normally.
- Header shows "Sign In" when signed out and `<UserButton />` when signed
  in, with no layout shift in the surrounding navbar.
- `/sign-in` and `/sign-up` render Clerk's prebuilt components themed to
  match the app (shadcn theme), inside the site's normal header/footer.
- No `CLERK_SECRET_KEY` or other server-only value is referenced from a
  Client Component or exposed in browser bundles.
- Existing `/api/*` action routes (if any exist yet) are unaffected by the
  proxy — Clerk does not block them.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (proxy/config and root layout changes affect the build)

## Manual test steps

1. `npm run dev`.
2. Open `http://localhost:3000/` — confirm the home feed loads without any
   sign-in prompt.
3. Click into any article card (`/article/<id>`) while signed out — confirm
   you're redirected to `/sign-in`.
4. Sign up for a new test account on `/sign-up`, or sign in with an existing
   one on `/sign-in` — confirm you're redirected back to the same
   `/article/<id>` page you originally tried to open.
5. Confirm the header now shows a `UserButton` avatar instead of "Sign In";
   click it and confirm "Sign out" works and returns you to a signed-out
   state.
6. After signing out, revisit the same `/article/<id>` URL directly and
   confirm it redirects to `/sign-in` again.
7. Visit `/design-system` while signed out and confirm it still loads
   without redirecting.
