# 13 — pgvector embeddings and Related Articles

## Goal

Implement AGENTS.md section 20:

1. Enable pgvector in Supabase and add `article_analyses.embedding vector(1536)` with an IVFFlat cosine index.
2. Extend the AI analysis pipeline so every analyzed article also gets a Gemini embedding (`gemini-embedding-001`, `outputDimensionality: 1536`), saved to `article_analyses.embedding`. `analyzed_at` is set only after both analysis and embedding are saved.
3. Backfill: analyses that exist but have `embedding IS NULL` are picked up on the next run and embedded **without** re-running the full analysis.
4. Add `getRelatedArticles(articleId, embedding)` to `lib/supabase/queries/articles.ts` (service-role client, cosine distance `<=>`, limit 5).
5. Show a Related Articles section on the news details page. Hide it when the current article has no embedding or has no related results.

## Skills read

- `.claude/skills/supabase/SKILL.md` — imperative schema workflow (this project applies SQL by hand via Dashboard → SQL Editor; no CLI/MCP available), RLS on every `public` table, `SECURITY DEFINER`/`public` function exposure warning, service-role key stays server-only.
- Package docs bundled with the installed versions (`ai@7.0.37`, `@ai-sdk/google@4.0.24`) instead of memory:
  - `node_modules/@ai-sdk/google/docs/15-google.mdx` — `google.embedding(modelId)`, `providerOptions.google.outputDimensionality`, `taskType`; `gemini-embedding-001` defaults to 3072 dimensions with custom dimensions supported.
  - `node_modules/ai/dist/index.d.ts` — `embed({ model, value, providerOptions, maxRetries, abortSignal })` returns `{ embedding: number[] }`.
  - `node_modules/@ai-sdk/google/dist/index.d.ts` — `google.embedding(): EmbeddingModelV4` confirmed present.

## Existing code inspected

- `supabase/schema.sql` — six tables, RLS enabled with zero policies (service-role only), and an explicit note that pgvector is added later by this section.
- `lib/supabase/types.ts` — hand-written `Database` type; `Functions: Record<string, never>` today.
- `lib/supabase/queries/articles.ts` — `getPublishedArticles`, `getArticleWithAnalysis` (both `select("*, source:sources(*), analysis:article_analyses(*)")`), `getPendingAnalysisArticles` (section 19 LEFT JOIN pending check, ids first then full rows).
- `lib/supabase/queries/analyses.ts` — `insertArticleAnalysis`, `markArticleAnalyzed`.
- `lib/pipeline/analysis.ts` — drain loop, `processBatch`, `analyzeOne` (insert analysis → `markArticleAnalyzed`), `recordFailure`.
- `lib/pipeline/types.ts` — `AnalysisItemResult`, `AnalysisRunSummary`.
- `lib/pipeline/analysis-run-logger.ts` — `analysisLog.*`, `persistAnalysisRunSummary`.
- `lib/ai/analyze-article.ts` — single-article Gemini call, Zod re-parse, returns `ArticleAnalysisInsert`.
- `lib/config/ai.ts`, `lib/config/limits.ts` — centralized model ID and limits.
- `app/article/[id]/page.tsx` — two-column details page (`1fr_350px`), left column ends with the newsletter block.
- `app/page.tsx`, `components/ui/news-card.tsx`, `lib/ui/analysis-display.ts`, `lib/ui/format.ts` — homepage card pattern: `<Link href={/article/${id}}>` wrapping `<NewsCard variant="vertical" ... />` with `sourceName`, `publishedLabel`, `sentimentLabel`, `framingLabel`, `confidence`, `bias`.
- `app/api/analyze/route.ts` — thin handler, admin secret, `maxDuration = 300`.

## Decisions and assumptions

