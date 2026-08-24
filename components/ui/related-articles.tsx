import * as React from "react"
import Link from "next/link"
import { NewsCard } from "@/components/ui/news-card"
import { formatArticleDate } from "@/lib/ui/format"
import type { RelatedArticleRow } from "@/lib/supabase/types"

/**
 * Section 20 Related Articles. Presentational only — the cosine-similarity
 * lookup happens in the page's server component. Renders nothing when there is
 * no match, so the caller can pass results through unconditionally.
 */
export function RelatedArticles({ articles }: { articles: RelatedArticleRow[] }) {
  if (articles.length === 0) {
    return null
  }

  return (
    <section className="space-y-4 pt-10 border-t border-[var(--border)]">
      <div className="space-y-1">
        <h2 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
          Related Articles
        </h2>
        <p className="text-[11px] font-bold text-zinc-400 leading-none">
          AI-estimated similarity, not editorial curation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {articles.map((article) => (
          <Link
            key={article.article_id}
            href={`/article/${article.article_id}`}
            className="block transition-transform hover:-translate-y-0.5"
          >
            <NewsCard
              articleId={article.article_id}
              variant="vertical"
              title={article.title}
              imageUrl={article.image_url}
              sourceName={article.source_name}
              publishedLabel={formatArticleDate(article.published_at)}
              bias={{
                left: article.left_percentage,
                center: article.center_percentage,
                right: article.right_percentage,
              }}
              sentimentLabel={article.sentiment_label}
              framingLabel={article.bias_label}
              confidence={article.confidence}
              className="bg-card rounded-xl border border-[var(--border)] shadow-xs h-full"
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
