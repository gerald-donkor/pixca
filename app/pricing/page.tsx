import type { Metadata } from "next";
import * as React from "react";
import Link from "next/link";
import {
  Check,
  Minus,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { PricingCards } from "@/components/ui/pricing-cards";
import { PricingFaq } from "@/components/ui/pricing-faq";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Pricing & Plans — Pixca Pro & Local MoMo / International Subscriptions",
  description:
    "Explore transparent pricing for Pixca News intelligence. Support for Ghana Mobile Money (GHS) and global cards (USD). Unlock 100% normalized AI bias analysis, pgvector similarity, and developer APIs.",
  openGraph: {
    title: "Pricing & Plans — Pixca News Intelligence",
    description:
      "Explore transparent pricing for Pixca News intelligence. Support for Ghana Mobile Money (GHS) and global cards (USD).",
    url: "/pricing",
    type: "website",
    siteName: "Pixca News",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Plans — Pixca News Intelligence",
    description:
      "Explore transparent pricing for Pixca News intelligence. Support for Ghana Mobile Money (GHS) and global cards (USD).",
  },
};

const COMPARISON_SECTIONS = [
  {
    category: "Core News & Sentiment",
    rows: [
      { name: "Hourly News Scraping (All Sources)", free: "Yes", starter: "Yes", pro: "Yes", enterprise: "Yes" },
      { name: "Basic Sentiment Indicators (Pos/Neut/Neg)", free: "Yes", starter: "Yes", pro: "Yes", enterprise: "Yes" },
      { name: "Daily Editorial Digests", free: "Yes", starter: "Yes", pro: "Yes", enterprise: "Yes" },
      { name: "Dark, Light & System Theme Support", free: "Yes", starter: "Yes", pro: "Yes", enterprise: "Yes" },
    ],
  },
  {
    category: "Advanced AI Analysis & Matrix",
    rows: [
      { name: "100% Normalized Left/Center/Right Matrix", free: "Basic", starter: "Basic", pro: "Full %", enterprise: "Full %" },
      { name: "Loaded Rhetoric & Terminology Extraction", free: "No", starter: "Preview", pro: "Yes", enterprise: "Yes" },
      { name: "Mathematical Bias Calibration Score", free: "No", starter: "No", pro: "Yes", enterprise: "Yes" },
      { name: "AI Editorial Framing Notes", free: "No", starter: "Summary", pro: "Yes", enterprise: "Yes" },
      { name: "Partisan Blindspot Detection Feed", free: "Preview", starter: "Standard", pro: "Real-time", enterprise: "Real-time" },
    ],
  },
  {
    category: "Research, Alerts & Bookmarks",
    rows: [
      { name: "pgvector 1536-dim Semantic Similarity", free: "3 per story", starter: "10 per story", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Saved Bookmarks Capacity", free: "5 articles", starter: "25 articles", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "High-Priority Hourly Ingestion", free: "Standard", starter: "Standard", pro: "Priority", enterprise: "Instant" },
      { name: "Personalized 'For You' Feed", free: "Yes", starter: "Yes", pro: "AI-Curated", enterprise: "AI-Curated" },
      { name: "Export Bookmarks to JSON / CSV", free: "No", starter: "No", pro: "Yes", enterprise: "Yes" },
    ],
  },
  {
    category: "Developer API & Team Features",
    rows: [
      { name: "Developer API Access", free: "No", starter: "No", pro: "1,000 req/mo", enterprise: "100k req/mo" },
      { name: "Webhook & RSS Feed Alerts", free: "Standard RSS", starter: "Standard RSS", pro: "Custom Webhooks", enterprise: "Real-time Webhooks" },
      { name: "Custom News Source Ingestion (Oxylabs)", free: "No", starter: "No", pro: "Request queue", enterprise: "Dedicated targets" },
      { name: "Multi-Seat Organization Management", free: "No", starter: "No", pro: "1 Seat", enterprise: "Up to 10 Seats" },
    ],
  },
];

function RenderCell({ value }: { value: string }) {
  if (value === "Yes") {
    return (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      </div>
    );
  }
  if (value === "No") {
    return (
      <div className="flex items-center justify-center text-zinc-300 dark:text-zinc-700">
        <Minus className="w-4 h-4" />
      </div>
    );
  }
  return <span className="font-semibold text-xs text-[var(--text-primary)]">{value}</span>;
}

export default function PricingPage() {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": "Pixca Pro News Intelligence",
        "description":
          "AI-powered news analysis, political framing calibration, sentiment scoring, and media blindspot detection platform.",
        "brand": {
          "@type": "Brand",
          "name": "Pixca",
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "Pixca Free Reader",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            "name": "Pixca Starter (USD)",
            "price": "4.89",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            "name": "Pixca Starter (GHS)",
            "price": "64.99",
            "priceCurrency": "GHS",
            "availability": "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            "name": "Pixca Pro (USD)",
            "price": "10.79",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            "name": "Pixca Pro (GHS)",
            "price": "139.99",
            "priceCurrency": "GHS",
            "availability": "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            "name": "Pixca Enterprise (USD)",
            "price": "24.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            "name": "Pixca Enterprise (GHS)",
            "price": "329.99",
            "priceCurrency": "GHS",
            "availability": "https://schema.org/InStock",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What payment methods are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "We support dual local and global payment channels: Global Credit/Debit Cards, Apple Pay, and Google Pay are processed securely via Polar (Merchant of Record with automated global VAT/tax compliance). Local Ghana Mobile Money (MTN MoMo, Telecel Cash, and AirtelTigo Money) is powered natively via Paystack.",
            },
          },
          {
            "@type": "Question",
            "name": "How does Mobile Money payment work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "When you choose Mobile Money (GHS) and enter your Ghana phone number, an instant USSD approval prompt is pushed directly to your handset. Enter your Mobile Money PIN to approve the transaction, and your Pixca Pro subscription activates immediately.",
            },
          },
          {
            "@type": "Question",
            "name": "How are international taxes and invoices handled by Polar?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "As our Merchant of Record, Polar automatically calculates, collects, and files digital services sales tax and EU/UK VAT at checkout based on your billing address. Corporate customers can enter their VAT/tax ID for reverse-charge tax exemption, and downloadable PDF invoices and receipts are generated automatically.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] w-full min-w-0 max-w-full overflow-x-hidden">
      <JsonLd schema={jsonLdSchema} />

      <main className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-20 w-full min-w-0 max-w-full">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto w-full min-w-0">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] sm:text-xs font-bold tracking-wide max-w-full">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate sm:whitespace-normal">Transparent Dual Local & Global Subscriptions</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight break-words">
            Unbiased AI News Intelligence for Everyone
          </h1>

          <p className="text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto break-words">
            Gain immediate clarity on political bias, sentiment framing, and underreported stories. Pay locally with Ghana Mobile Money or internationally with global cards.
          </p>

          {/* Payment Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2 text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-medium max-w-full">
            <div className="flex items-center gap-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 sm:px-3 py-1.5 rounded-lg shadow-xs max-w-full text-left">
              <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="break-words">Polar (Global Cards, Apple Pay & MoR Tax)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 sm:px-3 py-1.5 rounded-lg shadow-xs max-w-full text-left">
              <Smartphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="break-words">MTN MoMo • Telecel • AirtelTigo (Paystack)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] px-2.5 sm:px-3 py-1.5 rounded-lg shadow-xs max-w-full text-left">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="break-words">256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Component (Client Component with switches) */}
        <PricingCards />

        {/* Comprehensive Feature Comparison Matrix */}
        <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6 w-full min-w-0 max-w-full">
          <div className="text-center space-y-2 max-w-2xl mx-auto w-full min-w-0">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Full Feature Comparison Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Detailed breakdown of features across Free, Starter, Pixca Pro, and Enterprise tiers.
            </p>
          </div>

          <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm">
            <table className="w-full text-left border-collapse min-w-[640px] sm:min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="p-3.5 sm:p-5 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] w-5/12">
                    Features & Capabilities
                  </th>
                  <th className="p-3.5 sm:p-5 text-xs font-extrabold text-center text-[var(--text-primary)] w-[14%]">
                    Free Reader
                  </th>
                  <th className="p-3.5 sm:p-5 text-xs font-extrabold text-center text-[var(--text-primary)] w-[14%]">
                    Starter
                  </th>
                  <th className="p-3.5 sm:p-5 text-xs font-extrabold text-center text-blue-600 dark:text-blue-400 bg-blue-500/5 w-[15%]">
                    Pixca Pro
                  </th>
                  <th className="p-3.5 sm:p-5 text-xs font-extrabold text-center text-[var(--text-primary)] w-[14%]">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_SECTIONS.map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    {/* Category Header Row */}
                    <tr className="bg-zinc-100/60 dark:bg-zinc-800/40 border-t border-b border-[var(--border)]">
                      <td
                        colSpan={5}
                        className="px-3.5 py-2.5 sm:px-5 sm:py-3 text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase"
                      >
                        {section.category}
                      </td>
                    </tr>

                    {/* Feature Rows */}
                    {section.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="border-b border-[var(--border)] hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                      >
                        <td className="p-3.5 sm:p-5 text-xs font-medium text-[var(--text-primary)]">
                          {row.name}
                        </td>
                        <td className="p-3.5 sm:p-5 text-center">
                          <RenderCell value={row.free} />
                        </td>
                        <td className="p-3.5 sm:p-5 text-center">
                          <RenderCell value={row.starter} />
                        </td>
                        <td className="p-3.5 sm:p-5 text-center bg-blue-500/5">
                          <RenderCell value={row.pro} />
                        </td>
                        <td className="p-3.5 sm:p-5 text-center">
                          <RenderCell value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive FAQ Section */}
        <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6 w-full min-w-0 max-w-full">
          <div className="text-center space-y-2 max-w-2xl mx-auto w-full min-w-0">
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Everything you need to know about billing, Mobile Money, and AI methodology.
            </p>
          </div>

          <PricingFaq />
        </div>

        {/* Bottom Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-6 sm:p-12 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 w-full min-w-0 max-w-full">
          <div className="space-y-2 text-center md:text-left min-w-0">
            <h3 className="text-xl sm:text-3xl font-black tracking-tight text-white break-words">
              Ready to see the full picture?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl break-words">
              Join thousands of readers, journalists, and researchers making informed decisions with Pixca intelligence.
            </p>
          </div>

          <div className="flex items-center justify-center w-full md:w-auto shrink-0">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <span>Explore Top News</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
