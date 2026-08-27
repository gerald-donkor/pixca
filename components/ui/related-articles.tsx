"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";
import { NewsCard } from "@/components/ui/news-card";
import {
  PerspectiveComparisonModal,
  type PrimaryArticleComparisonData,
} from "@/components/ui/perspective-comparison-modal";
import { formatArticleDate } from "@/lib/ui/format";
import type { RelatedArticleRow } from "@/lib/supabase/types";

export interface RelatedArticlesProps {
  articles: RelatedArticleRow[];
  currentArticle?: PrimaryArticleComparisonData;
}

/**
 * Section 20 Related Articles. Displays articles matched via pgvector cosine
 * similarity, with interactive side-by-side perspective comparison capability.
 */
export function RelatedArticles({
  articles,
  currentArticle,
}: RelatedArticlesProps) {
  const [selectedCompareArticle, setSelectedCompareArticle] =
    React.useState<RelatedArticleRow | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  if (articles.length === 0) {
    return null;
  }

  const handleCompareClick = (
    e: React.MouseEvent,
    article: RelatedArticleRow
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCompareArticle(article);
    setModalOpen(true);
  };

  return (
    <section className="space-y-4 pt-10 border-t border-[var(--border)] min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Related Articles
          </h2>
          <p className="text-[11px] font-bold text-zinc-400 leading-none">
            AI-estimated similarity, not editorial curation
          </p>
        </div>

        {currentArticle && (
          <span className="hidden sm:inline-flex text-[11px] font-bold text-zinc-400">
            Click &ldquo;Compare&rdquo; to view framing side-by-side
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 min-w-0 max-w-full">
        {articles.map((article) => (
          <div key={article.article_id} className="relative group min-w-0 max-w-full">
            <Link
              href={`/article/${article.article_id}`}
              className="block transition-transform hover:-translate-y-0.5 h-full min-w-0 max-w-full"
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

            {/* Side-by-side Perspective Comparison Action Badge */}
            {currentArticle && (
              <button
                type="button"
                onClick={(e) => handleCompareClick(e, article)}
                aria-label={`Compare perspective with ${article.source_name}`}
                className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-zinc-900/80 hover:bg-zinc-900 text-white backdrop-blur-sm shadow-sm transition-all hover:scale-105 cursor-pointer border border-white/10"
              >
                <ArrowRightLeft className="h-3 w-3 text-sky-400" />
                <span>Compare</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Perspective Comparison Modal */}
      {currentArticle && (
        <PerspectiveComparisonModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          primaryArticle={currentArticle}
          targetArticle={selectedCompareArticle}
        />
      )}
    </section>
  );
}
