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

export async function getPendingAnalysisArticles({
  limit,
}: {
  limit: number;
}): Promise<Article[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("articles")
    .select("*, analysis:article_analyses(id)")
    .order("scraped_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.filter((row) => row.analysis === null).slice(0, limit);
}
