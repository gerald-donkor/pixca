"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What payment methods are supported?",
    answer:
      "We support dual local and global payment channels: Global Credit/Debit Cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay are processed securely via Polar (polar.sh), our official Merchant of Record with automated global VAT/tax compliance. Local Ghana Mobile Money (MTN MoMo, Telecel Cash, and AirtelTigo Money) is powered natively via Paystack.",
  },
  {
    question: "How does Mobile Money payment work?",
    answer:
      "When you choose Mobile Money (GHS) and enter your Ghana phone number, an instant USSD approval prompt is pushed directly to your handset. Enter your Mobile Money PIN to approve the transaction, and your Pixca Pro subscription activates immediately.",
  },
  {
    question: "How are international taxes and invoices handled by Polar?",
    answer:
      "As our Merchant of Record, Polar automatically calculates, collects, and files digital services sales tax and EU/UK VAT at checkout based on your billing address. Corporate customers can enter their VAT/tax ID for reverse-charge tax exemption, and downloadable PDF invoices and receipts are generated automatically.",
  },
  {
    question: "Can I switch between monthly and annual billing?",
    answer:
      "Yes, you can toggle between monthly and annual billing at any time. Selecting annual billing automatically grants you an instant discount across all paid subscription tiers.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, absolutely. There are no lock-in contracts or cancellation penalties. If you choose to cancel, your Pro features will remain fully accessible until the conclusion of your current billing period.",
  },
  {
    question: "How does Pixca ensure AI neutrality in its sentiment scoring?",
    answer:
      "Pixca utilizes Google Gemini with structured analytical rubrics. Every article's political framing is normalized across Left, Center, and Right percentages that strictly sum to 100%, alongside mathematical bias scoring and extraction of emotionally loaded rhetoric.",
  },
  {
    question: "Do you offer academic or non-profit discounts?",
    answer:
      "Yes! We offer a 50% discount for verified students, educators, university researchers, and accredited investigative journalism non-profits. Reach out to our support team to verify your credentials.",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto w-full min-w-0 max-w-full">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={cn(
              "rounded-2xl border transition-all duration-200 overflow-hidden w-full min-w-0 max-w-full",
              isOpen
                ? "bg-[var(--surface-elevated)] border-blue-500/40 shadow-sm"
                : "bg-[var(--surface-elevated)] border-[var(--border)] hover:border-zinc-400 dark:hover:border-zinc-700"
            )}
          >
            <button
              type="button"
              id={`faq-trigger-${index}`}
              aria-controls={`faq-panel-${index}`}
              onClick={() => toggle(index)}
              className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer min-w-0"
              aria-expanded={isOpen}
            >
              <span className="text-xs sm:text-base font-bold text-[var(--text-primary)] min-w-0 flex-1 break-words">
                {faq.question}
              </span>
              <div
                className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200",
                  isOpen
                    ? "rotate-180 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-[var(--text-secondary)]"
                )}
              >
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </button>

            {isOpen && (
              <div
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-trigger-${index}`}
                className="px-4 pb-4 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-3.5 sm:pt-4 animate-in fade-in-50 duration-200 break-words min-w-0"
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
