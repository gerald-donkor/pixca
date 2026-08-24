# 43 — Dynamic OpenGraph Social Share Cards with ImageResponse

## Goal

Implement dynamic, high-resolution (1200×630) OpenGraph and Twitter social share card image generation using Next.js `ImageResponse` (`next/og`) for the home portal (`app/opengraph-image.tsx`), article analysis details pages (`app/article/[id]/opengraph-image.tsx`), and the Blindspot divergence feed (`app/blindspot/opengraph-image.tsx`), rendering branded layouts with article titles, source pills, AI sentiment tags, and visual Left/Center/Right political framing meters.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router dynamic image generation (`ImageResponse`), route segment configuration, and edge/node runtime rules.
- `.agents/skills/supabase/SKILL.md` — Safe server-side database querying using existing data access patterns.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `app/article/[id]/page.tsx` — Dynamic article page rendering, metadata generation (`generateMetadata`), and layout hierarchy.
- `app/page.tsx` — Homepage structure and metadata.
- `app/blindspot/page.tsx` — Blindspot feed structure and metadata.
- `lib/supabase/queries/articles.ts` — Server query functions (`getArticleWithAnalysis`, `getBlindspotArticles`).
- `lib/ui/analysis-display.ts` — Bias and sentiment color styling helpers.
- `lib/ui/format.ts` — Date and percentage formatting helpers.

---

## Decisions and assumptions

1. **Next.js Native `ImageResponse`**:
   - Use Next.js native `ImageResponse` from `next/og`.
   - Set standard social card image dimensions: `width: 1200, height: 630`.
   - Set `contentType: 'image/png'`.
   - Use Node.js runtime (`export const runtime = "nodejs"`) to ensure seamless compatibility with `getSupabaseAdminClient` and existing query functions.
2. **Visual Design & Typography**:
   - **Root Homepage (`app/opengraph-image.tsx`)**:
     - Modern dark/navy editorial theme `#0B0F19` with a subtle radial gradient.
     - Large bold PIXCA brand header with an accent dot and badge: "AI News Analysis & Media Bias Intelligence".
     - Feature highlights: "Real-time AI Sentiment", "Political Framing Distribution", "Multi-Source Clustering".
     - Clean bottom URL marker: `pixca.news` / domain.
   - **Article Details (`app/article/[id]/opengraph-image.tsx`)**:
     - Dynamic per-article card that reads the article and its AI analysis via `getArticleWithAnalysis(id)`.
     - Displays source name pill (e.g., "Reuters", "BBC News"), formatted publication date, and headline.
     - If AI analysis exists:
       - Displays AI Sentiment badge (`Positive`, `Neutral`, `Negative`) with color coding.
       - Displays visual 3-part horizontal bias distribution meter (Left % in blue/cyan, Center % in purple/gray, Right % in amber/red).
       - Displays neutral summary snippet or deck if space permits.
     - Fallback layout if article is missing or analysis is still pending.
   - **Blindspot Feed (`app/blindspot/opengraph-image.tsx`)**:
     - Branded editorial card highlighting "PIXCA Blindspot — Divergent Perspectives & Media Coverage Gaps".
     - Visual badge comparing side-by-side left vs. right framing divergence.
3. **Zero Client Runtime Overhead**:
   - Fully executed on the server on request or statically generated at build/cache time by Next.js.
   - Requires no client JavaScript, CSS bundles, or browser DOM.

---

## Files likely to change

- `app/opengraph-image.tsx` [NEW] — Dynamic root OG image generator for `/`.
- `app/article/[id]/opengraph-image.tsx` [NEW] — Dynamic article detail OG image generator for `/article/[id]`.
- `app/blindspot/opengraph-image.tsx` [NEW] — Dynamic Blindspot feed OG image generator for `/blindspot`.

---

## Implementation requirements

1. **`app/opengraph-image.tsx`**:
   - Export `runtime = 'nodejs'`, `size = { width: 1200, height: 630 }`, `contentType = 'image/png'`, `alt = 'PIXCA — AI-Powered News Analysis'`.
   - Render a high-impact 1200×630 flexbox layout with PIXCA branding, tagline, and feature pills.
2. **`app/article/[id]/opengraph-image.tsx`**:
   - Export `runtime = 'nodejs'`, `size = { width: 1200, height: 630 }`, `contentType = 'image/png'`, `alt = 'Article Analysis Preview'`.
   - Accept `props: { params: Promise<{ id: string }> }`.
   - Resolve `params.id` and fetch article via `getArticleWithAnalysis(id)`.
   - Handle invalid ID / missing article gracefully with an elegant fallback card.
   - Render article title, source pill, sentiment badge, and political bias percentage distribution bar (Left / Center / Right) using Satori-compatible inline styles.
3. **`app/blindspot/opengraph-image.tsx`**:
   - Export `runtime = 'nodejs'`, `size = { width: 1200, height: 630 }`, `contentType = 'image/png'`, `alt = 'PIXCA Blindspot Feed'`.
   - Render a custom graphic emphasizing coverage balance and media blindspots.

---

## Security requirements

- Data fetching in OG image generators must use existing server-only database functions.
- Avoid passing sensitive credentials or database connection strings to the rendering context.
- Sanitize rendered text strings to prevent rendering overflows.

---

## Acceptance criteria

1. Next.js automatically associates generated images with the respective routes (`/opengraph-image`, `/article/[id]/opengraph-image`, `/blindspot/opengraph-image`).
2. Fetching `/opengraph-image` returns a 200 OK `image/png` with standard 1200×630 dimensions.
3. Fetching `/article/<id>/opengraph-image` with a valid article ID generates a customized card with the article title, source name, and AI bias meter.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run verification checks:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
2. Start dev server and test OG endpoints with curl / browser:
   ```bash
   curl -I http://localhost:3000/opengraph-image
   curl -I http://localhost:3000/blindspot/opengraph-image
   ```
3. Test article OG endpoint using an existing analyzed article ID:
   ```bash
   curl -I http://localhost:3000/article/<article-id>/opengraph-image
   ```
