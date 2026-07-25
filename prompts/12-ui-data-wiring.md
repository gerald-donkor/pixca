# 12 — UI data wiring (homepage + news details page)

## Goal

Replace every mock data array in the UI with real Supabase data, so the homepage
and the news details page display stored articles and their AI analysis
(AGENTS.md section 19 UI requirements).

Scope is UI wiring only:

- `app/page.tsx` renders analyzed articles from Supabase instead of the 12 mock
  `ARTICLES` objects, and the category pill bar renders active source names.
- `app/article/[id]/page.tsx` renders one real article + its stored analysis
  instead of the hard-coded Iran story, `RELATED_STORIES`, and the fabricated
  source-breakdown numbers.
- `components/ui/news-card.tsx` gains the optional props needed to show source,
  published date, sentiment, framing label, and confidence.

Out of scope: no new API routes, no pipeline changes, no scraping, no analysis,
no pgvector / Related Articles (that is section 20, prompt 13), no new visual
language.

## Skills read

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
  — `params` is a `Promise` in this Next version and must be awaited.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md`
  — `notFound()` for a missing article id.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`
  — docs prefer `await connection()` over `export const dynamic = 'force-dynamic'`
  to opt a route out of prerendering. `cacheComponents` is **not** enabled in
  `next.config.ts`, so a page with no request-time API would otherwise be
  prerendered at build time and serve a stale article list forever.
- `.agents/skills/supabase/SKILL.md` — query patterns; joined-table filter
  gotcha (AGENTS.md section 21).
- Clerk: the details page already calls `auth.protect()`; that stays unchanged.

## Existing code inspected

- `app/page.tsx` — mock `ARTICLES` (12), mock `CATEGORIES` (9), pill bar with
  chevron buttons, `Top News` heading, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`,
  each card wrapped in `<Link href={`/article/${id}`}>` with `hover:-translate-y-0.5`.
- `app/article/[id]/page.tsx` — takes no `params`; hard-coded headline, byline,
  hero image + caption, inline bias card (`12 sources`), 7 mock body paragraphs,
  `RELATED_STORIES` (6), newsletter block, and 3 sidebar widgets
  (Bias Analysis / AI Summary / Source Breakdown) plus the local
  `SidebarProgressBar` helper.
- `components/ui/news-card.tsx` — props `title, subtitle, category, location,
  timeAgo, readTime, imageUrl, variant, sourcesCount, bias`. Footer shows
  `{sourcesCount} sources` when set, else the clock/bookmark row. Uses `<img>`,
  not `next/image`.
- `components/ui/bias-meter.tsx` — `leftValue/centerValue/rightValue`,
  normalizes to a 100% total itself, `showLabels` toggles the 0/50/100 scale.
- `components/ui/chip.tsx` — a `<button>` with a trailing `Plus` icon.
- `lib/supabase/queries/articles.ts` — `getPublishedArticles({limit, offset})`
  (filters `analyzed_at is not null`, orders `published_at desc`) and
  `getArticleWithAnalysis(id)` already exist and return
  `ArticleWithSourceAndAnalysis = Article & { source: Source; analysis: ArticleAnalysis | null }`.
  Both are `server-only` and use the service-role client. No new query functions
  are needed.
- `lib/supabase/queries/sources.ts` — `getActiveSources()` already exists.
- `lib/supabase/types.ts` — `article_analyses` is declared `isOneToOne: true`
  and `supabase/schema.sql:77` has `article_id uuid not null unique`, so
  PostgREST returns `analysis` as a single object or `null`, not an array.
- `app/design-system/page.tsx:364` renders `NewsCard`, so existing props must
  keep working.
- `app/globals.css` — tokens `--bias-left #B42318`, `--bias-center #E5E7EB`,
  `--bias-right #1D4ED8`, `--text-primary`, `--text-secondary`, `--border`,
  `--surface`.

## Decisions and assumptions

Confirmed with the user before writing this prompt:

1. **Category pill bar → active source names.** Chips render
   `getActiveSources()` names, non-interactive for now (no category column and
   no filtering exists). The bar, chevron buttons, and styling stay as-is.
