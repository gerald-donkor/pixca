import "server-only";

// Single-article Gemini call: generate, validate, repair percentages, and shape
// the row that `article_analyses` expects (AGENTS.md section 19).
//
// Verified against the bundled version-matched docs for the installed packages
// (`ai@7.0.37`, `@ai-sdk/google@4.0.24`): structured output is produced by
// `generateText` with `output: Output.object({ schema })` and read back from
// the `output` property; `@ai-sdk/google` reads
// `GOOGLE_GENERATIVE_AI_API_KEY` from the environment by itself.

import { google } from "@ai-sdk/google";
import { Output, generateText } from "ai";
import {
  analysisOutputSchema,
  deriveBiasScore,
  normalizePercentages,
  type AnalysisOutput,
} from "@/lib/ai/analysis-schema";
import { isRateLimitError, toModelErrorMessage } from "@/lib/ai/errors";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from "@/lib/ai/prompt";
import { ANALYSIS_DISCLAIMER_FALLBACK, ANALYSIS_MODEL_ID } from "@/lib/config/ai";
import { ANALYSIS_MAX_ATTEMPTS } from "@/lib/config/limits";
import type { ArticleAnalysisInsert } from "@/lib/supabase/types";

export type AnalyzableArticle = {
  id: string;
  title: string;
  published_at: string;
  raw_text: string;
};

export type AnalysisFailureReason =
  | "invalid_output"
  | "percentages_unusable"
  | "model_error"
  | "rate_limited";

export type AnalyzeArticleResult =
  | { ok: true; analysis: ArticleAnalysisInsert }
  | { ok: false; reason: AnalysisFailureReason; message: string };

/** Only an output-shape failure can plausibly be fixed by asking again. */
const RETRYABLE_REASONS: ReadonlySet<AnalysisFailureReason> = new Set([
  "invalid_output",
  "percentages_unusable",
]);

/**
 * Analyze one article. Invalid model output is retried once
 * (`ANALYSIS_MAX_ATTEMPTS`); a rate limit or a transport error is returned on
 * the first failure so a dead run costs exactly one request per article.
 * Nothing is saved on failure, so the next run picks the article up again.
 */
export async function analyzeArticle(
  article: AnalyzableArticle
): Promise<AnalyzeArticleResult> {
  let lastFailure: AnalyzeArticleResult = {
    ok: false,
    reason: "model_error",
    message: "Analysis was never attempted.",
  };

  for (let attempt = 1; attempt <= ANALYSIS_MAX_ATTEMPTS; attempt += 1) {
    const attemptResult = await attemptAnalysis(article);

    if (attemptResult.ok) {
      return attemptResult;
    }

    lastFailure = attemptResult;

    if (!RETRYABLE_REASONS.has(attemptResult.reason)) {
      return lastFailure;
    }
  }

  return lastFailure;
}


async function attemptAnalysis(article: AnalyzableArticle): Promise<AnalyzeArticleResult> {
  let output: AnalysisOutput;

  try {
    const result = await generateText({
      model: google(ANALYSIS_MODEL_ID),
      system: ANALYSIS_SYSTEM_PROMPT,
      prompt: buildAnalysisPrompt({
        title: article.title,
        publishedAt: article.published_at,
        rawText: article.raw_text,
      }),
      output: Output.object({ schema: analysisOutputSchema }),
      // One attempt = one API request. Retry policy lives in the loop above,
      // not in two places; the SDK default of 2 silently tripled quota use.
      maxRetries: 0,
    });

    // Re-parse rather than trusting the SDK's own validation, so a provider
    // that returns a loose shape can never reach the DB constraints.
    const parsed = analysisOutputSchema.safeParse(result.output);

    if (!parsed.success) {
      return {
        ok: false,
        reason: "invalid_output",
        message: parsed.error.issues.map((issue) => issue.message).join("; "),
      };
    }

    output = parsed.data;
  } catch (error) {
    return {
      ok: false,
      reason: resolveErrorReason(error),
      message: toModelErrorMessage(error),
    };
  }

  const percentages = normalizePercentages(
    output.leftPercentage,
    output.centerPercentage,
    output.rightPercentage
  );

  if (!percentages) {
    return {
      ok: false,
      reason: "percentages_unusable",
      message: `Framing percentages do not add up to 100 (${output.leftPercentage}/${output.centerPercentage}/${output.rightPercentage}).`,
    };
  }

  return {
    ok: true,
    analysis: {
      article_id: article.id,
      summary: output.summary.trim(),
      sentiment_score: output.sentimentScore,
      sentiment_label: output.sentimentLabel,
      bias_score: deriveBiasScore(percentages.left, percentages.right),
      bias_label: output.politicalFramingLabel,
      left_percentage: percentages.left,
      center_percentage: percentages.center,
      right_percentage: percentages.right,
      confidence: output.confidence,
      framing_notes: emptyToNull(output.framingNotes),
      loaded_terms: output.loadedTerms.map((term) => term.trim()).filter(Boolean),
      disclaimer: output.disclaimer.trim() || ANALYSIS_DISCLAIMER_FALLBACK,
      model: ANALYSIS_MODEL_ID,
    },
  };
}

function resolveErrorReason(error: unknown): AnalysisFailureReason {
  if (isRateLimitError(error)) {
    return "rate_limited";
  }

  return error instanceof Error && error.name.includes("NoObjectGenerated")
    ? "invalid_output"
    : "model_error";
}

function emptyToNull(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}