1. **Cosine ordering needs an RPC.** supabase-js/PostgREST cannot `order by embedding <=> $1`. Add a Postgres function `public.match_related_articles(p_article_id uuid, p_embedding vector(1536), p_match_count int)` and call it with `.rpc()`. It is `language sql stable security invoker set search_path = public, extensions`, and `EXECUTE` is revoked from `public`/`anon`/`authenticated` so only `service_role` can call it (skill: functions in `public` are callable by every role by default).
2. **Vector wire format.** PostgREST returns a `vector` column as its text literal (`"[0.1,0.2,...]"`), and accepts the same literal on write. So: `Row.embedding: string | null`, `Insert.embedding?: number[] | string | null`, and a small `toVectorLiteral()` helper normalizes `number[] | string` before the RPC call. No `any`.
3. **Payload hygiene.** `select("... analysis:article_analyses(*)")` would now drag a 1536-float vector into every homepage card. Introduce an explicit `ARTICLE_ANALYSIS_COLUMNS` list that excludes `embedding` and use it in `getPublishedArticles`; `getArticleWithAnalysis` uses the same list **plus** `embedding`, so the details page keeps a single query.
4. **Backfill without re-analysis** (section 20 requirement). `getPendingAnalysisArticles` returns each item with a mode:
   - `analyze` — no `article_analyses` row (existing behaviour).
   - `embed_only` — analysis row exists with `embedding IS NULL`; carries `analysisId` and skips the Gemini analysis call entirely.
   Detecting `embed_only` must not pull vectors over the wire, so it uses two vector-free queries instead of one: the existing id pass (`select("id, analysis:article_analyses(id)")`) yields the `analyze` set, and a second query on `article_analyses` (`select("id, article_id").is("embedding", null)`) yields the `embed_only` set. The two are merged, ordered oldest-first, and sliced to `limit`.
5. **Partial-failure semantics.** If analysis succeeds but embedding fails, the analysis row is still inserted (with `embedding` null) and `analyzed_at` is **not** set — the Gemini analysis call is not wasted, and the next run finishes the job through the `embed_only` path. Failure reason `embedding_error`.
6. **Embedding input.** Title + summary + article text, truncated to `MAX_EMBEDDING_INPUT_CHARACTERS`. `taskType: "SEMANTIC_SIMILARITY"` (docs list it as the text-similarity task type; this is a similarity feature, not retrieval). Truncating 3072 → 1536 dimensions does not affect cosine ranking, so no re-normalisation step.
7. **No re-embedding migration.** `outputDimensionality: 1536` keeps the `vector(1536)` column and IVFFlat index as specified in section 20 — no schema change later.
8. **UI placement.** Related Articles goes at the end of the details page left column, below the newsletter block, as a 1/2-column grid of vertical `NewsCard`s wrapped in `Link`. No new visual language: same border/radius/shadow tokens and the same card props the homepage already passes. Similarity score is not displayed.
9. **IVFFlat on a small table.** `lists = 100` per the pgvector guidance for small datasets; the index is only an approximation aid and the row count here is small, so correctness does not depend on it. Noted in `schema.sql` that the index should be rebuilt if the table grows by an order of magnitude.
10. Section 20 says the details page shows "up to 5" — `RELATED_ARTICLES_LIMIT = 5` in `lib/config/limits.ts`.

## Files likely to change

**Schema / types**
- `supabase/schema.sql` — new section 7: pgvector extension note, `alter table ... add column embedding`, IVFFlat index, `match_related_articles` function + grants.
- `lib/supabase/types.ts` — `article_analyses` Row/Insert `embedding`; `Functions.match_related_articles` Args/Returns; `RelatedArticleRow` export.