2. **Related Stories and Source Breakdown are removed.** Related Articles comes
   back in the pgvector prompt (section 20). Source Breakdown is deleted
   outright: an article has exactly one source, so "12 sources / 6 right / 4
   center" cannot be derived from stored data.

Further decisions:

3. **No fabricated values anywhere.** Every removed mock concept has no column
   behind it: `category`, `location`, `sourcesCount`, author byline, read time,
   image caption/credit. They are dropped rather than faked.
4. **Card metadata row** shows `source.name • formatted published date` in place
   of `category • location`, reusing the exact same markup, spacing, and
   `text-caption font-semibold text-[var(--text-secondary)]` styling.
5. **Card footer** shows sentiment label, AI-estimated framing label, and
   confidence when present, replacing `{sourcesCount} sources` at the same
   position and type scale.
6. **Direct-link to an unanalyzed article** renders the article (title, source,
   date, image, body) with an "Analysis pending" notice in place of the analysis
   blocks — not a 404. `notFound()` is only for an id that does not exist.
   Homepage links only ever point at analyzed articles.
7. **Freshness**: `await connection()` at the top of the homepage component
   before the Supabase reads. The details page is already request-time via
   `auth.protect()`, so it needs nothing.
8. **Non-functional decorative controls approved in prompts 02/03** (Save,
   Share, More, the pill-bar chevrons, the newsletter block, the card `Info`
   overlay button) stay untouched — removing them is a design change, not
   wiring. The two sidebar buttons that promised data-backed behavior
   ("How We Analyze Bias", "Provide Feedback") are removed along with the
   widgets' fake copy.
9. **`<img>` stays** — the file already uses it and `next.config.ts` allows all
   remote hostnames. Switching to `next/image` is an unrelated change.
10. **Homepage limit** is a new centralized constant, default 12, matching the
    approved 12-card grid. No pagination UI in this prompt (`offset` stays 0).
11. **Sentiment score / bias score** are shown as derived display values only;
    `bias_score` is not surfaced separately since the L/C/R percentages it is
    derived from are already displayed.

## Files likely to change

New:

- `lib/ui/format.ts` — presentation helpers, no server-only imports:
  - `formatArticleDate(iso: string): string` → e.g. `May 31, 2026`
  - `formatPercent(value: number): string` → `49%`
  - `formatConfidence(value: number): string` → `72%` from a 0–1 value
  - `titleCase(label: string): string` for `left` → `Left`, `positive` → `Positive`
  - `splitIntoParagraphs(rawText: string): string[]` — split on blank lines,
    fall back to single newlines, trim, drop empties
- `lib/ui/analysis-display.ts` — typed label→style maps:
  - `biasLabelColorClass(label: BiasLabel): string` using the existing
    `--bias-left` / `--bias-right` / zinc tokens (`center`/`mixed`/`unclear`
    → neutral zinc)
  - `sentimentLabelColorClass(label: SentimentLabel): string`
  - `strongestFramingPercentage(analysis)` → `{ label, percentage }` for the
    "Overall Bias" headline value

Changed:

- `components/ui/news-card.tsx` — add optional props only:
  `sourceName?: string`, `publishedLabel?: string`, `sentimentLabel?: SentimentLabel`,
  `framingLabel?: BiasLabel`, `confidence?: number`. Metadata row prefers
  `sourceName`/`publishedLabel` and falls back to `category`/`location`; footer
  prefers the analysis row and falls back to `sourcesCount`, then
  `timeAgo`/`readTime`. No existing prop is removed or renamed.
- `app/page.tsx` — async server component; delete `ARTICLES` and `CATEGORIES`.
- `app/article/[id]/page.tsx` — accept `params: Promise<{ id: string }>`; delete
  `RELATED_STORIES`, the Related Stories section, and the Source Breakdown
  widget; wire the rest.
- `lib/config/limits.ts` — add `HOMEPAGE_ARTICLES_LIMIT = 12` with a comment.

