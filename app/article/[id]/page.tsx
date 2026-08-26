import type { Metadata } from "next"
import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { getPostHogClient } from "@/lib/posthog-server"
import { JsonLd } from "@/components/seo/json-ld"
import { BiasMeter } from "@/components/ui/bias-meter"
import { RelatedArticles } from "@/components/ui/related-articles"
import { NewsletterSubscribe } from "@/components/ui/newsletter-subscribe"
import { ReadingProgress } from "@/components/ui/reading-progress"
import { ArticleActionBar } from "@/components/ui/article-action-bar"
import { AiMetricExplainer } from "@/components/ui/ai-metric-explainer"
import { getArticleWithAnalysis, getRelatedArticles } from "@/lib/supabase/queries/articles"
import type { RelatedArticleRow } from "@/lib/supabase/types"
import {
  biasLabelColorClass,
  sentimentLabelColorClass,
  strongestFramingPercentage,
} from "@/lib/ui/analysis-display"
import {
  formatArticleDate,
  formatConfidence,
  formatPercent,
  splitIntoParagraphs,
  titleCase,
} from "@/lib/ui/format"
import Link from "next/link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const article = await getArticleWithAnalysis(id);
    if (!article) {
      return {
        title: "Article Not Found",
        description: "The requested news article could not be found.",
      };
    }

    const title = article.title;
    const description =
      article.analysis?.summary ||
      "AI-powered news analysis, political framing breakdown, and sentiment metrics.";
    return {
      title,
      description,
      openGraph: {
        title: `${title} — Pixca News`,
        description,
        url: `/article/${article.id}`,
        siteName: "Pixca News",
        type: "article",
        publishedTime: article.published_at,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — Pixca News`,
        description,
      },
    };
  } catch (error) {
    console.error(`[generateMetadata] Failed to fetch article metadata for ${id}:`, error);
    return {
      title: "Article Details",
      description: "AI-powered news analysis, political framing breakdown, and sentiment metrics.",
    };
  }
}

// Reusable progress bar row for sidebar widgets
function SidebarProgressBar({
  label,
  percentage,
  valueText,
  colorClass,
}: {
  label: string
  percentage: number
  valueText?: string
  colorClass: string
}) {
  return (
    <div className="grid grid-cols-[60px_45px_1fr] items-center gap-3 text-[11px] font-bold select-none">
      <div className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">{label}</div>
      <div className="text-zinc-800 dark:text-zinc-200 text-right">{valueText || `${percentage}%`}</div>
      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

/**
 * Section 20: nothing to look up until the article has an embedding, and a
 * failed similarity query must never take the article page down with it.
 */
async function loadRelatedArticles(
  articleId: string,
  embedding: string | null
): Promise<RelatedArticleRow[]> {
  if (embedding === null) {
    return []
  }

  try {
    return await getRelatedArticles(articleId, embedding)
  } catch (error) {
    console.error(`[article] related articles failed for ${articleId}:`, error)
    return []
  }
}

export default async function ArticleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth.protect();

  const { id } = await params
  const article = await getArticleWithAnalysis(id)

  if (!article) {
    notFound()
  }

  const posthog = getPostHogClient();
  if (posthog && userId) {
    posthog.capture({
      distinctId: userId,
      event: "article_viewed",
      properties: {
        article_id: article.id,
        source_name: article.source.name,
        has_analysis: article.analysis !== null,
        bias_label: article.analysis?.bias_label ?? null,
        sentiment_label: article.analysis?.sentiment_label ?? null,
      },
    });
    await posthog.flush();
  }

  const analysis = article.analysis
  const framing = analysis ? strongestFramingPercentage(analysis) : null
  const paragraphs = splitIntoParagraphs(article.raw_text)
  const related = await loadRelatedArticles(article.id, analysis?.embedding ?? null)

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://pixca.vercel.app").replace(/\/+$/, "")

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/article/${article.id}`,
    },
    headline: article.title,
    description:
      analysis?.summary ||
      "AI-powered news analysis, political framing breakdown, and sentiment metrics.",
    image: article.image_url ? [article.image_url] : undefined,
    datePublished: article.published_at,
    dateModified: analysis?.created_at || article.published_at,
    author: [
      {
        "@type": "Organization",
        name: article.source.name,
        url: article.source.listing_url || undefined,
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Pixca News",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.svg`,
      },
    },
    isAccessibleForFree: true,
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] pb-16">
      <JsonLd schema={articleSchema} />
      {/* Reading Progress Indicator */}
      <ReadingProgress />

      {/* Top Back Navigation Bar */}
      <div className="bg-white dark:bg-[#121215] border-b border-[var(--border)] py-3 px-6 shadow-xs">
        <div className="container mx-auto max-w-[1400px] flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Top News
          </Link>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">

          {/* LEFT COLUMN: ARTICLE CONTENT */}
          <div className="space-y-6">

            {/* Metadata Breadcrumb */}
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {article.source.name}
            </div>

            {/* Headline */}
            <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
              {article.title}
            </h1>

            {/* Byline & Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-y border-[var(--border)] py-4 gap-4">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{article.source.name}</span> <span className="mx-1">•</span> {formatArticleDate(article.published_at)} <span className="mx-1">•</span>{" "}
                <a
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white underline underline-offset-2"
                >
                  Read original
                </a>
              </div>
              <ArticleActionBar
                article={{
                  id: article.id,
                  title: article.title,
                  original_url: article.original_url,
                  source_name: article.source.name,
                  image_url: article.image_url,
                  bias_label: analysis?.bias_label,
                  left_percentage: analysis?.left_percentage,
                  center_percentage: analysis?.center_percentage,
                  right_percentage: analysis?.right_percentage,
                  sentiment_label: analysis?.sentiment_label,
                }}
              />
            </div>

            {/* Hero Image */}
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover rounded-xl border border-[var(--border)] shadow-xs"
            />

            {/* Inline Bias Distribution Card */}
            {analysis && (
              <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    Bias Distribution
                    <AiMetricExplainer type="bias-distribution" />
                  </span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-right">
                    AI-estimated: {titleCase(analysis.bias_label)} • {formatConfidence(analysis.confidence)} confidence
                  </span>
                </div>
                <BiasMeter
                  leftValue={analysis.left_percentage}
                  centerValue={analysis.center_percentage}
                  rightValue={analysis.right_percentage}
                  showLabels={false}
                />
              </div>
            )}

            {/* Article Text Content */}
            <article className="text-zinc-800 dark:text-zinc-200 text-[15px] md:text-[16px] leading-[1.7] font-medium space-y-6 max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>

            {/* Full-width Newsletter Block */}
            <div className="bg-zinc-50 dark:bg-card rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-center gap-6 mt-10">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Stay Informed. Stay Balanced.</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Get the top stories and bias analysis delivered to your inbox.</p>
              </div>
              <NewsletterSubscribe />
            </div>

            {/* Related Articles by pgvector cosine similarity */}
            <RelatedArticles
              articles={related}
              currentArticle={{
                id: article.id,
                title: article.title,
                sourceName: article.source.name,
                publishedAt: article.published_at,
                imageUrl: article.image_url,
                biasLabel: analysis?.bias_label,
                leftPercentage: analysis?.left_percentage,
                centerPercentage: analysis?.center_percentage,
                rightPercentage: analysis?.right_percentage,
                sentimentLabel: analysis?.sentiment_label,
                sentimentScore: analysis?.sentiment_score,
                confidence: analysis?.confidence,
                summary: analysis?.summary,
                framingNotes: analysis?.framing_notes,
                loadedTerms: analysis?.loaded_terms,
              }}
            />

          </div>

          {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
          <div className="space-y-6">

            {analysis && framing ? (
              <>
                {/* WIDGET 1: BIAS ANALYSIS */}
                <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Bias Analysis</h3>
                    <AiMetricExplainer type="bias-analysis" iconClassName="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall Bias</div>
                    <div className={`text-2xl font-extrabold ${biasLabelColorClass(framing.label)}`}>
                      {titleCase(framing.label)} {formatPercent(framing.percentage)}
                    </div>
                    <div className="text-[11px] font-bold text-zinc-400 leading-none">AI-estimated framing, not objective truth</div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <SidebarProgressBar label="Left" percentage={analysis.left_percentage} colorClass="bg-[var(--bias-left)]" />
                    <SidebarProgressBar label="Center" percentage={analysis.center_percentage} colorClass="bg-zinc-300 dark:bg-zinc-600" />
                    <SidebarProgressBar label="Right" percentage={analysis.right_percentage} colorClass="bg-[var(--bias-right)]" />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-bold">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Confidence</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{formatConfidence(analysis.confidence)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Sentiment</span>
                      <span className={sentimentLabelColorClass(analysis.sentiment_label)}>
                        {titleCase(analysis.sentiment_label)} ({analysis.sentiment_score.toFixed(2)})
                      </span>
                    </div>
                  </div>
                  {analysis.framing_notes && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                      {analysis.framing_notes}
                    </p>
                  )}
                </div>

                {/* WIDGET 2: AI SUMMARY */}
                <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">AI Summary</h3>
                    <AiMetricExplainer type="ai-summary" iconClassName="h-4 w-4" />
                  </div>
                  <div className="text-[11px] font-bold text-zinc-400 flex flex-wrap items-center gap-1 leading-none">
                    Generated {formatArticleDate(analysis.created_at)} <span className="text-zinc-300 dark:text-zinc-700">•</span> {analysis.model}
                  </div>
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {analysis.summary}
                  </p>
                  {analysis.loaded_terms.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Loaded terms</div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.loaded_terms.map((term) => (
                          <span
                            key={term}
                            className="rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] text-zinc-400 font-bold italic leading-tight pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    {analysis.disclaimer}
                  </div>
                </div>
              </>
            ) : (
              /* ANALYSIS PENDING NOTICE */
              <div className="bg-card text-card-foreground rounded-xl border border-[var(--border)] p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Analysis Pending</h3>
                  <AiMetricExplainer type="analysis-pending" iconClassName="h-4 w-4" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                  This article has not been analyzed yet. Sentiment and AI-estimated framing appear here once analysis has run.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}
