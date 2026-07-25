import "server-only";

import { toVectorLiteral } from "@/lib/ai/embed-article";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ArticleAnalysis, ArticleAnalysisInsert } from "@/lib/supabase/types";

export async function insertArticleAnalysis(
  data: ArticleAnalysisInsert
): Promise<ArticleAnalysis> {
  const { data: inserted, error } = await getSupabaseAdminClient()
    .from("article_analyses")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return inserted;
}

/**
 * Section 20: saves the pgvector embedding onto an existing analysis row. Kept
 * separate from `insertArticleAnalysis` so a failed embedding never discards a
 * successful (paid) analysis call.
 */
export async function updateAnalysisEmbedding(
  analysisId: string,
  embedding: number[]
): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("article_analyses")
    .update({ embedding: toVectorLiteral(embedding) })
    .eq("id", analysisId);

  if (error) {
    throw error;
  }
}

export async function markArticleAnalyzed(articleId: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("articles")
    .update({ analyzed_at: new Date().toISOString() })
    .eq("id", articleId);

  if (error) {
    throw error;
  }
}
