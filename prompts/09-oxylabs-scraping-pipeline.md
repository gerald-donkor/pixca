# 09 — Oxylabs scraping pipeline

## Goal

Implement the manual scrape-to-insert pipeline (AGENTS.md sections 9–16): fetch active
source homepages live through the Oxylabs Web Scraper API, extract visible story-card
links, reject non-article URLs, dedupe against Supabase, scrape article detail pages,
validate and clean them, and insert only valid articles (append-only) — triggered by
`POST /api/scrape` behind the `x-PIXCA-admin-secret` header.

Scheduler (section 18), AI analysis (section 19), and pgvector (section 20) are **out of
scope**. The pipeline core must be written so the scheduler can reuse it later by
supplying homepage HTML from Oxylabs job results instead of a live fetch.

## Skills read

- `.agents/skills/oxylabs-web-scraper/SKILL.md` — auth (`OXY_WSA_USERNAME` / `OXY_WSA_PASSWORD`
  HTTP Basic), `POST https://realtime.oxylabs.io/v1/queries`, `source: "universal"` + `url`,
  `render: "html"` for JS-heavy pages, `user_agent_type`, `geo_location`, response shape
  `{ results: [{ content, status_code, url }] }`, error codes (400/401/403/429), and the
  guidance to set client timeouts near 180s for rendered Realtime requests.
- `.agents/skills/supabase/SKILL.md` — service-role client is server-only and bypasses RLS;
  never expose the service key to the browser; verify work with a real query after
  implementing; recover from errors instead of retrying blindly.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` — Next 16
  Route Handler conventions: `export async function POST(request: NextRequest)`, Web
  `Request`/`Response` APIs, `Response.json`, `params` is a Promise.

## Existing code inspected

- `supabase/schema.sql` — `articles` requires `source_id`, `original_url` (unique),
  `canonical_url` (unique, NOT NULL), `title`, `image_url` (NOT NULL), `published_at`
  (NOT NULL), `raw_text` (NOT NULL); `analyzed_at` nullable. `logs` has
  `level`/`message`/`context jsonb`.
- `supabase/seed.sql` — seeded sources: Reuters (`https://www.reuters.com`), NPR
  (`https://www.npr.org`), Fox News (`https://www.foxnews.com`), BBC News
  (`https://www.bbc.com/news`), The Guardian US (`https://www.theguardian.com/us`).
- `lib/supabase/admin.ts` — `getSupabaseAdminClient()`, `import "server-only"`, cached client.
- `lib/supabase/queries/articles.ts` — already has `findExistingOriginalUrls()` chunked at 15
  (the **URL existence check**), `insertArticle()` returning
  `{ ok: false, reason: "duplicate" }` on Postgres `23505`, and
  `getPendingAnalysisArticles()`. Reuse these; do not rewrite them.
- `lib/supabase/queries/sources.ts` — `getActiveSources()`, `getSourceById()`.
- `lib/supabase/queries/logs.ts` — `insertLog()`, `getRecentLogs()`.
- `lib/supabase/types.ts` — hand-written `Database` type; `ArticleInsert` matches the schema.
- `proxy.ts` — `clerkMiddleware()` only establishes auth context; it does not block
  `/api/*`. API protection is the admin secret, per section 15.
- `package.json` — **`cheerio` and `zod` are not installed yet**; both must be added.
- `app/page.tsx` / `app/article/[id]/page.tsx` — still on mock data. **Do not touch UI in
  this prompt.**

## Decisions and assumptions

1. **Oxylabs source**: `universal` with `url`, `render: "html"`, `user_agent_type:
   "desktop_chrome"`, `geo_location: "United States"`. Realtime endpoint (immediate
   response), client timeout 180s.
2. **Scope selection**: `POST /api/scrape` accepts an optional JSON body validated with Zod:
   `{ sourceIds?: string[], sourceNames?: string[], limitPerSource?: number }`. Missing/empty
   body ⇒ all active sources, `DEFAULT_ARTICLES_PER_SOURCE = 5` (section 16). `sourceNames`
   matches case-insensitively against `sources.name`. Unknown names/ids are reported in the
   response, not silently ignored.
3. **Sequential processing** — sources one at a time, detail pages one at a time with a small
   delay, to keep Oxylabs usage predictable and logs readable. No concurrency work.
