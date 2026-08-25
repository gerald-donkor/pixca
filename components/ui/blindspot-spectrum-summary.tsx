"use client";

import * as React from "react";
import { Scale } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { ArticleWithSourceAndAnalysis } from "@/lib/supabase/queries/articles";

export interface BlindspotSpectrumSummaryProps {
  articles: ArticleWithSourceAndAnalysis[];
  activeBias: "all" | "left" | "right";
}

export function BlindspotSpectrumSummary({
  articles,
  activeBias,
}: BlindspotSpectrumSummaryProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Compute aggregated perspective statistics
  const stats = React.useMemo(() => {
    let totalLeft = 0;
    let totalCenter = 0;
    let totalRight = 0;
    let validCount = 0;

    let leftCount = 0;
    let centerCount = 0;
    let rightCount = 0;
    let mixedCount = 0;

    for (const article of articles) {
      if (!article.analysis) continue;
      const { left_percentage, center_percentage, right_percentage, bias_label } =
        article.analysis;

      totalLeft += left_percentage || 0;
      totalCenter += center_percentage || 0;
      totalRight += right_percentage || 0;
      validCount++;

      if (bias_label === "left") leftCount++;
      else if (bias_label === "right") rightCount++;
      else if (bias_label === "center") centerCount++;
      else mixedCount++;
    }

    const totalSum = totalLeft + totalCenter + totalRight;
    const avgLeft = totalSum > 0 ? Math.round((totalLeft / totalSum) * 100) : 0;
    const avgCenter = totalSum > 0 ? Math.round((totalCenter / totalSum) * 100) : 0;
    const avgRight = totalSum > 0 ? Math.round((totalRight / totalSum) * 100) : 0;

    // Normalization to ensure 100% sum if totalSum > 0
    let normalizedLeft = avgLeft;
    let normalizedCenter = avgCenter;
    let normalizedRight = avgRight;

    const currentSum = normalizedLeft + normalizedCenter + normalizedRight;
    if (currentSum > 0 && currentSum !== 100) {
      const diff = 100 - currentSum;
      if (normalizedCenter >= normalizedLeft && normalizedCenter >= normalizedRight) {
        normalizedCenter = Math.max(0, normalizedCenter + diff);
      } else if (normalizedLeft >= normalizedRight) {
        normalizedLeft = Math.max(0, normalizedLeft + diff);
      } else {
        normalizedRight = Math.max(0, normalizedRight + diff);
      }
    }

    let dominantLean = "Balanced";
    let dominantColor = "text-zinc-600 dark:text-zinc-300";
    if (normalizedLeft > normalizedRight + 10) {
      dominantLean = "Left-Leaning Skew";
      dominantColor = "text-blue-600 dark:text-blue-400";
    } else if (normalizedRight > normalizedLeft + 10) {
      dominantLean = "Right-Leaning Skew";
      dominantColor = "text-red-600 dark:text-red-400";
    }

    return {
      total: validCount,
      leftPct: normalizedLeft,
      centerPct: normalizedCenter,
      rightPct: normalizedRight,
      leftCount,
      centerCount,
      rightCount,
      mixedCount,
      dominantLean,
      dominantColor,
    };
  }, [articles]);

  // GSAP animations for the spectrum bar & cards
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".spectrum-segment",
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
          ".spectrum-metric",
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.05,
          }
        );
      });
    },
    { scope: containerRef, dependencies: [stats, activeBias] }
  );

  if (stats.total === 0) return null;

  return (
    <div
      ref={containerRef}
      className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-5"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Blindspot Spectrum Distribution</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                {stats.total} {stats.total === 1 ? "Story" : "Stories"}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Aggregated framing breakdown across all analyzed stories in this feed.
            </p>
          </div>
        </div>

        {/* Dataset Lean Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
            Overall Distribution:
          </span>
          <span className={cn("font-bold", stats.dominantColor)}>
            {stats.dominantLean}
          </span>
        </div>
      </div>

      {/* Visual Multi-Color Spectrum Bar */}
      <div className="space-y-2">
        <div className="relative flex h-7 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 select-none">
          {/* Left Segment */}
          {stats.leftPct > 0 && (
            <div
              className="spectrum-segment flex items-center justify-start bg-blue-600 text-white px-2.5 text-[11px] font-bold overflow-hidden shrink-0 will-change-transform origin-left transition-[width] duration-300"
              style={{ width: `${stats.leftPct}%` }}
              title={`Left Framing: ${stats.leftPct}% (${stats.leftCount} stories)`}
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
              className="spectrum-segment flex items-center justify-center bg-zinc-400 dark:bg-zinc-600 text-zinc-900 dark:text-white px-2.5 text-[11px] font-bold overflow-hidden shrink-0 will-change-transform origin-left transition-[width] duration-300"
              style={{ width: `${stats.centerPct}%` }}
              title={`Center / Neutral Framing: ${stats.centerPct}% (${stats.centerCount} stories)`}
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
              className="spectrum-segment flex items-center justify-end bg-red-600 text-white px-2.5 text-[11px] font-bold overflow-hidden shrink-0 will-change-transform origin-left transition-[width] duration-300"
              style={{ width: `${stats.rightPct}%` }}
              title={`Right Framing: ${stats.rightPct}% (${stats.rightCount} stories)`}
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
              <span>Left ({stats.leftCount} stories)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
              <span>Center ({stats.centerCount} stories)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
              <span>Right ({stats.rightCount} stories)</span>
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500 font-medium">
            Updated dynamically with AI analysis
          </div>
        </div>
      </div>

      {/* Mini Insight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="spectrum-metric p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Left-Framed Stories
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

        <div className="spectrum-metric p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
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

        <div className="spectrum-metric p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Right-Framed Stories
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
      </div>
    </div>
  );
}
