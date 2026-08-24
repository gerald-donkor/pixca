import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { connection } from "next/server"
import { Chip } from "@/components/ui/chip"
import { NewsCard } from "@/components/ui/news-card"
import { HOMEPAGE_ARTICLES_LIMIT } from "@/lib/config/limits"
import { getPublishedArticles } from "@/lib/supabase/queries/articles"
import { getActiveSources } from "@/lib/supabase/queries/sources"
import { formatArticleDate } from "@/lib/ui/format"
import Link from "next/link"

export default async function HomePage() {
  // Read-at-request-time: without this the page prerenders at build and serves
  // a frozen article list (Next.js `connection` docs).
  await connection()

  const [sources, articles] = await Promise.all([
    getActiveSources(),
    getPublishedArticles({ limit: HOMEPAGE_ARTICLES_LIMIT, offset: 0 }),
  ])

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      {/* CATEGORY PILLS BAR */}
      {sources.length > 0 && (
        <div className="bg-white dark:bg-[#121215] border-b border-[var(--border)] py-3 px-6 shadow-xs overflow-hidden">
          <div className="container mx-auto max-w-[1400px] flex items-center gap-3">
            {/* Left Scroll Trigger */}
            <button
              type="button"
              className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Scrolling Sources */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {sources.map((source) => (
                <Chip
                  key={source.id}
                  label={source.name}
                  className="shrink-0 text-xs font-semibold py-1.5 px-3.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                />
              ))}
            </div>

            {/* Right Scroll Trigger */}
            <button
              type="button"
              className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN BODY CONTAINER */}
      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        {/* Title */}
        <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
          Top News
        </h1>

        {articles.length === 0 ? (
          <div className="bg-card rounded-xl border border-[var(--border)] shadow-xs p-8 space-y-2">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">No analyzed articles yet</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">
              Articles appear here once scraping and AI analysis have run.
            </p>
          </div>
        ) : (
          /* Responsive Article Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`} className="block transition-transform hover:-translate-y-0.5">
                <NewsCard
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
                  className="bg-card rounded-xl border border-[var(--border)] shadow-xs h-full"
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
