import "server-only";
import { cache } from "react";

import { toVectorLiteral } from "@/lib/ai/embed-article";
import { RELATED_ARTICLES_LIMIT } from "@/lib/config/limits";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Article,
  ArticleAnalysis,
  ArticleInsert,
  BiasLabel,
  RelatedArticleRow,
  SentimentLabel,
  Source,
} from "@/lib/supabase/types";

const URL_CHECK_CHUNK_SIZE = 15;

/**
 * Every analysis column except `embedding`. Listed explicitly because
 * `article_analyses(*)` would drag 1536 floats per row into UI reads.
 */
const ARTICLE_ANALYSIS_COLUMNS =
  "id, article_id, summary, sentiment_score, sentiment_label, bias_score, bias_label, left_percentage, center_percentage, right_percentage, confidence, framing_notes, loaded_terms, disclaimer, model, created_at";

/** What the UI reads: the full analysis row minus the vector. */
export type ArticleAnalysisForDisplay = Omit<ArticleAnalysis, "embedding">;

export type ArticleWithSourceAndAnalysis = Article & {
  source: Source;
  analysis: ArticleAnalysisForDisplay | null;
};

/** The details page additionally needs the vector to look up related articles. */
export type ArticleWithSourceAndAnalysisDetail = Article & {
  source: Source;
  analysis: (ArticleAnalysisForDisplay & { embedding: string | null }) | null;
};

export type InsertArticleResult =
  | { ok: true; article: Article }
  | { ok: false; reason: "duplicate" };

export interface GetPublishedArticlesOptions {
  limit: number;
  offset: number;
  sourceId?: string;
  sourceName?: string;
  biasLabel?: BiasLabel;
  sentimentLabel?: SentimentLabel;
  query?: string;
}

export async function getPublishedArticles({
  limit,
  offset,
  sourceId,
  sourceName,
  biasLabel,
  sentimentLabel,
  query,
}: GetPublishedArticlesOptions): Promise<ArticleWithSourceAndAnalysis[]> {
  const sourceJoin = sourceName && !sourceId ? "source:sources!inner(*)" : "source:sources(*)";
  const analysisJoin =
    biasLabel || sentimentLabel
      ? `analysis:article_analyses!inner(${ARTICLE_ANALYSIS_COLUMNS})`
      : `analysis:article_analyses(${ARTICLE_ANALYSIS_COLUMNS})`;

  let queryBuilder = getSupabaseAdminClient()
    .from("articles")
    .select(`*, ${sourceJoin}, ${analysisJoin}`)
    .not("analyzed_at", "is", null);

  if (sourceId) {
    queryBuilder = queryBuilder.eq("source_id", sourceId);
  } else if (sourceName) {
    queryBuilder = queryBuilder.ilike("source.name", sourceName);
  }

  if (biasLabel) {
    queryBuilder = queryBuilder.eq("analysis.bias_label", biasLabel);
  }

  if (sentimentLabel) {
    queryBuilder = queryBuilder.eq("analysis.sentiment_label", sentimentLabel);
  }

  if (query && query.trim()) {
    queryBuilder = queryBuilder.ilike("title", `%${query.trim()}%`);
  }

  const { data, error } = await queryBuilder
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return data as unknown as ArticleWithSourceAndAnalysis[];
}

export const getArticleWithAnalysis = cache(
  async (id: string): Promise<ArticleWithSourceAndAnalysisDetail | null> => {
    const { data, error } = await getSupabaseAdminClient()
      .from("articles")
      .select(
        `*, source:sources(*), analysis:article_analyses(${ARTICLE_ANALYSIS_COLUMNS}, embedding)`
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }
);

export async function findExistingOriginalUrls(urls: string[]): Promise<Set<string>> {
  const existing = new Set<string>();

  for (let i = 0; i < urls.length; i += URL_CHECK_CHUNK_SIZE) {
    const chunk = urls.slice(i, i + URL_CHECK_CHUNK_SIZE);
    const { data, error } = await getSupabaseAdminClient()
      .from("articles")
      .select("original_url")
      .in("original_url", chunk);

    if (error) {
      throw error;
    }

    for (const row of data) {
      existing.add(row.original_url);
    }
  }

  return existing;
}

export async function insertArticle(article: ArticleInsert): Promise<InsertArticleResult> {
  const { data, error } = await getSupabaseAdminClient()
    .from("articles")
    .insert(article)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, reason: "duplicate" };
    }
    throw error;
  }

  return { ok: true, article: data };
}

