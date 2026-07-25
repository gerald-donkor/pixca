// Label → style maps for AI analysis values, using the bias tokens already
// declared in `app/globals.css`. Presentation only — no data access.

import type { BiasLabel, SentimentLabel } from "@/lib/supabase/types";

/** `center`, `mixed`, and `unclear` are deliberately neutral — no leaning implied. */
export function biasLabelColorClass(label: BiasLabel): string {
  switch (label) {
    case "left":
      return "text-[var(--bias-left)]";
    case "right":
      return "text-[var(--bias-right)]";
    default:
      return "text-zinc-500";
  }
}

export function sentimentLabelColorClass(label: SentimentLabel): string {
  switch (label) {
    case "positive":
      return "text-emerald-600";
    case "negative":
      return "text-[var(--bias-left)]";
    default:
      return "text-zinc-500";
  }
}

export type FramingHighlight = {
  label: BiasLabel;
  percentage: number;
};

/**
 * The strongest of the three stored percentages, used as the "Overall Bias"
 * headline value. When the model's own label is `mixed` or `unclear` that label
 * is kept — it carries the low-confidence signal the raw percentages do not.
 */
export function strongestFramingPercentage(analysis: {
  bias_label: BiasLabel;
  left_percentage: number;
  center_percentage: number;
  right_percentage: number;
}): FramingHighlight {
  const candidates: FramingHighlight[] = [
    { label: "left", percentage: analysis.left_percentage },
    { label: "center", percentage: analysis.center_percentage },
    { label: "right", percentage: analysis.right_percentage },
  ];

  const strongest = candidates.sort((a, b) => b.percentage - a.percentage)[0];

  if (analysis.bias_label === "mixed" || analysis.bias_label === "unclear") {
    return { label: analysis.bias_label, percentage: strongest.percentage };
  }

  return strongest;
}
