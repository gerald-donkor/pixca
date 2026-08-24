"use client"

import * as React from "react"
import { Search, X, RotateCcw, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export interface FilterBarProps {
  activeBias?: string
  activeSentiment?: string
  searchQuery?: string
  totalResults: number
  hasActiveSource?: boolean
}

const FRAMING_OPTIONS = [
  { label: "All Framing", value: "" },
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Mixed", value: "mixed" },
]

const SENTIMENT_OPTIONS = [
  { label: "All Sentiments", value: "" },
  { label: "Positive", value: "positive" },
  { label: "Neutral", value: "neutral" },
  { label: "Negative", value: "negative" },
]

export function FilterBar({
  activeBias,
  activeSentiment,
  searchQuery = "",
  totalResults,
  hasActiveSource = false,
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [prevSearchQuery, setPrevSearchQuery] = React.useState(searchQuery)
  const [searchTerm, setSearchTerm] = React.useState(searchQuery)

  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery)
    setSearchTerm(searchQuery)
  }

  // Debounced search query parameter updater
  React.useEffect(() => {
    if (searchTerm === searchQuery) {
      return
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "")
      const trimmed = searchTerm.trim()

      if (trimmed) {
        params.set("q", trimmed)
      } else {
        params.delete("q")
      }

      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, searchQuery, pathname, router, searchParams])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (!value || params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.delete("q")
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const handleResetAll = () => {
    setSearchTerm("")
    router.push(pathname, { scroll: false })
  }

  const hasAnyFilter = Boolean(activeBias || activeSentiment || searchQuery || hasActiveSource)

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-card p-4 sm:p-5 shadow-xs">
      {/* Top row: Search input & Results stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search news articles or topics..."
            className="w-full h-10 pl-9 pr-8 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results summary and Reset action */}
        <div className="flex items-center gap-3 self-end sm:self-center text-xs">
          <span className="font-semibold text-[var(--text-secondary)]">
            {totalResults} {totalResults === 1 ? "article" : "articles"} found
          </span>
          {hasAnyFilter && (
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Filter Groups Divider */}
      <div className="border-t border-[var(--border)] pt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Political Framing Filter Group */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)] mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            Framing:
          </span>
          {FRAMING_OPTIONS.map((opt) => {
            const isSelected = (!activeBias && opt.value === "") || activeBias === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => updateParam("bias", opt.value)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Sentiment Filter Group */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)] mr-1">
            Sentiment:
          </span>
          {SENTIMENT_OPTIONS.map((opt) => {
            const isSelected =
              (!activeSentiment && opt.value === "") || activeSentiment === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => updateParam("sentiment", opt.value)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer",
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
