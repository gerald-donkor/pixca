# 18 — UI Interactive Foundations (GSAP, Theme Provider, Toast & Primitives)

## Goal

Establish the core interactive and animation infrastructure for PIXCA:
1. Install and configure **GSAP** and **@gsap/react** with proper client plugin registration (`useGSAP`, `ScrollTrigger`).
2. Implement a robust **Theme Provider** supporting Light, Dark, and System (Auto) modes, synced with `document.documentElement` and `localStorage`, with hydration mismatch prevention.
3. Integrate a global **Toast Notification System** using `sonner` styled to match PIXCA's design tokens in `app/globals.css`.
4. Provide accessible **Tooltip** and **Popover** primitives using the project's installed `@base-ui/react` library.
5. Wire the providers into `app/layout.tsx` without breaking SSR or existing Clerk authentication.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Core tweens, defaults (`ease: "power2.out"`, `duration: 0.5`), `autoAlpha`, transform aliases, reduced-motion matching.
- `.agents/skills/gsap-react/SKILL.md` — `useGSAP()` hook, plugin registration, scoping via refs, SSR-safety rules.
- `.agents/skills/gsap-performance/SKILL.md` — 60fps compositor optimization (transforms & autoAlpha only, avoid layout thrashing).
- `node_modules/next/dist/docs/01-app/01-building-your-application/01-routing/02-layouts-and-templates.md` — Server/Client boundary in root layout.

---

## Existing code inspected

- `package.json` — currently contains `@base-ui/react` (1.6.0), `lucide-react`, `tailwindcss` (v4), `@clerk/nextjs`, `@supabase/supabase-js`, `tw-animate-css`. Needs `gsap`, `@gsap/react`, `sonner`.
- `app/layout.tsx` — root layout with `Poppins` font, `ClerkProvider`, `PostHogIdentify`, `Header`, `Footer`.
- `app/globals.css` — defines CSS variables for `--background`, `--foreground`, `--surface`, `--bias-left`, `--bias-center`, `--bias-right`, `--text-primary`, `--text-secondary`, `.dark` classes.
- `components/ui/button.tsx` — uses `@base-ui/react/button` with `cva` and `cn`.
- `components.json` — configured with `baseColor: "neutral"` and aliases.

---

## Decisions and assumptions

1. **Client-Safe GSAP Registration**: GSAP and its plugins (`useGSAP`, `ScrollTrigger`) must be registered on the client side only (checking `typeof window !== "undefined"`).
2. **Accessible Primitives via `@base-ui/react`**: `@base-ui/react` is already installed and powers `Button`. We will build `Tooltip` and `Popover` using `@base-ui/react/tooltip` and `@base-ui/react/popover` for unstyled, fully accessible overlays.
3. **Theme Management**: Theme toggle will support 3 modes: `light`, `dark`, and `system`. It will persist preference to `localStorage.getItem("pixca-theme")` and toggle the `.dark` class on `document.documentElement`.
4. **Toast Notifications**: `sonner` is lightweight, highly customizable, and pairs seamlessly with Tailwind CSS variables. The `Toaster` will be placed in `app/layout.tsx` inside the ThemeProvider.

---

## Files likely to change

- `package.json` [MODIFY] — add `gsap`, `@gsap/react`, `sonner`.
- `lib/gsap/index.ts` [NEW] — client GSAP setup, plugin registration, and reduced motion helper.
- `components/layout/theme-provider.tsx` [NEW] — React context provider and hook `useTheme()` for light/dark/system mode.
- `components/ui/toaster.tsx` [NEW] — configured `sonner` toaster matching PIXCA palette.
- `components/ui/tooltip.tsx` [NEW] — accessible tooltip component using `@base-ui/react`.
- `components/ui/popover.tsx` [NEW] — accessible popover component using `@base-ui/react`.
- `app/layout.tsx` [MODIFY] — wrap children with `ThemeProvider` and mount `Toaster`.

---

## Implementation requirements

1. **Package Installation**:
   - Run `npm install gsap @gsap/react sonner`.
2. **GSAP Initialization (`lib/gsap/index.ts`)**:
   - Export `gsap`, `useGSAP`, `ScrollTrigger`.
   - Register plugins safely in client environment:
     ```typescript
     "use client";
     import gsap from "gsap";
     import { useGSAP } from "@gsap/react";
     import { ScrollTrigger } from "gsap/ScrollTrigger";

     if (typeof window !== "undefined") {
       gsap.registerPlugin(useGSAP, ScrollTrigger);
       gsap.defaults({
         ease: "power2.out",
         duration: 0.5,
       });
     }

     export { gsap, useGSAP, ScrollTrigger };
     ```
3. **Theme Provider (`components/layout/theme-provider.tsx`)**:
   - Export `ThemeProvider` and `useTheme()` hook returning `{ theme, setTheme, resolvedTheme }`.
   - On mount and change, apply/remove `.dark` class on `document.documentElement` according to user choice / system media query `(prefers-color-scheme: dark)`.
4. **Toaster (`components/ui/toaster.tsx`)**:
   - Export `Toaster` component wrapping `sonner`'s `<Toaster />` with rich colors, custom styling matching PIXCA border/surface tokens, and position `"bottom-right"`.
5. **Primitives (`components/ui/tooltip.tsx`, `components/ui/popover.tsx`)**:
   - Create clean, accessible wrapper components with animations, smooth transitions, and proper z-index.
6. **Root Layout Wiring (`app/layout.tsx`)**:
   - Wrap tree with `ThemeProvider` and include `<Toaster />`.

---

## Security requirements

- No API keys or backend secrets touched.
- All client-side storage keys prefixed with `pixca-` (e.g. `pixca-theme`).

---

## Acceptance criteria

1. `npm run typecheck` passes with zero errors.
2. `npm run lint` passes with zero errors.
3. `npm run build` succeeds without SSR or bundling errors for GSAP or Sonner.
4. `ThemeProvider` cleanly manages light/dark/system mode with persistence.
5. Calling `toast("Test notification")` anywhere in client code renders a polished toast notification.
6. `useGSAP` is registered and ready for all subsequent UI components.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps

1. Start dev server with `npm run dev`.
2. Load homepage `http://localhost:3000`.
3. Check browser console for zero GSAP or hydration errors.
4. Verify theme provider initializes without flash of incorrect theme.
