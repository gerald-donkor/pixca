import "server-only";

// The AI analysis pipeline (AGENTS.md section 19). Finds articles with no
// `article_analyses` row, analyzes each with Gemini, saves valid output, and
// sets `analyzed_at` only after the analysis row is committed.
//
// Written as a plain module with no request coupling so the section 18 cron
// route can import and reuse it unchanged.

import { analyzeArticle } from "@/lib/ai/analyze-article";
import { ANALYSIS_MODEL_ID } from "@/lib/config/ai";
import {
  ANALYSIS_REQUEST_DELAY_MS,
  DEFAULT_ANALYSIS_BATCH_SIZE,
  MAX_ANALYSIS_BATCH_SIZE,
} from "@/lib/config/limits";
import { analysisLog, persistAnalysisRunSummary } from "@/lib/pipeline/analysis-run-logger";
import { toMessage } from "@/lib/pipeline/run-logger";
import type {
  AnalysisFailureCounts,
  AnalysisItemResult,
  AnalysisRunSummary,
} from "@/lib/pipeline/types";
import { insertArticleAnalysis, markArticleAnalyzed } from "@/lib/supabase/queries/analyses";
import {
  getPendingAnalysisArticles,
  type PendingAnalysisArticle,
} from "@/lib/supabase/queries/articles";

export type RunAnalysisPipelineOptions = {
  /** Articles per batch. Batching exists only for timeout control (section 19). */
  batchSize?: number;
  /** Total articles to attempt. Omitted means "continue until none remain". */
  limit?: number;
  /** Analyze exactly these articles, skipping the drain loop. */
  articleIds?: string[];
};

export async function runAnalysisPipeline(
  options: RunAnalysisPipelineOptions = {}
): Promise<AnalysisRunSummary> {
  const startedAt = Date.now();
  const batchSize = resolveBatchSize(options.batchSize);
  const limit = options.limit ?? null;

  analysisLog.started(ANALYSIS_MODEL_ID, batchSize, limit);

  const state: RunState = {
    articles: [],
    failureReasons: {},
    analyzed: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
    batchesRun: 0,
    processedIds: new Set<string>(),
  };

  let error: string | null = null;

  try {
    if (options.articleIds) {
      await runSelectedArticles(state, options.articleIds, batchSize, limit);
    } else {
      await drainPendingArticles(state, batchSize, limit);
    }
  } catch (caught) {
    error = toMessage(caught);
    analysisLog.runError(error);
  }

  const summary: AnalysisRunSummary = {
    status: error === null ? "completed" : "failed",
    model: ANALYSIS_MODEL_ID,
    articlesPending: state.pending,
    articlesAnalyzed: state.analyzed,
    articlesSkipped: state.skipped,
    articlesFailed: state.failed,
    batchesRun: state.batchesRun,
    durationMs: Date.now() - startedAt,
    failureReasons: state.failureReasons,
    articles: state.articles,
    error,
  };

  analysisLog.completed(summary);
  await persistAnalysisRunSummary(summary);

  return summary;
}

type RunState = {
  articles: AnalysisItemResult[];
  failureReasons: AnalysisFailureCounts;
  analyzed: number;
  failed: number;
  skipped: number;
  pending: number;
  batchesRun: number;
  /** Guards against re-fetching articles that failed and stayed pending. */
  processedIds: Set<string>;
};

/** Default run: keep pulling batches until no pending article remains. */
async function drainPendingArticles(
  state: RunState,
  batchSize: number,
  limit: number | null
): Promise<void> {
  for (;;) {
    const remaining = limit === null ? batchSize : limit - attempted(state);

    if (remaining <= 0) {
      return;
    }

    const batch = await getPendingAnalysisArticles({
      limit: Math.min(batchSize, remaining),
    });

    if (batch.length === 0) {
      return;
    }

    const fresh = batch.filter((article) => !state.processedIds.has(article.id));

    // Failed articles stay pending, so the same batch can come back forever.
    // Stop once a batch brings nothing new instead of looping.
    if (fresh.length === 0) {
      state.skipped += batch.length;
      analysisLog.noProgress(batch.length);
      return;
    }

    await processBatch(state, fresh);
  }
}

/** Explicit selection: analyze exactly the requested articles that are pending. */
async function runSelectedArticles(
  state: RunState,
  articleIds: string[],
  batchSize: number,
  limit: number | null
): Promise<void> {
  const pending = await getPendingAnalysisArticles({
    limit: limit ?? articleIds.length,
    articleIds,
  });

  // Requested articles that already have an analysis row are not pending.
  state.skipped += articleIds.length - pending.length;

  for (let index = 0; index < pending.length; index += batchSize) {
    await processBatch(state, pending.slice(index, index + batchSize));
  }
}

/**
 * Analyze one batch sequentially. Concurrency would risk Gemini rate limits and
 * make the log stream unreadable; this is a background job, not a request path.
 */
async function processBatch(state: RunState, batch: PendingAnalysisArticle[]): Promise<void> {
  state.batchesRun += 1;
  state.pending += batch.length;

  const batchNumber = state.batchesRun;
  analysisLog.batchStarted(batchNumber, batch.length);

  let analyzed = 0;
  let failed = 0;

  for (const [index, article] of batch.entries()) {
    if (index > 0) {
      await delay(ANALYSIS_REQUEST_DELAY_MS);
    }

    state.processedIds.add(article.id);
    analysisLog.articleStarted(article.id, article.title);

    // One article must never abort the run.
    const outcome = await analyzeOne(state, article);

    if (outcome === "analyzed") {
      analyzed += 1;
    } else {
      failed += 1;
    }
  }

  state.analyzed += analyzed;
  state.failed += failed;

  analysisLog.batchFinished(batchNumber, analyzed, failed);
}

async function analyzeOne(
  state: RunState,
  article: PendingAnalysisArticle
): Promise<"analyzed" | "failed"> {
  try {
    const result = await analyzeArticle({
      id: article.id,
      title: article.title,
      published_at: article.published_at,
      raw_text: article.raw_text,
    });

    if (!result.ok) {
      recordFailure(state, article, result.reason, result.message);
      return "failed";
    }

    // Order matters (section 19 requirement 6): `analyzed_at` is set only after
    // the analysis row is committed.
    await insertArticleAnalysis(result.analysis);
    await markArticleAnalyzed(article.id);

    state.articles.push({
      articleId: article.id,
      title: article.title,
      status: "analyzed",
      reason: null,
    });

    analysisLog.articleAnalyzed(
      article.id,
      result.analysis.bias_label,
      result.analysis.confidence
    );

    return "analyzed";
  } catch (error) {
    recordFailure(state, article, "save_error", toMessage(error));
    return "failed";
  }
}

function recordFailure(
  state: RunState,
  article: PendingAnalysisArticle,
  reason: string,
  message: string
): void {
  state.failureReasons[reason] = (state.failureReasons[reason] ?? 0) + 1;
  state.articles.push({
    articleId: article.id,
    title: article.title,
    status: "failed",
    reason,
  });

  analysisLog.articleFailed(article.id, reason, message);
}

function attempted(state: RunState): number {
  return state.analyzed + state.failed;
}

function resolveBatchSize(requested?: number): number {
  const configured = Number.parseInt(process.env.ANALYSIS_BATCH_SIZE ?? "", 10);
  const fallback = Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_ANALYSIS_BATCH_SIZE;

  const value = requested ?? fallback;

  return Math.min(Math.max(1, value), MAX_ANALYSIS_BATCH_SIZE);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
