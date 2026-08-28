"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";


import { Check, Sparkles, ArrowRight, CreditCard, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "@/components/ui/checkout-modal";
import { SubscribeModal } from "@/components/ui/subscribe-modal";
import { useSubscription } from "@/hooks/use-subscription";
import { gsap, useGSAP } from "@/lib/gsap";
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

const planGlowStyles: Record<string, string> = {
  free: "hover:border-emerald-500/80 dark:hover:border-emerald-400/80 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/25",
  starter: "hover:border-sky-500/80 dark:hover:border-sky-400/80 hover:shadow-sky-500/25 dark:hover:shadow-sky-500/30",
  pro: "hover:border-blue-600/90 dark:hover:border-blue-500/90 hover:shadow-blue-600/30 dark:hover:shadow-blue-500/35",
  enterprise: "hover:border-purple-600/80 dark:hover:border-purple-400/80 hover:shadow-purple-600/25 dark:hover:shadow-purple-500/30",
};

function StatusBannerContent({
  onSuccessRefetch,
}: {
  onSuccessRefetch?: () => void;
}) {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (status === "success" && onSuccessRefetch) {
      onSuccessRefetch();
    }
  }, [status, onSuccessRefetch]);

  if (!status || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("status");
      const search = url.searchParams.toString() ? `?${url.searchParams.toString()}` : "";
      window.history.replaceState({}, "", `${url.pathname}${search}${url.hash}`);
    }
  };

  if (status === "no_active_subscription") {
    return (
      <div className="p-3.5 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start sm:items-center justify-between gap-3 shadow-xs w-full min-w-0 max-w-full">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <span className="break-words">
            No active Polar subscription record found for your account. Please select a plan below to subscribe.
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="p-1 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (status === "simulated_portal") {
    return (
      <div className="p-3.5 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs sm:text-sm flex items-start sm:items-center justify-between gap-3 shadow-xs w-full min-w-0 max-w-full">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
          <span className="break-words">
            <strong>Polar Dev Simulation Mode:</strong> In production with <code className="break-all">POLAR_ACCESS_TOKEN</code> configured, you are redirected to the self-service Polar Customer Portal to manage subscriptions, payment methods, and invoices.
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="p-1 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="p-3.5 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-sm w-full min-w-0 max-w-full">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="font-bold text-emerald-900 dark:text-emerald-100">
              Subscription payment successful!
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 break-words">
              Thank you for subscribing to Pixca. Your upgraded features and entitlements are now active.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
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
    id: "starter",
    name: "Pixca Starter",
    badge: "New",
    description: "For engaged readers wanting extended sentiment depth, custom digests, and saved stories.",
    highlight: false,
    prices: {
      USD: { monthly: 4.89, annual: 43.99, monthlyEq: 3.67, save: 14.69 },
      GHS: { monthly: 64.99, annual: 579.99, monthlyEq: 48.33, save: 199.89 },
    },
    features: [
      "Everything in Free Reader, plus:",
      "Extended sentiment spectrum & confidence meters",
      "Up to 25 saved article bookmarks",
      "Weekly curated deep-dive editorial digest",
      "Ad-free reading experience",
      "Priority article loading & mobile notifications",
    ],
    ctaLabel: "Get Starter",
    actionType: "checkout",
  },
  {
    id: "pro",
    name: "Pixca Pro",
    badge: "Most Popular",
    description: "For professionals, researchers, and journalists needing deep narrative intelligence.",
    highlight: true,
    prices: {
      USD: { monthly: 10.79, annual: 96.99, monthlyEq: 8.08, save: 32.49 },
      GHS: { monthly: 139.99, annual: 1249.99, monthlyEq: 104.17, save: 429.89 },
    },
    features: [
      "Everything in Pixca Starter, plus:",
      "100% normalized Left / Center / Right percentage breakdown",
      "Mathematical bias calibration score (Right% − Left%) / 100",
      "AI-extracted loaded rhetoric & framing notes",
      "Unlimited pgvector 1536-dim semantic similarity search",
      "Real-time partisan blindspot alerts",
      "Unlimited article bookmarks & offline reading",
      "Priority hourly scraping updates",
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
      USD: { monthly: 24.99, annual: 239.99, monthlyEq: 20.0, save: 59.89 },
      GHS: { monthly: 329.99, annual: 3199.99, monthlyEq: 266.67, save: 759.89 },
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
  const { tier, isSubscribed, isLoading, isSignedIn, refetch } = useSubscription();
  const [currency, setCurrency] = React.useState<Currency>("USD");
  const [interval, setInterval] = React.useState<BillingInterval>("monthly");
  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(".pricing-card-item", {
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.3,
          ease: "power2.out",
          clearProps: "all",
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pricing-card-item", {
          y: 20,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "all",
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [subscribeOpen, setSubscribeOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<{
    name: string;
    price: number;
    currency: Currency;
    interval: BillingInterval;
  }>({
    name: "Pixca Pro",
    price: 10.79,
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
    <div ref={containerRef} className="space-y-12">
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

      {/* URL Status Feedback Banner */}
      <React.Suspense fallback={null}>
        <StatusBannerContent onSuccessRefetch={refetch} />
      </React.Suspense>

      {/* Control Toggles: Currency & Billing Interval */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-2 w-full min-w-0 max-w-full">
        {/* Currency Switcher */}
        <div className="w-full sm:w-auto inline-flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs max-w-full">
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={cn(
              "flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center",
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
              "flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5",
              currency === "GHS"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <span>GHS (GH₵) Local MoMo</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
              Ghana
            </span>
          </button>
        </div>

        {/* Interval Switcher */}
        <div className="w-full sm:w-auto inline-flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs max-w-full">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={cn(
              "flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center",
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
              "flex-1 sm:flex-initial px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5",
              interval === "annual"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <span>Annual</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              Save up to 25%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full min-w-0 max-w-full">
        {PLANS.map((plan) => {
          const pricing = plan.prices[currency];
          const isFree = plan.id === "free";
          const isCurrentPlan = !isLoading && (isSignedIn ? tier === plan.id : false);
          const displayPrice = isFree
            ? 0
            : interval === "annual"
            ? pricing.annual
            : pricing.monthly;

          return (
            <div
              key={plan.id}
              className={cn(
                "pricing-card-item group relative rounded-3xl p-5 sm:p-7 flex flex-col justify-between transform-gpu transition-all duration-300 ease-out will-change-transform hover:-translate-y-2 sm:hover:-translate-y-4 hover:scale-[1.01] sm:hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] cursor-pointer w-full min-w-0 max-w-full",
                planGlowStyles[plan.id],
                isCurrentPlan
                  ? "bg-white dark:bg-[#121215] border-2 border-emerald-500 shadow-xl shadow-emerald-500/15"
                  : plan.highlight
                  ? "bg-white dark:bg-[#121215] border-2 border-blue-500/90 shadow-xl shadow-blue-500/15"
                  : "bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-md"
              )}
            >
              {/* Highlight / Current Plan Badge */}
              {isCurrentPlan ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 max-w-[90%]">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-md truncate">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Current Plan</span>
                  </span>
                </div>
              ) : plan.badge ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 max-w-[90%]">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md truncate">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>{plan.badge}</span>
                  </span>
                </div>
              ) : null}

              {/* Card Top Section */}
              <div className="space-y-5 sm:space-y-6 min-w-0">
                <div className="space-y-1.5 sm:space-y-2 min-w-0">
                  <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight break-words">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed min-h-[36px] break-words">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
                    <span className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 break-words">
                      {formatPrice(displayPrice, currencySymbol)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      /{interval === "annual" && !isFree ? "year" : "month"}
                    </span>
                  </div>

                  {!isFree && interval === "annual" && (
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold break-words">
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
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Free forever • No credit card required
                    </p>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 sm:space-y-3 min-w-0">
                  <span className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                    What’s included
                  </span>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 min-w-0">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            isCurrentPlan
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : plan.id === "starter"
                              ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                              : plan.id === "pro"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : plan.id === "enterprise"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className={cn("break-words flex-1", i === 0 && (plan.highlight || isCurrentPlan) ? "font-bold text-zinc-900 dark:text-zinc-100" : "")}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 sm:pt-8 space-y-2.5 sm:space-y-3 min-w-0">
                <Button
                  type="button"
                  disabled={isCurrentPlan}
                  onClick={() => !isCurrentPlan && handleSelectPlan(plan)}
                  className={cn(
                    "w-full h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                    isCurrentPlan
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 cursor-default opacity-90 disabled:opacity-90"
                      : plan.highlight
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 group-hover:scale-[1.01] transition-transform"
                      : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white group-hover:scale-[1.01] transition-transform"
                  )}
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.ctaLabel}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-zinc-500 dark:text-zinc-400 break-words leading-normal">
                  {isCurrentPlan
                    ? "Included in your current subscription"
                    : currency === "GHS" && !isFree
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

      {/* Customer Self-Service Portal Access */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 gap-4 shadow-sm w-full min-w-0 max-w-full">
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Manage Existing Polar Subscription
              </h4>
              {isSubscribed && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide shrink-0">
                  {tier} Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 break-words">
              {isSubscribed
                ? `Manage your active Pixca ${tier.toUpperCase()} subscription, update billing details, switch payment methods, cancel, or download EU/UK VAT tax invoices.`
                : "Update billing details, switch cards, cancel plans, or download EU/UK VAT tax invoices directly in the Customer Portal."}
            </p>
          </div>
        </div>
        <a
          href="/api/portal/polar"
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-all shrink-0 cursor-pointer border border-zinc-200 dark:border-zinc-700 shadow-xs w-full sm:w-auto"
        >
          <span>Open Customer Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

