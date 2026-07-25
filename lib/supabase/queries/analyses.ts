import "server-only";

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

export async function markArticleAnalyzed(articleId: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("articles")
    .update({ analyzed_at: new Date().toISOString() })
    .eq("id", articleId);

  if (error) {
    throw error;
  }
}