4. **`canonical_url`** is NOT NULL in the schema; when a page has no `<link rel="canonical">`,
   fall back to the normalized original URL.
5. **Published date** parsing order: `<meta property="article:published_time">` →
   JSON-LD `datePublished` → `<meta name="date"|"pubdate"|"parsely-pub-date">` → `<time datetime>`.
   No date ⇒ reject (section 13).
6. **Image** parsing order: `og:image` → `twitter:image` → JSON-LD `image` → first
   `<article> img[src]` with an absolute URL. No image ⇒ reject.
7. **Logging**: console is primary (section 9 **run logging**), plus one `logs` row per run
   (`level: "info"` on success, `"error"` on failure) holding the summary object in `context`.
   Per-candidate noise stays on the console only.
8. **No run-id polling route** (section 16) — the summary is returned in the `POST` response.
9. `GET /api/sources` is included because section 8 requires showing available source names
   before choosing a scrape scope, and it is a listed read route in section 14.

## Files likely to change

New:
- `lib/config/limits.ts` — centralized limits/timeouts (per-source article limit, max
  candidates per homepage, min chars/paragraphs, request timeouts, inter-request delay).
- `lib/oxylabs/client.ts` — `server-only`; `fetchPageHtml(url)` via Realtime `universal`;
  Basic auth from env; timeout via `AbortSignal.timeout`; typed `OxylabsError` with status
  code mapping (400/401/403/429); one retry on 429/5xx/timeout.
- `lib/scraping/url.ts` — `normalizeUrl()` (absolutize, strip hash + tracking params, drop
  trailing slash, lowercase host), `isSameSourceHost()`.
- `lib/scraping/reject-list.ts` — the **non-article reject list** (section 9) as path/segment
  patterns, exported once and used by both homepage extraction and candidate filtering.
- `lib/scraping/homepage-links.ts` — Cheerio extraction of visible story-card links only
  (article/story card containers, headline anchors); skips nav/header/footer/aside/menu.
- `lib/scraping/candidate-filter.ts` — generic article-URL heuristics (date paths, long
  slugs, numeric IDs) plus per-source rules keyed by `sources.parser_strategy` or host for
  Reuters, NPR, Fox, BBC, Guardian; uncertain ⇒ reject.
- `lib/scraping/article-parser.ts` — Cheerio detail-page parsing: title, canonical, image,
  published date, paragraph extraction with one-large-paragraph splitting, and `raw_text`
  cleanup (scripts, styles, ads, newsletter/subscribe/related/most-viewed blocks, share
  text, nav labels, CSS/JS dumps).
- `lib/scraping/validate.ts` — the **article content gate**: returns
  `{ ok: true, article } | { ok: false, reason }` with a typed rejection-reason union.
- `lib/pipeline/types.ts` — `ScrapeRunSummary`, `SourceRunResult`, rejection-reason union.
- `lib/pipeline/scrape.ts` — `runScrapePipeline({ sources, limitPerSource, fetchHomepageHtml })`
  implementing the section 9 steps 1–9. Homepage HTML arrives through the injected
  `fetchHomepageHtml` so the scheduler can reuse this unchanged.
- `lib/pipeline/run-logger.ts` — console run logging + final summary + `logs` row.
- `lib/api/admin-secret.ts` — `requireAdminSecret(request)` reading `x-PIXCA-admin-secret`
  against `PIXCA_ADMIN_SECRET`; returns a `401` Response when missing/invalid.
- `app/api/scrape/route.ts` — thin `POST` handler: admin secret → Zod body → resolve sources
  → `runScrapePipeline` → JSON summary.
- `app/api/sources/route.ts` — thin `GET` handler returning active sources
  (`id`, `name`, `listing_url`, `is_active`).

