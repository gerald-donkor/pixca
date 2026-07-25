// Zod schema for the Gemini analysis output plus the pure helpers that turn it
// into DB-safe values (AGENTS.md section 19 framing output rules).
//
// The schema mirrors the `article_analyses` check constraints so invalid model
// output is rejected before it can reach Postgres. Kept free of server-only
// imports so the helpers stay trivially testable.

import { z } from "zod";

export const analysisOutputSchema = z
  .object({
    summary: z.string().min(1),
    sentimentScore: z.number().min(-1).max(1),
    sentimentLabel: z.enum(["positive", "neutral", "negative"]),
    politicalFramingLabel: z.enum(["left", "center", "right", "mixed", "unclear"]),
    leftPercentage: z.number().min(0).max(100),
    centerPercentage: z.number().min(0).max(100),
    rightPercentage: z.number().min(0).max(100),
    confidence: z.number().min(0).max(1),
    framingNotes: z.string().nullable(),
    loadedTerms: z.array(z.string()),
    disclaimer: z.string(),
  })
  .strict();

export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;

export type NormalizedPercentages = {
  left: number;
  center: number;
  right: number;
};

/** How far the raw percentages may miss 100 before the output is treated as bad. */
const MAX_PERCENTAGE_DEVIATION = 2;

/**
 * The DB enforces `left + center + right = 100` exactly while models routinely
 * return e.g. 30/35/34. Round each value, then absorb the residual into the
 * largest bucket. A pre-repair sum more than 2 off 100 means the model did not
 * really answer the question, so the output is rejected instead of reshaped.
 */
export function normalizePercentages(
  left: number,
  center: number,
  right: number
): NormalizedPercentages | null {
  const rawSum = left + center + right;

  if (Math.abs(rawSum - 100) > MAX_PERCENTAGE_DEVIATION) {
    return null;
  }

  const rounded: NormalizedPercentages = {
    left: Math.round(left),
    center: Math.round(center),
    right: Math.round(right),
  };

  const residual = 100 - (rounded.left + rounded.center + rounded.right);

  if (residual !== 0) {
    const largest = largestKey(rounded);
    rounded[largest] += residual;
  }

  if (rounded.left < 0 || rounded.center < 0 || rounded.right < 0) {
    return null;
  }

  return rounded;
}

/** Section 7: `bias_score = (right − left) / 100`, kept inside the [-1, 1] check. */
export function deriveBiasScore(left: number, right: number): number {
  const score = (right - left) / 100;
  const clamped = Math.min(1, Math.max(-1, score));

  return Number(clamped.toFixed(4));
}

function largestKey(percentages: NormalizedPercentages): keyof NormalizedPercentages {
  const { left, center, right } = percentages;

  if (center >= left && center >= right) {
    return "center";
  }

  return left >= right ? "left" : "right";
}
