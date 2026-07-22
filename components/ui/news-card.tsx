import * as React from "react"
import { Clock, Bookmark, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { BiasMeter } from "./bias-meter"

export interface NewsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  category?: string
  location?: string
  timeAgo: string
  readTime?: string
  imageUrl?: string
  bias?: {
    left: number
    center: number
    right: number
  }
}

export const NewsCard = React.forwardRef<HTMLDivElement, NewsCardProps>(
  ({ className, title, subtitle, category, location, timeAgo, readTime, imageUrl, bias, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-card text-card-foreground shadow-sm hover:shadow-md transition-all sm:flex-row w-full max-w-2xl",
          className
        )}
        {...props}
      >
        {/* Left Side: Image */}
        <div className="relative h-40 w-full shrink-0 bg-[var(--surface)] sm:h-auto sm:w-[35%]">
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

        {/* Right Side: Content */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 min-w-0">
          <div className="space-y-2">
            {/* Category / Location */}
            {(category || location) && (
              <div className="flex items-center gap-1.5 text-caption font-semibold text-[var(--text-secondary)]">
                {category && <span>{category}</span>}
                {category && location && <span>•</span>}
                {location && <span>{location}</span>}
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
          <div className="flex items-center gap-4 text-caption font-medium text-[var(--text-secondary)]">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeAgo}</span>
            </div>
            {readTime && (
              <div className="flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" />
                <span>{readTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
NewsCard.displayName = "NewsCard"
