import { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { toMessage } from "@/lib/pipeline/run-logger";
import type { BiasLabel, SentimentLabel } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export interface SearchArticleResult {
  id: string;
  title: string;
  image_url: string;
  published_at: string;
  canonical_url: string;
  source: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  analysis: {
    bias_label: BiasLabel;
    left_percentage: number;
    center_percentage: number;
    right_percentage: number;
    sentiment_label: SentimentLabel;
    summary: string | null;
  } | null;
}

export interface SearchSourceResult {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
}

export interface SearchApiResponse {
  articles: SearchArticleResult[];
  sources: SearchSourceResult[];
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim().slice(0, 100);

    if (!query) {
      return Response.json({ articles: [], sources: [] });
    }

    const supabase = getSupabaseAdminClient();

    // Query matching published articles with analysis and source
    const [articlesResult, sourcesResult] = await Promise.all([
      supabase
        .from("articles")
        .select(
          `id, title, image_url, published_at, canonical_url, source:sources(id, name, logo_url), analysis:article_analyses(bias_label, left_percentage, center_percentage, right_percentage, sentiment_label, summary)`
        )
        .not("analyzed_at", "is", null)
        .ilike("title", `%${query}%`)
        .order("published_at", { ascending: false })
        .limit(8),

      supabase
        .from("sources")
        .select("id, name, logo_url, is_active")
        .eq("is_active", true)
        .ilike("name", `%${query}%`)
        .limit(4),
    ]);

    if (articlesResult.error) {
      console.error("[api/search] articles query error:", articlesResult.error);
    }
    if (sourcesResult.error) {
      console.error("[api/search] sources query error:", sourcesResult.error);
    }

    const articles: SearchArticleResult[] = (articlesResult.data as unknown as SearchArticleResult[]) || [];
    const sources: SearchSourceResult[] = sourcesResult.data || [];

    return Response.json({ articles, sources });
  } catch (error) {
    console.error("[api/search] failed to process search:", toMessage(error));
    return Response.json({ articles: [], sources: [] }, { status: 200 });
  }
}
