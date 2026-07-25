import "server-only";

// The AI analysis pipeline (AGENTS.md sections 19 and 20). Finds articles with
// no `article_analyses` row, analyzes each with Gemini, embeds it for pgvector
// similarity search, and sets `analyzed_at` only after both the analysis row
// and its embedding are committed. Analyses left without an embedding by an
// earlier run are backfilled without a second analysis call.
//
// Written as a plain module with no request coupling so the section 18 cron
// route can import and reuse it unchanged.

import { analyzeArticle } from "@/lib/ai/analyze-article";
import { embedArticle } from "@/lib/ai/embed-article";
import { ANALYSIS_MODEL_ID, EMBEDDING_MODEL_ID } from "@/lib/config/ai";
import {
  ANALYSIS_REQUEST_DELAY_MS,
  DEFAULT_ANALYSIS_BATCH_SIZE,
  MAX_ANALYSIS_BATCH_SIZE,
  MAX_ANALYSIS_RUN_MS,
} from "@/lib/config/limits";
import { analysisLog, persistAnalysisRunSummary } from "@/lib/pipeline/analysis-run-logger";
import { toMessage } from "@/lib/pipeline/run-logger";
import type {
  AnalysisFailureCounts,
  AnalysisItemResult,
  AnalysisRunSummary,
  AnalysisStoppedReason,
} from "@/lib/pipeline/types";
import {
  insertArticleAnalysis,
  markArticleAnalyzed,
  updateAnalysisEmbedding,
} from "@/lib/supabase/queries/analyses";
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

  analysisLog.started(ANALYSIS_MODEL_ID, EMBEDDING_MODEL_ID, batchSize, limit);

  const state: RunState = {
    articles: [],
    failureReasons: {},
    analyzed: 0,
    embedded: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
    batchesRun: 0,
    processedIds: new Set<string>(),
    stoppedReason: null,
    callsMade: 0,
    deadline: startedAt + MAX_ANALYSIS_RUN_MS,
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
    embeddingModel: EMBEDDING_MODEL_ID,
    articlesPending: state.pending,
    articlesAnalyzed: state.analyzed,
    articlesEmbedded: state.embedded,
    articlesSkipped: state.skipped,
    articlesFailed: state.failed,
    batchesRun: state.batchesRun,
    durationMs: Date.now() - startedAt,
    failureReasons: state.failureReasons,
    articles: state.articles,
    stoppedReason: state.stoppedReason,
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
  embedded: number;
  failed: number;
  skipped: number;
  /**
   * Articles this run took responsibility for: every article attempted, plus
   * requested articles that turned out not to be pending. Always equals
   * analyzed + embedded + skipped + failed.
   */
  pending: number;
  batchesRun: number;
  /** Guards against re-fetching articles that failed and stayed pending. */
  processedIds: Set<string>;
  stoppedReason: AnalysisStoppedReason;
  /** Gemini calls made so far, used to pace the first article of each batch. */
  callsMade: number;
  /** Wall-clock instant the run must stop by (`MAX_ANALYSIS_RUN_MS`). */
  deadline: number;
};

