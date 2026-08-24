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
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main className="container mx-auto max-w-[1200px] px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-8 sm:p-12 border border-zinc-800 shadow-2xl">
          <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              <span>Editorial Neutrality & AI Intelligence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Empowering Readers with Media Transparency
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                Pixca is an automated AI-powered news analysis intelligence platform. We collect articles from leading international publications, parse their narrative structures, and measure sentiment and political framing to give readers balanced, multi-perspective insights on every major story.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-blue-500/25"
              >
                <span>Explore Top Stories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blindspot"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold transition-all border border-white/10"
              >
                <span>View Blindspot Feed</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </Link>
            </div>
          </div>

          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-32 -mb-20 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 4-Pillar Pipeline Architecture */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              The Pixca Intelligence Pipeline
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
              Every story displayed on Pixca travels through a 4-stage automated processing and verification pipeline before publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    1. Automated Ingestion & Scraping
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Oxylabs Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Active source homepages stored in Supabase are monitored on an hourly schedule. Detail pages pass strict URL candidate filters, non-article reject lists, deduplication checks, and HTML cleanup to extract clean, readable text without ads or navigation boilerplate.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    2. AI Framing & Sentiment Analysis
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Gemini 3.6 Flash
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Cleaned article text is evaluated via Vercel AI SDK and Google Gemini. The model generates an objective neutral summary, extracts loaded rhetoric or emotionally charged terms, and computes tone sentiment across a scale from −1.0 (negative) to +1.0 (positive).
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    3. Mathematical Bias Calibration
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    100% Normalized
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Political framing is broken down into Left, Center, and Right percentages that strictly sum to 100%. A continuous Bias Score is calculated as <code className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">(Right% − Left%) / 100</code>, mapping stories to Left, Center, Right, Mixed, or Unclear.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    4. pgvector Semantic Similarity
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    1536-dim IVFFlat
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  High-dimensional 1536-vector embeddings are generated with <code className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">gemini-embedding-001</code> and stored in Supabase with pgvector cosine distance indexing to deliver related multi-source reading instantly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bias Framing Matrix & Scoring Guide */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Political Framing Classification Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              How Pixca classifies news stories according to their contextual emphasis and linguistic framing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Left */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400">Left-Leaning</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Highlights progressive economic reform, systemic inequities, climate urgency, or social justice policies with greater emphasis.
              </p>
            </div>

            {/* Center */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400">Center / Balanced</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Presents balanced attribution, proportional stakeholder viewpoints, and avoids ideological framing or emotionally loaded adjectives.
              </p>
            </div>

            {/* Right */}
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Right-Leaning</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Highlights free-market deregulation, individual liberties, national security, or fiscal conservatism with greater prominence.
              </p>
            </div>

            {/* Mixed */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Mixed Framing</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Contains significant arguments and rhetoric from multiple opposing sides of the spectrum within a single comprehensive report.
              </p>
            </div>

            {/* Unclear */}
            <div className="p-4 rounded-xl bg-zinc-500/5 border border-zinc-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Unclear / Ambiguous</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Short factual briefs, emergency dispatches, or articles where linguistic evidence does not support a confident political classification.
              </p>
            </div>

            {/* Blindspot Indicator */}
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Blindspot Detection</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Identifies stories that are heavily reported by one ideological spectrum while receiving minimal coverage across the other.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Transparency Statement */}
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row gap-4 sm:items-start text-amber-950 dark:text-amber-100">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              AI Methodology Disclaimer & Editorial Transparency
            </h3>
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300/90 font-normal">
              Pixca’s political framing labels, sentiment scores, and summaries are AI-estimated analytical indicators. They reflect our model’s evaluation of language, rhetoric, and topical focus within the specific article text at the time of scraping. They do not constitute an authoritative judgment of any journalist’s intent or a publisher’s universal editorial integrity.
            </p>
          </div>
        </div>

        {/* Quick Links / Footer CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-blue-500/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
                Top Stories
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Browse latest multi-source news
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/blindspot"
            className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-purple-500/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-purple-500 transition-colors">
                Blindspot Feed
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Uncover media coverage gaps
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-purple-500 group-hover:scale-110 transition-all" />
          </Link>

          <Link
            href="/logs"
            className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-emerald-500/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                System Status
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Inspect live pipeline telemetry
              </div>
            </div>
            <Activity className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-emerald-500 transition-colors" />
          </Link>
        </div>
      </main>
    </div>
  );
}
