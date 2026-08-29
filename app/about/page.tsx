import type { Metadata } from "next";
import * as React from "react";
import Link from "next/link";
import {
  Scale,
  Brain,
  Globe,
  Database,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Activity,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About & Methodology — AI News Analysis & Transparency",
  description:
    "Discover how Pixca processes real-time news articles, calculates political framing and sentiment scores, and uses vector similarity search to uncover media blindspots.",
  openGraph: {
    title: "About & Methodology — Pixca News",
    description:
      "Discover how Pixca processes real-time news articles, calculates political framing and sentiment scores, and uses vector similarity search to uncover media blindspots.",
    url: "/about",
    type: "website",
    siteName: "Pixca News",
  },
  twitter: {
    card: "summary_large_image",
    title: "About & Methodology — Pixca News",
    description:
      "Discover how Pixca processes real-time news articles, calculates political framing and sentiment scores, and uses vector similarity search to uncover media blindspots.",
  },
};

export default function AboutPage() {
  return (
    <div className="w-full min-w-0 max-w-full min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main className="w-full min-w-0 max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-8 md:p-12 border border-zinc-800 shadow-2xl">
          <div className="relative z-10 space-y-5 sm:space-y-6 max-w-3xl min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="min-w-0 break-words">Editorial Neutrality & AI Intelligence</span>
            </div>

            <div className="space-y-3 min-w-0">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight break-words">
                Empowering Readers with Media Transparency
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-normal break-words">
                Pixca is an automated AI-powered news analysis intelligence platform. We collect articles from leading international publications, parse their narrative structures, and measure sentiment and political framing to give readers balanced, multi-perspective insights on every major story.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-blue-500/25 w-full sm:w-auto text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span>Explore Top Stories</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/blindspot"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold transition-all border border-white/10 w-full sm:w-auto text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <span>View Blindspot Feed</span>
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-16 sm:right-32 -mb-20 w-56 sm:w-72 h-56 sm:h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 4-Pillar Pipeline Architecture */}
        <div className="space-y-6 sm:space-y-8 min-w-0">
          <div className="space-y-2 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] break-words">
              The Pixca Intelligence Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl break-words">
              Every story displayed on Pixca travels through a 4-stage automated processing and verification pipeline before publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="min-w-0 p-5 sm:p-6 md:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-start sm:items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] min-w-0 break-words">
                    1. Automated Ingestion & Scraping
                  </h3>
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Oxylabs Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                  Active source homepages stored in Supabase are monitored on an hourly schedule. Detail pages pass strict URL candidate filters, non-article reject lists, deduplication checks, and HTML cleanup to extract clean, readable text without ads or navigation boilerplate.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="min-w-0 p-5 sm:p-6 md:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center font-bold shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-start sm:items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] min-w-0 break-words">
                    2. AI Framing & Sentiment Analysis
                  </h3>
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Gemini 3.6 Flash
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                  Cleaned article text is evaluated via Vercel AI SDK and Google Gemini. The model generates an objective neutral summary, extracts loaded rhetoric or emotionally charged terms, and computes tone sentiment across a scale from −1.0 (negative) to +1.0 (positive).
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="min-w-0 p-5 sm:p-6 md:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-start sm:items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] min-w-0 break-words">
                    3. Mathematical Bias Calibration
                  </h3>
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    100% Normalized
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                  Political framing is broken down into Left, Center, and Right percentages that strictly sum to 100%. A continuous Bias Score is calculated as{" "}
                  <code className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono break-all sm:break-normal">
                    (Right% − Left%) / 100
                  </code>
                  , mapping stories to Left, Center, Right, Mixed, or Unclear.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="min-w-0 p-5 sm:p-6 md:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-start sm:items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] min-w-0 break-words">
                    4. pgvector Semantic Similarity
                  </h3>
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    1536-dim IVFFlat
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                  High-dimensional 1536-vector embeddings are generated with{" "}
                  <code className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono break-all sm:break-normal">
                    gemini-embedding-001
                  </code>{" "}
                  and stored in Supabase with pgvector cosine distance indexing to deliver related multi-source reading instantly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bias Framing Matrix & Scoring Guide */}
        <div className="min-w-0 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-6">
          <div className="space-y-2 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] break-words">
              Political Framing Classification Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] break-words">
              How Pixca classifies news stories according to their contextual emphasis and linguistic framing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {/* Left */}
            <div className="min-w-0 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 break-words">Left-Leaning</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
                Highlights progressive economic reform, systemic inequities, climate urgency, or social justice policies with greater emphasis.
              </p>
            </div>

            {/* Center */}
            <div className="min-w-0 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 break-words">Center / Balanced</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
                Presents balanced attribution, proportional stakeholder viewpoints, and avoids ideological framing or emotionally loaded adjectives.
              </p>
            </div>

            {/* Right */}
            <div className="min-w-0 p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <h4 className="text-sm font-bold text-red-600 dark:text-red-400 break-words">Right-Leaning</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
                Highlights free-market deregulation, individual liberties, national security, or fiscal conservatism with greater prominence.
              </p>
            </div>

            {/* Mixed */}
            <div className="min-w-0 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 break-words">Mixed Framing</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
                Contains significant arguments and rhetoric from multiple opposing sides of the spectrum within a single comprehensive report.
              </p>
            </div>

            {/* Unclear */}
            <div className="min-w-0 p-4 rounded-xl bg-zinc-500/5 border border-zinc-500/20 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 shrink-0" />
                <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 break-words">Unclear / Ambiguous</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
                Short factual briefs, emergency dispatches, or articles where linguistic evidence does not support a confident political classification.
              </p>
            </div>

            {/* Blindspot Indicator */}
            <div className="min-w-0 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 break-words">Blindspot Detection</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
                Identifies stories that are heavily reported by one ideological spectrum while receiving minimal coverage across the other.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Transparency Statement */}
        <div className="min-w-0 p-5 sm:p-6 md:p-8 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row gap-3.5 sm:gap-4 sm:items-start text-amber-950 dark:text-amber-100">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 break-words">
              AI Methodology Disclaimer & Editorial Transparency
            </h3>
            <p className="text-[11px] sm:text-xs leading-relaxed text-amber-800 dark:text-amber-300/90 font-normal break-words">
              Pixca’s political framing labels, sentiment scores, and summaries are AI-estimated analytical indicators. They reflect our model’s evaluation of language, rhetoric, and topical focus within the specific article text at the time of scraping. They do not constitute an authoritative judgment of any journalist’s intent or a publisher’s universal editorial integrity.
            </p>
          </div>
        </div>

        {/* Quick Links / Footer CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-blue-500/50 transition-all flex items-center justify-between gap-3 group min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors break-words">
                Top Stories
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 break-words">
                Browse latest multi-source news
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-[var(--text-secondary)] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/blindspot"
            className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-purple-500/50 transition-all flex items-center justify-between gap-3 group min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-purple-500 transition-colors break-words">
                Blindspot Feed
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 break-words">
                Uncover media coverage gaps
              </div>
            </div>
            <Sparkles className="w-4 h-4 shrink-0 text-[var(--text-secondary)] group-hover:text-purple-500 group-hover:scale-110 transition-all" />
          </Link>

          <Link
            href="/logs"
            className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors break-words">
                System Status
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 break-words">
                Inspect live pipeline telemetry
              </div>
            </div>
            <Activity className="w-4 h-4 shrink-0 text-[var(--text-secondary)] group-hover:text-emerald-500 transition-colors" />
          </Link>
        </div>
      </main>
    </div>
  );
}