**AI / pipeline**
- `lib/config/ai.ts` — `EMBEDDING_MODEL_ID`, `EMBEDDING_DIMENSIONS`.
- `lib/config/limits.ts` — `MAX_EMBEDDING_INPUT_CHARACTERS`, `RELATED_ARTICLES_LIMIT`.
- `lib/ai/embed-article.ts` (new) — `embedArticle()` returning `{ ok: true; embedding: number[] } | { ok: false; message: string }`.
- `lib/pipeline/analysis.ts` — embedding step, `embed_only` branch, new counters.
- `lib/pipeline/types.ts` — `articlesEmbedded` on the summary; `"embedded"` item status.
- `lib/pipeline/analysis-run-logger.ts` — `articleEmbedded`, embed-only progress lines, summary line update.
- `lib/supabase/queries/analyses.ts` — `updateAnalysisEmbedding(analysisId, embedding)`.
- `lib/supabase/queries/articles.ts` — `ARTICLE_ANALYSIS_COLUMNS`, mode-aware `getPendingAnalysisArticles`, `getRelatedArticles(articleId, embedding)`.

**UI**
- `components/ui/related-articles.tsx` (new) — presentational section component.
- `app/article/[id]/page.tsx` — fetch related articles when `analysis.embedding` is present and render the section.

Not touched: scraping, Oxylabs, cron route (it calls `runAnalysisPipeline` and inherits the change), auth, `/api/analyze` request shape.

## Implementation requirements

### 1. SQL (hand-applied via Dashboard → SQL Editor, mirrored into `supabase/schema.sql`)

```sql
-- Enable pgvector first: Dashboard -> Database -> Extensions -> "vector".
-- (Supabase installs it into the `extensions` schema.)

alter table public.article_analyses
  add column if not exists embedding vector(1536);

create index if not exists article_analyses_embedding_idx
  on public.article_analyses
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_related_articles(
  p_article_id uuid,
  p_embedding vector(1536),
  p_match_count int default 5
)
returns table (
  article_id uuid,
  title text,
  image_url text,
  published_at timestamptz,
  source_name text,
  sentiment_label text,
  bias_label text,
  left_percentage numeric,
  center_percentage numeric,
  right_percentage numeric,
  confidence numeric,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    a.id,
    a.title,
    a.image_url,
    a.published_at,
    s.name,
    an.sentiment_label,
    an.bias_label,
    an.left_percentage,
    an.center_percentage,
    an.right_percentage,
    an.confidence,
    1 - (an.embedding <=> p_embedding) as similarity
  from public.article_analyses an
  join public.articles a on a.id = an.article_id
  join public.sources s on s.id = a.source_id
  where an.embedding is not null
    and a.analyzed_at is not null
    and a.id <> p_article_id
  order by an.embedding <=> p_embedding
  limit p_match_count;
$$;

revoke all on function public.match_related_articles(uuid, vector, int) from public;
revoke all on function public.match_related_articles(uuid, vector, int) from anon, authenticated;
grant execute on function public.match_related_articles(uuid, vector, int) to service_role;
```

If `type "vector" does not exist` appears, qualify as `extensions.vector(1536)` — the extension lives in the `extensions` schema.

### 2. Embedding generation

`lib/ai/embed-article.ts`, `import "server-only"`:

```ts
const { embedding } = await embed({
  model: google.embedding(EMBEDDING_MODEL_ID),
  value: buildEmbeddingInput({ title, summary, rawText }),
  providerOptions: {
    google: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
      taskType: "SEMANTIC_SIMILARITY",
    } satisfies GoogleEmbeddingModelOptions,
  },
});
```

- Verify `embedding.length === EMBEDDING_DIMENSIONS`; a wrong length is a failure, never a save.
- Errors are returned, never thrown — one article must not abort the run (existing pipeline contract).

### 3. Pipeline

- `analyze` mode: analyze → `insertArticleAnalysis` → `embedArticle` → `updateAnalysisEmbedding` → `markArticleAnalyzed`. Embedding failure records `embedding_error`, leaves `analyzed_at` null, keeps the analysis row.
- `embed_only` mode: `embedArticle` → `updateAnalysisEmbedding` → `markArticleAnalyzed`. No Gemini analysis call.
- The `processedIds` no-progress guard keeps working for both modes.
- Summary gains `articlesEmbedded`; logs report analyzed / embedded / skipped / failed per batch and in the final summary object.

