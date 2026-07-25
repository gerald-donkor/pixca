import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Article, ArticleAnalysis, ArticleInsert, Source } from "@/lib/supabase/types";

const URL_CHECK_CHUNK_SIZE = 15;

export type ArticleWithSourceAndAnalysis = Article & {
  source: Source;
  analysis: ArticleAnalysis | null;
};

export type InsertArticleResult =
  | { ok: true; article: Article }
  | { ok: false; reason: "duplicate" };

export async function getPublishedArticles({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}): Promise<ArticleWithSourceAndAnalysis[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("articles")
    .select("*, source:sources(*), analysis:article_analyses(*)")
    .not("analyzed_at", "is", null)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return data;
}

export async function getArticleWithAnalysis(
  id: string
): Promise<ArticleWithSourceAndAnalysis | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("articles")
    .select("*, source:sources(*), analysis:article_analyses(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

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

/** Only the columns the analysis pipeline needs — `raw_text` is the heavy one. */
export type PendingAnalysisArticle = Pick<
  Article,
  "id" | "source_id" | "title" | "published_at" | "raw_text"
>;

/**
 * Section 19 **pending-analysis check**. An article is pending when no
 * `article_analyses` row exists for it — never `analyzed_at IS NULL`, which
 * can be set while the analysis row is absent.
 *
 * The LEFT JOIN cannot be filtered in SQL (Supabase joined-table filter
 * gotcha), so the null check happens in JS. To avoid pulling every `raw_text`
 * in the table through that filter, ids are resolved first and only the
 * selected batch is fetched in full.
 */
export async function getPendingAnalysisArticles({
  limit,
  articleIds,
}: {
  limit: number;
  articleIds?: string[];
}): Promise<PendingAnalysisArticle[]> {
  const client = getSupabaseAdminClient();

  let idQuery = client
    .from("articles")
    .select("id, analysis:article_analyses(id)")
    .order("scraped_at", { ascending: true });

  if (articleIds) {
    if (articleIds.length === 0) {
      return [];
    }

    idQuery = idQuery.in("id", articleIds);
  }

  const { data: idRows, error: idError } = await idQuery;

  if (idError) {
    throw idError;
  }

  const pendingIds = idRows
    .filter((row) => row.analysis === null)
    .slice(0, limit)
    .map((row) => row.id);

  if (pendingIds.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("articles")
    .select("id, source_id, title, published_at, raw_text")
    .in("id", pendingIds)
    .order("scraped_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
