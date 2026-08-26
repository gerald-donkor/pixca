"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  ArrowRight,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { NewsCard } from "@/components/ui/news-card";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { ForYouAffinitySummary } from "@/components/ui/for-you-affinity-summary";
import {
  ForYouTuningControls,
  type TuningMode,
} from "@/components/ui/for-you-tuning-controls";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatArticleDate } from "@/lib/ui/format";
import type { ArticleWithSourceAndAnalysis } from "@/lib/supabase/queries/articles";

export interface ForYouFeedProps {
  initialArticles: ArticleWithSourceAndAnalysis[];
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "by", "from",
  "up", "about", "into", "over", "after", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "but", "if", "because", "as", "until",
  "while", "against", "between", "through", "during", "before", "above", "below",
  "it", "its", "they", "them", "their", "this", "that", "these", "those", "what", "which",
  "who", "whom", "whose", "why", "how", "all", "any", "both", "each", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
  "very", "can", "will", "just", "should", "now", "says", "said", "new", "amid", "exclusive",
  "report", "breaking", "update", "latest", "first", "key", "takeaways", "here"
]);

const SAMPLE_DISCOVERY_TOPICS = [
  "geopolitics",
  "economy",
  "technology",
  "climate",
  "healthcare",
  "election",
];

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

