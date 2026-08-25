"use client";

import * as React from "react";
import { Bookmark, Share2, MoreHorizontal, Copy, ExternalLink, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ShareModal } from "@/components/ui/share-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useSubscription } from "@/hooks/use-subscription";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { BiasLabel, SentimentLabel } from "@/lib/supabase/types";

export interface ArticleActionBarProps {
  article: {
    id: string;
    title: string;
    original_url: string;
    source_name: string;
    image_url?: string;
    bias_label?: BiasLabel;
    left_percentage?: number;
    center_percentage?: number;
    right_percentage?: number;
    sentiment_label?: SentimentLabel;
  };
  className?: string;
}

export function ArticleActionBar({ article, className }: ArticleActionBarProps) {
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const { entitlements } = useSubscription();
  const bookmarked = isBookmarked(article.id);
  const iconRef = React.useRef<SVGSVGElement>(null);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  const handleSave = () => {
    if (!bookmarked && bookmarks.length >= entitlements.maxBookmarks) {
      setUpgradeOpen(true);
      toast.error(`Bookmark limit reached (${entitlements.maxBookmarks} max for ${entitlements.badgeLabel})`, {
        description: "Upgrade your plan to unlock more saved articles.",
      });
      return;
    }

    const isSaved = toggleBookmark(
      {
        id: article.id,
        title: article.title,
        source_name: article.source_name,
        image_url: article.image_url,
        bias_label: article.bias_label,
        left_percentage: article.left_percentage,
        center_percentage: article.center_percentage,
        right_percentage: article.right_percentage,
        sentiment_label: article.sentiment_label,
      },
      { maxLimit: entitlements.maxBookmarks }
    );

    if (
      iconRef.current &&
      (typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      gsap.fromTo(
        iconRef.current,
        { scale: 1.35 },
        { scale: 1, duration: 0.35, ease: "back.out(2)" }
      );
    }

    if (isSaved) {
      toast.success("Saved to bookmarks");
    } else {
      toast.info("Removed from bookmarks");
    }
  };

  const handleCopyLink = async () => {
    setPopoverOpen(false);
    const shareUrl = typeof window !== "undefined" ? window.location.href : article.original_url;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleReport = () => {
    setPopoverOpen(false);
    toast.info("Thank you for your feedback. Our team has been notified.");
  };

  return (
    <>
      <div className={cn("flex items-center gap-3", className)}>
        <Button
          variant="ghost"
          onClick={handleSave}
          aria-label={bookmarked ? "Remove bookmark" : "Save article bookmark"}
          className={cn(
            "text-xs font-semibold gap-1.5 p-0 h-auto hover:bg-transparent transition-colors",
            bookmarked
              ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          )}
        >
          <Bookmark
            ref={iconRef}
            className={cn("h-4 w-4 transition-colors", bookmarked && "fill-current")}
          />
          <span>{bookmarked ? "Saved" : "Save"}</span>
        </Button>

        <span className="text-zinc-300 dark:text-zinc-700">|</span>

        <Button
          variant="ghost"
          onClick={() => setShareOpen(true)}
          aria-label="Share article"
          className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-semibold gap-1.5 p-0 h-auto hover:bg-transparent transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>

        <span className="text-zinc-300 dark:text-zinc-700">|</span>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            aria-label="More options"
            className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none cursor-pointer flex items-center justify-center"
          >
            <MoreHorizontal className="h-4 w-4" />
          </PopoverTrigger>

          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-52 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-xl rounded-xl"
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-left"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Article Link</span>
              </button>
              <a
                href={article.original_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setPopoverOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-left"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Original Source</span>
              </a>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
              <button
                type="button"
                onClick={handleReport}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Report an Issue</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        article={article}
      />

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentCount={bookmarks.length}
        maxLimit={entitlements.maxBookmarks}
        reason="bookmarks"
      />
    </>
  );
}
