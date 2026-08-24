import * as React from "react"
import { connection } from "next/server"
import { SourcePillsBar } from "@/components/ui/source-pills-bar"
import { FilterBar } from "@/components/ui/filter-bar"
import { ArticleGrid } from "@/components/ui/article-grid"
import { HOMEPAGE_ARTICLES_LIMIT } from "@/lib/config/limits"
import { getPublishedArticles } from "@/lib/supabase/queries/articles"
import { getActiveSources } from "@/lib/supabase/queries/sources"
import type { BiasLabel, SentimentLabel } from "@/lib/supabase/types"

interface HomePageProps {
  searchParams: Promise<{
    source?: string
    bias?: string
    sentiment?: string
    q?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Read-at-request-time: without this the page prerenders at build and serves
  // a frozen article list (Next.js `connection` docs).
  await connection()

  const params = await searchParams
  const sourceParam = params.source?.trim()
  const queryParam = params.q?.trim()

  const validBiases: BiasLabel[] = ["left", "center", "right", "mixed", "unclear"]
  const biasParam = validBiases.includes(params.bias?.toLowerCase() as BiasLabel)
    ? (params.bias?.toLowerCase() as BiasLabel)
    : undefined

  const validSentiments: SentimentLabel[] = ["positive", "neutral", "negative"]
  const sentimentParam = validSentiments.includes(params.sentiment?.toLowerCase() as SentimentLabel)
    ? (params.sentiment?.toLowerCase() as SentimentLabel)
    : undefined

  const sources = await getActiveSources()

  const matchedSource = sourceParam
    ? sources.find(
        (s) =>
          s.name.toLowerCase() === sourceParam.toLowerCase() ||
          s.id.toLowerCase() === sourceParam.toLowerCase()
      )
    : undefined

  const articles = await getPublishedArticles({
    limit: HOMEPAGE_ARTICLES_LIMIT,
    offset: 0,
    sourceId: matchedSource?.id,
    sourceName: !matchedSource && sourceParam ? sourceParam : undefined,
    biasLabel: biasParam,
    sentimentLabel: sentimentParam,
    query: queryParam,
  })

  const headingTitle = matchedSource
    ? `${matchedSource.name} News`
    : sourceParam
      ? `${sourceParam} News`
      : "Top News"

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      {/* Category / Source Pills Bar */}
      <SourcePillsBar
        sources={sources}
        activeSource={matchedSource ? matchedSource.name : sourceParam}
      />

      {/* Main Body Container */}
      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-6">
        {/* Page Heading & Search/Filters */}
        <div className="space-y-4">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
              {headingTitle}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              Real-time AI framing, sentiment, and bias analysis across trusted media
            </p>
          </div>

          {/* Interactive Filter & Search Bar */}
          <FilterBar
            activeBias={biasParam}
            activeSentiment={sentimentParam}
            searchQuery={queryParam}
            totalResults={articles.length}
            hasActiveSource={Boolean(sourceParam)}
          />
        </div>

        {/* Responsive Animated Article Grid */}
        <ArticleGrid articles={articles} />
      </main>
    </div>
  )
}
