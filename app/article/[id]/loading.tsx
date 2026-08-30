import * as React from "react"
import { ChevronLeft } from "lucide-react"

export default function ArticleLoading() {
  return (
    <div
      className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] pb-16 w-full min-w-0 max-w-full overflow-x-hidden"
      aria-busy="true"
      aria-label="Loading article details"
    >
      {/* Top Back Navigation Bar Skeleton */}
      <div className="bg-white dark:bg-[#121215] border-b border-[var(--border)] py-3 px-4 sm:px-6 shadow-xs w-full min-w-0 max-w-full">
        <div className="container mx-auto max-w-[1400px] w-full min-w-0 flex items-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400">
            <ChevronLeft className="h-4 w-4 opacity-50" />
            <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="container mx-auto max-w-[1400px] w-full min-w-0 max-w-full px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start w-full min-w-0 max-w-full">
          {/* LEFT COLUMN: ARTICLE CONTENT SKELETON */}
          <div className="space-y-6 w-full min-w-0 max-w-full">
            {/* Metadata Breadcrumb */}
            <div className="h-3.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />

            {/* Headline Skeleton */}
            <div className="space-y-2.5 min-w-0 w-full">
              <div className="h-8 md:h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
              <div className="h-8 md:h-10 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            </div>

            {/* Byline & Actions Row Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-y border-[var(--border)] py-4 gap-4 w-full min-w-0 max-w-full">
              <div className="h-4 w-48 max-w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Hero Image Skeleton */}
            <div className="w-full max-w-full aspect-[16/9] bg-zinc-200 dark:bg-zinc-800 rounded-xl border border-[var(--border)] animate-pulse" />

            {/* Inline Bias Distribution Card Skeleton */}
            <div className="bg-card rounded-xl border border-[var(--border)] p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0 max-w-full">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3 min-w-0 w-full">
                <div className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3.5 w-44 max-w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>

            {/* Article Text Paragraph Skeletons */}
            <div className="space-y-4 pt-2 w-full min-w-0">
              <div className="space-y-2 min-w-0">
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="space-y-2 min-w-0">
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="space-y-2 min-w-0">
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR WIDGETS SKELETON */}
          <div className="space-y-6 w-full min-w-0 max-w-full">
            {/* WIDGET 1: BIAS ANALYSIS SKELETON */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-5 sm:p-6 shadow-xs space-y-4 w-full min-w-0 max-w-full">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 min-w-0">
                <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2 min-w-0">
                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-7 w-36 max-w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="space-y-3 pt-2 w-full min-w-0">
                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 min-w-0">
                <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>

            {/* WIDGET 2: AI SUMMARY SKELETON */}
            <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-5 sm:p-6 shadow-xs space-y-4 w-full min-w-0 max-w-full">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 min-w-0">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              </div>
              <div className="h-3 w-36 max-w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="space-y-2 min-w-0">
                <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3.5 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