Not changed: `lib/supabase/queries/*`, `lib/supabase/types.ts`,
`supabase/schema.sql`, `components/ui/bias-meter.tsx`, `components/ui/chip.tsx`,
`app/design-system/page.tsx`, any API route, any pipeline module.

## Implementation requirements

### `app/page.tsx`

1. `export default async function HomePage()`; `await connection()` first.
2. Fetch in parallel with `Promise.all`: `getActiveSources()` and
   `getPublishedArticles({ limit: HOMEPAGE_ARTICLES_LIMIT, offset: 0 })`.
3. Pill bar: map sources to `<Chip key={source.id} label={source.name} … />`
   with the existing className. Render the bar only when there is at least one
   active source; keep the chevron buttons.
4. Grid: for each article render the existing `<Link href={`/article/${article.id}`}>`
   wrapper (same classes) around `<NewsCard variant="vertical" … />` with
   `title={article.title}`, `imageUrl={article.image_url}`,
   `sourceName={article.source.name}`,
   `publishedLabel={formatArticleDate(article.published_at)}`, and — when
   `article.analysis` is non-null — `bias`, `sentimentLabel`, `framingLabel`,
   `confidence`.
5. Empty state when no articles: keep the `Top News` heading and render a
   bordered card in the existing card style (`bg-white rounded-xl border
   border-[var(--border)] shadow-sm`) reading that no analyzed articles are
   available yet, with a short line explaining articles appear after scraping
   and analysis run. No mock filler.

### `app/article/[id]/page.tsx`

1. Signature `{ params }: { params: Promise<{ id: string }> }`; `await auth.protect()`
   then `const { id } = await params`.
2. `const article = await getArticleWithAnalysis(id)`; `if (!article) notFound()`.
3. Left column:
   - Metadata breadcrumb → `article.source.name` (drop the fake location half).
   - Headline → `article.title`.
   - Byline row → `article.source.name` + `formatArticleDate(article.published_at)`
     plus a link to `article.original_url` (`target="_blank" rel="noopener noreferrer"`,
     label "Read original"). Save/Share/More stay as they are.
   - Hero image → `article.image_url` with `alt={article.title}`; delete the
     hard-coded caption and photo credit block.
   - Inline bias card → header keeps `Bias Distribution` + `Info` icon; the
     right-hand `12 sources` becomes the AI-estimated framing label plus
     confidence; `BiasMeter` gets the analysis percentages. Render the whole
     card only when `article.analysis` exists.
   - Body → `splitIntoParagraphs(article.raw_text).map(…)` inside the existing
     `<article>` element with its current typography classes. Drop the styled
     pull-quote paragraph (no data identifies a quote).
   - Keep the newsletter block. Delete the Related Stories block and the now
     unused `NewsCard` import.
4. Sidebar (keep `SidebarProgressBar` and the widget shell styling):
   - **Bias Analysis** — "Overall Bias" value = `titleCase(label) + ' ' + formatPercent(percentage)`
     from `strongestFramingPercentage`, colored via `biasLabelColorClass`; the
     sub-line reads that this is AI-estimated framing, not objective truth
     (section 19), instead of "Based on 12 balanced sources"; three
     `SidebarProgressBar` rows fed by `left_percentage`, `center_percentage`,
     `right_percentage`; a confidence row showing `formatConfidence(confidence)`;
     a sentiment row showing `titleCase(sentiment_label)` colored via
     `sentimentLabelColorClass` with the score to two decimals; the hard-coded
     paragraph replaced by `framing_notes` (rendered only when non-null); drop
     the "How We Analyze Bias" button.
   - **AI Summary** — sub-header shows `formatArticleDate(analysis.created_at)`
     and `analysis.model` instead of "3 min read"; body is `analysis.summary`
     rendered as a paragraph (not fake bullets); `analysis.loaded_terms`
     rendered as a small wrapped list of loaded-term pills when the array is
     non-empty, with a `Loaded terms` label; footer italic line is
     `analysis.disclaimer`; drop the "Provide Feedback" button.
   - **Source Breakdown** — deleted entirely.
