"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Scale, Compass, Bookmark, ShieldCheck, ArrowRight, BookOpen } from "lucide-react";
import { NewsCard } from "@/components/ui/news-card";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatArticleDate } from "@/lib/ui/format";
import { cn } from "@/lib/utils";
import type { ArticleWithSourceAndAnalysis } from "@/lib/supabase/queries/articles";

export interface ForYouFeedProps {
  initialArticles: ArticleWithSourceAndAnalysis[];
}

type FeedTab = "recommended" | "counter" | "balanced";

export function ForYouFeed({ initialArticles }: ForYouFeedProps) {
  const { bookmarks } = useBookmarks();
  const [activeTab, setActiveTab] = React.useState<FeedTab>("recommended");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Compute User Source and Bias Affinities from Bookmarks
  const { topSources, dominantBias, bookmarkedSourceSet } = React.useMemo(() => {
    if (bookmarks.length === 0) {
      return { topSources: [], dominantBias: null, bookmarkedSourceSet: new Set<string>() };
    }

    const sourceCounts: Record<string, { name: string; count: number }> = {};
    bookmarks.forEach((b) => {
      if (b.source_name) {
        const key = b.source_name.toLowerCase();
        if (!sourceCounts[key]) {
          sourceCounts[key] = { name: b.source_name, count: 0 };
        }
        sourceCounts[key].count += 1;
      }
    });

    const sortedSources = Object.values(sourceCounts)
      .sort((a, b) => b.count - a.count)
      .map((item) => item.name);

    const bookmarkedSet = new Set(Object.keys(sourceCounts));

    // Correlate bookmarked articles with initial pool to approximate user bias affinity
    const bookmarkedIds = new Set(bookmarks.map((b) => b.id));
    let leftCount = 0;
    let rightCount = 0;
    let centerCount = 0;

    initialArticles.forEach((article) => {
      if (bookmarkedIds.has(article.id) && article.analysis) {
        if (article.analysis.bias_label === "left") leftCount++;
        else if (article.analysis.bias_label === "right") rightCount++;
        else if (article.analysis.bias_label === "center") centerCount++;
      }
    });

    let dominant: "left" | "right" | "center" | null = null;
    if (leftCount > rightCount && leftCount > centerCount) dominant = "left";
    else if (rightCount > leftCount && rightCount > centerCount) dominant = "right";
    else if (centerCount >= leftCount && centerCount >= rightCount && centerCount > 0) dominant = "center";

    return {
      topSources: sortedSources.slice(0, 3),
      dominantBias: dominant,
      bookmarkedSourceSet: bookmarkedSet,
    };
  }, [bookmarks, initialArticles]);

  // Compute Tab Articles
  const filteredArticles = React.useMemo(() => {
    if (initialArticles.length === 0) return [];

    if (activeTab === "balanced") {
      // Prioritize Center, high center percentage, or high confidence neutral/balanced framing
      return [...initialArticles]
        .filter((a) => a.analysis && (a.analysis.bias_label === "center" || a.analysis.center_percentage >= 40))
        .sort((a, b) => (b.analysis?.center_percentage || 0) - (a.analysis?.center_percentage || 0));
    }

    if (activeTab === "counter") {
      // If user has dominant bias, show opposite side to counter echo chambers; else show mixed/divergent stories
      if (dominantBias === "left") {
        return initialArticles.filter((a) => a.analysis?.bias_label === "right" || (a.analysis?.right_percentage || 0) >= 40);
      } else if (dominantBias === "right") {
        return initialArticles.filter((a) => a.analysis?.bias_label === "left" || (a.analysis?.left_percentage || 0) >= 40);
      } else {
        // Diversified framing
        return initialArticles.filter(
          (a) => a.analysis && (a.analysis.bias_label === "left" || a.analysis.bias_label === "right")
        );
      }
    }

    // "recommended": Rank based on bookmark affinities + quality confidence
    if (bookmarks.length === 0) {
      return initialArticles;
    }

    return [...initialArticles].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Source match boost
      if (bookmarkedSourceSet.has(a.source.name.toLowerCase())) scoreA += 50;
      if (bookmarkedSourceSet.has(b.source.name.toLowerCase())) scoreB += 50;

      // Confidence boost
      scoreA += (a.analysis?.confidence || 0.5) * 20;
      scoreB += (b.analysis?.confidence || 0.5) * 20;

      return scoreB - scoreA;
    });
  }, [initialArticles, activeTab, bookmarks.length, bookmarkedSourceSet, dominantBias]);

  const articlesKey = `${activeTab}-${filteredArticles.map((a) => a.id).slice(0, 10).join(",")}`;

  // GSAP Choreographed Entrance Animation
  useGSAP(
    () => {
      if (!containerRef.current || filteredArticles.length === 0) return;

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
      {/* Onboarding / Personalization Banner */}
      {bookmarks.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Personalize Your AI News Experience
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Pixca curates top stories and balanced counter-perspectives tailored to your reading interests.
              Bookmark articles across the site to teach the recommendation model your favorite publishers and topics.
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
      ) : (
        <div className="bg-card border border-[var(--border)] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Tailored Intelligence
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                Tuned from {bookmarks.length} saved {bookmarks.length === 1 ? "article" : "articles"}
                {topSources.length > 0 && ` • Top sources: ${topSources.join(", ")}`}
              </div>
            </div>
          </div>
          <Link href="/saved">
            <Button variant="ghost" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Manage Bookmarks →
            </Button>
          </Link>
        </div>
      )}

      {/* Feed Filter Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 overflow-x-auto gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("recommended")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "recommended"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-muted"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended For You</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("counter")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "counter"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-muted"
            )}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Counter-Perspective</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("balanced")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
              activeTab === "balanced"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-muted"
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Top Balanced</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>AI-Verified Intelligence</span>
        </div>
      </div>

      {/* News Article Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-card rounded-2xl border border-[var(--border)] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              No matching articles in this category
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Check back soon as new articles are scraped and analyzed hourly, or switch to the Recommended tab.
            </p>
          </div>
          <Button
            onClick={() => setActiveTab("recommended")}
            variant="outline"
            className="text-xs font-semibold rounded-lg"
          >
            View All Recommendations
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
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
                  sourceName={article.source.name}
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
