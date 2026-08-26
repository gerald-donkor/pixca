import type { Metadata } from "next";
import * as React from "react";
import { connection } from "next/server";
import { Sparkles, ShieldCheck, Cpu, Compass } from "lucide-react";
import { ForYouFeed } from "@/components/ui/for-you-feed";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedArticles, type ArticleWithSourceAndAnalysis } from "@/lib/supabase/queries/articles";

export const metadata: Metadata = {
  title: "For You — Curated News Intelligence",
  description:
    "AI-tailored news recommendations and balanced perspective suggestions tuned to your reading habits.",
  openGraph: {
    title: "For You — Curated News Intelligence — Pixca News",
    description:
      "AI-tailored news recommendations and balanced perspective suggestions tuned to your reading habits.",
    url: "/for-you",
    type: "website",
    siteName: "Pixca News",
  },
  twitter: {
    card: "summary_large_image",
    title: "For You — Curated News Intelligence — Pixca News",
    description:
      "AI-tailored news recommendations and balanced perspective suggestions tuned to your reading habits.",
  },
};

export default async function ForYouPage() {
  // Read-at-request-time for fresh published articles
  await connection();

  let articles: ArticleWithSourceAndAnalysis[] = [];
  try {
    articles = await getPublishedArticles({
      limit: 80,
      offset: 0,
    });
  } catch (err) {
    console.error("[ForYouPage getPublishedArticles failed]:", err);
    articles = [];
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://pixca.vercel.app").replace(/\/+$/, "");

  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "For You — Curated News Intelligence",
    url: `${baseUrl}/for-you`,
    description:
      "AI-tailored news recommendations and balanced perspective suggestions tuned to your reading habits.",
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Pixca News",
      url: baseUrl,
    },
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <JsonLd schema={webpageSchema} />

      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-8 border border-zinc-800 shadow-xl">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Intelligence</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                For You Feed
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Curated articles and balanced counter-perspectives dynamically tuned to your saved topics and reading patterns.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Adaptive Affinity</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Source Relevance</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>Echo-Chamber Defense</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Counter-Perspectives</div>
              </div>

              <div className="hidden sm:block p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy First</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Client-Side Only</div>
              </div>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-24 -mb-16 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Interactive Feed Component */}
        <ForYouFeed initialArticles={articles} />
      </main>
    </div>
  );
}