Modified:
- `package.json` / `package-lock.json` — add `cheerio` and `zod` (pinned, lockfile committed).
- `.env.example` — add `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, `PIXCA_ADMIN_SECRET`.
- `lib/supabase/queries/articles.ts` — only if a helper is genuinely missing; prefer reuse.

## Implementation requirements

Follow AGENTS.md section 9's numbered scrape-to-insert pipeline exactly:

1. Load selected active sources from Supabase (all active by default) — never hardcode URLs.
2. Fetch each source's stored homepage URL live through Oxylabs. No crawling into sublinks.
3. Extract candidates from visible homepage story cards only (section 11).
4. Apply the **non-article reject list** before any detail scrape.
5. Normalize + dedupe candidates, then skip URLs already stored via the **URL existence
   check** (`findExistingOriginalUrls`, chunks of ≤15).
6. Scrape only candidates passing the section 12 URL check; stop at `limitPerSource` valid
   inserts per source.
7. Validate and clean each detail page against the **article content gate** (section 13):
   article-specific URL and title, one clear subject, meaningful body, image URL, published
   date. Body passes on ≥3 meaningful paragraphs **or** ≥900 meaningful characters with a
   clear title, image, date, and article-specific URL. Never reject solely because paragraph
   extraction returned one paragraph — split first.
8. Insert valid articles append-only. Never delete/replace/reset. Never save a homepage,
   listing, or category page.
9. Emit **run logging** during the run and the final summary object.

Additional:
- One source failing must not abort the run — log the source error and continue.
- `raw_text` must read like one article, not a page dump.
- Prefer fewer good articles over more bad ones.
- TypeScript throughout; no `any`; small functions; explicit types; typed pipeline results;
  `import "server-only"` at the top of every server-only module.
- No unrelated refactors, no UI changes, no scheduler/analysis code.

## Security requirements

- `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, and
  `PIXCA_ADMIN_SECRET` are server-only; never `NEXT_PUBLIC_*`, never imported by client
  components.
- All Oxylabs calls, scraping, parsing, and Supabase writes run server-side only.
- `POST /api/scrape` requires `x-PIXCA-admin-secret`; missing/invalid ⇒ `401` with no detail
  leakage. Never accept the secret from the query string. Compare in a way that does not
  short-circuit on the first differing byte.
- Error responses must not echo credentials, raw Oxylabs payloads, or stack traces.

## Acceptance criteria

- `POST /api/scrape` without the header returns `401`; with it, it runs and returns a summary.
- Summary object contains: `status`, `sourcesChecked`, `candidatesFound`,
  `candidatesRejected`, `duplicatesSkipped`, `detailPagesScraped`, `articlesInserted`,
  `articlesRejected`, `articlesFailed`, `durationMs`, and `rejectionReasons` grouped by count.
- Every inserted `articles` row has a non-empty `title`, `image_url`, `published_at`,
  `canonical_url`, and clean `raw_text`; `analyzed_at` is `null`.
- No homepage, category, topic, author, show, live, game, product, or corporate page is
  stored as an article.
- Re-running the same scrape inserts 0 new articles and reports them as duplicates skipped.
- Console shows the section 9 run-logging lines in order.
- `GET /api/sources` returns the active sources.
- No secret is reachable from browser code.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (new routes and server modules are added)

## Manual test steps

1. Add to `.env.local`:
   ```
   OXY_WSA_USERNAME=...
   OXY_WSA_PASSWORD=...
   PIXCA_ADMIN_SECRET=<any long random string>
   ```
2. Apply `supabase/schema.sql` and `supabase/seed.sql` in Supabase Dashboard → SQL Editor if
   not already applied.
3. `npm run dev` — **keep this terminal visible**, all scrape progress is logged there.
4. List available sources:
   ```bash
   curl -s http://localhost:3000/api/sources
   ```
5. Rejected without the secret (expect `401`):
   ```bash
   curl -i -X POST http://localhost:3000/api/scrape
   ```
6. Scrape 2 sources, 3 articles each:
   ```bash
   curl -s -X POST http://localhost:3000/api/scrape \
     -H 'Content-Type: application/json' \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{"sourceNames":["NPR","BBC News"],"limitPerSource":3}'
   ```
7. Scrape all active sources with defaults (all sources, 5 each):
   ```bash
   curl -s -X POST http://localhost:3000/api/scrape \
     -H 'Content-Type: application/json' \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{}'
   ```
8. Re-run step 6 — expect `articlesInserted: 0` and a non-zero `duplicatesSkipped`.
9. In Supabase → Table Editor, verify `articles` rows: real article URLs, real titles,
   populated `image_url` and `published_at`, `analyzed_at` null, and `raw_text` that reads
   like one article. Check the `logs` table for one summary row per run.
