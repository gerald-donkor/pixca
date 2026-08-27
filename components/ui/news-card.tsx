"use client"

import * as React from "react"
import { Clock, Bookmark, Info } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { biasLabelColorClass, sentimentLabelColorClass } from "@/lib/ui/analysis-display"
import { formatConfidence, titleCase } from "@/lib/ui/format"
import type { BiasLabel, SentimentLabel } from "@/lib/supabase/types"
import { BiasMeter } from "./bias-meter"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradeModal } from "@/components/ui/upgrade-modal"
import { gsap } from "@/lib/gsap"

export interface NewsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  articleId?: string
  title: string
  subtitle?: string
  category?: string
  location?: string
  timeAgo?: string
  readTime?: string
  imageUrl?: string
  variant?: "horizontal" | "vertical"
  sourcesCount?: number
  bias?: {
    left: number
    center: number
    right: number
  }
  /** Stored-data props. When set they take precedence over category/location. */
  sourceName?: string
  publishedLabel?: string
  sentimentLabel?: SentimentLabel
  framingLabel?: BiasLabel
  confidence?: number
}

export const NewsCard = React.forwardRef<HTMLDivElement, NewsCardProps>(
  (
    {
      className,
      articleId,
      title,
      subtitle,
      category,
      location,
      timeAgo,
      readTime,
      imageUrl,
      variant = "horizontal",
      sourcesCount,
      bias,
      sourceName,
      publishedLabel,
      sentimentLabel,
      framingLabel,
      confidence,
      ...props
    },
    ref
  ) => {
    const isVertical = variant === "vertical"
    const primaryMeta = sourceName ?? category
    const secondaryMeta = publishedLabel ?? location
    const hasAnalysisFooter = sentimentLabel !== undefined || framingLabel !== undefined

    const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks()
    const { entitlements } = useSubscription()
    const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false)
    const isSaved = articleId ? isBookmarked(articleId) : false
    const bookmarkIconRef = React.useRef<SVGSVGElement>(null)

    const handleBookmarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (!articleId) return

      if (!isSaved && bookmarks.length >= entitlements.maxBookmarks) {
        setUpgradeModalOpen(true)
        toast.error(`Bookmark limit reached (${entitlements.maxBookmarks} max for ${entitlements.badgeLabel})`, {
          description: "Upgrade your plan to unlock more saved articles.",
        })
        return
      }

      const saved = toggleBookmark(
        {
          id: articleId,
          title,
          source_name: sourceName || category || "News Source",
          image_url: imageUrl,
          bias_label: framingLabel,
          left_percentage: bias?.left,
          center_percentage: bias?.center,
          right_percentage: bias?.right,
          sentiment_label: sentimentLabel,
        },
        { maxLimit: entitlements.maxBookmarks }
      )

      if (
        bookmarkIconRef.current &&
        (typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      ) {
        gsap.fromTo(
          bookmarkIconRef.current,
          { scale: 1.35, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.35, ease: "back.out(2)" }
        )
      }

      if (saved) {
        toast.success("Saved to bookmarks", { id: `bookmark-${articleId}` })
      } else {
        toast.info("Removed from bookmarks", { id: `bookmark-${articleId}` })
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-card text-card-foreground shadow-sm hover:shadow-md transition-all w-full min-w-0 max-w-full",
          isVertical ? "" : "sm:flex-row max-w-2xl",
          className
        )}
        {...props}
      >
        {/* Image Container */}
        <div
          className={cn(
            "relative shrink-0 bg-[var(--surface)] w-full",
            isVertical ? "h-52" : "h-40 sm:h-auto sm:w-[35%]"
          )}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] p-4 text-center">
              <span className="text-[13px] font-medium leading-[1.6]">Image Placeholder</span>
            </div>
          )}
          {/* Overlay Bookmark or Info Action */}
          {articleId ? (
            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={isSaved ? "Remove bookmark" : "Save article bookmark"}
              className={cn(
                "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all cursor-pointer z-10 shadow-sm",
                isSaved
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-black/50 hover:bg-black/80 text-white/90 hover:text-white"
              )}
            >
              <Bookmark
                ref={bookmarkIconRef}
                className={cn("h-3.5 w-3.5 transition-colors", isSaved && "fill-current")}
              />
            </button>
          ) : (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm pointer-events-none">
              <Info className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className={cn("flex flex-1 flex-col justify-between p-4 sm:p-5 min-w-0 overflow-hidden")}>
          <div className="space-y-2 min-w-0">
            {/* Source / Published date — falls back to category / location */}
            {(primaryMeta || secondaryMeta) && (
              <div className="flex items-center gap-1.5 text-caption font-semibold text-[var(--text-secondary)] flex-wrap">
                {primaryMeta && <span className="break-words">{primaryMeta}</span>}
                {primaryMeta && secondaryMeta && <span>•</span>}
                {secondaryMeta && <span className="break-words">{secondaryMeta}</span>}
              </div>
            )}

            {/* Title */}
            <h3 className="text-h3 text-[var(--text-primary)] hover:text-[var(--bias-right)] transition-colors line-clamp-2 break-words">
              {title}
            </h3>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-body-sm text-[var(--text-secondary)] line-clamp-2 break-words">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bias Meter */}
          {bias && (
            <div className="mt-4 mb-3">
              <BiasMeter
                leftValue={bias.left}
                centerValue={bias.center}
                rightValue={bias.right}
                showLabels={false}
              />
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption font-medium text-[var(--text-secondary)]">
            {hasAnalysisFooter ? (
              <>
                {sentimentLabel && (
                  <span className={cn("text-[12px] font-semibold", sentimentLabelColorClass(sentimentLabel))}>
                    {titleCase(sentimentLabel)}
                  </span>
                )}
                {framingLabel && (
                  <span className={cn("text-[12px] font-semibold", biasLabelColorClass(framingLabel))}>
                    AI-estimated: {titleCase(framingLabel)}
                  </span>
                )}
                {confidence !== undefined && (
                  <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
                    {formatConfidence(confidence)} confidence
                  </span>
                )}
              </>
            ) : sourcesCount !== undefined ? (
              <span className="text-[12px] font-semibold text-[var(--text-secondary)]">{sourcesCount} sources</span>
            ) : (
              <>
                {timeAgo && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{timeAgo}</span>
                  </div>
                )}
                {readTime && (
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{readTime}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <UpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          currentCount={bookmarks.length}
          maxLimit={entitlements.maxBookmarks}
          reason="bookmarks"
        />
      </div>
    )
  }
)
NewsCard.displayName = "NewsCard"
