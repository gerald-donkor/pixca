# 44 — RSS and Atom News Feed Syndication

## Goal

Implement standards-compliant RSS 2.0 (`/rss.xml`) and Atom 1.0 (`/feed.xml`) feeds that syndicate the latest analyzed news articles with their AI sentiment, political framing distribution percentages, and source attribution, complete with feed auto-discovery links in the root layout.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router route handlers, XML response handling, and route caching headers.
- `.agents/skills/supabase/SKILL.md` — Safe server-side database querying using existing data access patterns.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `lib/supabase/queries/articles.ts` — Server query functions (`getPublishedArticles`).
- `app/layout.tsx` — Root layout metadata and `<head>` structure.
- `lib/supabase/types.ts` — TypeScript types for Article, Source, and ArticleAnalysis.

---

## Decisions and assumptions

1. **Feed Formats**:
   - `/rss.xml` returns valid RSS 2.0 XML with custom `xmlns:pixca` and `xmlns:media` extensions.
   - `/feed.xml` returns valid Atom 1.0 XML with custom `xmlns:pixca` extensions.
2. **Metadata & Auto-discovery**:
   - Update `metadata.alternates.types` in `app/layout.tsx` to automatically emit feed `<link>` tags in `<head>`.
3. **Data Integrity & Escaping**:
   - Proper XML escaping / CDATA wrapping for titles, summaries, and source names to prevent XML parsing errors.
   - Clean RFC 822 / RFC 2822 dates for RSS 2.0 (`toUTCString()`) and ISO 8601 dates for Atom 1.0 (`toISOString()`).
4. **Caching & Performance**:
   - Set HTTP `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` headers on both feed routes.
   - Set `export const runtime = "nodejs"`.

---

## Files likely to change

- `app/rss.xml/route.ts` [NEW] — RSS 2.0 XML route handler.
- `app/feed.xml/route.ts` [NEW] — Atom 1.0 XML route handler.
- `app/layout.tsx` [MODIFY] — Add RSS and Atom feed alternates to metadata.

---

## Implementation requirements

1. **`app/rss.xml/route.ts`**:
   - Export `GET` handler.
   - Fetch up to 50 latest analyzed articles via `getPublishedArticles({ limit: 50, offset: 0 })`.
   - Build RSS 2.0 XML string with channel metadata (title, description, link, language, lastBuildDate, atom:link).
   - Format each article as an `<item>` containing title, link, guid, pubDate, author (source name), description (AI summary or snippet), enclosure / media:content (article image), and custom `pixca:*` framing tags (`biasLabel`, `biasScore`, `sentimentLabel`, `sentimentScore`, `leftPercentage`, `centerPercentage`, `rightPercentage`, `confidence`).
   - Return `Response` with status 200, `Content-Type: application/rss+xml; charset=utf-8`, and cache headers.
2. **`app/feed.xml/route.ts`**:
   - Export `GET` handler.
   - Fetch up to 50 latest analyzed articles via `getPublishedArticles({ limit: 50, offset: 0 })`.
   - Build Atom 1.0 XML string with feed metadata (id, title, subtitle, link, updated).
   - Format each article as an `<entry>` containing id, title, link, published, updated, author, summary, and `pixca:*` tags.
   - Return `Response` with status 200, `Content-Type: application/atom+xml; charset=utf-8`, and cache headers.
3. **`app/layout.tsx`**:
   - Add `alternates: { types: { 'application/rss+xml': '/rss.xml', 'application/atom+xml': '/feed.xml' } }` to `metadata`.

---

## Security requirements

- Feeds must only syndicate already-published and analyzed articles via safe server-side queries.
- Sanitize XML content strings against CDATA injection or malformed XML control characters.
- Zero server credentials or sensitive environment variables exposed in the feed XML.

---

## Acceptance criteria

1. Fetching `GET /rss.xml` returns 200 OK with `Content-Type: application/rss+xml; charset=utf-8` and well-formed RSS 2.0 XML.
2. Fetching `GET /feed.xml` returns 200 OK with `Content-Type: application/atom+xml; charset=utf-8` and well-formed Atom 1.0 XML.
3. Both feeds include source names, article titles, permalinks, publication dates, and AI analysis framing/sentiment scores when available.
4. Root HTML `<head>` includes `<link rel="alternate" type="application/rss+xml" ...>` and `<link rel="alternate" type="application/atom+xml" ...>`.
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
2. Test RSS 2.0 feed endpoint:
   ```bash
   curl -s -I http://localhost:3000/rss.xml
   curl -s http://localhost:3000/rss.xml | head -n 30
   ```
3. Test Atom feed endpoint:
   ```bash
   curl -s -I http://localhost:3000/feed.xml
   curl -s http://localhost:3000/feed.xml | head -n 30
   ```