5. When `article.analysis` is `null`: skip the inline bias card and both sidebar
   widgets and render one "Analysis pending" card in the sidebar in the same
   widget style. The article title, source, date, image, and body still render.

### Code standards

- Explicit types, no `any`, no `as` casts to force the Supabase row types.
- `lib/ui/*` must stay free of `server-only` imports and of any Supabase,
  Oxylabs, or AI imports so the modules remain safe in either boundary.
- Keep both pages server components. No `"use client"`, no client-side
  fetching, no new dependencies.
- No unrelated refactors of the query, pipeline, or scraping layers.

## Security requirements

- Both pages read through the existing `server-only` service-role query
  functions; the service-role key never reaches the browser (section 21).
- No secret, env var, Oxylabs credential, Gemini key, or admin secret is read or
  rendered in page or component code.
- No scraping, analysis, model call, or pipeline mutation is triggered from the
  UI — the pages read stored data only (section 5).
- The details page keeps `auth.protect()`; the homepage stays public as before.
- `article.original_url` is rendered as an outbound link with
  `rel="noopener noreferrer"`.
- No `dangerouslySetInnerHTML`; `raw_text` is rendered as React text nodes.

## Acceptance criteria

1. No mock/hard-coded article, category, source, or analysis data remains in
   `app/page.tsx` or `app/article/[id]/page.tsx`.
2. The homepage lists up to `HOMEPAGE_ARTICLES_LIMIT` analyzed articles, newest
   `published_at` first, each linking to `/article/<uuid>`.
3. Each card shows title, source name, published date, image, sentiment label,
   AI-estimated framing label, L/C/R percentages, and confidence when available.
4. The pill bar shows active source names from Supabase.
5. The details page shows the real title, source, published date, hero image,
   body paragraphs from `raw_text`, summary, sentiment, L/C/R framing
   percentages, confidence, framing notes, loaded terms, disclaimer, and model.
6. Framing is labeled AI-estimated wherever it appears.
7. An unknown article id renders the 404; an existing but unanalyzed article
   renders the article plus an "Analysis pending" notice.
8. The homepage with zero analyzed articles renders the empty-state card, not a
   crash and not filler content.
9. Related Stories and Source Breakdown are gone; no fabricated source counts
   appear anywhere.
10. `app/design-system/page.tsx` still renders unchanged (existing `NewsCard`
    props preserved).
11. Existing layout, spacing, colors, typography, rounding, shadows, and
    responsive breakpoints are preserved; the pages must not scroll
    horizontally on mobile.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (pages, config-adjacent behavior, and server modules change)

Report exact output; do not claim a check passed without running it.

## Manual test steps

Prerequisite: at least one scraped and analyzed article. If the DB is empty,
first run (dev server in another terminal):

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "content-type: application/json" \
  -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
  -d '{"limitPerSource": 3}'

curl -X POST http://localhost:3000/api/analyze \
  -H "content-type: application/json" \
  -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
  -d '{}'
```

Watch the terminal running `npm run dev` — scrape and analysis progress is
logged there (section 17).

Then:

1. `npm run dev`.
2. Open `http://localhost:3000/`. Confirm the pill bar shows real source names,
   and each card shows a real headline, source, date, image, bias meter,
   sentiment, framing label, and confidence.
3. Click a card. Sign in if prompted (the details page is protected).
4. On `/article/<uuid>` confirm: headline, source, published date, "Read
   original" link opens the source article, hero image, body paragraphs that
   read like one article, Bias Distribution meter, Bias Analysis widget
   (overall framing + L/C/R bars + confidence + sentiment + framing notes),
   AI Summary widget (summary, loaded terms, model, generated date,
   disclaimer). Confirm no Related Stories and no Source Breakdown.
5. Visit `/article/00000000-0000-0000-0000-000000000000` → 404.
6. To check the pending path, delete one `article_analyses` row in the Supabase
   SQL editor and open that article's URL directly → article renders with the
   "Analysis pending" notice. Re-run `POST /api/analyze` to restore it.
7. Resize to ~375px wide on both pages → no horizontal scrolling, cards stack
   to one column, sidebar stacks below the article.
