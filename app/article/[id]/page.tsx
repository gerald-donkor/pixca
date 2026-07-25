import * as React from "react"
import {
  Info,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronLeft
} from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BiasMeter } from "@/components/ui/bias-meter"
import { getArticleWithAnalysis } from "@/lib/supabase/queries/articles"
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
      <div className="text-zinc-500 uppercase tracking-wider text-[10px]">{label}</div>
      <div className="text-zinc-800 text-right">{valueText || `${percentage}%`}</div>
      <div className="h-2 w-full bg-zinc-100 border border-zinc-200/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default async function ArticleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await auth.protect();

  const { id } = await params
  const article = await getArticleWithAnalysis(id)

  if (!article) {
    notFound()
  }

  const analysis = article.analysis
  const framing = analysis ? strongestFramingPercentage(analysis) : null
  const paragraphs = splitIntoParagraphs(article.raw_text)

  return (
    <div className="min-h-screen bg-white text-[#0D0D0F] pb-16">
      {/* Top Back Navigation Bar */}
      <div className="bg-white border-b border-[var(--border)] py-3 px-6 shadow-sm">
        <div className="container mx-auto max-w-[1400px] flex items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors">
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
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {article.source.name}
            </div>

            {/* Headline */}
            <h1 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#0D0D0F] leading-tight">
              {article.title}
            </h1>

            {/* Byline & Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-y border-[var(--border)] py-4 gap-4">
              <div className="text-xs font-medium text-zinc-500">
                <span className="font-bold text-zinc-800">{article.source.name}</span> <span className="mx-1">•</span> {formatArticleDate(article.published_at)} <span className="mx-1">•</span>{" "}
                <a
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-zinc-800 hover:text-black underline underline-offset-2"
                >
                  Read original
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-zinc-500 hover:text-black text-xs font-semibold gap-1.5 p-0 hover:bg-transparent">
                  <Bookmark className="h-4 w-4" /> Save
                </Button>
                <span className="text-zinc-300">|</span>
                <Button variant="ghost" className="text-zinc-500 hover:text-black text-xs font-semibold gap-1.5 p-0 hover:bg-transparent">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <span className="text-zinc-300">|</span>
                <button className="text-zinc-500 hover:text-black transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover rounded-xl border border-[var(--border)] shadow-sm"
            />

            {/* Inline Bias Distribution Card */}
            {analysis && (
              <div className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1.5">
                    Bias Distribution
                    <Info className="h-3.5 w-3.5 text-zinc-400 cursor-pointer" />
                  </span>
                  <span className="text-xs font-bold text-zinc-700 text-right">
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
            <article className="text-zinc-800 text-[15px] md:text-[16px] leading-[1.7] font-medium space-y-6 max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>

            {/* Full-width Newsletter Block */}
            <div className="bg-zinc-50 rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mt-10">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg font-extrabold text-[#0D0D0F]">Stay Informed. Stay Balanced.</h3>
                <p className="text-xs text-zinc-500 font-semibold">Get the top stories and bias analysis delivered to your inbox.</p>
              </div>
              <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium py-2.5 px-4 outline-none focus:border-zinc-400 flex-1 md:w-64"
                />
                <Button variant="default" className="bg-[#0D0D0F] hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-5 h-auto rounded-md">
                  Subscribe
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
          <div className="space-y-6">

            {analysis && framing ? (
              <>
                {/* WIDGET 1: BIAS ANALYSIS */}
                <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800">Bias Analysis</h3>
                    <Info className="h-4 w-4 text-zinc-400 cursor-pointer" />
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
                    <SidebarProgressBar label="Center" percentage={analysis.center_percentage} colorClass="bg-zinc-300" />
                    <SidebarProgressBar label="Right" percentage={analysis.right_percentage} colorClass="bg-[var(--bias-right)]" />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-zinc-100 text-[11px] font-bold">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Confidence</span>
                      <span className="text-zinc-800">{formatConfidence(analysis.confidence)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Sentiment</span>
                      <span className={sentimentLabelColorClass(analysis.sentiment_label)}>
                        {titleCase(analysis.sentiment_label)} ({analysis.sentiment_score.toFixed(2)})
                      </span>
                    </div>
                  </div>
                  {analysis.framing_notes && (
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      {analysis.framing_notes}
                    </p>
                  )}
                </div>

                {/* WIDGET 2: AI SUMMARY */}
                <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800">AI Summary</h3>
                    <Info className="h-4 w-4 text-zinc-400 cursor-pointer" />
                  </div>
                  <div className="text-[11px] font-bold text-zinc-400 flex flex-wrap items-center gap-1 leading-none">
                    Generated {formatArticleDate(analysis.created_at)} <span className="text-zinc-300">•</span> {analysis.model}
                  </div>
                  <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                    {analysis.summary}
                  </p>
                  {analysis.loaded_terms.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Loaded terms</div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.loaded_terms.map((term) => (
                          <span
                            key={term}
                            className="rounded-full bg-zinc-50 border border-zinc-200 px-2.5 py-1 text-[11px] font-bold text-zinc-700"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] text-zinc-400 font-bold italic leading-tight pt-2 border-t border-zinc-50">
                    {analysis.disclaimer}
                  </div>
                </div>
              </>
            ) : (
              /* ANALYSIS PENDING NOTICE */
              <div className="bg-white rounded-xl border border-[var(--border)] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-800">Analysis Pending</h3>
                  <Info className="h-4 w-4 text-zinc-400 cursor-pointer" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
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
