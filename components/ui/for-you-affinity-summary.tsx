"use client";

import * as React from "react";
import { Sparkles, Compass, ShieldAlert, ShieldCheck, Scale, Bookmark, Tag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReadingDietShareModal } from "@/components/ui/reading-diet-share-modal";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { BookmarkedArticle } from "@/hooks/use-bookmarks";

export interface ForYouAffinitySummaryProps {
  bookmarks: BookmarkedArticle[];
  topTopics: string[];
  className?: string;
}

export function ForYouAffinitySummary({
  bookmarks,
  topTopics,
  className,
}: ForYouAffinitySummaryProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);

  // Compute User Affinity, Perspective Balance, and Echo-Chamber Index
  const stats = React.useMemo(() => {
    let totalLeft = 0;
    let totalCenter = 0;
    let totalRight = 0;
    let validCount = 0;

    let leftCount = 0;
    let centerCount = 0;
    let rightCount = 0;
    let mixedCount = 0;

    const sourcesSet = new Set<string>();

    for (const item of bookmarks) {
      if (item.source_name) {
        sourcesSet.add(item.source_name);
      }

      if (
        item.left_percentage !== undefined &&
        item.center_percentage !== undefined &&
        item.right_percentage !== undefined
      ) {
        totalLeft += item.left_percentage;
        totalCenter += item.center_percentage;
        totalRight += item.right_percentage;
        validCount++;

        if (item.bias_label === "left") leftCount++;
        else if (item.bias_label === "right") rightCount++;
        else if (item.bias_label === "center") centerCount++;
        else mixedCount++;
      } else if (item.bias_label) {
        validCount++;
        if (item.bias_label === "left") {
          totalLeft += 70;
          totalCenter += 20;
          totalRight += 10;
          leftCount++;
        } else if (item.bias_label === "right") {
          totalLeft += 10;
          totalCenter += 20;
          totalRight += 70;
          rightCount++;
        } else if (item.bias_label === "center") {
          totalLeft += 15;
          totalCenter += 70;
          totalRight += 15;
          centerCount++;
        } else {
          totalLeft += 33;
          totalCenter += 34;
          totalRight += 33;
          mixedCount++;
        }
      }
    }

    const totalSum = totalLeft + totalCenter + totalRight;
    let avgLeft = totalSum > 0 ? Math.round((totalLeft / totalSum) * 100) : 33;
    let avgCenter = totalSum > 0 ? Math.round((totalCenter / totalSum) * 100) : 34;
    let avgRight = totalSum > 0 ? Math.round((totalRight / totalSum) * 100) : 33;

    if (totalSum === 0 && bookmarks.length > 0) {
      avgLeft = 25;
      avgCenter = 50;
      avgRight = 25;
    }

    // Normalization to guarantee 100% total
    const currentSum = avgLeft + avgCenter + avgRight;
    if (currentSum > 0 && currentSum !== 100) {
      const diff = 100 - currentSum;
      if (avgCenter >= avgLeft && avgCenter >= avgRight) {
        avgCenter = Math.max(0, avgCenter + diff);
      } else if (avgLeft >= avgRight) {
        avgLeft = Math.max(0, avgLeft + diff);
      } else {
        avgRight = Math.max(0, avgRight + diff);
      }
    }

    // Dominant Lean Classification
    let dominantLean = "Balanced Exploration";
    let dominantColor = "text-purple-600 dark:text-purple-400";
    let dominantBg = "bg-purple-500/10 border-purple-500/20";
    let biasKey: "left" | "right" | "center" | "balanced" = "balanced";

    if (avgCenter >= 55) {
      dominantLean = "Centrist Focus";
      dominantColor = "text-zinc-700 dark:text-zinc-300";
      dominantBg = "bg-zinc-500/10 border-zinc-500/20";
      biasKey = "center";
    } else if (avgLeft > avgRight + 12) {
      dominantLean = "Left-Leaning Skew";
      dominantColor = "text-blue-600 dark:text-blue-400";
      dominantBg = "bg-blue-500/10 border-blue-500/20";
      biasKey = "left";
    } else if (avgRight > avgLeft + 12) {
      dominantLean = "Right-Leaning Skew";
      dominantColor = "text-red-600 dark:text-red-400";
      dominantBg = "bg-red-500/10 border-red-500/20";
      biasKey = "right";
    }

    // Compute Echo-Chamber Resilience Index (0 to 100%)
    // High entropy across left/center/right + high source diversity = high resilience
    const maxSkew = Math.max(avgLeft, avgCenter, avgRight);
    let resilienceScore = Math.max(10, Math.round(100 - (maxSkew - 33.3) * 1.5));
    if (sourcesSet.size >= 4) resilienceScore = Math.min(100, resilienceScore + 10);
    if (sourcesSet.size <= 1 && bookmarks.length >= 3) resilienceScore = Math.max(20, resilienceScore - 15);

    let resilienceLabel = "Echo-Chamber Shielded";
    let resilienceColor = "text-emerald-600 dark:text-emerald-400";
    let resilienceBadge = "bg-emerald-500/10 border-emerald-500/20";
    let resilienceIcon = ShieldCheck;

    if (resilienceScore < 50) {
      resilienceLabel = "Echo-Chamber Risk";
      resilienceColor = "text-amber-600 dark:text-amber-400";
      resilienceBadge = "bg-amber-500/10 border-amber-500/20";
      resilienceIcon = ShieldAlert;
    } else if (resilienceScore < 75) {
      resilienceLabel = "Moderate Diversity";
      resilienceColor = "text-blue-600 dark:text-blue-400";
      resilienceBadge = "bg-blue-500/10 border-blue-500/20";
      resilienceIcon = Compass;
    }

    return {
      totalBookmarks: bookmarks.length,
      analyzedCount: validCount,
      uniqueSourcesCount: sourcesSet.size,
      leftPct: avgLeft,
      centerPct: avgCenter,
      rightPct: avgRight,
      leftCount,
      centerCount,
      rightCount,
      mixedCount,
      dominantLean,
      dominantColor,
      dominantBg,
      biasKey,
      resilienceScore,
      resilienceLabel,
      resilienceColor,
      resilienceBadge,
      resilienceIcon,
    };
  }, [bookmarks]);

  // GSAP animation for meter segments & metric cards
  useGSAP(
    () => {
      if (!containerRef.current || bookmarks.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".for-you-meter-segment",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.6,
            ease: "power2.out",
            transformOrigin: "left center",
            stagger: 0.08,
          }
        );

        gsap.fromTo(
          ".for-you-metric-card",
          { autoAlpha: 0, y: 8 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.05,
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          ".for-you-meter-segment, .for-you-metric-card",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
            stagger: 0.02,
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [stats, bookmarks.length] }
  );

  if (bookmarks.length === 0) return null;

  const ShieldIcon = stats.resilienceIcon;

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-2xl bg-card border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-5 w-full min-w-0 max-w-full",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h2 className="text-base font-bold text-[var(--text-primary)] break-words">
                Adaptive Reading Profile
              </h2>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 max-w-full",
                  stats.dominantBg,
                  stats.dominantColor
                )}
              >
                {stats.dominantLean}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 break-words">
              Personalized intelligence computed from your {stats.totalBookmarks} saved{" "}
              {stats.totalBookmarks === 1 ? "article" : "articles"} across{" "}
              {stats.uniqueSourcesCount} {stats.uniqueSourcesCount === 1 ? "publisher" : "publishers"}.
            </p>
          </div>
        </div>

        {/* Actions & Echo-Chamber Shield Indicator */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-start sm:justify-end">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold shrink-0",
              stats.resilienceBadge,
              stats.resilienceColor
            )}
          >
            <ShieldIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{stats.resilienceLabel}</span>
            <span className="opacity-60 text-[10px]">({stats.resilienceScore}%)</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShareModalOpen(true)}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Share Profile</span>
          </Button>
        </div>
      </div>

      {/* 3-Segment Perspective Balance Meter */}
      <div className="space-y-2 w-full min-w-0">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium text-[var(--text-muted)] gap-1 flex-wrap min-[360px]:flex-nowrap">
          <span className="flex items-center gap-1 sm:gap-1.5 text-blue-600 dark:text-blue-400 font-semibold truncate">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0" />
            Left {stats.leftPct}%
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-zinc-600 dark:text-zinc-400 font-semibold truncate">
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 inline-block shrink-0" />
            Center {stats.centerPct}%
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 text-red-600 dark:text-red-400 font-semibold truncate">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
            Right {stats.rightPct}%
          </span>
        </div>

        <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5 p-0.5 min-w-0">
          {stats.leftPct > 0 && (
            <div
              className="for-you-meter-segment h-full rounded-l-full bg-blue-500 transition-[width] duration-300"
              style={{ width: `${stats.leftPct}%` }}
              title={`Left-leaning: ${stats.leftPct}%`}
            />
          )}
          {stats.centerPct > 0 && (
            <div
              className={cn(
                "for-you-meter-segment h-full bg-zinc-400 dark:bg-zinc-500 transition-[width] duration-300",
                stats.leftPct === 0 && "rounded-l-full",
                stats.rightPct === 0 && "rounded-r-full"
              )}
              style={{ width: `${stats.centerPct}%` }}
              title={`Center / Neutral: ${stats.centerPct}%`}
            />
          )}
          {stats.rightPct > 0 && (
            <div
              className="for-you-meter-segment h-full rounded-r-full bg-red-500 transition-[width] duration-300"
              style={{ width: `${stats.rightPct}%` }}
              title={`Right-leaning: ${stats.rightPct}%`}
            />
          )}
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1 w-full min-w-0">
        <div className="for-you-metric-card p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border)] min-w-0 overflow-hidden">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 sm:gap-1.5 truncate">
            <Bookmark className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">Saved Library</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mt-1 truncate">
            {stats.totalBookmarks} <span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)]">articles</span>
          </div>
        </div>

        <div className="for-you-metric-card p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border)] min-w-0 overflow-hidden">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 sm:gap-1.5 truncate">
            <Scale className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="truncate">Source Breadth</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mt-1 truncate">
            {stats.uniqueSourcesCount} <span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)]">publishers</span>
          </div>
        </div>

        <div className="for-you-metric-card p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border)] min-w-0 overflow-hidden">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 sm:gap-1.5 truncate">
            <ShieldIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Shield Score</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mt-1 truncate">
            {stats.resilienceScore}% <span className="text-[10px] sm:text-xs font-normal text-[var(--text-muted)]">resilience</span>
          </div>
        </div>

        <div className="for-you-metric-card p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border)] min-w-0 overflow-hidden">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 sm:gap-1.5 truncate">
            <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Topic Interests</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 flex-wrap overflow-hidden">
            {topTopics.length > 0 ? (
              topTopics.slice(0, 2).map((topic) => (
                <span
                  key={topic}
                  className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[9px] sm:text-[10px] font-semibold text-[var(--text-secondary)] capitalize truncate max-w-[65px] sm:max-w-[80px]"
                >
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-normal truncate">General News</span>
            )}
          </div>
        </div>
      </div>

      {/* Reading Diet Export & Share Modal */}
      <ReadingDietShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        stats={{
          totalBookmarks: stats.totalBookmarks,
          uniqueSourcesCount: stats.uniqueSourcesCount,
          leftPct: stats.leftPct,
          centerPct: stats.centerPct,
          rightPct: stats.rightPct,
          dominantLean: stats.dominantLean,
          resilienceScore: stats.resilienceScore,
          resilienceLabel: stats.resilienceLabel,
          topTopics,
        }}
      />
    </div>
  );
}
