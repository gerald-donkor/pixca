"use client"

import * as React from "react"
import Link from "next/link"
import { SearchX, RotateCcw } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useGSAP, gsap } from "@/lib/gsap"
import { NewsCard } from "@/components/ui/news-card"
import { formatArticleDate } from "@/lib/ui/format"
import type { ArticleWithSourceAndAnalysis } from "@/lib/supabase/queries/articles"

export interface ArticleGridProps {
  articles: ArticleWithSourceAndAnalysis[]
  emptyMessage?: string
}

export function ArticleGrid({ articles, emptyMessage }: ArticleGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const gridRef = React.useRef<HTMLDivElement>(null)

  const articlesKey = articles.map((a) => a.id).join(",")

  useGSAP(
    () => {
      if (!gridRef.current || articles.length === 0) return

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".news-card-item",
          { y: 16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.04,
            clearProps: "transform,opacity",
          }
        )
      })

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          ".news-card-item",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
            stagger: 0.02,
            clearProps: "transform,opacity",
          }
        )
      })

      return () => {
        mm.revert()
      }
    },
    { scope: gridRef, dependencies: [articlesKey] }
  )

  const handleResetFilters = () => {
    router.push(pathname, { scroll: false })
  }

  if (articles.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-[var(--border)] shadow-xs p-6 sm:p-12 text-center space-y-4 w-full min-w-0 max-w-full">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
          <SearchX className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto min-w-0 px-2">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] break-words">
            {emptyMessage || "No articles found"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium break-words">
            No analyzed articles match your selected filters. Try broadening your search or resetting filters to view top stories.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer break-words"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset all filters
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full min-w-0 max-w-full"
    >
      {articles.map((article) => (
        <div key={article.id} className="news-card-item h-full min-w-0 w-full max-w-full">
          <Link
            href={`/article/${article.id}`}
            prefetch={false}
            className="block h-full min-w-0 w-full transition-transform hover:-translate-y-0.5"
          >
            <NewsCard
              articleId={article.id}
              variant="vertical"
              title={article.title}
              imageUrl={article.image_url}
              sourceName={article.source.name}
              publishedLabel={formatArticleDate(article.published_at)}
              bias={
                article.analysis
                  ? {
                      left: article.analysis.left_percentage,
                      center: article.analysis.center_percentage,
                      right: article.analysis.right_percentage,
                    }
                  : undefined
              }
              sentimentLabel={article.analysis?.sentiment_label}
              framingLabel={article.analysis?.bias_label}
              confidence={article.analysis?.confidence}
              className="bg-card rounded-xl border border-[var(--border)] shadow-xs h-full w-full min-w-0"
            />
          </Link>
        </div>
      ))}
    </div>
  )
}