/** Default run: keep pulling batches until no pending article remains. */
async function drainPendingArticles(
  state: RunState,
  batchSize: number,
  limit: number | null
): Promise<void> {
  for (;;) {
    if (state.stoppedReason !== null) {
      return;
    }

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
    // Stop once a batch brings nothing new instead of looping. These articles
    // were already counted as failed, so they are not counted again as skipped.
    if (fresh.length === 0) {
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
  const skipped = articleIds.length - pending.length;
  state.skipped += skipped;
  state.pending += skipped;

  for (let index = 0; index < pending.length; index += batchSize) {
    if (state.stoppedReason !== null) {
      return;
    }

    await processBatch(state, pending.slice(index, index + batchSize));
  }
}

/**
 * Analyze one batch sequentially. Concurrency would risk Gemini rate limits and
 * make the log stream unreadable; this is a background job, not a request path.
 */
async function processBatch(state: RunState, batch: PendingAnalysisArticle[]): Promise<void> {
  state.batchesRun += 1;

  const batchNumber = state.batchesRun;
  const embedOnlyCount = batch.filter((article) => article.mode === "embed_only").length;
  analysisLog.batchStarted(batchNumber, batch.length, embedOnlyCount);

  let analyzed = 0;
  let embedded = 0;
  let failed = 0;

  for (const article of batch) {
    // A rate limit means no further call can succeed, and every extra attempt
    // extends the lockout. Unattempted articles stay pending, uncounted.
    if (state.stoppedReason !== null) {
      break;
    }

    if (state.callsMade > 0) {
      if (Date.now() + ANALYSIS_REQUEST_DELAY_MS >= state.deadline) {
        state.stoppedReason = "time_budget";
        analysisLog.timeBudgetReached(MAX_ANALYSIS_RUN_MS);
        break;
      }

      await delay(ANALYSIS_REQUEST_DELAY_MS);
    }

    state.callsMade += 1;
    state.pending += 1;
    state.processedIds.add(article.id);

    // One article must never abort the run.
    const outcome =
      article.mode === "embed_only"
        ? await embedOne(state, article)
        : await analyzeOne(state, article);

    if (outcome === "analyzed") {
      analyzed += 1;
    } else if (outcome === "embedded") {
      embedded += 1;
    } else {
      failed += 1;
    }
  }

  state.analyzed += analyzed;
  state.embedded += embedded;
  state.failed += failed;

  analysisLog.batchFinished(batchNumber, analyzed, embedded, failed);
}

type ItemOutcome = "analyzed" | "embedded" | "failed";

/** Full path: analyze, save, embed, then mark analyzed. */
async function analyzeOne(
  state: RunState,
  article: PendingAnalysisArticle
): Promise<ItemOutcome> {
  analysisLog.articleStarted(article.id, article.title);

  try {
    const result = await analyzeArticle({
      id: article.id,
      title: article.title,
      published_at: article.published_at,
      raw_text: article.raw_text,
    });

    if (!result.ok) {
      if (result.reason === "rate_limited") {
        stopForRateLimit(state, ANALYSIS_MODEL_ID);
      }

      recordFailure(state, article, result.reason, result.message);
      return "failed";
    }

    const analysis = await insertArticleAnalysis(result.analysis);

    analysisLog.articleAnalyzed(
      article.id,
      result.analysis.bias_label,
      result.analysis.confidence
    );

    // The analysis row stays saved even if embedding fails, so the paid
    // analysis call is never wasted; `analyzed_at` stays null and the next run
    // finishes the job through the `embed_only` path.
    const saved = await saveEmbedding(state, article, analysis.id, result.analysis.summary);

    if (!saved) {
      return "failed";
    }

    // Order matters (section 19 requirement 6, section 20): `analyzed_at` is
    // set only after both the analysis row and its embedding are committed.
    await markArticleAnalyzed(article.id);

    state.articles.push({
      articleId: article.id,
      title: article.title,
      status: "analyzed",
      reason: null,
    });

    return "analyzed";
  } catch (error) {
    recordFailure(state, article, "save_error", toMessage(error));
    return "failed";
  }
}

/** Backfill path (section 20): embed an analysis that already exists. */
async function embedOne(
  state: RunState,
  article: PendingAnalysisArticle
): Promise<ItemOutcome> {
  analysisLog.articleEmbedStarted(article.id, article.title);

  if (article.analysisId === null) {
    recordFailure(state, article, "embedding_error", "Missing analysis row id.");
    return "failed";
  }

  try {
    const saved = await saveEmbedding(
      state,
      article,
      article.analysisId,
      article.summary ?? ""
    );

    if (!saved) {
      return "failed";
    }

    await markArticleAnalyzed(article.id);

    state.articles.push({
      articleId: article.id,
      title: article.title,
      status: "embedded",
      reason: null,
    });

    return "embedded";
  } catch (error) {
    recordFailure(state, article, "save_error", toMessage(error));
    return "failed";
  }
}

/** Shared by both paths. Returns false after recording an `embedding_error`. */
async function saveEmbedding(
  state: RunState,
  article: PendingAnalysisArticle,
  analysisId: string,
  summary: string
): Promise<boolean> {
  const result = await embedArticle({
    title: article.title,
    summary,
    raw_text: article.raw_text,
  });

  if (!result.ok) {
    if (result.rateLimited) {
      stopForRateLimit(state, EMBEDDING_MODEL_ID);
      recordFailure(state, article, "rate_limited", result.message);
      return false;
    }

    recordFailure(state, article, "embedding_error", result.message);
    return false;
  }

  await updateAnalysisEmbedding(analysisId, result.embedding);
  analysisLog.articleEmbedded(article.id, result.embedding.length);

  return true;
}

/** First 429 of a run ends it; nothing after it could succeed anyway. */
function stopForRateLimit(state: RunState, model: string): void {
  if (state.stoppedReason !== null) {
    return;
  }

  state.stoppedReason = "rate_limited";
  analysisLog.rateLimited(model);
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
  return state.analyzed + state.embedded + state.failed;
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
