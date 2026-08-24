# 35 — Dynamic SEO Metadata, OpenGraph Cards, Sitemap, and Robots Configuration

## Goal

Implement dynamic SEO metadata (`generateMetadata`) for article detail and curated feed pages, rich OpenGraph and Twitter card previews with AI analysis summaries, and dynamic `sitemap.ts` / `robots.ts` to ensure proper search engine indexing and social link sharing across PIXCA.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router metadata conventions, `generateMetadata`, `sitemap.ts`, and `robots.ts`.
- `.agents/skills/supabase/SKILL.md` — Database queries, service role access, and type safety.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit standards.

---

## Existing code inspected

- `app/layout.tsx` — Global root metadata configuration and site branding.
- `app/page.tsx` — Homepage data fetching and search param handling.
- `app/article/[id]/page.tsx` — Article details page and Supabase query integration (`getArticleWithAnalysis`).
- `app/saved/page.tsx` — Bookmarked articles client view.
- `app/blindspot/page.tsx` — Curated political framing divergence feed.
- `lib/supabase/queries/articles.ts` — Core query functions (`getPublishedArticles`, `getArticleWithAnalysis`).

---

## Decisions and assumptions

1. **Dynamic Metadata per Article (`/article/[id]`)**:
   - Use Next.js `generateMetadata({ params })` to fetch the specific article.
   - Set OpenGraph `og:title`, `og:description` (using the AI neutral summary, or falling back to title/deck), `og:image` (using the article `image_url`), `og:type` (`article`), and `twitter:card` (`summary_large_image`).
   - If the article is not found, fallback gracefully without throwing unhandled exceptions.
2. **Global & Feed Page Metadata**:
   - `app/page.tsx`, `app/saved/page.tsx`, and `app/blindspot/page.tsx` export descriptive static/dynamic metadata and canonical openGraph descriptions highlighting PIXCA's AI-balanced news mission.
3. **Dynamic Sitemap (`app/sitemap.ts`)**:
   - Generate sitemap entries for core static routes (`/`, `/saved`, `/blindspot`).
   - Query the most recent published articles (up to 100) from Supabase and include their `/article/{id}` URLs with `lastModified` matching `published_at` or `analyzed_at`.
   - Default domain fallback to `https://pixca.vercel.app` (or `process.env.NEXT_PUBLIC_APP_URL` if set).
4. **Standard Robots File (`app/robots.ts`)**:
   - Allow indexing for public news and feed routes.
   - Disallow internal action routes (`/api/`).
   - Reference the dynamic sitemap URL (`/sitemap.xml`).

---

## Files likely to change

- `app/article/[id]/page.tsx` [MODIFY] — Add `generateMetadata` export for dynamic article previews.
- `app/sitemap.ts` [NEW] — Dynamic sitemap route generating sitemap.xml.
- `app/robots.ts` [NEW] — Standard robots.txt definition.
- `app/blindspot/page.tsx` [MODIFY] — Add metadata export for Blindspot feed.
- `app/page.tsx` [MODIFY] — Enhance home portal OpenGraph and Twitter card metadata.

---

## Implementation requirements

1. **Article Detail Metadata**:
   - In `app/article/[id]/page.tsx`, export `generateMetadata` accepting `props: { params: Promise<{ id: string }> }`.
   - Resolve `params`, fetch the article using `getArticleWithAnalysis(id)`.
   - If found:
     - `title`: `${article.title} — Pixca News`
     - `description`: `article.analysis?.summary || "AI-powered news analysis and political framing breakdown."`
     - `openGraph`: title, description, url, siteName: "Pixca News", images: `[article.image_url]`, type: "article", publishedTime: `article.published_at`
     - `twitter`: card: "summary_large_image", title, description, images: `[article.image_url]`
   - If missing:
     - `title`: "Article Not Found — Pixca News"
2. **Sitemap (`app/sitemap.ts`)**:
   - Export default async function `sitemap()` returning `MetadataRoute.Sitemap`.
   - Fetch recent analyzed articles via `getPublishedArticles({ limit: 100, offset: 0 })`.
   - Map articles to sitemap items (`url`, `lastModified`, `changeFrequency: "hourly"`, `priority: 0.8`).
   - Add core static routes (`/`, `/saved`, `/blindspot`).
3. **Robots (`app/robots.ts`)**:
   - Export default function `robots()` returning `MetadataRoute.Robots`.
   - Rules: `userAgent: "*", allow: "/", disallow: ["/api/"]`.
   - Include `sitemap: "${baseUrl}/sitemap.xml"`.
4. **Blindspot Metadata**:
   - In `app/blindspot/page.tsx`, export descriptive `metadata: Metadata`.

---

## Security requirements

- Never expose secret keys in metadata.
- Ensure all Supabase queries in `sitemap.ts` and `generateMetadata` use safe server-only query functions.
- Disallow indexing of private backend endpoints (`/api/`) in `robots.ts`.

---

## Acceptance criteria

1. Article detail pages output valid OpenGraph and Twitter meta tags in `<head>` populated with article title, summary, and thumbnail.
2. `GET /sitemap.xml` returns valid XML indexing home, feed pages, and published articles.
3. `GET /robots.txt` returns standard crawler rules pointing to sitemap.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass cleanly with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run TypeScript check and ESLint:
   ```bash
   npm run typecheck && npm run lint
   ```
2. Verify production build:
   ```bash
   npm run build
   ```
3. Test sitemap and robots endpoints locally:
   ```bash
   curl -s "http://localhost:3000/sitemap.xml" | head -n 30
   curl -s "http://localhost:3000/robots.txt"
   ```
