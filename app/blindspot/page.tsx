import type { Metadata } from "next";
import * as React from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Eye, ShieldAlert, Sparkles, Scale } from "lucide-react";
import { ArticleGrid } from "@/components/ui/article-grid";
import { BlindspotSpectrumSummary } from "@/components/ui/blindspot-spectrum-summary";
import { BlindspotDivergenceCard } from "@/components/ui/blindspot-divergence-card";
import { getPublishedArticles, type ArticleWithSourceAndAnalysis } from "@/lib/supabase/queries/articles";
import type { BiasLabel } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Blindspot Feed",
  description:
    "Stories and perspectives disproportionately covered or framed across the political spectrum with AI intelligence.",
  openGraph: {
    title: "The Blindspot Feed — Pixca News",
    description:
      "Stories and perspectives disproportionately covered or framed across the political spectrum with AI intelligence.",
    url: "/blindspot",
    type: "website",
    siteName: "Pixca News",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Blindspot Feed — Pixca News",
    description:
      "Stories and perspectives disproportionately covered or framed across the political spectrum with AI intelligence.",
  },
};

interface BlindspotPageProps {
  searchParams: Promise<{
    bias?: string;
  }>;
}

export default async function BlindspotPage({ searchParams }: BlindspotPageProps) {
  // Read-at-request-time
  await connection();

  const params = await searchParams;
  const rawBias = params.bias?.toLowerCase()?.trim();
  const activeBias: "all" | "left" | "right" =
    rawBias === "left" ? "left" : rawBias === "right" ? "right" : "all";

  let queryBiasLabel: BiasLabel | undefined = undefined;
  if (activeBias === "left") {
    queryBiasLabel = "left";
  } else if (activeBias === "right") {
    queryBiasLabel = "right";
  }

  let fetchedArticles: ArticleWithSourceAndAnalysis[] = [];
  try {
    fetchedArticles = await getPublishedArticles({
      limit: 40,
      offset: 0,
      biasLabel: queryBiasLabel,
    });
  } catch (err) {
    console.error("[BlindspotPage getPublishedArticles failed]:", err);
    fetchedArticles = [];
  }

  // If "all" is selected, filter strictly to stories with meaningful bias or framing divergence (left, right, or mixed)
  const articles =
    activeBias === "all"
      ? fetchedArticles.filter(
          (a) =>
            a.analysis &&
            (a.analysis.bias_label === "left" ||
              a.analysis.bias_label === "right" ||
              a.analysis.bias_label === "mixed")
        )
      : fetchedArticles;

  // Find top divergent Left/Right pair for side-by-side comparison
  const leftArticles = articles.filter(
    (a) => a.analysis && (a.analysis.bias_label === "left" || a.analysis.left_percentage >= 45)
  );
  const rightArticles = articles.filter(
    (a) => a.analysis && (a.analysis.bias_label === "right" || a.analysis.right_percentage >= 45)
  );

  let featuredPair: {
    left: ArticleWithSourceAndAnalysis;
    right: ArticleWithSourceAndAnalysis;
    topic: string;
  } | null = null;

  if (leftArticles.length > 0 && rightArticles.length > 0) {
    const STOP_WORDS = new Set([
      "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "by", "from",
      "up", "about", "into", "over", "after", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "but", "if", "because", "as", "until",
      "while", "against", "between", "through", "during", "before", "above", "below",
      "it", "its", "they", "them", "their", "this", "that", "these", "those", "what", "which",
      "who", "whom", "whose", "why", "how", "all", "any", "both", "each", "few", "more", "most",
      "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
      "very", "can", "will", "just", "should", "now", "says", "said", "new", "amid"
    ]);

    const getKeywords = (title: string) =>
      title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    let bestScore = -1;
    let bestLeft = leftArticles[0];
    let bestRight = rightArticles[0];
    let bestMatchedKeyword = "";

    for (const left of leftArticles) {
      const leftWords = new Set(getKeywords(left.title));
      for (const right of rightArticles) {
        const rightWords = getKeywords(right.title);
        const matches = rightWords.filter((w) => leftWords.has(w));
        const score = matches.length;
        if (score > bestScore) {
          bestScore = score;
          bestLeft = left;
          bestRight = right;
          if (matches.length > 0) {
            bestMatchedKeyword = matches[0].charAt(0).toUpperCase() + matches[0].slice(1);
          }
        }
      }
    }

    featuredPair = {
      left: bestLeft,
      right: bestRight,
      topic:
        bestScore > 0 && bestMatchedKeyword
          ? `Perspective Divergence: ${bestMatchedKeyword} Coverage`
          : "Perspective Divergence: High-Contrast Editorial Framing",
    };
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        {/* Blindspot Explanatory Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-8 border border-zinc-800 shadow-xl">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>Perspective Intelligence</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                The Blindspot Feed
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Stories and angles disproportionately covered or framed by one side of the political spectrum. Discover perspectives you might miss in standard media feeds.
              </p>
            </div>

            {/* Quick Metrics / Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-400" />
                  <span>Framing Balance</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Multi-Source AI</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Skew Detection</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Real-Time Scoring</div>
              </div>

              <div className="hidden sm:block p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Topic Coverage</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Unbiased Analysis</div>
              </div>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-24 -mb-16 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Aggregated Spectrum Distribution Summary */}
        <BlindspotSpectrumSummary
          articles={articles}
          activeBias={activeBias}
        />

        {/* Featured Perspective Divergence Card */}
        {featuredPair && activeBias === "all" && (
          <BlindspotDivergenceCard
            leftArticle={featuredPair.left}
            rightArticle={featuredPair.right}
            topicTitle={featuredPair.topic}
          />
        )}

        {/* Filter Tabs & Stories Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Link
              href="/blindspot"
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeBias === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "bg-muted text-text-secondary hover:text-text-primary hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              All Blindspots
            </Link>
            <Link
              href="/blindspot?bias=left"
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeBias === "left"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-muted text-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Left Coverage / Skew</span>
            </Link>
            <Link
              href="/blindspot?bias=right"
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeBias === "right"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-muted text-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Right Coverage / Skew</span>
            </Link>
          </div>

          <div className="text-xs font-semibold text-[var(--text-secondary)]">
            Showing {articles.length} {articles.length === 1 ? "story" : "stories"}
          </div>
        </div>

        {/* Article Grid with Staggered Animations */}
        <ArticleGrid
          articles={articles}
          emptyMessage="No blindspot stories found for the selected filter."
        />
      </main>
    </div>
  );
}
