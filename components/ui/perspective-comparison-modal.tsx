"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  ExternalLink,
  Copy,
  Check,
  Scale,
  Sparkles,
  ShieldAlert,
  Flame,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BiasMeter } from "@/components/ui/bias-meter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import type { BiasLabel, SentimentLabel, RelatedArticleRow } from "@/lib/supabase/types";
import {
  biasLabelColorClass,
  sentimentLabelColorClass,
} from "@/lib/ui/analysis-display";
import { formatArticleDate, formatPercent, formatConfidence, titleCase } from "@/lib/ui/format";

export interface PrimaryArticleComparisonData {
  id: string;
  title: string;
  sourceName: string;
  publishedAt?: string;
  imageUrl?: string;
  biasLabel?: BiasLabel;
  leftPercentage?: number;
  centerPercentage?: number;
  rightPercentage?: number;
  sentimentLabel?: SentimentLabel;
  sentimentScore?: number;
  confidence?: number;
  summary?: string;
  framingNotes?: string | null;
  loadedTerms?: string[];
}

export interface TargetArticleComparisonData {
  id?: string;
  article_id?: string;
  title: string;
  source_name?: string;
  sourceName?: string;
  published_at?: string;
  publishedAt?: string;
  image_url?: string;
  imageUrl?: string;
  bias_label?: BiasLabel;
  biasLabel?: BiasLabel;
  left_percentage?: number;
  leftPercentage?: number;
  center_percentage?: number;
  centerPercentage?: number;
  right_percentage?: number;
  rightPercentage?: number;
  sentiment_label?: SentimentLabel;
  sentimentLabel?: SentimentLabel;
  sentiment_score?: number;
  sentimentScore?: number;
  confidence?: number;
  similarity?: number;
  summary?: string;
  framing_notes?: string | null;
  framingNotes?: string | null;
  loaded_terms?: string[];
  loadedTerms?: string[];
}

export interface PerspectiveComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primaryArticle: PrimaryArticleComparisonData;
  targetArticle: TargetArticleComparisonData | RelatedArticleRow | null;
}

function useIsDesktop(query = "(min-width: 768px)") {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );

  return React.useSyncExternalStore(
    subscribe,
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : true),
    () => true
  );
}

