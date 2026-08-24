# 24 — Article Details Actions, Reading Progress, and AI Metric Explainers

## Goal

Make all action buttons, explainer elements, reading progress, and bias meters on the news details page interactive, responsive, accessible, and animated with GSAP micro-interactions:
1. **Hydration-Safe Bookmark Storage Hook (`hooks/use-bookmarks.ts`)**: Client hook using `useSyncExternalStore` and `localStorage` to save/remove bookmarked articles with multi-tab and multi-component instant synchronization.
2. **ScrollTrigger Reading Progress Indicator (`components/ui/reading-progress.tsx`)**: Pinned top progress bar linked to page scroll position using GSAP ScrollTrigger with smooth scrub and compositor optimization.
3. **Interactive Article Action Bar (`components/ui/article-action-bar.tsx`)**: Client action bar supporting bookmark toggling with GSAP elastic bounce (`scale: 1.35 -> 1.0`), Native Share API with clipboard fallback & Sonner toast notification, and an accessible options popover menu.
4. **Accessible AI Metric Explainers (`components/ui/ai-metric-explainer.tsx`)**: Accessible popover / tooltip components replacing static info icons to explain Bias Distribution, Political Framing, Confidence, and AI Summary methodology.
5. **Animated Bias Meter (`components/ui/bias-meter.tsx`)**: Enhance the existing `BiasMeter` component with `useGSAP()` segment expansion animations.
6. **Article Details Page Integration (`app/article/[id]/page.tsx`)**: Integrate `ReadingProgress`, `ArticleActionBar`, `AiMetricExplainer`, and the animated `BiasMeter` while preserving Server Component data fetching, pgvector similarity lookup, and Clerk authentication.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Core GSAP tweens, easing (`back.out`, `power2.out`), and `gsap.matchMedia()` for reduced motion.
- `.agents/skills/gsap-react/SKILL.md` — `@gsap/react` `useGSAP()` hook scoping, dependency stability, and React 19 cleanup.
- `.agents/skills/gsap-scrolltrigger/SKILL.md` — `ScrollTrigger` scrubbed reading progress bar.
- `.agents/skills/gsap-performance/SKILL.md` — 60fps GPU compositor acceleration (`scaleX`, `autoAlpha`, `transformOrigin: "left center"`, avoiding layout thrashing).
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit format.

---

## Existing code inspected

- `app/article/[id]/page.tsx` — Server component rendering article details, static action buttons (Save, Share, More), static info icons, and sidebar analysis widgets.
- `components/ui/bias-meter.tsx` — Horizontal segment bar rendering Left, Center, and Right percentages.
- `components/ui/popover.tsx` — Accessible `@base-ui/react/popover` primitive.
- `components/ui/tooltip.tsx` — Accessible `@base-ui/react/tooltip` primitive.
- `lib/gsap/index.ts` — Registered GSAP plugins (`useGSAP`, `ScrollTrigger`).
- `components/ui/toaster.tsx` — Sonner toaster component.

---

## Decisions and assumptions

1. **Hydration-Safe Bookmark Storage**:
   - `hooks/use-bookmarks.ts` uses `useSyncExternalStore` to read from `localStorage` under key `pixca-bookmarks`.
   - Server snapshot returns an empty array `[]`, ensuring zero hydration mismatch between server markup and client hydration.
   - State dispatch triggers custom `pixca-bookmarks-change` and native `storage` events for instant multi-component reactivity.
2. **ScrollTrigger Reading Progress**:
   - `ReadingProgress` mounts a fixed top bar (`fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none`).
   - Inner indicator transforms `scaleX` from `0` to `1` with `transformOrigin: "left center"` driven by `ScrollTrigger.create({ trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.15 })`.
   - Wrapped in `gsap.matchMedia()` to safely respect `prefers-reduced-motion: reduce`.
