"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log route error safely without exposing keys
    console.error("[Route Error Caught]:", error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16 bg-[var(--surface)] text-[var(--text-primary)] w-full min-w-0">
      <div className="max-w-md w-full min-w-0 bg-card rounded-2xl border border-[var(--border)] shadow-md p-6 sm:p-8 md:p-10 text-center space-y-6">
        {/* Warning Icon */}
        <div className="inline-flex p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 shadow-xs">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
            Application Error
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Something Went Wrong Loading This Page
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            An unexpected error occurred while loading news data. You can attempt to reload the component or return to the main feed.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 pt-1 break-all max-w-full">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-[var(--text-primary)] text-[var(--background)] text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)] border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all shadow-xs"
          >
            <Home className="h-3.5 w-3.5" />
            Back to Top News
          </Link>
        </div>
      </div>
    </div>
  )
}
