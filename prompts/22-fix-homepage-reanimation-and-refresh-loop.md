# 22 — Fix Homepage Card Re-Animation and Refresh Loop

## Goal

Resolve the continuous re-animation ("refresh effect" / card flashing) and excessive prefetch rendering on the homepage identified in screencast `Screencast_20260824_123038.webm`:
1. **Stabilize GSAP Effect Dependencies in `ArticleGrid` (`components/ui/article-grid.tsx`)**: Replace the unstable array object reference `[articles]` in `useGSAP` with a stable identifier string `[articlesKey]` (`articles.map((a) => a.id).join(",")`) so animations run strictly when the dataset actually changes (filter/source switches) and never on incidental re-renders or mouse events.
2. **Prevent Conflicting Animation & Opacity Resets**: Streamline the GSAP card entrance animation to execute cleanly with `clearProps: "transform,opacity"` on complete, preventing cards from vanishing or getting stuck at `autoAlpha: 0`.
3. **Disable Eager Dev Prefetch Bursts on Cards (`components/ui/article-grid.tsx`)**: Set `prefetch={false}` on the `<Link>` wrapping each news card in the grid to stop Next.js from spamming simultaneous dynamic SSR prefetch calls (`Rendering localhost:3000/article/...`) for all 12+ cards in the viewport on scroll and hover.
4. **Harden `FilterBar` URL Synchronization (`components/ui/filter-bar.tsx`)**: Ensure search debounce and filter updates do not trigger unnecessary router pushes when the query has not changed.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Core GSAP tweens, easing, and `clearProps` cleanup.
- `.agents/skills/gsap-react/SKILL.md` — `@gsap/react` `useGSAP()` dependency array stability and lifecycle management.
- `.agents/skills/gsap-performance/SKILL.md` — Preventing layout thrashing, unnecessary resets, and compositor acceleration.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit format.

---

## Existing code inspected

- `components/ui/article-grid.tsx` — Client component wrapping the article grid with `useGSAP()` and `dependencies: [articles]`.
- `components/ui/filter-bar.tsx` — Client component managing search debouncing and filter state.
- `app/page.tsx` — Server component passing `articles` to `ArticleGrid`.
- Video reference: `/home/dgk/Videos/Screencasts/Screencast_20260824_123038.webm` showing cards repeatedly re-rendering and flashing `autoAlpha: 0` during hover, scroll, and prefetch cycles.

---

## Decisions and assumptions

1. **Stable Dependency Key**: In React, passing a new array reference `[articles]` to `useGSAP` on every render causes the GSAP context to revert and re-run `fromTo({ autoAlpha: 0, y: 24 })`, making all cards vanish and slide in repeatedly. Using `const articlesKey = articles.map((a) => a.id).join(",")` ensures animations only execute when the actual list of articles changes.
2. **Smooth Staggered Entrance without Conflicting ScrollTrigger Resets**: Use a clean, fast staggered entrance (`y: 16, autoAlpha: 0, duration: 0.35, stagger: 0.04, ease: "power2.out"`) with `clearProps: "transform,opacity"` so cards remain permanently visible after animating.
3. **`prefetch={false}` on Grid Links**: Next.js App Router dynamic routes that call `await connection()` trigger dev compilation and SSR prefetch requests when links are in viewport. Adding `prefetch={false}` prevents background prefetch bursts and eliminates the "Rendering ..." dev server compilation churn while scrolling.
4. **Preserve User Accessibility**: Maintain `gsap.matchMedia()` support for `prefers-reduced-motion: reduce`.

---

## Files likely to change

- `components/ui/article-grid.tsx` [MODIFY] — Use stable `articlesKey` in `useGSAP`, clean up tweens with `clearProps`, and add `prefetch={false}` to card links.
- `components/ui/filter-bar.tsx` [MODIFY] — Ensure debounced search only pushes when query differs from current search parameters.

---

## Implementation requirements

### 1. `components/ui/article-grid.tsx`
- Compute a stable `articlesKey`:
  ```typescript
  const articlesKey = React.useMemo(() => articles.map((a) => a.id).join(","), [articles])
  ```
- Use `articlesKey` in the `useGSAP` dependency array:
  ```typescript
  useGSAP(
    () => {
      if (!gridRef.current || articles.length === 0) return

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".news-card-item",
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.04,
            clearProps: "transform,opacity",
          }
        )
      })

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          ".news-card-item",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
            stagger: 0.02,
            clearProps: "transform,opacity",
          }
        )
      })

      return () => {
        mm.revert()
      }
    },
    { scope: gridRef, dependencies: [articlesKey] }
  )
  ```
- Add `prefetch={false}` to `<Link href={`/article/${article.id}`} prefetch={false}>`.

### 2. `components/ui/filter-bar.tsx`
- Verify that `useEffect` for debounced search only calls `router.push` when `searchTerm.trim()` actually differs from `(searchParams?.get("q") ?? "").trim()`.

---

## Security requirements

- Pure client-side UI and animation performance stabilization.
- No sensitive data exposed.

---

## Acceptance criteria

1. **No Re-Animation on Scroll or Hover**: Scrolling, moving the mouse, or hovering over cards does not cause cards to flash, disappear, or re-trigger entrance animations.
2. **Smooth Filter Transition**: Changing source pills, political framing chips, or sentiment chips triggers a single, smooth card entrance animation.
3. **No Excessive Prefetch Churn**: Links do not trigger dev-mode dynamic SSR compilation loops while scrolling.
4. **Typecheck & Lint**: Zero TypeScript errors (`npm run typecheck`) and zero ESLint errors (`npm run lint`).

---

## Checks to run

```bash
npm run typecheck
npm run lint
```

---

## Exact manual test steps expected after implementation

1. Open `http://localhost:3000/`.
2. Scroll up and down the page and hover over various news cards. Verify that cards remain fully visible without any flashing, disappearing, or re-animation.
3. Click a source pill (e.g. "BBC News" or "Fox News") and verify cards animate in smoothly once.
4. Click a framing filter (e.g. "Left", "Center") or sentiment filter and verify clean single entrance animation.
5. Verify that the bottom-left "Rendering ..." dev server compilation badge is not continuously firing on every scroll/hover.