export function ForYouFeed({ initialArticles }: ForYouFeedProps) {
  const { bookmarks } = useBookmarks();
  const [activeMode, setActiveMode] = React.useState<TuningMode>("balanced");
  const [activeTopic, setActiveTopic] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Extract User Affinities, Dominant Bias, and Topic Keywords from Saved Bookmarks
  const {
    dominantBias,
    bookmarkedSourceSet,
    topKeywords,
    keywordFrequencyMap,
  } = React.useMemo(() => {
    if (bookmarks.length === 0) {
      return {
        dominantBias: null,
        bookmarkedSourceSet: new Set<string>(),
        topKeywords: [],
        keywordFrequencyMap: new Map<string, number>(),
      };
    }

    const sourceCounts: Record<string, { name: string; count: number }> = {};
    const wordCounts = new Map<string, number>();

    let totalLeft = 0;
    let totalRight = 0;
    let totalCenter = 0;

    bookmarks.forEach((b) => {
      // Source counts
      if (b.source_name) {
        const key = b.source_name.toLowerCase();
        if (!sourceCounts[key]) {
          sourceCounts[key] = { name: b.source_name, count: 0 };
        }
        sourceCounts[key].count += 1;
      }

      // Keyword counts
      if (b.title) {
        const words = extractKeywords(b.title);
        words.forEach((w) => {
          wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
        });
      }

      // Bias accumulation
      if (
        b.left_percentage !== undefined &&
        b.center_percentage !== undefined &&
        b.right_percentage !== undefined
      ) {
        totalLeft += b.left_percentage;
        totalCenter += b.center_percentage;
        totalRight += b.right_percentage;
      } else if (b.bias_label) {
        if (b.bias_label === "left") {
          totalLeft += 70;
          totalCenter += 20;
          totalRight += 10;
        } else if (b.bias_label === "right") {
          totalLeft += 10;
          totalCenter += 20;
          totalRight += 70;
        } else if (b.bias_label === "center") {
          totalLeft += 15;
          totalCenter += 70;
          totalRight += 15;
        }
      }
    });

    const sortedKeywords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    let dominant: "left" | "right" | "center" | "balanced" | null = null;
    const sum = totalLeft + totalCenter + totalRight;
    if (sum > 0) {
      const avgLeft = totalLeft / sum;
      const avgRight = totalRight / sum;
      const avgCenter = totalCenter / sum;

      if (avgCenter >= 0.55) dominant = "center";
      else if (avgLeft > avgRight + 0.12) dominant = "left";
      else if (avgRight > avgLeft + 0.12) dominant = "right";
      else dominant = "balanced";
    }

    return {
      dominantBias: dominant,
      bookmarkedSourceSet: new Set(Object.keys(sourceCounts)),
      topKeywords: sortedKeywords.slice(0, 6),
      keywordFrequencyMap: wordCounts,
    };
  }, [bookmarks]);

  // Determine available topic tags for pill bar
  const availableTopics = React.useMemo(() => {
    if (bookmarks.length > 0 && topKeywords.length > 0) {
      return topKeywords;
    }
    return SAMPLE_DISCOVERY_TOPICS;
  }, [bookmarks.length, topKeywords]);

  // Algorithmic News Scoring & Filtering based on Active Tuning Mode
  const rankedArticles = React.useMemo(() => {
    if (initialArticles.length === 0) return [];

    let pool = [...initialArticles];

    // Filter by active topic if selected
    if (activeTopic) {
      const targetWord = activeTopic.toLowerCase();
      pool = pool.filter((a) => {
        const titleLower = a.title?.toLowerCase() || "";
        const summaryLower = a.analysis?.summary?.toLowerCase() || "";
        const sourceLower = a.source?.name?.toLowerCase() || "";
        return (
          titleLower.includes(targetWord) ||
          summaryLower.includes(targetWord) ||
          sourceLower.includes(targetWord)
        );
      });
    }

    // Mode-specific filtering and scoring
    if (activeMode === "anchor") {
      // Strictly Centrist / High-Balance
      return pool
        .filter(
          (a) =>
            a.analysis &&
            (a.analysis.bias_label === "center" || a.analysis.center_percentage >= 40)
        )
        .sort((a, b) => {
          const centerA = a.analysis?.center_percentage || 0;
          const centerB = b.analysis?.center_percentage || 0;
          const confA = a.analysis?.confidence || 0.5;
          const confB = b.analysis?.confidence || 0.5;
          return centerB * 0.7 + confB * 30 - (centerA * 0.7 + confA * 30);
        });
    }

    if (activeMode === "counter") {
      // Counter-perspective prioritization
      return pool
        .filter((a) => {
          if (!a.analysis) return true;
          if (dominantBias === "left") {
            return a.analysis.bias_label === "right" || a.analysis.right_percentage >= 40;
          }
          if (dominantBias === "right") {
            return a.analysis.bias_label === "left" || a.analysis.left_percentage >= 40;
          }
          // Balanced / No dominant bias: surface both left and right extremes
          return (
            a.analysis.bias_label === "left" ||
            a.analysis.bias_label === "right" ||
            a.analysis.bias_label === "mixed"
          );
        })
        .sort((a, b) => {
          let scoreA = (a.analysis?.confidence || 0.5) * 40;
          let scoreB = (b.analysis?.confidence || 0.5) * 40;

          if (dominantBias === "left") {
            scoreA += (a.analysis?.right_percentage || 0) * 0.8;
            scoreB += (b.analysis?.right_percentage || 0) * 0.8;
          } else if (dominantBias === "right") {
            scoreA += (a.analysis?.left_percentage || 0) * 0.8;
            scoreB += (b.analysis?.left_percentage || 0) * 0.8;
          } else {
            const spreadA = Math.abs((a.analysis?.right_percentage || 0) - (a.analysis?.left_percentage || 0));
            const spreadB = Math.abs((b.analysis?.right_percentage || 0) - (b.analysis?.left_percentage || 0));
            scoreA += spreadA * 0.5;
            scoreB += spreadB * 0.5;
          }

          return scoreB - scoreA;
        });
    }

    if (activeMode === "focus") {
      // Deep focus on saved publishers and topics
      return pool.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Source match
        if (a.source?.name && bookmarkedSourceSet.has(a.source.name.toLowerCase())) scoreA += 60;
        if (b.source?.name && bookmarkedSourceSet.has(b.source.name.toLowerCase())) scoreB += 60;

        // Keyword overlap
        const wordsA = a.title ? extractKeywords(a.title) : [];
        const wordsB = b.title ? extractKeywords(b.title) : [];

        wordsA.forEach((w) => {
          if (keywordFrequencyMap.has(w)) scoreA += (keywordFrequencyMap.get(w) || 0) * 15;
        });
        wordsB.forEach((w) => {
          if (keywordFrequencyMap.has(w)) scoreB += (keywordFrequencyMap.get(w) || 0) * 15;
        });

        scoreA += (a.analysis?.confidence || 0.5) * 20;
        scoreB += (b.analysis?.confidence || 0.5) * 20;

        return scoreB - scoreA;
      });
    }

    // Default "balanced": Harmonious composite scoring
    if (bookmarks.length === 0) {
      return pool;
    }

    return pool.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Source match (25%)
      if (a.source?.name && bookmarkedSourceSet.has(a.source.name.toLowerCase())) scoreA += 30;
      if (b.source?.name && bookmarkedSourceSet.has(b.source.name.toLowerCase())) scoreB += 30;

      // Keyword match (35%)
      const wordsA = a.title ? extractKeywords(a.title) : [];
      const wordsB = b.title ? extractKeywords(b.title) : [];

      wordsA.forEach((w) => {
        if (keywordFrequencyMap.has(w)) scoreA += (keywordFrequencyMap.get(w) || 0) * 10;
      });
      wordsB.forEach((w) => {
        if (keywordFrequencyMap.has(w)) scoreB += (keywordFrequencyMap.get(w) || 0) * 10;
      });

      // Centrist Anchor (20%)
      scoreA += (a.analysis?.center_percentage || 0) * 0.25;
      scoreB += (b.analysis?.center_percentage || 0) * 0.25;

      // Quality Confidence (20%)
      scoreA += (a.analysis?.confidence || 0.5) * 20;
      scoreB += (b.analysis?.confidence || 0.5) * 20;

      return scoreB - scoreA;
    });
  }, [
    initialArticles,
    activeMode,
    activeTopic,
    bookmarks.length,
    dominantBias,
    bookmarkedSourceSet,
    keywordFrequencyMap,
  ]);

  const articlesKey = `${activeMode}-${activeTopic || "all"}-${rankedArticles
    .map((a) => a.id)
    .slice(0, 10)
    .join(",")}`;

  // GSAP Choreographed Entrance Animation
  useGSAP(
    () => {
      if (!containerRef.current || rankedArticles.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".for-you-card-item",
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.04,
            clearProps: "transform,opacity",
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          ".for-you-card-item",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
            stagger: 0.02,
            clearProps: "transform,opacity",
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [articlesKey] }
  );

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Top Adaptive Reading Affinity Profile (when bookmarks exist) */}
      {bookmarks.length > 0 ? (
        <ForYouAffinitySummary
          bookmarks={bookmarks}
          topTopics={topKeywords}
        />
      ) : (
        /* First-Time Onboarding Experience */
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Personalize Your AI News Experience
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Pixca dynamically curates top stories and balanced counter-perspectives tailored to your reading interests.
              Bookmark articles across the site to teach the recommendation model your favorite publishers and topics, or explore sample topic areas below.
            </p>
          </div>
          <Link href="/" className="shrink-0">
            <Button
              variant="outline"
              className="border-blue-500/30 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs h-10 px-4 rounded-xl flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Top News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Interactive Curation Tuning Controls & Topic Pills */}
      <ForYouTuningControls
        activeMode={activeMode}
        onModeChange={setActiveMode}
        availableTopics={availableTopics}
        activeTopic={activeTopic}
        onTopicChange={setActiveTopic}
        dominantBias={dominantBias}
        resultCount={rankedArticles.length}
        totalPoolCount={initialArticles.length}
        isNewVisitor={bookmarks.length === 0}
      />

      {/* News Article Grid */}
      {rankedArticles.length === 0 ? (
        <div className="bg-card rounded-2xl border border-[var(--border)] p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              No matching articles for this tuning filter
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {activeTopic
                ? `No stories found matching topic "${activeTopic}" under ${activeMode} mode.`
                : "Check back as new articles are scraped and analyzed hourly, or reset your filters."}
            </p>
          </div>
          <Button
            onClick={() => {
              setActiveMode("balanced");
              setActiveTopic(null);
            }}
            variant="outline"
            className="text-xs font-semibold rounded-xl flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Balanced Discovery</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankedArticles.map((article) => (
            <div key={article.id} className="for-you-card-item h-full">
                <Link
                  href={`/article/${article.id}`}
                  prefetch={false}
                  className="block h-full transition-transform hover:-translate-y-0.5"
                >
                  <NewsCard
                    articleId={article.id}
                    variant="vertical"
                    title={article.title}
                    imageUrl={article.image_url}
                    sourceName={article.source?.name || "Unknown Source"}
                    publishedLabel={formatArticleDate(article.published_at)}
                    bias={
                      article.analysis
                        ? {
                            left: article.analysis.left_percentage,
                            center: article.analysis.center_percentage,
                            right: article.analysis.right_percentage,
                          }
                        : undefined
                    }
                    sentimentLabel={article.analysis?.sentiment_label}
                    framingLabel={article.analysis?.bias_label}
                    confidence={article.analysis?.confidence}
                    className="bg-card rounded-xl border border-[var(--border)] shadow-xs h-full"
                  />
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
