import * as React from "react"

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]"
      aria-busy="true"
      aria-label="Loading news feed"
    >
      {/* Category / Source Pills Bar Skeleton */}
      <div className="bg-white dark:bg-[#121215] border-b border-[var(--border)] py-3 px-6 shadow-xs">
        <div className="container mx-auto max-w-[1400px] flex items-center gap-2 overflow-x-hidden">
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
      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        {/* Page Heading & Search/Filters Skeleton */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            <div className="h-4 w-80 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
          </div>

          {/* Filter & Search Bar Skeleton */}
          <div className="bg-card rounded-xl border border-[var(--border)] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-9 w-full md:w-72 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
              <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* 6-Card Responsive Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-card shadow-xs h-full"
            >
              {/* Image Skeleton */}
              <div className="h-52 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />

              {/* Content Skeleton */}
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-4">
                <div className="space-y-2.5">
                  {/* Source & Date */}
                  <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  {/* Title lines */}
                  <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>

                {/* Bias Meter Skeleton */}
                <div className="space-y-3 pt-2">
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                  {/* Footer tags */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-4 w-14 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
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
