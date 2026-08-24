"use client";

import * as React from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "@/components/ui/checkout-modal";
import { SubscribeModal } from "@/components/ui/subscribe-modal";
import { cn } from "@/lib/utils";

export type Currency = "USD" | "GHS";
export type BillingInterval = "monthly" | "annual";

export function formatPrice(price: number, currencySymbol: string): string {
  if (price === 0) return `${currencySymbol}0`;
  return `${currencySymbol}${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface TierPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  highlight?: boolean;
  prices: {
    USD: { monthly: number; annual: number; monthlyEq: number; save: number };
    GHS: { monthly: number; annual: number; monthlyEq: number; save: number };
  };
  features: string[];
  ctaLabel: string;
  actionType: "free" | "checkout";
}

const PLANS: TierPlan[] = [
  {
    id: "free",
    name: "Free Reader",
    description: "Essential daily news reading with standard AI sentiment and framing indicators.",
    highlight: false,
    prices: {
      USD: { monthly: 0, annual: 0, monthlyEq: 0, save: 0 },
      GHS: { monthly: 0, annual: 0, monthlyEq: 0, save: 0 },
    },
    features: [
      "Access to breaking top stories & hourly scraping",
      "Basic tone sentiment (Positive / Neutral / Negative)",
      "Standard bias classification (Left / Center / Right)",
      "Daily morning editorial newsletter digest",
      "Up to 5 saved bookmarks",
      "Full dark, light, and auto system theme support",
    ],
    ctaLabel: "Get Started Free",
    actionType: "free",
  },
  {
    id: "pro",
    name: "Pixca Pro",
    badge: "Most Popular",
    description: "For professionals, researchers, and journalists needing deep narrative intelligence.",
    highlight: true,
    prices: {
      USD: { monthly: 9.99, annual: 89.99, monthlyEq: 7.5, save: 29.89 },
      GHS: { monthly: 129.99, annual: 1199.99, monthlyEq: 100, save: 359.89 },
    },
    features: [
      "Everything in Free Reader, plus:",
      "100% normalized Left / Center / Right percentage breakdown",
      "Mathematical bias calibration score (Right% − Left%) / 100",
      "AI-extracted loaded rhetoric & framing notes",
      "Unlimited pgvector 1536-dim semantic similarity search",
      "Real-time partisan blindspot alerts",
      "Unlimited article bookmarks & offline reading",
      "Priority hourly scraping updates & ad-free experience",
    ],
    ctaLabel: "Upgrade to Pixca Pro",
    actionType: "checkout",
  },
  {
    id: "enterprise",
    name: "Pixca Enterprise",
    badge: "Teams & API",
    description: "For newsrooms, institutions, and developers building on news intelligence.",
    highlight: false,
    prices: {
      USD: { monthly: 29.99, annual: 289.99, monthlyEq: 24.17, save: 69.89 },
      GHS: { monthly: 399.99, annual: 3799.99, monthlyEq: 316.67, save: 999.89 },
    },
    features: [
      "Everything in Pixca Pro, plus:",
      "Developer REST & GraphQL API access (100k requests/mo)",
      "Full JSON/CSV export of sentiment & vector datasets",
      "Custom news source ingestion queue (Oxylabs engine)",
      "Multi-seat team workspace (up to 10 seats)",
      "Real-time webhook alerts on editorial shifts",
      "Dedicated 99.9% uptime SLA & priority support",
    ],
    ctaLabel: "Get Enterprise",
    actionType: "checkout",
  },
];

export function PricingCards() {
  const [currency, setCurrency] = React.useState<Currency>("USD");
  const [interval, setInterval] = React.useState<BillingInterval>("monthly");

  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [subscribeOpen, setSubscribeOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<{
    name: string;
    price: number;
    currency: Currency;
    interval: BillingInterval;
  }>({
    name: "Pixca Pro",
    price: 9.99,
    currency: "USD",
    interval: "monthly",
  });

  const currencySymbol = currency === "GHS" ? "GH₵" : "$";

  const handleSelectPlan = (plan: TierPlan) => {
    if (plan.actionType === "free") {
      setSubscribeOpen(true);
      return;
    }

    const price =
      interval === "annual"
        ? plan.prices[currency].annual
        : plan.prices[currency].monthly;

    setSelectedPlan({
      name: plan.name,
      price,
      currency,
      interval,
    });
    setCheckoutOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        planName={selectedPlan.name}
        currency={selectedPlan.currency}
        interval={selectedPlan.interval}
        price={selectedPlan.price}
      />

      {/* Free Newsletter Modal */}
      <SubscribeModal
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
      />

      {/* Control Toggles: Currency & Billing Interval */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2">
        {/* Currency Switcher */}
        <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              currency === "USD"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            USD ($) Global
          </button>
          <button
            type="button"
            onClick={() => setCurrency("GHS")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              currency === "GHS"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <span>GHS (GH₵) Local MoMo</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
              Ghana
            </span>
          </button>
        </div>

        {/* Interval Switcher */}
        <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              interval === "monthly"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("annual")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              interval === "annual"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <span>Annual</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {PLANS.map((plan) => {
          const pricing = plan.prices[currency];
          const isFree = plan.id === "free";
          const displayPrice = isFree
            ? 0
            : interval === "annual"
            ? pricing.annual
            : pricing.monthly;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300",
                plan.highlight
                  ? "bg-[var(--surface-elevated)] border-2 border-blue-500/80 shadow-2xl shadow-blue-500/10 lg:-translate-y-2"
                  : "bg-[var(--surface-elevated)] border border-[var(--border)] shadow-md hover:border-zinc-400 dark:hover:border-zinc-700"
              )}
            >
              {/* Highlight Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Card Top Section */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="space-y-1 pb-4 border-b border-[var(--border)]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
                      {formatPrice(displayPrice, currencySymbol)}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      /{interval === "annual" && !isFree ? "year" : "month"}
                    </span>
                  </div>

                  {!isFree && interval === "annual" && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>
                        Equivalent to {formatPrice(pricing.monthlyEq, currencySymbol)}/mo
                      </span>
                      <span>•</span>
                      <span>
                        Save {formatPrice(pricing.save, currencySymbol)}/yr
                      </span>
                    </div>
                  )}

                  {isFree && (
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Free forever • No credit card required
                    </p>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
                    What’s included
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            plan.highlight
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={cn(i === 0 && plan.highlight ? "font-bold text-[var(--text-primary)]" : "")}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 space-y-3">
                <Button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={cn(
                    "w-full h-11 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
                      : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white"
                  )}
                >
                  <span>{plan.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-[10px] text-center text-[var(--text-secondary)]">
                  {currency === "GHS" && !isFree
                    ? "Pay locally with MTN MoMo, Telecel, AirtelTigo or Card"
                    : !isFree
                    ? "Billed globally via Polar (Merchant of Record • VAT included)"
                    : "Instant access in 30 seconds"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
