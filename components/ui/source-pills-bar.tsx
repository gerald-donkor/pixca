"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Source } from "@/lib/supabase/types"

export interface SourcePillsBarProps {
  sources: Source[]
  activeSource?: string
}

export function SourcePillsBar({ sources, activeSource }: SourcePillsBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const checkScrollBounds = React.useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  React.useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    checkScrollBounds()
    el.addEventListener("scroll", checkScrollBounds, { passive: true })
    window.addEventListener("resize", checkScrollBounds)

    return () => {
      el.removeEventListener("scroll", checkScrollBounds)
      window.removeEventListener("resize", checkScrollBounds)
    }
  }, [checkScrollBounds, sources])

  const scrollByAmount = (delta: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: delta, behavior: "smooth" })
    }
  }

  const handleSelectSource = (sourceName?: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (!sourceName || sourceName === "all") {
      params.delete("source")
    } else {
      params.set("source", sourceName)
    }
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  if (sources.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-[#121215] border-b border-[var(--border)] py-2.5 sm:py-3 px-3 sm:px-6 shadow-xs overflow-hidden w-full min-w-0 max-w-full">
      <div className="container mx-auto max-w-[1400px] w-full min-w-0 flex items-center gap-2 sm:gap-3">
        {/* Left Scroll Trigger */}
        <button
          type="button"
          onClick={() => scrollByAmount(-240)}
          disabled={!canScrollLeft}
          aria-label="Scroll sources left"
          className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Scrolling Sources */}
        <div
          ref={scrollContainerRef}
          className="flex flex-1 min-w-0 items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5"
        >
          {/* All Sources Pill */}
          <button
            type="button"
            onClick={() => handleSelectSource(undefined)}
            className={cn(
              "shrink-0 text-xs font-semibold py-1.5 px-3 sm:px-3.5 rounded-full transition-colors cursor-pointer whitespace-nowrap",
              !activeSource
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-bold"
                : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            )}
          >
            All Sources
          </button>

          {/* Individual Source Pills */}
          {sources.map((source) => {
            const isActive =
              activeSource?.toLowerCase() === source.name.toLowerCase() ||
              activeSource === source.id

            return (
              <button
                key={source.id}
                type="button"
                onClick={() => handleSelectSource(source.name)}
                className={cn(
                  "shrink-0 text-xs font-semibold py-1.5 px-3 sm:px-3.5 rounded-full transition-colors cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-bold"
                    : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
              >
                {source.name}
              </button>
            )
          })}
        </div>

        {/* Right Scroll Trigger */}
        <button
          type="button"
          onClick={() => scrollByAmount(240)}
          disabled={!canScrollRight}
          aria-label="Scroll sources right"
          className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
