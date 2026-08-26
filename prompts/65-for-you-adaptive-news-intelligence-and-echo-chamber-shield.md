# 65 — For You Adaptive News Intelligence & Echo-Chamber Shield

## Goal

Upgrade the **"For You" Personalized News Feed** ([`app/for-you/page.tsx`](file:///home/dg/Projects/nextjs/pixca/app/for-you/page.tsx)) into an interactive **Adaptive News Intelligence & Echo-Chamber Shield**:
1. **Adaptive Reading Affinity Intelligence Profile**: Compute and present the user's reading affinity metrics (Favorite Sources, Perspective Bias Lean, Echo-Chamber Vulnerability Index, and Reading Breadth) with animated GSAP gauges and insight cards.
2. **Interactive Echo-Chamber Shield Tuning Controls**: Provide 4 distinct curation modes ("Balanced Discovery", "Echo-Chamber Shield", "Deep Focus", and "Centrist Anchor") allowing readers to adjust algorithmic recommendations dynamically.
3. **Smart Topic & Keyword Affinity Clustering**: Extract salient topic keywords from the user's bookmarked articles and match against the available news pool to surface stories matching genuine interest areas.
4. **Rich Bookmark Metadata Integration**: Fully utilize the enriched metadata in `useBookmarks` (`bias_label`, `left_percentage`, `center_percentage`, `right_percentage`, `sentiment_label`) without requiring articles to be present in the recent published window.
5. **GSAP Micro-Interactions & Fluid Animations**: Implement 60fps card grid reordering, tuning mode transitions, and metric gauge reveals using `@gsap/react` `useGSAP()` and `gsap.matchMedia()` adhering strictly to `prefers-reduced-motion`.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js client boundaries, dynamic route conventions, and component patterns.
- `.agents/skills/gsap-core/SKILL.md` — Tweens, easings, `matchMedia`, and defaults.
- `.agents/skills/gsap-react/SKILL.md` — Scoped `@gsap/react` `useGSAP()` hook for React 19 safety and cleanup.
- `.agents/skills/gsap-performance/SKILL.md` — Compositor transforms (`autoAlpha`, `scale`, `x/y`), layout-shift elimination, and reduced motion.
- `.agents/skills/supabase/SKILL.md` — Query patterns and article data typing.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review dispatch workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit messages.

---

## Existing code inspected

- `app/for-you/page.tsx` — Server component for the For You page with metadata and article fetching.
- `components/ui/for-you-feed.tsx` — Client component managing bookmarks, affinities, tabs, and news cards.
- `hooks/use-bookmarks.ts` — LocalStorage bookmark state management with rich analysis fields.
- `components/ui/saved-diet-meter.tsx` — Reference implementation for animated perspective meters and insight cards.
- `components/ui/blindspot-divergence-card.tsx` — Reference implementation for keyword extraction and topic matching.
- `components/ui/news-card.tsx` — Standard news card component.

---

## Decisions and assumptions

1. **Privacy-First Client Processing**:
   - All user affinity calculations, keyword extractions, and scoring computations remain strictly client-side via `useBookmarks()`. No user browsing data or PII is sent to external servers or logged.
2. **Algorithmic Tuning Modes (`components/ui/for-you-tuning-controls.tsx`)**:
   - **Balanced Discovery (Default)**: Combines favorite source affinity (30%), keyword topic relevance (35%), and a centrist/balance baseline (35%).
   - **Echo-Chamber Shield**: Prioritizes articles offering counter-perspectives to the user's dominant political framing (50%), high factual confidence, and diverse sources (50%).
   - **Deep Focus**: Maximizes matches against the user's top bookmarked sources (50%) and extracted topic keywords (50%).
   - **Centrist Anchor**: Filters and ranks strictly for articles with high `center_percentage` (≥ 40%), neutral sentiment, and balanced multi-angle framing.
3. **Adaptive Reading Profile (`components/ui/for-you-affinity-summary.tsx`)**:
   - Visual dashboard header rendered when `bookmarks.length > 0`:
     - **Dominant Lean & Perspective Balance**: Proportional bar showing Left / Center / Right distribution of saved reading.
     - **Echo-Chamber Shield Status**: Gauge rating the user's perspective diversity (e.g. "High Diversity / Resilient", "Moderate", "High Echo-Chamber Risk").
     - **Top Topic Interests**: Extracted high-frequency keyword badges from saved articles.
     - **Source Breadth**: Count of distinct publishers engaged with.
4. **Keyword Topic Extraction**:
   - Strip common stopwords and extract significant unigrams/bigrams from saved article titles. Score candidate articles based on keyword overlap with bookmark titles.
5. **Interactive Onboarding State**:
   - When no bookmarks exist, provide an engaging "Welcome to Your News Intelligence Feed" with sample topic filters (e.g. "Global Geopolitics", "Economy & Markets", "Technology & AI", "Climate & Energy") to immediately explore balanced reporting before saving personal bookmarks.

---

## Files likely to change

- `components/ui/for-you-affinity-summary.tsx` [NEW] — Client component for adaptive reading profile, perspective balance, and echo-chamber resilience gauge.
- `components/ui/for-you-tuning-controls.tsx` [NEW] — Interactive tuning controls bar for the 4 curation modes with instant feedback.
- `components/ui/for-you-feed.tsx` [MODIFY] — Upgraded feed logic with rich bookmark metadata, keyword clustering, mode scoring, and GSAP animations.
- `app/for-you/page.tsx` [MODIFY] — Increased fetch pool (`limit: 80`) for deeper recommendation pool and refined hero banner copy.

---

## Implementation requirements

1. **Create `components/ui/for-you-affinity-summary.tsx`**:
   - Calculate user statistics from `bookmarks`:
     - Left / Center / Right percentages.
     - Dominant bias label.
     - Distinct sources count.
     - Top extracted topic keywords (up to 4 keywords).
     - Echo-chamber resilience score (0-100 based on entropy of perspective distribution).
   - Render animated spectrum bar and metric chips with GSAP `useGSAP()` and `gsap.matchMedia()`.
2. **Create `components/ui/for-you-tuning-controls.tsx`**:
   - Render segmented control or buttons for the 4 tuning modes:
     - "Balanced Discovery" (Sparkles icon)
     - "Echo-Chamber Shield" (ShieldAlert / Compass icon)
     - "Deep Focus" (Target / Bookmark icon)
     - "Centrist Anchor" (Scale icon)
   - Include active state badge and concise mode explanation tooltip/caption.
3. **Upgrade `components/ui/for-you-feed.tsx`**:
   - Compute topic keyword sets from bookmarks.
   - Score each article in `initialArticles` based on active tuning mode:
     - Topic match score (0-1)
     - Source match score (0-1)
     - Perspective alignment or counter-perspective weight (0-1)
     - Confidence score (0-1)
   - Filter out already bookmarked articles or indicate "In Your Library".
   - Staggered GSAP reveal on mode change (`autoAlpha: 0, y: 15, stagger: 0.05`).
   - First-time visitor onboarding view with interactive sample topic pills.
4. **Update `app/for-you/page.tsx`**:
   - Fetch up to 80 published articles to provide rich diversity for scoring.
5. **Verification**:
   - Run `npm run typecheck`, `npm run lint`, and `npm run build`.

---

## Security requirements

- All affinity computations remain entirely client-side.
- Zero tracking scripts or external API calls for user preferences.
- Safe string sanitization and regex escaping for keyword matching.

---

## Acceptance criteria

1. Navigating to `/for-you` with bookmarked articles displays the **Adaptive Reading Affinity Profile** with animated perspective distributions and echo-chamber resilience rating.
2. Selecting different tuning modes ("Balanced Discovery", "Echo-Chamber Shield", "Deep Focus", "Centrist Anchor") dynamically updates and re-ranks the news feed with fluid GSAP card animations.
3. Topic keywords extracted from saved articles surface relevant thematic stories in "Deep Focus" and "Balanced Discovery".
4. "Echo-Chamber Shield" proactively surfaces counter-framing articles when a user has a dominant political bias.
5. "Centrist Anchor" filters for high-confidence centrist and multi-angle articles.
6. First-time visitors without bookmarks see a clean onboarding experience with interactive discovery pills.
7. `npm run typecheck`, `npm run lint`, and `npm run build` all pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Manual test steps expected after implementation

1. Navigate to `http://localhost:3000/`.
2. Bookmark 2-3 articles from specific sources (e.g. BBC, Reuters, Fox News) with diverse perspectives.
3. Navigate to `http://localhost:3000/for-you`.
4. Verify the **Adaptive Reading Affinity Profile** appears at the top, showing accurate dominant bias, source count, and top topic tags.
5. Click **"Echo-Chamber Shield"** and verify that stories with counter-perspectives or divergent framing are prioritized.
6. Click **"Centrist Anchor"** and verify that highly balanced, centrist articles are displayed.
7. Click **"Deep Focus"** and verify stories from favorite sources or matching topic keywords are surfaced.
8. Clear bookmarks and verify the onboarding discovery mode renders gracefully.
