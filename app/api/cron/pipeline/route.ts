import type { NextRequest } from "next/server";
import { requireCronSecret } from "@/lib/api/cron-secret";
import { runAnalysisPipeline } from "@/lib/pipeline/analysis";
import { cronLog } from "@/lib/pipeline/scheduler-logger";
import { processScheduledResults } from "@/lib/pipeline/scheduler";
import type { CronPipelineSummary } from "@/lib/pipeline/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * The automatic hourly pipeline (AGENTS.md section 18). Registered in
 * `vercel.json` at `15 * * * *` — 15 minutes after the Oxylabs schedules run,
 * giving their jobs time to finish.
 *
 * `GET` is the one exception to the POST-for-actions rule (section 14): Vercel
 * Cron always sends GET. The route is internal only and protected by
 * `CRON_SECRET`, never `PIXCA_ADMIN_SECRET`.
 *
 * Step one turns completed job HTML into articles; step two analyzes pending
 * articles. Step two runs even when step one throws — there may be
 * pre-existing unanalyzed articles.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const unauthorized = requireCronSecret(request);

  if (unauthorized) {
    return unauthorized;
  }

  const startedAt = Date.now();

  cronLog.started();

  const summary: CronPipelineSummary = {
    status: "completed",
    durationMs: 0,
    scrape: null,
    scrapeError: null,
    analysis: null,
    analysisError: null,
  };

  cronLog.stepOneStarted();

  try {
    summary.scrape = await processScheduledResults();
  } catch (error) {
    summary.scrapeError = toSafeMessage(error);
    cronLog.stepOneFailed(summary.scrapeError);
  }

  cronLog.stepTwoStarted();

  try {
    summary.analysis = await runAnalysisPipeline({});
  } catch (error) {
    summary.analysisError = toSafeMessage(error);
    cronLog.stepTwoFailed(summary.analysisError);
  }

  summary.status =
    summary.scrapeError !== null && summary.analysisError !== null ? "failed" : "completed";
  summary.durationMs = Date.now() - startedAt;

  cronLog.completed(summary);

  return Response.json(summary);
}

function toSafeMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
