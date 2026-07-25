import "server-only";

// Section 19 logging: neat server-side console progress during an analysis run
// plus one `logs` row holding the final summary object. Same shape as the
// scrape run logger, under the `[analyze]` prefix.

import type { AnalysisRunSummary } from "@/lib/pipeline/types";
import { insertLog } from "@/lib/supabase/queries/logs";
import { toMessage } from "@/lib/pipeline/run-logger";

const PREFIX = "[analyze]";

export const analysisLog = {
  started(
    model: string,
    embeddingModel: string,
    batchSize: number,
    limit: number | null
  ): void {
    console.info(
      `${PREFIX} analysis started — model ${model}, embeddings ${embeddingModel}, ` +
        `batch size ${batchSize}, limit ${limit === null ? "none (all pending)" : limit}`
    );
  },

  batchStarted(batchNumber: number, count: number, embedOnly: number): void {
    console.info(
      `${PREFIX} batch ${batchNumber} — ${count} pending article(s)` +
        (embedOnly > 0 ? ` (${embedOnly} embedding backfill)` : "")
    );
  },

  articleStarted(articleId: string, title: string): void {
    console.info(`${PREFIX} analyzing ${articleId} — "${truncate(title, 90)}"`);
  },

  articleEmbedStarted(articleId: string, title: string): void {
    console.info(
      `${PREFIX} embedding only (analysis already saved) ${articleId} — "${truncate(title, 90)}"`
    );
  },

  articleEmbedded(articleId: string, dimensions: number): void {
    console.info(`${PREFIX} embedded ${articleId} — ${dimensions} dimensions`);
  },

  articleAnalyzed(articleId: string, label: string, confidence: number): void {
    console.info(
      `${PREFIX} analyzed ${articleId} — framing ${label}, confidence ${confidence}`
    );
  },

  articleFailed(articleId: string, reason: string, message: string): void {
    console.warn(`${PREFIX} failed ${articleId} (${reason}): ${message}`);
  },

  batchFinished(
    batchNumber: number,
    analyzed: number,
    embedded: number,
    failed: number
  ): void {
    console.info(
      `${PREFIX} batch ${batchNumber} done — ${analyzed} analyzed, ` +
        `${embedded} embedded, ${failed} failed`
    );
  },

  rateLimited(model: string): void {
    console.warn(
      `${PREFIX} rate limited by ${model} — stopping the run early. ` +
        "Remaining articles stay pending and are picked up by the next run."
    );
  },

  timeBudgetReached(budgetMs: number): void {
    console.warn(
      `${PREFIX} stopping — ${budgetMs}ms run budget reached; remaining articles stay pending`
    );
  },

  noProgress(pending: number): void {
    console.warn(
      `${PREFIX} stopping — ${pending} pending article(s) returned again with no new analysis saved`
    );
  },

  runError(message: string): void {
    console.error(`${PREFIX} analysis run error: ${message}`);
  },

  completed(summary: AnalysisRunSummary): void {
    console.info(
      `${PREFIX} analysis ${summary.status} in ${summary.durationMs}ms — ` +
        `${summary.articlesAnalyzed} analyzed, ${summary.articlesEmbedded} embedded, ` +
        `${summary.articlesSkipped} skipped, ${summary.articlesFailed} failed` +
        (summary.stoppedReason === null ? "" : ` (stopped early: ${summary.stoppedReason})`)
    );
    console.info(`${PREFIX} summary`, summary);
  },
};

/** Logging must never break a run, so failures here go to the console only. */
export async function persistAnalysisRunSummary(summary: AnalysisRunSummary): Promise<void> {
  try {
    await insertLog({
      level: summary.status === "completed" ? "info" : "error",
      message: `analysis run ${summary.status}`,
      context: summary as unknown as Record<string, unknown>,
    });
  } catch (error) {
    console.error(`${PREFIX} failed to persist run summary:`, toMessage(error));
  }
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
