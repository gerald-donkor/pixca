"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Trash2,
  ExternalLink,
  Compass,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { SavedDietMeter } from "@/components/ui/saved-diet-meter";
import {
  SavedFiltersBar,
  type SavedBiasFilter,
  type SavedSortOption,
} from "@/components/ui/saved-filters-bar";
import { BiasMeter } from "@/components/ui/bias-meter";
import { biasLabelColorClass, sentimentLabelColorClass } from "@/lib/ui/analysis-display";
import { formatArticleDate, titleCase } from "@/lib/ui/format";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export default function SavedArticlesPage() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();
  const { entitlements } = useSubscription();

  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeBias, setActiveBias] = React.useState<SavedBiasFilter>("all");
  const [selectedSource, setSelectedSource] = React.useState("all");
  const [sortOption, setSortOption] = React.useState<SavedSortOption>("newest");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // Distinct sources list
  const availableSources = React.useMemo(() => {
    const set = new Set<string>();
    for (const b of bookmarks) {
      if (b.source_name) set.add(b.source_name);
    }
    return Array.from(set).sort();
  }, [bookmarks]);

  // Filtered and sorted bookmarks
  const filteredBookmarks = React.useMemo(() => {
    let result = [...bookmarks];

    // 1. Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (b) =>
          (b.title || "").toLowerCase().includes(q) ||
          (b.source_name || "").toLowerCase().includes(q)
      );
    }

    // 2. Perspective / Bias filter
    if (activeBias !== "all") {
      result = result.filter((b) => {
        if (b.bias_label === activeBias) return true;
        const left = b.left_percentage ?? 0;
        const center = b.center_percentage ?? 0;
        const right = b.right_percentage ?? 0;
        if (activeBias === "left") {
          return left > center && left > right;
        }
        if (activeBias === "center") {
          return center >= left && center >= right;
        }
        if (activeBias === "right") {
          return right > left && right > center;
        }
        return false;
      });
    }

    // 3. Source filter
    if (selectedSource !== "all") {
      result = result.filter((b) => b.source_name === selectedSource);
    }

    // Helper to compute polarization score for sorting (with legacy fallback)
    const getPolarization = (b: (typeof bookmarks)[0]) => {
      if (b.left_percentage !== undefined && b.right_percentage !== undefined) {
        return Math.abs(b.left_percentage - b.right_percentage);
      }
      if (b.bias_label === "left" || b.bias_label === "right") return 60;
      return 0;
    };

    // 4. Sorting
    result.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime();
      }
      if (sortOption === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortOption === "balanced") {
        return getPolarization(a) - getPolarization(b);
      }
      if (sortOption === "polarized") {
        return getPolarization(b) - getPolarization(a);
      }
      return 0;
    });

    return result;
  }, [bookmarks, searchQuery, activeBias, selectedSource, sortOption]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveBias("all");
    setSelectedSource("all");
    setSortOption("newest");
  };

  // GSAP Choreographed Entrance Animation
  useGSAP(
    () => {
      if (!containerRef.current || filteredBookmarks.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".saved-card-item",
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
          ".saved-card-item",
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
    {
      scope: containerRef,
      dependencies: [filteredBookmarks.length, sortOption, activeBias, selectedSource],
    }
  );

  const handleRemove = (id: string, title: string) => {
    if (removingId) return;

    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReducedMotion) {
      removeBookmark(id);
      toast.info("Removed from saved articles");
      return;
    }

    const cardEl = cardRefs.current.get(id);
    if (!cardEl) {
      removeBookmark(id);
      toast.info("Removed from saved articles");
      return;
    }

    setRemovingId(id);
    gsap.to(cardEl, {
      autoAlpha: 0,
      scale: 0.92,
      y: -8,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        removeBookmark(id);
        setRemovingId(null);
        toast.info(`"${title.slice(0, 32)}..." removed`);
      },
    });
  };

  const handleConfirmClear = () => {
    clearBookmarks();
    setClearDialogOpen(false);
    toast.success("All saved articles cleared");
  };

  const isAtLimit =
    entitlements.tier !== "pro" &&
    entitlements.tier !== "enterprise" &&
    bookmarks.length >= entitlements.maxBookmarks;

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] w-full min-w-0 max-w-full overflow-x-clip">
      <main
        ref={containerRef}
        className="container mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full min-w-0 max-w-full"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[var(--border)] w-full min-w-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Bookmark className="w-4 h-4 fill-current" />
              </div>
              <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
                Saved Articles
              </h1>
              {bookmarks.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-full shrink-0">
                  {bookmarks.length} {bookmarks.length === 1 ? "article" : "articles"}
                </span>
              )}
              {/* Plan Quota Badge */}
              {entitlements.tier === "free" ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full shrink-0">
                  Free: {bookmarks.length} / 5
                </span>
              ) : entitlements.tier === "starter" ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full shrink-0">
                  Starter: {bookmarks.length} / 25
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full shrink-0">
                  Pro: Unlimited
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Your personal library of bookmarked stories and intelligence analyses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {isAtLimit && (
              <Button
                variant="default"
                onClick={() => setUpgradeModalOpen(true)}
                className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 h-9 px-3.5 rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Upgrade for Unlimited</span>
              </Button>
            )}

            {bookmarks.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setClearDialogOpen(true)}
                className="text-xs font-semibold text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 h-9 px-3.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center flex-1 sm:flex-initial"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span>Clear all</span>
              </Button>
            )}
          </div>
        </div>

        {/* Empty State when no bookmarks at all */}
        {bookmarks.length === 0 ? (
          <div className="bg-card rounded-2xl border border-[var(--border)] shadow-xs p-6 sm:p-12 text-center space-y-5 sm:space-y-6 max-w-lg mx-auto my-8 sm:my-12 w-full min-w-0">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-inner shrink-0">
              <Bookmark className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                No saved articles yet
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                Bookmark stories across Pixca to read them later, compare narrative framings, and track evolving perspectives.
              </p>
            </div>
            <div>
              <Link href="/" className="inline-block w-full sm:w-auto">
                <Button
                  variant="default"
                  className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-bold text-xs h-10 px-5 rounded-lg shadow-sm cursor-pointer"
                >
                  <Compass className="w-4 h-4 mr-2 shrink-0" />
                  <span>Discover Top Stories</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 w-full min-w-0">
            {/* Personal Reading Diet & Perspective Balance Meter */}
            <SavedDietMeter bookmarks={bookmarks} />

            {/* Interactive Filters Bar */}
            <SavedFiltersBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeBias={activeBias}
              onBiasChange={setActiveBias}
              availableSources={availableSources}
              selectedSource={selectedSource}
              onSourceChange={setSelectedSource}
              sortOption={sortOption}
              onSortChange={setSortOption}
              totalCount={bookmarks.length}
              filteredCount={filteredBookmarks.length}
              onResetFilters={handleResetFilters}
            />

            {/* Filtered Empty State */}
            {filteredBookmarks.length === 0 ? (
              <div className="bg-card rounded-2xl border border-[var(--border)] shadow-xs p-6 sm:p-10 text-center space-y-4 max-w-md mx-auto my-6 sm:my-8 w-full min-w-0">
                <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    No matching saved articles
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    No articles match your active search keyword or perspective filter criteria.
                  </p>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold h-9 px-4 rounded-lg cursor-pointer w-full sm:w-auto"
                  >
                    Reset all filters
                  </Button>
                </div>
              </div>
            ) : (
              /* Bookmarked Articles Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full min-w-0">
                {filteredBookmarks.map((item) => {
                  const hasBias =
                    item.left_percentage !== undefined &&
                    item.center_percentage !== undefined &&
                    item.right_percentage !== undefined;

                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        if (el) cardRefs.current.set(item.id, el);
                        else cardRefs.current.delete(item.id);
                      }}
                      className="saved-card-item h-full flex flex-col bg-card rounded-xl border border-[var(--border)] shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 w-full min-w-0"
                    >
                      {/* Thumbnail Image Container */}
                      <Link
                        href={`/article/${item.id}`}
                        className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden block group min-w-0"
                      >
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <Sparkles className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        {/* Source Pill */}
                        <div className="absolute top-3 left-3 max-w-[calc(100%-6rem)] min-w-0">
                          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-xs text-white rounded-md truncate max-w-full">
                            {item.source_name}
                          </span>
                        </div>
                        {/* Perspective Lean Pill if available */}
                        {item.bias_label && (
                          <div className="absolute top-3 right-3 shrink-0">
                            <span
                              className={cn(
                                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs rounded-md shadow-xs",
                                item.bias_label === "left"
                                  ? "bg-blue-600/90 text-white"
                                  : item.bias_label === "right"
                                  ? "bg-red-600/90 text-white"
                                  : "bg-zinc-700/90 text-white"
                              )}
                            >
                              {item.bias_label}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Content Section */}
                      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3.5 sm:gap-4 min-w-0">
                        <div className="space-y-2.5 min-w-0">
                          <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                            {item.saved_at
                              ? `Saved ${formatArticleDate(item.saved_at)}`
                              : "Saved recently"}
                          </div>
                          <Link href={`/article/${item.id}`} className="block group min-w-0">
                            <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug break-words">
                              {item.title}
                            </h2>
                          </Link>

                          {/* Bias Meter if percentages available */}
                          {hasBias && (
                            <div className="pt-1 w-full min-w-0">
                              <BiasMeter
                                leftValue={item.left_percentage!}
                                centerValue={item.center_percentage!}
                                rightValue={item.right_percentage!}
                                showLabels={false}
                              />
                            </div>
                          )}
                        </div>

                        {/* Actions & Perspective Footer */}
                        <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                            {/* Analysis metadata badges */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                              {item.sentiment_label && (
                                <span
                                  className={cn(
                                    "text-[11px] font-semibold",
                                    sentimentLabelColorClass(item.sentiment_label)
                                  )}
                                >
                                  {titleCase(item.sentiment_label)}
                                </span>
                              )}
                              {item.bias_label && (
                                <span
                                  className={cn(
                                    "text-[11px] font-semibold",
                                    biasLabelColorClass(item.bias_label)
                                  )}
                                >
                                  {titleCase(item.bias_label)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                              <Link
                                href={`/article/${item.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <span>Read Analysis</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleRemove(item.id, item.title)}
                                disabled={removingId === item.id}
                                aria-label="Remove from saved articles"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6 gap-4">
          <DialogHeader>
            <DialogTitle>Clear all saved articles?</DialogTitle>
            <DialogDescription>
              This will remove all {bookmarks.length} bookmarked stories from your personal reading list on this device. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
              className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmClear}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        currentCount={bookmarks.length}
        maxLimit={entitlements.maxBookmarks}
        reason="bookmarks"
      />
    </div>
  );
}
