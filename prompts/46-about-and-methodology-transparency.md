# 46 — About and Methodology Transparency

## Goal

Implement a comprehensive, beautifully styled About & AI Methodology Transparency page (`/about`) with dynamic OpenGraph card generation (`/about/opengraph-image.tsx`), sitemap inclusion, and updated footer navigation links, detailing Pixca's multi-source scraping pipeline, Google Gemini AI sentiment and political framing formulas, confidence calibration, pgvector embeddings, and journalistic neutrality disclaimer.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router Server Component patterns, metadata generation, and ImageResponse dynamic OG card conventions.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — Client UI component patterns and styling standards.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `components/layout/footer.tsx` — Global footer navigation links and placeholder text.
- `app/sitemap.ts` — Dynamic sitemap generator for static and dynamic article routes.
- `app/blindspot/page.tsx` & `app/blindspot/opengraph-image.tsx` — Architectural and visual reference for custom feed pages and OG cards.
- `lib/supabase/types.ts` — Database analysis types (`BiasLabel`, `SentimentLabel`, `ArticleAnalysis`).
- `AGENTS.md` — Section 19 (AI analysis and UI framing), Section 20 (pgvector and related articles).

---

## Decisions and assumptions

1. **Page Structure & Visual Hierarchy (`app/about/page.tsx`)**:
   - Built as an SSR Server Component compatible with Next.js dynamic routing and theme CSS variables.
   - Header Hero: Mission statement, "Balanced News Powered by AI", and core value propositions.
   - Interactive Architecture & Pipeline Flow:
     - 1. **Multi-Source Scraping**: Stored homepage entry points via Oxylabs, candidate filtering, deduplication.
     - 2. **AI Article Analysis**: Gemini 3.6 Flash structured evaluation, neutral summarization, loaded terms extraction.
     - 3. **Sentiment & Political Framing Calibration**: Left/Center/Right percentages summing to 100%, derived bias score formula `(Right% - Left%) / 100`, 5-label classification (`left`, `center`, `right`, `mixed`, `unclear`).
     - 4. **pgvector Semantic Similarity**: `gemini-embedding-001` 1536-dimensional cosine distance matching for contextual cross-source reading.
   - AI Disclaimer & Transparency: Clear articulation that political framing scores are AI-estimated perspectives based strictly on article textual framing rather than objective truth or publisher identity.
2. **Dynamic OpenGraph Social Card (`app/about/opengraph-image.tsx`)**:
   - Use Next.js `ImageResponse` with `@vercel/og` compatible styling.
   - Branded typography, dark gradient backdrop, and clear visual badge highlighting "Methodology & AI Intelligence".
3. **Footer Navigation Updates (`components/layout/footer.tsx`)**:
   - Connect "About" to `/about`.
   - Ensure "System Status" links to `/logs`.
   - Update quick links and copyright year.
4. **Sitemap Integration (`app/sitemap.ts`)**:
   - Include `{ url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 }`.

---

## Files likely to change

- `app/about/page.tsx` [NEW] — About & AI Methodology Transparency page.
- `app/about/opengraph-image.tsx` [NEW] — Dynamic OG card for `/about`.
- `components/layout/footer.tsx` [MODIFY] — Connect footer navigation to `/about`.
- `app/sitemap.ts` [MODIFY] — Add `/about` route to static sitemap entries.

---

## Implementation requirements

1. **`app/about/page.tsx`**:
   - Define comprehensive `metadata` (title, description, openGraph, twitter).
   - Render responsive sections:
     - Hero header with badge and overview.
     - 4-pillar methodology breakdown (Scraping, AI Analysis, Framing Math, Vector Embeddings).
     - Bias & Sentiment Matrix reference table / metric cards.
     - Neutrality & Editorial Ethics disclaimer.
     - Quick navigation CTAs to Top Stories (`/`), Blindspot Feed (`/blindspot`), and System Status (`/logs`).
2. **`app/about/opengraph-image.tsx`**:
   - Standard 1200x630 `ImageResponse` with SVG icons and Pixca branding.
3. **`components/layout/footer.tsx`**:
   - Convert plain `<li>About</li>` into `<Link href="/about">About</Link>`.
   - Verify all links have accessible hover states and semantic markup.
4. **`app/sitemap.ts`**:
   - Add `/about` with `daily` change frequency and `0.8` priority.

---

## Security requirements

- Server-side static/deterministic rendering with zero secrets exposed.
- Strict Next.js App Router metadata standards.

---

## Acceptance criteria

1. Navigating to `/about` displays the full methodology and transparency documentation.
2. `/about/opengraph-image` generates a crisp, branded 1200x630 social preview image.
3. Footer "About" button cleanly navigates to `/about`.
4. `GET /sitemap.xml` includes the `/about` URL.
5. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

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
2. Test About page and OG card endpoint:
   ```bash
   curl -s -I http://localhost:3000/about
   curl -s -I http://localhost:3000/about/opengraph-image
   ```
3. Verify sitemap entry:
   ```bash
   curl -s http://localhost:3000/sitemap.xml | grep "/about"
   ```
