"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Newspaper, SlidersHorizontal, Eye, ShieldCheck, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { NewsletterSubscribe } from "@/components/ui/newsletter-subscribe";

export interface SubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscribeModal({ open, onOpenChange }: SubscribeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[480px] p-4 sm:p-6 gap-4 sm:gap-5 max-h-[calc(100dvh-2rem)] overflow-y-auto min-w-0">
        <DialogHeader className="space-y-1.5 sm:space-y-2 min-w-0 pr-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <Sparkles className="h-3 w-3" />
              Pixca Pro Intelligence
            </span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 break-words">
            Stay Ahead with AI-Powered Intelligence
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed break-words">
            Get balanced multi-perspective news digests, real-time framing analysis, and blindspot alerts delivered to your inbox.
          </DialogDescription>
        </DialogHeader>

        {/* Feature Highlights */}
        <div className="grid gap-2.5 py-1 min-w-0">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <Newspaper className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 text-left min-w-0 flex-1">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 break-words">
                Daily Balanced Digest
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal break-words">
                Curated multi-source reporting delivered straight to your inbox every morning.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 min-w-0">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 text-left min-w-0 flex-1">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 break-words">
                Skew & Bias Detection
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal break-words">
                Identify left, right, and center editorial framing and loaded language instantly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Eye className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 text-left min-w-0 flex-1">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 break-words">
                Breaking Blindspot Alerts
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal break-words">
                Catch essential stories underreported across the partisan media spectrum.
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Form */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 min-w-0">
          <NewsletterSubscribe className="w-full [&>form]:w-full [&>form>div]:w-full [&_input]:w-full [&_input]:md:w-auto" />
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
            <div className="flex items-center gap-1 shrink-0">
              <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>No spam. Free forever.</span>
            </div>
            <Link
              href="/pricing"
              onClick={() => onOpenChange(false)}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 shrink-0"
            >
              <span>Explore Pro & MoMo Plans</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
