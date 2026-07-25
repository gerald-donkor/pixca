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
    <div className="min-h-screen bg-[#F6F6F6] text-[#0D0D0F]">
      {/* CATEGORY PILLS BAR */}
      {sources.length > 0 && (
        <div className="bg-white border-b border-[var(--border)] py-3 px-6 shadow-sm overflow-hidden">
          <div className="container mx-auto max-w-[1400px] flex items-center gap-3">
            {/* Left Scroll Trigger */}
            <button className="p-1 rounded-full border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 flex items-center justify-center shrink-0">
              <ChevronLeft className="h-4 w-4 text-zinc-500" />
            </button>

            {/* Scrolling Sources */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {sources.map((source) => (
                <Chip key={source.id} label={source.name} className="shrink-0 text-[11px] font-bold py-1 px-3 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors" />
              ))}
            </div>

            {/* Right Scroll Trigger */}
            <button className="p-1 rounded-full border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 flex items-center justify-center shrink-0">
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN BODY CONTAINER */}
      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        {/* Title */}
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0D0D0F]">
          Top News
        </h1>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-8 space-y-2">
            <h2 className="text-lg font-extrabold text-[#0D0D0F]">No analyzed articles yet</h2>
            <p className="text-xs text-zinc-500 font-semibold">
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
                  className="bg-white rounded-xl border border-[var(--border)] shadow-sm h-full"
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