3. **Micro-Interactions & Elastic Feedback**:
   - Toggling bookmark triggers a spring tween (`gsap.fromTo(iconRef.current, { scale: 1.35 }, { scale: 1, duration: 0.35, ease: "back.out(2)" })`) and displays a Sonner toast.
   - Sharing leverages `navigator.share` when available (mobile browsers), falling back to `navigator.clipboard.writeText(window.location.href)` with toast confirmation (`"Link copied to clipboard"`).
4. **AI Metric Educational Explainers**:
   - Replace static `Info` icons with interactive `<AiMetricExplainer>` popovers explaining:
     - `bias-distribution`: Explains how the left/center/right percentages reflect language tone and framing.
     - `bias-analysis`: Explains how overall bias and confidence metrics are calculated.
     - `ai-summary`: Explains neural summarization, model provenance, and loaded terms.
5. **Compositor Animated Bias Meter**:
   - Enhance `BiasMeter` with `useGSAP()` to animate segment widths smoothly on mount (`scaleX: 0 -> 1` with `origin: left`), with instant display if reduced-motion is requested.

---

## Files likely to change

- `hooks/use-bookmarks.ts` [NEW] — Client hook for managing saved articles in `localStorage` with `useSyncExternalStore`.
- `components/ui/reading-progress.tsx` [NEW] — Client component with GSAP ScrollTrigger scrubbed reading progress indicator.
- `components/ui/article-action-bar.tsx` [NEW] — Client component for Save, Share, and Options dropdown with GSAP micro-animations and Sonner toasts.
- `components/ui/ai-metric-explainer.tsx` [NEW] — Accessible explainer popovers for Bias Distribution, Bias Analysis, and AI Summary.
- `components/ui/bias-meter.tsx` [MODIFY] — Add `useGSAP` segment entrance animation.
- `app/article/[id]/page.tsx` [MODIFY] — Wire `ReadingProgress`, `ArticleActionBar`, `AiMetricExplainer`, and updated `BiasMeter`.

---

## Implementation requirements

### 1. `hooks/use-bookmarks.ts`
- Must be a client hook (`"use client"`).
- Storage key: `pixca-bookmarks`.
- Custom event: `pixca-bookmarks-change`.
- Structure:
  ```typescript
  export interface BookmarkedArticle {
    id: string;
    title: string;
    source_name: string;
    image_url?: string;
    saved_at: string;
  }
  ```
- Exposes:
  - `bookmarks: BookmarkedArticle[]`
  - `isBookmarked: (id: string) => boolean`
  - `toggleBookmark: (article: { id: string; title: string; source_name: string; image_url?: string }) => boolean`
  - `removeBookmark: (id: string) => void`
- Uses `useSyncExternalStore` with server snapshot returning `[]` and safe `try/catch` JSON parsing.

### 2. `components/ui/reading-progress.tsx`
- Must be a client component (`"use client"`).
- Renders:
  ```tsx
  <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
    <div ref={barRef} className="h-full bg-zinc-900 dark:bg-white origin-left transform-gpu scale-x-0 will-change-transform" />
  </div>
  ```
- Uses `useGSAP()` to register `ScrollTrigger`:
  - Animates `barRef.current` with `scaleX: 1`, `ease: "none"`, `scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.15 }`.
  - Wrapped in `gsap.matchMedia()` so `prefers-reduced-motion: reduce` leaves scale static at 1 or hides progress.

### 3. `components/ui/article-action-bar.tsx`
- Must be a client component (`"use client"`).
- Props:
  ```typescript
  interface ArticleActionBarProps {
    article: {
      id: string;
      title: string;
      original_url: string;
      source_name: string;
      image_url?: string;
    };
  }
  ```
- Renders:
  - **Save Button**: `<Button variant="ghost">` with `Bookmark` icon (filled when bookmarked). On click, triggers `toggleBookmark`, plays GSAP icon bounce animation, and displays Sonner toast (`toast.success` / `toast.info`).
  - **Share Button**: `<Button variant="ghost">` with `Share2` icon. On click, checks `navigator.share` or copies URL via `navigator.clipboard.writeText` and shows `toast.success("Link copied to clipboard!")`.
  - **More Options Popover**: `<Popover>` containing:
    - "Copy Article Link" action
    - "Open Original Source" external link
    - "Report an Issue" link/toast