export function PerspectiveComparisonModal({
  open,
  onOpenChange,
  primaryArticle,
  targetArticle,
}: PerspectiveComparisonModalProps) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const [copied, setCopied] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState<"split" | "primary" | "target">("split");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMobileTab("split");
    }
    onOpenChange(nextOpen);
  };

  // Delta calculations
  const primaryLeft = primaryArticle.leftPercentage ?? 0;
  const primaryRight = primaryArticle.rightPercentage ?? 0;
  const primaryCenter = primaryArticle.centerPercentage ?? 0;

  const targetId = targetArticle
    ? "article_id" in targetArticle && targetArticle.article_id
      ? targetArticle.article_id
      : "id" in targetArticle && targetArticle.id
        ? targetArticle.id
        : ""
    : "";
  const targetTitle = targetArticle?.title ?? "";
  const targetSourceName = targetArticle
    ? "source_name" in targetArticle && targetArticle.source_name
      ? targetArticle.source_name
      : "sourceName" in targetArticle && targetArticle.sourceName
        ? targetArticle.sourceName
        : "Unknown"
    : "Unknown";
  const targetPublishedAt = targetArticle
    ? "published_at" in targetArticle && targetArticle.published_at
      ? targetArticle.published_at
      : "publishedAt" in targetArticle && targetArticle.publishedAt
        ? targetArticle.publishedAt
        : undefined
    : undefined;
  const targetLeft = targetArticle
    ? "left_percentage" in targetArticle && targetArticle.left_percentage !== undefined
      ? targetArticle.left_percentage
      : "leftPercentage" in targetArticle && targetArticle.leftPercentage !== undefined
        ? targetArticle.leftPercentage
        : 0
    : 0;
  const targetRight = targetArticle
    ? "right_percentage" in targetArticle && targetArticle.right_percentage !== undefined
      ? targetArticle.right_percentage
      : "rightPercentage" in targetArticle && targetArticle.rightPercentage !== undefined
        ? targetArticle.rightPercentage
        : 0
    : 0;
  const targetCenter = targetArticle
    ? "center_percentage" in targetArticle && targetArticle.center_percentage !== undefined
      ? targetArticle.center_percentage
      : "centerPercentage" in targetArticle && targetArticle.centerPercentage !== undefined
        ? targetArticle.centerPercentage
        : 0
    : 0;
  const targetBiasLabel: BiasLabel = targetArticle
    ? "bias_label" in targetArticle && targetArticle.bias_label
      ? targetArticle.bias_label
      : "biasLabel" in targetArticle && targetArticle.biasLabel
        ? targetArticle.biasLabel
        : "unclear"
    : "unclear";
  const targetSentiment: SentimentLabel = targetArticle
    ? "sentiment_label" in targetArticle && targetArticle.sentiment_label
      ? targetArticle.sentiment_label
      : "sentimentLabel" in targetArticle && targetArticle.sentimentLabel
        ? targetArticle.sentimentLabel
        : "neutral"
    : "neutral";
  const targetSentimentScore = targetArticle
    ? "sentiment_score" in targetArticle && targetArticle.sentiment_score !== undefined
      ? targetArticle.sentiment_score
      : "sentimentScore" in targetArticle && targetArticle.sentimentScore !== undefined
        ? targetArticle.sentimentScore
        : undefined
    : undefined;
  const targetConfidence = targetArticle && "confidence" in targetArticle ? targetArticle.confidence : undefined;
  const targetSimilarity = targetArticle && "similarity" in targetArticle ? targetArticle.similarity : undefined;
  const targetSummary = targetArticle && "summary" in targetArticle ? targetArticle.summary : undefined;
  const targetLoadedTerms = targetArticle
    ? "loaded_terms" in targetArticle && targetArticle.loaded_terms
      ? targetArticle.loaded_terms
      : "loadedTerms" in targetArticle && targetArticle.loadedTerms
        ? targetArticle.loadedTerms
        : undefined
    : undefined;

  // Compute framing bias shift (-100 to 100)
  const primaryLean = primaryRight - primaryLeft;
  const targetLean = targetRight - targetLeft;
  const divergenceDelta = Math.abs(primaryLean - targetLean) / 2;

  // Sentiment alignment
  const primarySentiment = primaryArticle.sentimentLabel || "neutral";
  const sentimentContrasting =
    (primarySentiment === "positive" && targetSentiment === "negative") ||
    (primarySentiment === "negative" && targetSentiment === "positive");

  let divergenceLevel = "Low Divergence";
  let divergenceBadgeColor = "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700";

  if (divergenceDelta >= 35) {
    divergenceLevel = "Strong Divergence";
    divergenceBadgeColor = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  } else if (divergenceDelta >= 15) {
    divergenceLevel = "Moderate Divergence";
    divergenceBadgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }

  // Entrance animations
  useGSAP(
    () => {
      if (!open || !targetArticle) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".compare-card-col",
          { autoAlpha: 0, y: 15, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.35,
            stagger: 0.08,
            ease: "power2.out",
          }
        );
        gsap.fromTo(
          ".compare-delta-metric",
          { autoAlpha: 0, scale: 0.9 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
            delay: 0.15,
            ease: "back.out(1.5)",
          }
        );
      });
    },
    { scope: containerRef, dependencies: [open, targetArticle] }
  );

  const handleCopyLink = async () => {
    if (!targetArticle) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const comparisonText = `Perspective Comparison on Pixca:\n\n1️⃣ ${primaryArticle.sourceName}: "${primaryArticle.title}" (${titleCase(primaryArticle.biasLabel || "unclear")})\n2️⃣ ${targetSourceName}: "${targetTitle}" (${titleCase(targetBiasLabel)})\n\nFraming Divergence: ${Math.round(divergenceDelta)}%\n\nView details: ${url}`;

    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(comparisonText);
        setCopied(true);
        toast.success("Comparison summary copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Failed to copy comparison to clipboard");
    }
  };

  if (!targetArticle) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-[var(--border)] bg-card text-card-foreground shadow-2xl rounded-2xl"
      >
        <div ref={containerRef} className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <DialogHeader className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <ArrowRightLeft className="h-4 w-4" />
                </span>
                <DialogTitle className="text-xl font-extrabold tracking-tight">
                  Perspective Comparison
                </DialogTitle>
              </div>

              <div
                className={cn(
                  "compare-delta-metric flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                  divergenceBadgeColor
                )}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>{divergenceLevel} ({Math.round(divergenceDelta)}% Delta)</span>
              </div>
            </div>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Comparing AI-estimated political framing and sentiment across related coverage of this story.
            </DialogDescription>
          </DialogHeader>

          {/* Top Divergence Highlights Bar */}
          <div className="bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{primaryArticle.sourceName}</span>
              <span className={cn("font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800", biasLabelColorClass(primaryArticle.biasLabel || "unclear"))}>
                {primaryArticle.biasLabel || "unclear"}
              </span>
              <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-400 mx-1 shrink-0" />
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{targetSourceName}</span>
              <span className={cn("font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800", biasLabelColorClass(targetBiasLabel))}>
                {targetBiasLabel}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400 w-full sm:w-auto justify-between sm:justify-end">
              {sentimentContrasting ? (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <ShieldAlert className="h-3.5 w-3.5" /> Contrasting Tone
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Similar Sentiment
                </span>
              )}
              <span>
                {targetSimilarity !== undefined
                  ? `Similarity: ${Math.round(targetSimilarity * 100)}%`
                  : `Divergence Delta: ${Math.round(divergenceDelta)}%`}
              </span>
            </div>
          </div>

          {/* Mobile Viewport Tab Switcher (< md) */}
          <div className="flex md:hidden rounded-lg bg-zinc-100 dark:bg-zinc-800/80 p-1 text-xs font-bold">
            <button
              onClick={() => setMobileTab("split")}
              className={cn(
                "flex-1 py-1.5 px-2 truncate rounded-md transition-all",
                mobileTab === "split"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setMobileTab("primary")}
              className={cn(
                "flex-1 py-1.5 px-2 truncate rounded-md transition-all",
                mobileTab === "primary"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              {primaryArticle.sourceName}
            </button>
            <button
              onClick={() => setMobileTab("target")}
              className={cn(
                "flex-1 py-1.5 px-2 truncate rounded-md transition-all",
                mobileTab === "target"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              {targetSourceName}
            </button>
          </div>

          {/* Comparison Dual-Column Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Primary Article */}
            <div
              className={cn(
                "compare-card-col flex flex-col justify-between rounded-xl border border-[var(--border)] bg-zinc-50/50 dark:bg-zinc-900/30 p-5 space-y-4",
                mobileTab === "target" && "hidden md:flex"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Current Article • {primaryArticle.sourceName}
                  </span>
                  <span className={cn("text-xs font-extrabold uppercase", biasLabelColorClass(primaryArticle.biasLabel || "unclear"))}>
                    {titleCase(primaryArticle.biasLabel || "unclear")}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {primaryArticle.title}
                </h3>

                {primaryArticle.publishedAt && (
                  <div className="text-[11px] font-semibold text-zinc-400">
                    {formatArticleDate(primaryArticle.publishedAt)}
                  </div>
                )}

                {/* Bias Meter */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                    <span>Bias Distribution</span>
                    <span>{formatPercent(primaryLeft)} L / {formatPercent(primaryCenter)} C / {formatPercent(primaryRight)} R</span>
                  </div>
                  <BiasMeter
                    leftValue={primaryLeft}
                    centerValue={primaryCenter}
                    rightValue={primaryRight}
                  />
                </div>

                {/* Sentiment & Metrics */}
                <div className="flex items-center justify-between py-2 border-y border-zinc-200/60 dark:border-zinc-800 text-xs font-bold">
                  <span className="text-zinc-500">Sentiment</span>
                  <span className={sentimentLabelColorClass(primarySentiment)}>
                    {titleCase(primarySentiment)} {primaryArticle.sentimentScore !== undefined ? `(${primaryArticle.sentimentScore.toFixed(2)})` : ""}
                  </span>
                </div>

                {/* Summary Snippet */}
                {primaryArticle.summary && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">AI Summary</span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-4 leading-relaxed">
                      {primaryArticle.summary}
                    </p>
                  </div>
                )}

                {/* Loaded Terms */}
                {primaryArticle.loadedTerms && primaryArticle.loadedTerms.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" /> Loaded terms
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {primaryArticle.loadedTerms.map((term) => (
                        <span
                          key={term}
                          className="rounded-full bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {primaryArticle.id && (
                <div className="pt-2">
                  <Link
                    href={`/article/${primaryArticle.id}`}
                    target={isDesktop ? "_blank" : undefined}
                    rel={isDesktop ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      if (!isDesktop) {
                        e.preventDefault();
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                        onOpenChange(false);
                        if (typeof window !== "undefined") {
                          window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
                        }
                        router.push(`/article/${primaryArticle.id}`, { scroll: true });
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <span>Read Full Coverage</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Column 2: Target Related Article */}
            <div
              className={cn(
                "compare-card-col flex flex-col justify-between rounded-xl border border-[var(--border)] bg-zinc-50/50 dark:bg-zinc-900/30 p-5 space-y-4",
                mobileTab === "primary" && "hidden md:flex"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {targetSimilarity !== undefined ? "Related Coverage" : "Comparative Coverage"} • {targetSourceName}
                  </span>
                  <span className={cn("text-xs font-extrabold uppercase", biasLabelColorClass(targetBiasLabel))}>
                    {titleCase(targetBiasLabel)}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {targetTitle}
                </h3>

                {targetPublishedAt && (
                  <div className="text-[11px] font-semibold text-zinc-400">
                    {formatArticleDate(targetPublishedAt)}
                  </div>
                )}

                {/* Bias Meter */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                    <span>Bias Distribution</span>
                    <span>{formatPercent(targetLeft)} L / {formatPercent(targetCenter)} C / {formatPercent(targetRight)} R</span>
                  </div>
                  <BiasMeter
                    leftValue={targetLeft}
                    centerValue={targetCenter}
                    rightValue={targetRight}
                  />
                </div>

                {/* Sentiment & Metrics */}
                <div className="flex items-center justify-between py-2 border-y border-zinc-200/60 dark:border-zinc-800 text-xs font-bold">
                  <span className="text-zinc-500">Sentiment</span>
                  <span className={sentimentLabelColorClass(targetSentiment)}>
                    {titleCase(targetSentiment)} {targetSentimentScore !== undefined ? `(${targetSentimentScore.toFixed(2)})` : ""}
                  </span>
                </div>

                {/* Summary Snippet */}
                {targetSummary && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">AI Summary</span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-4 leading-relaxed">
                      {targetSummary}
                    </p>
                  </div>
                )}

                {/* Loaded Terms */}
                {targetLoadedTerms && targetLoadedTerms.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" /> Loaded terms
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {targetLoadedTerms.map((term) => (
                        <span
                          key={term}
                          className="rounded-full bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence & Match info */}
                <div className="p-3 bg-zinc-100/70 dark:bg-zinc-800/50 rounded-lg text-xs space-y-1">
                  {targetConfidence !== undefined && (
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 font-semibold">
                      <span>AI Confidence</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatConfidence(targetConfidence)}</span>
                    </div>
                  )}
                  {targetSimilarity !== undefined ? (
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 font-semibold">
                      <span>Semantic Similarity</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatPercent(targetSimilarity * 100)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 font-semibold">
                      <span>Framing Divergence</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{Math.round(divergenceDelta)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Read Action */}
              {targetId && (
                <div className="pt-2">
                  <Link
                    href={`/article/${targetId}`}
                    target={isDesktop ? "_blank" : undefined}
                    rel={isDesktop ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      if (!isDesktop) {
                        e.preventDefault();
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                        onOpenChange(false);
                        if (typeof window !== "undefined") {
                          window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
                        }
                        router.push(`/article/${targetId}`, { scroll: true });
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    <span>Read Full Coverage</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied Link" : "Copy Comparison"}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-xs font-bold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
