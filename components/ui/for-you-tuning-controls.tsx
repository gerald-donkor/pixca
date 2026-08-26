"use client";

import * as React from "react";
import {
  Sparkles,
  Compass,
  Scale,
  Target,
  RotateCcw,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TuningMode = "balanced" | "counter" | "focus" | "anchor";

export interface ForYouTuningControlsProps {
  activeMode: TuningMode;
  onModeChange: (mode: TuningMode) => void;
  availableTopics: string[];
  activeTopic: string | null;
  onTopicChange: (topic: string | null) => void;
  dominantBias?: "left" | "right" | "center" | "balanced" | null;
  resultCount: number;
  totalPoolCount: number;
  isNewVisitor?: boolean;
  className?: string;
}

const MODES: Array<{
  id: TuningMode;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}> = [
  {
    id: "balanced",
    label: "Balanced Discovery",
    shortLabel: "Balanced",
    icon: Sparkles,
    description:
      "Harmonious blend matching your favorite publishers and topics with balanced baseline reporting.",
  },
  {
    id: "counter",
    label: "Echo-Chamber Shield",
    shortLabel: "Counter-Perspectives",
    icon: Compass,
    description:
      "Proactively surfaces counter-perspectives and divergent reporting across the political spectrum.",
    badge: "Shielded",
  },
  {
    id: "focus",
    label: "Deep Focus",
    shortLabel: "Deep Focus",
    icon: Target,
    description:
      "Maximizes relevance for publishers and specific news topics you save and engage with most.",
  },
  {
    id: "anchor",
    label: "Centrist Anchor",
    shortLabel: "Centrist Anchor",
    icon: Scale,
    description:
      "Filters strictly for high-confidence centrist analysis with low loaded language.",
  },
];

export function ForYouTuningControls({
  activeMode,
  onModeChange,
  availableTopics,
  activeTopic,
  onTopicChange,
  dominantBias,
  resultCount,
  totalPoolCount,
  isNewVisitor = false,
  className,
}: ForYouTuningControlsProps) {
  const currentModeInfo = MODES.find((m) => m.id === activeMode) || MODES[0];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-[var(--border)]">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onModeChange(mode.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                  {mode.badge && (
                    <span
                      className={cn(
                        "hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase",
                        isActive
                          ? "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {mode.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count & Reset Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[var(--text-muted)] shrink-0">
          <span>
            Showing <strong className="text-[var(--text-primary)] font-bold">{resultCount}</strong> of{" "}
            {totalPoolCount} stories
          </span>
          {(activeTopic !== null || activeMode !== "balanced") && (
            <button
              type="button"
              onClick={() => {
                onModeChange("balanced");
                onTopicChange(null);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Mode Explanation & Topic Pills Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 border border-[var(--border)] rounded-xl px-4 py-2.5">
        {/* Left: Mode Explanation */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-semibold text-[var(--text-primary)]">{currentModeInfo.label}:</span>
          <span>{currentModeInfo.description}</span>
          {activeMode === "counter" && dominantBias && dominantBias !== "balanced" && (
            <span className="hidden sm:inline-block font-semibold text-purple-600 dark:text-purple-400">
              (Balancing your {dominantBias} skew)
            </span>
          )}
        </div>

        {/* Right: Dynamic Topic Pills */}
        {availableTopics.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 pt-1 lg:pt-0">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1 shrink-0 mr-1">
              <Tag className="w-3 h-3 text-amber-500" />
              <span>{isNewVisitor ? "Explore Topics:" : "Topic Focus:"}</span>
            </span>

            <button
              type="button"
              onClick={() => onTopicChange(null)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap border",
                activeTopic === null
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "bg-card text-[var(--text-secondary)] border-[var(--border)] hover:bg-muted"
              )}
            >
              All Topics
            </button>

            {availableTopics.slice(0, 5).map((topic) => {
              const isSelected = activeTopic?.toLowerCase() === topic.toLowerCase();
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onTopicChange(isSelected ? null : topic)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap capitalize border",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500 shadow-xs"
                      : "bg-card text-[var(--text-secondary)] border-[var(--border)] hover:bg-muted hover:text-[var(--text-primary)]"
                  )}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
