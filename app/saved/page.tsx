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
import { gsap, useGSAP } from "@/lib/gsap";
import { formatArticleDate } from "@/lib/ui/format";

export default function SavedArticlesPage() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();
  const { entitlements } = useSubscription();
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // GSAP Choreographed Entrance Animation
  useGSAP(
    () => {
      if (!containerRef.current || bookmarks.length === 0) return;

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
    { scope: containerRef, dependencies: [bookmarks.length] }
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
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main
        ref={containerRef}
        className="container mx-auto max-w-[1400px] px-6 py-8 space-y-8"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Bookmark className="w-4 h-4 fill-current" />
              </div>
              <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
                Saved Articles
              </h1>
              {bookmarks.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-full">
                  {bookmarks.length} {bookmarks.length === 1 ? "article" : "articles"}
                </span>
              )}
              {/* Plan Quota Badge */}
              {entitlements.tier === "free" ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
                  Free: {bookmarks.length} / 5
                </span>
              ) : entitlements.tier === "starter" ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                  Starter: {bookmarks.length} / 25
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full">
                  Pro: Unlimited
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Your personal library of bookmarked stories and intelligence analyses
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAtLimit && (
              <Button
                variant="default"
                onClick={() => setUpgradeModalOpen(true)}
                className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 h-9 px-3.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Upgrade for Unlimited
              </Button>
            )}

            {bookmarks.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setClearDialogOpen(true)}
                className="text-xs font-semibold text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 h-9 px-3.5 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {bookmarks.length === 0 ? (
          <div className="bg-card rounded-2xl border border-[var(--border)] shadow-xs p-12 text-center space-y-6 max-w-lg mx-auto my-12">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-inner">
              <Bookmark className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                No saved articles yet
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                Bookmark stories across Pixca to read them later, compare narrative framings, and track evolving perspectives.
              </p>
            </div>
            <div>
              <Link href="/">
                <Button
                  variant="default"
                  className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-bold text-xs h-10 px-5 rounded-lg shadow-sm"
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Discover Top Stories
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Bookmarked Articles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((item) => (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(item.id, el);
                  else cardRefs.current.delete(item.id);
                }}
                className="saved-card-item h-full flex flex-col bg-card rounded-xl border border-[var(--border)] shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {/* Thumbnail Image Container */}
                <Link
                  href={`/article/${item.id}`}
                  className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden block group"
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
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-xs text-white rounded-md">
                      {item.source_name}
                    </span>
                  </div>
                </Link>

                {/* Content Section */}
                <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                  <div className="space-y-2">
                    <div className="text-[11px] text-[var(--text-secondary)] font-medium">
                      {item.saved_at ? `Saved ${formatArticleDate(item.saved_at)}` : "Saved recently"}
                    </div>
                    <Link
                      href={`/article/${item.id}`}
                      className="block group"
                    >
                      <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h2>
                    </Link>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <Link
                      href={`/article/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
            ))}
          </div>
        )}
      </main>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clear all saved articles?</DialogTitle>
            <DialogDescription>
              This will remove all {bookmarks.length} bookmarked stories from your personal reading list on this device. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmClear}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
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
