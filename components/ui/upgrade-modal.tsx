"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Bookmark,
  ArrowRight,
  Zap,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  currentCount?: number;
  maxLimit?: number;
  reason?: "bookmarks" | "rhetoric" | "similarity" | "general";
}

export function UpgradeModal({
  open,
  onOpenChange,
  title,
  description,
  currentCount,
  maxLimit,
  reason = "bookmarks",
}: UpgradeModalProps) {
  const defaultTitle =
    reason === "bookmarks"
      ? "Bookmark Limit Reached"
      : "Upgrade for Full Intelligence";

  const defaultDescription =
    reason === "bookmarks"
      ? `Free Reader accounts can save up to ${maxLimit || 5} articles. Upgrade to Starter ($4.89/mo) for 25 bookmarks, or Pixca Pro ($10.79/mo) for unlimited bookmarks and deep AI rhetoric extraction.`
      : "Unlock unlimited semantic vector similarity search, deep loaded rhetoric analysis, and customizable AI news digests.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 gap-5">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Zap className="h-3 w-3" />
              Plan Entitlement
            </span>
            {currentCount !== undefined && maxLimit !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <Bookmark className="h-3 w-3" />
                {currentCount} / {maxLimit} used
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title || defaultTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Plan Comparison Highlights */}
        <div className="grid gap-2.5 py-1">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-left flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Pixca Pro
                </h4>
                <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                  $10.79/mo
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
                Unlimited bookmarks, full Left/Center/Right sentiment matrix, pgvector similarity, and blindspot alerts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <Shield className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-left flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Pixca Starter
                </h4>
                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  $4.89/mo
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                Up to 25 saved bookmarks and loaded rhetoric extraction with weekly digests.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Link href="/pricing" onClick={() => onOpenChange(false)} className="w-full">
            <Button
              type="button"
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-bold h-10 rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Upgrade Plan & Unlock Unlimited Access</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 h-8 cursor-pointer"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
