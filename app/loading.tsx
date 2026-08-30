import * as React from "react"

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] w-full min-w-0 max-w-full overflow-x-hidden"
      aria-busy="true"
      aria-label="Loading news feed"
    >
      {/* Category / Source Pills Bar Skeleton */}
      <div className="bg-white dark:bg-[#121215] border-b border-[var(--border)] py-2.5 sm:py-3 px-3 sm:px-6 shadow-xs overflow-hidden w-full min-w-0 max-w-full">
        <div className="container mx-auto max-w-[1400px] w-full min-w-0 flex items-center gap-2 overflow-x-hidden">
          <div className="h-7 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-7 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-7 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-7 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-7 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-7 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="h-7 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
        </div>
      </div>

      {/* Main Body Container */}
      <main className="container mx-auto max-w-[1400px] w-full min-w-0 max-w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Page Heading & Search/Filters Skeleton */}
        <div className="space-y-4 min-w-0 w-full">
          <div className="space-y-1.5 min-w-0">
            <div className="h-8 w-40 sm:w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse max-w-full" />
            <div className="h-4 w-60 sm:w-80 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse max-w-full" />
          </div>

          {/* Filter & Search Bar Skeleton */}
          <div className="bg-card rounded-xl border border-[var(--border)] p-3.5 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full min-w-0">
            <div className="h-9 w-full md:w-72 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse shrink-0" />
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto min-w-0">
              <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse shrink-0" />
              <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse shrink-0" />
              <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse shrink-0" />
            </div>
          </div>
        </div>

        {/* 6-Card Responsive Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full min-w-0 max-w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-card shadow-xs h-full w-full min-w-0 max-w-full"
            >
              {/* Image Skeleton */}
              <div className="h-52 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />

              {/* Content Skeleton */}
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-4 min-w-0 w-full">
                <div className="space-y-2.5 min-w-0">
                  {/* Source & Date */}
                  <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  {/* Title lines */}
                  <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>

                {/* Bias Meter Skeleton */}
                <div className="space-y-3 pt-2 min-w-0 w-full">
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                  {/* Footer tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 min-w-0">
                    <div className="h-4 w-14 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse shrink-0" />
                    <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