- Keyboard accessible and responsive.

### 4. `components/ui/ai-metric-explainer.tsx`
- Must be a client component (`"use client"`).
- Props:
  ```typescript
  interface AiMetricExplainerProps {
    type: "bias-distribution" | "bias-analysis" | "ai-summary";
    className?: string;
  }
  ```
- Renders an accessible `<Popover>` with trigger `Info` button (accessible label, hover & focus states).
- Provides crisp, educational copy explaining:
  - **`bias-distribution`**: "Estimates the proportion of left-leaning, center, and right-leaning language, quotes, and framing detected across the article text."
  - **`bias-analysis`**: "The overall political framing label is determined by the dominant percentage and contextual confidence score. This represents an AI estimate, not objective editorial truth."
  - **`ai-summary`**: "Synthesized key takeaways generated by Google Gemini. Loaded terms highlight emotionally charged or rhetorically slanted keywords identified in the text."

### 5. `components/ui/bias-meter.tsx`
- Enhance `BiasMeter` with `useGSAP()` scoping:
  - Animate segment entrance on mount with `gsap.fromTo(element, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" })` with `transformOrigin: "left center"`.
  - Respect `prefers-reduced-motion: reduce` with `gsap.matchMedia()`.

### 6. `app/article/[id]/page.tsx`
- Integrate `<ReadingProgress />`.
- Replace inline Save/Share/More buttons with `<ArticleActionBar article={{ id: article.id, title: article.title, original_url: article.original_url, source_name: article.source.name, image_url: article.image_url }} />`.
- Replace static `Info` icons in Bias Distribution, Bias Analysis, and AI Summary sections with `<AiMetricExplainer type="..." />`.
- Preserve Clerk authentication, PostHog logging, and related articles rendering.

---

## Security requirements

- All interactive components run client-side without exposing API keys or service role secrets.
- Clipboard and Web Share operations must handle permission rejections and non-secure contexts safely with fallback messages.
- External links must maintain `rel="noopener noreferrer"` and `target="_blank"`.

---

## Acceptance criteria

1. Navigating down any article details page smoothly expands the top reading progress indicator linked to viewport scroll.
2. Clicking "Save" toggles bookmark state in `localStorage`, animates the bookmark icon with an elastic pop, updates button state to "Saved", and displays a toast notification.
3. Clicking "Share" triggers native sharing or copies the article link to clipboard with a toast notification.
4. Clicking the "More" button opens an accessible popover menu with copy and external source options.
5. Clicking or hovering the `Info` icons on Bias Distribution, Bias Analysis, and AI Summary opens educational explainer popovers.
6. The `BiasMeter` renders with smooth initial segment animations.
7. Users with `prefers-reduced-motion: reduce` experience instant, non-jarring transitions without unwanted layout shifts.
8. `npm run typecheck` and `npm run lint` pass with zero errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
```

---

## Exact manual test steps expected after implementation

1. Start dev server: `npm run dev`.
2. Open `http://localhost:3000` and click any article card to open its news details page.
3. Verify the fixed top reading progress bar expands smoothly from 0% to 100% as you scroll down the article body.
4. Click the "Save" button in the byline row:
   - Verify the icon scales with a spring bounce.
   - Verify the text changes to "Saved" with filled icon.
   - Verify a toast notification ("Saved to bookmarks") appears.
5. Click "Share":
   - Verify a toast ("Link copied to clipboard!") appears and clipboard contains the current article URL.
6. Click the "..." button:
   - Verify the options popover opens with "Copy Article Link" and "Open Original Source".
7. Click the `Info` icons on the "Bias Distribution", "Bias Analysis", and "AI Summary" widgets:
   - Verify the educational explainer popovers open with clear, styled guidance.
8. Refresh the page:
   - Verify the "Saved" state persists without any hydration errors in the browser console.
