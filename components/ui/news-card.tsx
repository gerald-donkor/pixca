import * as React from "react"
import { Clock, Bookmark, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { biasLabelColorClass, sentimentLabelColorClass } from "@/lib/ui/analysis-display"
import { formatConfidence, titleCase } from "@/lib/ui/format"
import type { BiasLabel, SentimentLabel } from "@/lib/supabase/types"
import { BiasMeter } from "./bias-meter"

export interface NewsCardProps extends React.HTMLAttributes<HTMLDivElement> {
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

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-card text-card-foreground shadow-sm hover:shadow-md transition-all w-full",
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
            <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] text-text-secondary p-4 text-center">
              <span className="text-[13px] font-medium leading-[1.6]">Image Placeholder</span>
            </div>
          )}
          {/* Overlay Info Icon */}
          <button className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60">
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Container */}
        <div className={cn("flex flex-1 flex-col justify-between p-4 sm:p-5 min-w-0")}>
          <div className="space-y-2">
            {/* Source / Published date — falls back to category / location */}
            {(primaryMeta || secondaryMeta) && (
              <div className="flex items-center gap-1.5 text-caption font-semibold text-[var(--text-secondary)]">
                {primaryMeta && <span>{primaryMeta}</span>}
                {primaryMeta && secondaryMeta && <span>•</span>}
                {secondaryMeta && <span>{secondaryMeta}</span>}
              </div>
            )}

            {/* Title */}
            <h3 className="text-h3 text-[var(--text-primary)] hover:text-[var(--bias-right)] transition-colors line-clamp-2">
              {title}
            </h3>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-body-sm text-[var(--text-secondary)] line-clamp-2">
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
                  <span className="text-[12px] font-semibold text-text-secondary">
                    {formatConfidence(confidence)} confidence
                  </span>
                )}
              </>
            ) : sourcesCount !== undefined ? (
              <span className="text-[12px] font-semibold text-text-secondary">{sourcesCount} sources</span>
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
      </div>
    )
  }
)
NewsCard.displayName = "NewsCard"