### 4. Related articles query and UI

- `getRelatedArticles(articleId, embedding)` → `.rpc("match_related_articles", { p_article_id, p_embedding: toVectorLiteral(embedding), p_match_count: RELATED_ARTICLES_LIMIT })`, service-role client, throws on error.
- Details page: only call it when `analysis?.embedding` is non-null. Render nothing when the result array is empty. A related-articles failure must not break the page — catch, log server-side, render nothing.
- Section markup: heading `Related Articles` in the existing uppercase/extrabold section style, subline noting similarity is AI-estimated, then `grid grid-cols-1 sm:grid-cols-2 gap-5`, each card `<Link href={/article/${id}}><NewsCard variant="vertical" ... /></Link>` with `sourceName`, `publishedLabel` (via `formatArticleDate`), `sentimentLabel`, `framingLabel`, `confidence`, `bias`.

## Security requirements

- Embedding calls run only in `server-only` modules; `GOOGLE_GENERATIVE_AI_API_KEY` never reaches browser code.
- The RPC is called with the service-role client from server code only; `EXECUTE` is revoked from `anon`/`authenticated`.
- `security invoker` (not definer) with a pinned `search_path`.
- RLS stays enabled with zero policies on `article_analyses`; no new table exposure.
- No new environment variables; `.env.example` and the AGENTS.md section 21 table are already correct (`GOOGLE_GENERATIVE_AI_API_KEY` already covers embeddings).

## Acceptance criteria

1. `article_analyses.embedding vector(1536)` exists with an IVFFlat cosine index; `supabase/schema.sql` and `lib/supabase/types.ts` match the live schema.
2. A fresh `POST /api/analyze` run saves both analysis and a 1536-dimension embedding, and sets `analyzed_at` only after both.
3. An analysis row with `embedding IS NULL` is embedded on the next run without a new analysis call, and its article then has `analyzed_at` set.
4. Embedding failure leaves the analysis row saved, `analyzed_at` null, and reports `embedding_error` in the summary.
5. The details page shows up to 5 related articles ordered by cosine similarity, excluding the current article, and shows nothing when there is no embedding or no match.
6. Homepage and details queries no longer transfer the `embedding` column except where the details page needs it.
7. No `any`; no unrelated refactors.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (server modules, queries, and a route-rendered page all change)

## Manual test steps

1. Apply the SQL above in Supabase Dashboard → SQL Editor after enabling the `vector` extension. Confirm:
   ```sql
   select column_name, data_type from information_schema.columns
   where table_name = 'article_analyses' and column_name = 'embedding';
   ```
2. Start the dev server and watch its terminal for pipeline logs:
   ```bash
   npm run dev
   ```
3. Backfill embeddings for already-analyzed articles (they have analysis rows with null embeddings):
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{}'
   ```
   Expect `articlesEmbedded` > 0 and `articlesAnalyzed` 0 if everything was already analyzed.
4. Verify in SQL Editor:
   ```sql
   select count(*) filter (where embedding is null) as missing,
          count(*) filter (where embedding is not null) as embedded
   from public.article_analyses;
   ```
5. Analyze a specific still-pending article and confirm both steps run in one pass:
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{"articleIds":["<article-uuid>"],"batchSize":1}'
   ```
6. Open `http://localhost:3000`, sign in, click any card, and scroll to the bottom of the article column: the Related Articles section shows up to 5 cards, none of them the current article, each linking to its own details page.
7. Sanity-check ordering directly:
   ```sql
   select title, similarity from public.match_related_articles(
     '<article-uuid>',
     (select embedding from public.article_analyses where article_id = '<article-uuid>'),
     5
   );
   ```
   Similarity should decrease down the list and the topics should look related.
