# 68 — Fix Mobile Theme Script Warning & Clerk Hydration Mismatch

## Goal

Resolve two console and runtime hydration issues observed during mobile and desktop rendering:
1. **Script Tag in JSX Warning** in [`app/layout.tsx`](file:///home/dg/Projects/nextjs/pixca/app/layout.tsx): Replace the raw `<script>` tag inside `<head>` with Next.js's native `<Script id="pixca-theme-init" strategy="beforeInteractive">` (from `next/script`) to comply with React 19 component script rules while maintaining instant zero-flash theme initialization.
2. **Clerk Auth Hydration Mismatch** in [`components/layout/header.tsx`](file:///home/dg/Projects/nextjs/pixca/components/layout/header.tsx) and [`components/layout/mobile-drawer.tsx`](file:///home/dg/Projects/nextjs/pixca/components/layout/mobile-drawer.tsx): Add a client-side mounting protection guard (`mounted` state with a lightweight skeleton placeholder) around Clerk's `<Show>` and `<UserButton />` components to eliminate SSR ↔ Client DOM mismatch during initial hydration.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js `Script` component, `strategy="beforeInteractive"`, and hydration lifecycle.
- `.agents/skills/clerk/SKILL.md` — Clerk client components and authentication state handling.
- `.agents/skills/clerk-nextjs-patterns/SKILL.md` — Next.js client component patterns with Clerk.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `app/layout.tsx` — Root layout with inline `<script>` theme initialization.
- `components/layout/header.tsx` — Header component with Clerk `<Show>` and `<UserButton />`.
- `components/layout/mobile-drawer.tsx` — Mobile drawer with Clerk `<Show>` and `<UserButton />`.

---

## Decisions and assumptions

1. **Theme Initialization Script in `app/layout.tsx`**:
   - Use Next.js `<Script>` from `next/script` with `id="pixca-theme-init"` and `strategy="beforeInteractive"`.
   - Keep the exact self-executing function that checks `localStorage.getItem('pixca-theme')` and `window.matchMedia('(prefers-color-scheme: dark)')` to prevent theme flash (FOUC).
2. **Hydration Protection for Clerk Auth Elements in `components/layout/header.tsx`**:
   - Maintain `mounted` state (`const [mounted, setMounted] = React.useState(false); React.useEffect(() => setMounted(true), []);`).
   - When `!mounted`, render a stable, non-flashing placeholder button/skeleton.
   - When `mounted`, render the dynamic `<Show when="signed-out">` and `<Show when="signed-in">` with `<UserButton />`.
   - Add `suppressHydrationWarning` to the auth button container for extra defense against browser extensions.
3. **Hydration Protection for Clerk in `components/layout/mobile-drawer.tsx`**:
   - Apply the same mounted protection to the bottom auth container in the mobile drawer.

---

## Files likely to change

- `app/layout.tsx` [MODIFY] — Use Next.js `Script` with `strategy="beforeInteractive"`.
- `components/layout/header.tsx` [MODIFY] — Add client mounting guard for Clerk auth buttons and UserButton.
- `components/layout/mobile-drawer.tsx` [MODIFY] — Add client mounting guard for Clerk auth section.

---

## Implementation requirements

1. **Update `app/layout.tsx`**:
   - Import `Script` from `next/script`.
   - Replace `<script dangerouslySetInnerHTML={{ __html: ... }} />` with `<Script id="pixca-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: ... }} />`.
2. **Update `components/layout/header.tsx`**:
   - Add `const [mounted, setMounted] = React.useState(false);` and `React.useEffect(() => setMounted(true), []);`.
   - Wrap the Clerk auth block so that during initial SSR/hydration, a stable placeholder is shown until `mounted` is true.
3. **Update `components/layout/mobile-drawer.tsx`**:
   - Ensure the Clerk auth block in the drawer is protected against hydration mismatches.

---

## Acceptance criteria

- [ ] Console warning "Encountered a script tag while rendering React component" is eliminated.
- [ ] Recoverable hydration mismatch error on `<UserButton />` / ClerkHostRenderer is eliminated.
- [ ] Theme initialization (dark / light mode) works instantly on first load without FOUC.
- [ ] Sign In button and UserButton avatar render cleanly on desktop and mobile.
- [ ] All checks (`npm run typecheck`, `npm run lint`, `npm run build`) pass with 0 errors.

---

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build`

---

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000` in mobile emulation mode (e.g. Chrome DevTools Responsive View).
2. Check the browser console and verify there are zero script tag warnings and zero hydration mismatch errors.
3. Toggle between Dark, Light, and Auto themes; reload the page to confirm zero theme flash.
4. Sign in / sign out to verify UserButton and Sign In transitions work smoothly on both desktop and mobile drawer.
