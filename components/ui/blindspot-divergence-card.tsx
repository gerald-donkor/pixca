"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowRightLeft,
  Columns2,
  Sparkles,
  Flame,
  FileText,
  Quote,
} from "lucide-react";
import { BiasMeter } from "@/components/ui/bias-meter";
import {
  PerspectiveComparisonModal,
  type PrimaryArticleComparisonData,
  type TargetArticleComparisonData,
} from "@/components/ui/perspective-comparison-modal";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { sentimentLabelColorClass } from "@/lib/ui/analysis-display";
import type { ArticleWithSourceAndAnalysis } from "@/lib/supabase/queries/articles";

export interface BlindspotDivergenceCardProps {
  leftArticle: ArticleWithSourceAndAnalysis;
  rightArticle: ArticleWithSourceAndAnalysis;
  topicTitle?: string;
}

export function BlindspotDivergenceCard({
  leftArticle,
  rightArticle,
  topicTitle = "High-Contrast Framing Divergence",
}: BlindspotDivergenceCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = React.useState<"side-by-side" | "framing-matrix">(
    "side-by-side"
  );
  const [compareModalOpen, setCompareModalOpen] = React.useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".tab-content-panel",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      });
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  const leftAnalysis = leftArticle.analysis;
  const rightAnalysis = rightArticle.analysis;

  const primaryComparisonData: PrimaryArticleComparisonData = {
    id: leftArticle.id,
    title: leftArticle.title,
    sourceName: leftArticle.source.name,
    publishedAt: leftArticle.published_at,
    imageUrl: leftArticle.image_url,
    biasLabel: leftAnalysis?.bias_label,
    leftPercentage: leftAnalysis?.left_percentage,
    centerPercentage: leftAnalysis?.center_percentage,
    rightPercentage: leftAnalysis?.right_percentage,
    sentimentLabel: leftAnalysis?.sentiment_label,
    sentimentScore: leftAnalysis?.sentiment_score,
    confidence: leftAnalysis?.confidence,
    summary: leftAnalysis?.summary,
    framingNotes: leftAnalysis?.framing_notes,
    loadedTerms: leftAnalysis?.loaded_terms ?? undefined,
  };

  const targetComparisonData: TargetArticleComparisonData = {
    id: rightArticle.id,
    article_id: rightArticle.id,
    title: rightArticle.title,
    sourceName: rightArticle.source.name,
    source_name: rightArticle.source.name,
    publishedAt: rightArticle.published_at,
    published_at: rightArticle.published_at,
    imageUrl: rightArticle.image_url,
    image_url: rightArticle.image_url,
    biasLabel: rightAnalysis?.bias_label,
    bias_label: rightAnalysis?.bias_label,
    leftPercentage: rightAnalysis?.left_percentage,
    left_percentage: rightAnalysis?.left_percentage,
    centerPercentage: rightAnalysis?.center_percentage,
    center_percentage: rightAnalysis?.center_percentage,
    rightPercentage: rightAnalysis?.right_percentage,
    right_percentage: rightAnalysis?.right_percentage,
    sentimentLabel: rightAnalysis?.sentiment_label,
    sentiment_label: rightAnalysis?.sentiment_label,
    sentimentScore: rightAnalysis?.sentiment_score,
    sentiment_score: rightAnalysis?.sentiment_score,
    confidence: rightAnalysis?.confidence,
    summary: rightAnalysis?.summary,
    framingNotes: rightAnalysis?.framing_notes,
    framing_notes: rightAnalysis?.framing_notes,
    loadedTerms: rightAnalysis?.loaded_terms ?? undefined,
    loaded_terms: rightAnalysis?.loaded_terms ?? undefined,
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl bg-white dark:bg-[#121215] border-2 border-blue-500/30 dark:border-blue-500/40 p-5 sm:p-7 shadow-lg shadow-blue-500/5 space-y-6 overflow-hidden"
    >
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-gradient-to-bl from-blue-500/10 via-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Perspective Divergence Feature</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            {topicTitle}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comparing how left-leaning and right-leaning outlets frame related events with contrasting rhetoric.
          </p>
        </div>

        {/* View Toggle Mode & Modal Action */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setCompareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Compare in Modal</span>
          </button>

          <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("side-by-side")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "side-by-side"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Side by Side</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("framing-matrix")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "framing-matrix"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Framing & Rhetoric</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Side by Side View */}
      {activeTab === "side-by-side" && (
        <div className="tab-content-panel grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column Story */}
          <div className="flex flex-col justify-between rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-blue-500/30 p-5 sm:p-6 space-y-5 transition-all hover:border-blue-500/60 hover:shadow-md">
            <div className="space-y-4">
              {/* Header Meta */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    Left Perspective
                  </span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {leftArticle.source.name}
                  </span>
                </div>
                {leftAnalysis && (
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded-md capitalize bg-zinc-200 dark:bg-zinc-800",
                      sentimentLabelColorClass(leftAnalysis.sentiment_label)
                    )}
                  >
                    {leftAnalysis.sentiment_label} Tone
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                {leftArticle.title}
              </h3>

              {/* Summary */}
              {leftAnalysis?.summary && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {leftAnalysis.summary}
                </p>
              )}

              {/* Bias Meter */}
              {leftAnalysis && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Estimated Framing Breakdown
                  </span>
                  <BiasMeter
                    leftValue={leftAnalysis.left_percentage}
                    centerValue={leftAnalysis.center_percentage}
                    rightValue={leftAnalysis.right_percentage}
                  />
                </div>
              )}
            </div>

            {/* Link to Full Analysis */}
            <div className="pt-2">
              <Link
                href={`/article/${leftArticle.id}`}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs"
              >
                <span>Read Full Left-Angle Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column Story */}
          <div className="flex flex-col justify-between rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-red-500/30 p-5 sm:p-6 space-y-5 transition-all hover:border-red-500/60 hover:shadow-md">
            <div className="space-y-4">
              {/* Header Meta */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                    Right Perspective
                  </span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {rightArticle.source.name}
                  </span>
                </div>
                {rightAnalysis && (
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded-md capitalize bg-zinc-200 dark:bg-zinc-800",
                      sentimentLabelColorClass(rightAnalysis.sentiment_label)
                    )}
                  >
                    {rightAnalysis.sentiment_label} Tone
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                {rightArticle.title}
              </h3>

              {/* Summary */}
              {rightAnalysis?.summary && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {rightAnalysis.summary}
                </p>
              )}

              {/* Bias Meter */}
              {rightAnalysis && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Estimated Framing Breakdown
                  </span>
                  <BiasMeter
                    leftValue={rightAnalysis.left_percentage}
                    centerValue={rightAnalysis.center_percentage}
                    rightValue={rightAnalysis.right_percentage}
                  />
                </div>
              )}
            </div>

            {/* Link to Full Analysis */}
            <div className="pt-2">
              <Link
                href={`/article/${rightArticle.id}`}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-xs"
              >
                <span>Read Full Right-Angle Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Framing & Loaded Terms Matrix View */}
      {activeTab === "framing-matrix" && (
        <div className="tab-content-panel grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Angle Framing Notes & Loaded Terms */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-blue-500/30 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {leftArticle.source.name} Framing & Loaded Rhetoric
              </h4>
            </div>

            {/* Framing Notes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Editorial Framing Notes</span>
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-800/80 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                {leftAnalysis?.framing_notes ||
                  "Standard reporting focusing on policy consequences and societal impact."}
              </p>
            </div>

            {/* Loaded Terms */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Extracted Loaded Terms</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {leftAnalysis?.loaded_terms && leftAnalysis.loaded_terms.length > 0 ? (
                  leftAnalysis.loaded_terms.map((term, i) => (
                    <span
                      key={`${term}-${i}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                    >
                      &ldquo;{term}&rdquo;
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                    No strongly polarized rhetoric detected.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Angle Framing Notes & Loaded Terms */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-red-500/30 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {rightArticle.source.name} Framing & Loaded Rhetoric
              </h4>
            </div>

            {/* Framing Notes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <span>Editorial Framing Notes</span>
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-800/80 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                {rightAnalysis?.framing_notes ||
                  "Standard reporting emphasizing institutional accountability and economic factors."}
              </p>
            </div>

            {/* Loaded Terms */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Extracted Loaded Terms</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {rightAnalysis?.loaded_terms && rightAnalysis.loaded_terms.length > 0 ? (
                  rightAnalysis.loaded_terms.map((term, i) => (
                    <span
                      key={`${term}-${i}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20"
                    >
                      &ldquo;{term}&rdquo;
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                    No strongly polarized rhetoric detected.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Perspective Comparison Modal */}
      <PerspectiveComparisonModal
        open={compareModalOpen}
        onOpenChange={setCompareModalOpen}
        primaryArticle={primaryComparisonData}
        targetArticle={targetComparisonData}
      />
    </div>
  );
}