/**
 * What still has to happen for a pending article:
 * - `analyze` — no `article_analyses` row exists yet; run analysis then embed.
 * - `embed_only` — the analysis row exists with `embedding IS NULL`; embed it
 *   without paying for a second analysis call (section 20 backfill).
 */
export type PendingAnalysisMode = "analyze" | "embed_only";

/** Only the columns the analysis pipeline needs — `raw_text` is the heavy one. */
export type PendingAnalysisArticle = Pick<
  Article,
  "id" | "source_id" | "title" | "published_at" | "raw_text"
> & {
  mode: PendingAnalysisMode;
  /** `embed_only` only: the analysis row to write the embedding onto. */
  analysisId: string | null;
  /** `embed_only` only: the stored summary, reused as embedding input. */
  summary: string | null;
};

/**
 * Section 19 **pending-analysis check**, extended by section 20. An article is
 * pending when no `article_analyses` row exists for it — never
 * `analyzed_at IS NULL`, which can be set while the analysis row is absent —
 * or when its analysis row is missing an embedding.
 *
 * The LEFT JOIN cannot be filtered in SQL (Supabase joined-table filter
 * gotcha), so the null check happens in JS. Two vector-free passes are used
 * instead of one query so that detecting missing embeddings never transfers a
 * vector, and so that `raw_text` is fetched only for the selected batch.
 */
export async function getPendingAnalysisArticles({
  limit,
  articleIds,
}: {
  limit: number;
  articleIds?: string[];
}): Promise<PendingAnalysisArticle[]> {
  const client = getSupabaseAdminClient();

  if (articleIds && articleIds.length === 0) {
    return [];
  }

  // Pass 1 — every article id in scrape order, with its analysis row's id (or
  // null). This ordering doubles as the oldest-first ordering for the result.
  let idQuery = client
    .from("articles")
    .select("id, analysis:article_analyses(id)")
    .order("scraped_at", { ascending: true });

  // Pass 2 — analysis rows still missing an embedding.
  let embedQuery = client
    .from("article_analyses")
    .select("id, article_id, summary")
    .is("embedding", null);

  if (articleIds) {
    idQuery = idQuery.in("id", articleIds);
    embedQuery = embedQuery.in("article_id", articleIds);
  }

  const [{ data: idRows, error: idError }, { data: embedRows, error: embedError }] =
    await Promise.all([idQuery, embedQuery]);

  if (idError) {
    throw idError;
  }

  if (embedError) {
    throw embedError;
  }

  const needsAnalysis = new Set(
    idRows.filter((row) => row.analysis === null).map((row) => row.id)
  );
  const needsEmbedding = new Map(embedRows.map((row) => [row.article_id, row]));

  const selected: { id: string; mode: PendingAnalysisMode; analysisId: string | null; summary: string | null }[] = [];

  for (const row of idRows) {
    if (selected.length >= limit) {
      break;
    }

    if (needsAnalysis.has(row.id)) {
      selected.push({ id: row.id, mode: "analyze", analysisId: null, summary: null });
      continue;
    }

    const analysis = needsEmbedding.get(row.id);

    if (analysis) {
      selected.push({
        id: row.id,
        mode: "embed_only",
        analysisId: analysis.id,
        summary: analysis.summary,
      });
    }
  }

  if (selected.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("articles")
    .select("id, source_id, title, published_at, raw_text")
    .in(
      "id",
      selected.map((item) => item.id)
    );

  if (error) {
    throw error;
  }

  const rowsById = new Map(data.map((row) => [row.id, row]));

  return selected.flatMap((item) => {
    const row = rowsById.get(item.id);

    return row ? [{ ...row, mode: item.mode, analysisId: item.analysisId, summary: item.summary }] : [];
  });
}

/**
 * Section 20 related articles: the 5 nearest analyzed articles by cosine
 * distance. Ordering lives in the `match_related_articles` SQL function
 * because PostgREST cannot express `order by embedding <=> $1`.
 */
export async function getRelatedArticles(
  articleId: string,
  embedding: string | number[]
): Promise<RelatedArticleRow[]> {
  const { data, error } = await getSupabaseAdminClient().rpc("match_related_articles", {
    p_article_id: articleId,
    p_embedding: toVectorLiteral(embedding),
    p_match_count: RELATED_ARTICLES_LIMIT,
  });

  if (error) {
    throw error;
  }

  return data;
}
