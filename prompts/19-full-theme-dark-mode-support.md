# 19 — Full Theme & Dark Mode Support Across All Pages

## Goal

Ensure comprehensive, pixel-perfect Dark and Light mode support across all pages, layouts, and components in PIXCA:
1. **Homepage (`app/page.tsx`)**: Theme-aware surface background, category/source pill bar, scroll buttons, and card grid.
2. **Article Details Page (`app/article/[id]/page.tsx`)**: Theme-aware back bar, headline, byline, original article link, article body text typography, inline bias cards, newsletter subscribe section, and all sidebar widgets (Bias Analysis, AI Summary, Analysis Pending, loaded terms).
3. **Auth Pages (`app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`)**: Theme-aware container background and Clerk UI styling.
4. **Design System Page (`app/design-system/page.tsx`)**: Complete CSS variable and dark mode compatibility.
5. **Components & Layout (`components/layout/header.tsx`, `components/layout/footer.tsx`, `components/ui/news-card.tsx`, `components/ui/related-articles.tsx`, `components/ui/newsletter-subscribe.tsx`, `components/ui/chip.tsx`, `components/ui/bias-meter.tsx`)**: Replace hardcoded `#F6F6F6`, `bg-white`, `#0D0D0F` colors with semantic design tokens (`var(--surface)`, `var(--background)`, `var(--card)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--border)`).

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Theme animation rules & smooth transitions.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.
- `node_modules/next/dist/docs/01-app/01-building-your-application/01-routing/02-layouts-and-templates.md` — Layout and theme boundaries.

---

## Existing code inspected

- `app/globals.css` — Defines `:root` and `.dark` CSS variables (`--background`, `--foreground`, `--card`, `--surface`, `--text-primary`, `--text-secondary`, `--border`, `--divider`, `--bias-left`, `--bias-center`, `--bias-right`).
- `components/layout/theme-provider.tsx` — `ThemeProvider` syncing `pixca-theme` with `document.documentElement.classList`.
- `components/layout/header.tsx` — Utility bar theme toggle, logo, navbar links, action buttons.
- `components/layout/footer.tsx` — Site footer.
- `app/page.tsx` — Main feed, category pills.
- `app/article/[id]/page.tsx` — Article content, sidebar widgets, related articles.
- `components/ui/news-card.tsx` — News card layout, bias meter wrapper, metadata footer.
- `components/ui/related-articles.tsx` — Related articles section.
- `components/ui/newsletter-subscribe.tsx` — Newsletter input and button.
- `app/sign-in/[[...sign-in]]/page.tsx` & `app/sign-up/[[...sign-up]]/page.tsx` — Auth wrapper screens.
- `app/design-system/page.tsx` — Design system documentation.

---

## Decisions and assumptions

1. **Semantic CSS Tokens**: Use Tailwind theme variables (`bg-surface`, `bg-card`, `bg-background`, `text-[var(--text-primary)]`, `text-[var(--text-secondary)]`, `border-[var(--border)]`) instead of hardcoded hex values (`#F6F6F6`, `#0D0D0F`, `#FFFFFF`).
2. **High-Contrast Readability**: Ensure paragraph text in both Light mode (`text-zinc-800`) and Dark mode (`dark:text-zinc-200`) meets WCAG AAA contrast standards.
3. **Interactive Theme Switcher**: Persist theme changes across all pages via the top utility bar, updating the entire DOM instantly without page reload.
4. **Seamless Component Adaptation**: All widgets, chips, inputs, buttons, and popovers must seamlessly transition between Light and Dark mode.

---

## Files likely to change

- `app/article/[id]/page.tsx` [MODIFY] — Dark mode styling for back bar, headline, body paragraphs, sidebar widgets, loaded terms, and progress bars.
- `components/ui/related-articles.tsx` [MODIFY] — Theme-aware typography and card container styling.
- `components/ui/newsletter-subscribe.tsx` [MODIFY] — Theme-aware input background, border, text, and button.
- `components/ui/chip.tsx` [MODIFY] — Dark mode styling for source and category chips.
- `app/sign-in/[[...sign-in]]/page.tsx` [MODIFY] — Replace hardcoded `#F6F6F6` with `bg-[var(--surface)]`.
- `app/sign-up/[[...sign-up]]/page.tsx` [MODIFY] — Replace hardcoded `#F6F6F6` with `bg-[var(--surface)]`.
- `app/design-system/page.tsx` [MODIFY] — Theme-aware card panels and tokens.
- `components/layout/footer.tsx` [MODIFY] — Refine dark styling and border tokens.

---

## Implementation requirements

1. **Article Details Page (`app/article/[id]/page.tsx`)**:
   - Replace `bg-white text-[#0D0D0F]` with `bg-[var(--surface)] text-[var(--text-primary)]`.
   - Update back navigation bar to `bg-white dark:bg-[#121215] border-b border-[var(--border)]`.
   - Ensure byline links and metadata adapt to dark mode with `text-zinc-800 dark:text-zinc-200`.
   - Style article paragraph text with `text-zinc-800 dark:text-zinc-200`.
   - Update sidebar widgets and inline bias cards to `bg-card text-card-foreground border-[var(--border)]`.
   - Update SidebarProgressBar center background to `bg-zinc-300 dark:bg-zinc-600` and track to `bg-zinc-100 dark:bg-zinc-800`.
   - Style loaded terms with `bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300`.
2. **Related Articles & Newsletter (`components/ui/related-articles.tsx`, `components/ui/newsletter-subscribe.tsx`)**:
   - Update RelatedArticles section header and cards with theme tokens.
   - Update NewsletterSubscribe input and button with dark mode support.
3. **Auth Pages (`app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`)**:
   - Replace hardcoded background `bg-[#F6F6F6]` with `bg-[var(--surface)]`.
4. **Design System (`app/design-system/page.tsx`)**:
   - Update card panels from `bg-white` to `bg-card border-[var(--border)] text-card-foreground`.

---

## Acceptance criteria

1. `npm run typecheck` passes with zero errors.
2. `npm run lint` passes with zero errors.
3. `npm run build` passes with zero errors.
4. Toggling Light / Dark / Auto in the header switches theme styling instantly across:
   - Homepage (`/`)
   - Article details page (`/article/[id]`)
   - Sign in / Sign up pages (`/sign-in`, `/sign-up`)
   - Design system page (`/design-system`)
5. All text, cards, inputs, buttons, and meters remain fully readable and high-contrast in both themes.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000`.
2. Click **Dark** in the top utility bar:
   - Verify background, cards, header, and chips switch to dark mode.
3. Navigate to an article page (`/article/<id>`):
   - Verify article text, sidebar widgets, bias meters, and newsletter adapt to dark mode.
4. Open `/sign-in` and verify dark surface background.
5. Click **Light** and verify instant return to light mode.
