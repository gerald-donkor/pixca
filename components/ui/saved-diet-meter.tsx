"use client";

import * as React from "react";
import { Scale, Sparkles, Newspaper } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { BookmarkedArticle } from "@/hooks/use-bookmarks";

export interface SavedDietMeterProps {
  bookmarks: BookmarkedArticle[];
  className?: string;
}

export function SavedDietMeter({ bookmarks, className }: SavedDietMeterProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Compute aggregated reading diet perspective statistics
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
        // Fallback for legacy bookmarks with bias_label only
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
      // Default to neutral center if no items have analysis yet
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

    let dominantLean = "Balanced Reading Diet";
    let dominantColor = "text-emerald-600 dark:text-emerald-400";
    let dominantBg = "bg-emerald-500/10 border-emerald-500/20";

    if (avgCenter >= 55) {
      dominantLean = "Centrist Focus";
      dominantColor = "text-zinc-700 dark:text-zinc-300";
      dominantBg = "bg-zinc-500/10 border-zinc-500/20";
    } else if (avgLeft > avgRight + 10) {
      dominantLean = "Left-Leaning Diet";
      dominantColor = "text-blue-600 dark:text-blue-400";
      dominantBg = "bg-blue-500/10 border-blue-500/20";
    } else if (avgRight > avgLeft + 10) {
      dominantLean = "Right-Leaning Diet";
      dominantColor = "text-red-600 dark:text-red-400";
      dominantBg = "bg-red-500/10 border-red-500/20";
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
    };
  }, [bookmarks]);

  // GSAP animation for meter segments & metric cards
  useGSAP(
    () => {
      if (!containerRef.current || bookmarks.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".diet-meter-segment",
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
          ".diet-metric-card",
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
          ".diet-meter-segment, .diet-metric-card",
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

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-2xl bg-card border border-[var(--border)] p-5 sm:p-6 shadow-xs space-y-5",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>Personal Reading Diet & Perspective Balance</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                {stats.totalBookmarks} {stats.totalBookmarks === 1 ? "Story" : "Stories"}
              </span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Aggregated framing distribution and source diversity across your saved library.
            </p>
          </div>
        </div>

        {/* Dominant Lean Indicator */}
        <div
          className={cn(
            "flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs",
            stats.dominantBg
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
            Reading Diet:
          </span>
          <span className={cn("font-bold", stats.dominantColor)}>
            {stats.dominantLean}
          </span>
        </div>
      </div>

      {/* Visual Proportional Spectrum Bar */}
      <div className="space-y-2">
        <div className="relative flex h-7.5 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 select-none">
          {/* Left Segment */}
          {stats.leftPct > 0 && (
            <div
              className="diet-meter-segment flex items-center justify-start bg-blue-600 text-white px-2.5 text-[11px] font-bold overflow-hidden shrink-0 will-change-transform origin-left transition-[width] duration-300"
              style={{ width: `${stats.leftPct}%` }}
              title={`Left Framing: ${stats.leftPct}%`}
            >
              {stats.leftPct >= 10 && (
                <span className="whitespace-nowrap drop-shadow-xs">
                  Left {stats.leftPct}%
                </span>
              )}
            </div>
          )}

          {/* Center Segment */}
          {stats.centerPct > 0 && (
            <div
              className="diet-meter-segment flex items-center justify-center bg-zinc-400 dark:bg-zinc-600 text-zinc-900 dark:text-white px-2.5 text-[11px] font-bold overflow-hidden shrink-0 will-change-transform origin-left transition-[width] duration-300"
              style={{ width: `${stats.centerPct}%` }}
              title={`Center / Neutral Framing: ${stats.centerPct}%`}
            >
              {stats.centerPct >= 10 && (
                <span className="whitespace-nowrap drop-shadow-xs">
                  Center {stats.centerPct}%
                </span>
              )}
            </div>
          )}

          {/* Right Segment */}
          {stats.rightPct > 0 && (
            <div
              className="diet-meter-segment flex items-center justify-end bg-red-600 text-white px-2.5 text-[11px] font-bold overflow-hidden shrink-0 will-change-transform origin-left transition-[width] duration-300"
              style={{ width: `${stats.rightPct}%` }}
              title={`Right Framing: ${stats.rightPct}%`}
            >
              {stats.rightPct >= 10 && (
                <span className="whitespace-nowrap drop-shadow-xs">
                  Right {stats.rightPct}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-0.5 gap-2">
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <span>Left ({stats.leftPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
              <span>Center ({stats.centerPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
              <span>Right ({stats.rightPct}%)</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
            Calculated across your saved stories
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Left Stories Card */}
        <div className="diet-metric-card p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Left-Framed
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {stats.leftCount}{" "}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              ({stats.leftPct}%)
            </span>
          </div>
        </div>

        {/* Center Stories Card */}
        <div className="diet-metric-card p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Center / Balanced
            </span>
            <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          </div>
          <div className="text-base font-extrabold text-zinc-700 dark:text-zinc-300 mt-1">
            {stats.centerCount}{" "}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              ({stats.centerPct}%)
            </span>
          </div>
        </div>

        {/* Right Stories Card */}
        <div className="diet-metric-card p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Right-Framed
            </span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="text-base font-extrabold text-red-600 dark:text-red-400 mt-1">
            {stats.rightCount}{" "}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              ({stats.rightPct}%)
            </span>
          </div>
        </div>

        {/* Publisher Diversity Card */}
        <div className="diet-metric-card p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Publisher Diversity
            </span>
            <Newspaper className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="text-base font-extrabold text-[var(--text-primary)] mt-1">
            {stats.uniqueSourcesCount}{" "}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              {stats.uniqueSourcesCount === 1 ? "source" : "sources"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
