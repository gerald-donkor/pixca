import "server-only";

// Console logging for the Oxylabs Scheduler sync and scheduled-result
// processing runs. Kept separate from `run-logger.ts` so `runLog` stays
// scrape-specific and its message shapes are not diluted.

import type {
  CronPipelineSummary,
  ScheduledProcessSummary,
  ScheduleSyncSummary,
} from "@/lib/pipeline/types";

const SYNC_PREFIX = "[scheduler:sync]";
const PROCESS_PREFIX = "[scheduler:process]";
const CRON_PREFIX = "[cron]";

export const syncLog = {
  started(activeSources: number): void {
    console.info(`${SYNC_PREFIX} sync started — ${activeSources} active source(s)`);
  },

  scheduleExists(sourceName: string, scheduleId: string): void {
    console.info(`${SYNC_PREFIX} [${sourceName}] schedule already active — ${scheduleId}`);
  },

  scheduleCreated(sourceName: string, scheduleId: string, nextRunAt: string | null): void {
    console.info(
      `${SYNC_PREFIX} [${sourceName}] schedule created — ${scheduleId}` +
        (nextRunAt ? ` (next run ${nextRunAt})` : "")
    );
  },

  scheduleFailed(sourceName: string, message: string): void {
    console.error(`${SYNC_PREFIX} [${sourceName}] schedule creation failed: ${message}`);
  },

  orphansFound(count: number): void {
    console.info(`${SYNC_PREFIX} orphaned Oxylabs schedules to deactivate: ${count}`);
  },

  orphanDeactivated(scheduleId: string): void {
    console.info(`${SYNC_PREFIX} deactivated orphan schedule ${scheduleId}`);
  },

  orphanFailed(scheduleId: string, message: string): void {
    console.warn(`${SYNC_PREFIX} failed to deactivate orphan ${scheduleId}: ${message}`);
  },

  completed(summary: ScheduleSyncSummary): void {
    console.info(`${SYNC_PREFIX} sync ${summary.status} in ${summary.durationMs}ms`);
    console.info(`${SYNC_PREFIX} summary`, summary);
  },
};

export const processLog = {
  started(scheduleCount: number, limitPerSource: number): void {
    console.info(
      `${PROCESS_PREFIX} processing started — ${scheduleCount} active schedule(s), ` +
        `up to ${limitPerSource} article(s) per source`
    );
  },

  runsFetched(sourceName: string, doneJobs: number): void {
    console.info(`${PROCESS_PREFIX} [${sourceName}] done job(s) found: ${doneJobs}`);
  },

  runsFetchFailed(sourceName: string, message: string): void {
    console.error(`${PROCESS_PREFIX} [${sourceName}] failed to list runs: ${message}`);
  },

  jobAlreadySeen(sourceName: string, jobId: string): void {
    console.info(`${PROCESS_PREFIX} [${sourceName}] job already processed — ${jobId}`);
  },

  jobStaleSkipped(sourceName: string, jobId: string): void {
    console.info(
      `${PROCESS_PREFIX} [${sourceName}] stale job recorded and skipped — ${jobId}; ` +
        `its homepage HTML is older than the job being processed`
    );
  },

  jobSelected(sourceName: string, jobId: string): void {
    console.info(`${PROCESS_PREFIX} [${sourceName}] processing newest done job — ${jobId}`);
  },

  jobHtmlFetched(sourceName: string, jobId: string, bytes: number): void {
    console.info(
      `${PROCESS_PREFIX} [${sourceName}] job ${jobId} result fetched (${bytes} bytes)`
    );
  },

  jobFetchFailed(sourceName: string, jobId: string, message: string): void {
    console.error(`${PROCESS_PREFIX} [${sourceName}] job ${jobId} result fetch failed: ${message}`);
  },

  nothingToProcess(): void {
    console.info(`${PROCESS_PREFIX} no fresh job results to process — skipping the scrape pipeline`);
  },

  pipelineStarted(sourceCount: number): void {
    console.info(
      `${PROCESS_PREFIX} handing ${sourceCount} source(s) to the scrape-to-insert pipeline`
    );
  },

  completed(summary: ScheduledProcessSummary): void {
    console.info(`${PROCESS_PREFIX} processing ${summary.status} in ${summary.durationMs}ms`);
    console.info(`${PROCESS_PREFIX} summary`, summary);
  },

  failed(message: string): void {
    console.error(`${PROCESS_PREFIX} processing failed: ${message}`);
  },
};

export const cronLog = {
  started(): void {
    console.info(`${CRON_PREFIX} hourly pipeline started`);
  },

  stepOneStarted(): void {
    console.info(`${CRON_PREFIX} step 1/2 — processing Oxylabs scheduled results`);
  },

  stepOneFailed(message: string): void {
    console.error(
      `${CRON_PREFIX} step 1/2 failed: ${message} — continuing to analysis, ` +
        `there may be pre-existing unanalyzed articles`
    );
  },

  stepTwoStarted(): void {
    console.info(`${CRON_PREFIX} step 2/2 — running AI analysis on pending articles`);
  },

  stepTwoFailed(message: string): void {
    console.error(`${CRON_PREFIX} step 2/2 failed: ${message}`);
  },

  completed(summary: CronPipelineSummary): void {
    console.info(`${CRON_PREFIX} hourly pipeline ${summary.status} in ${summary.durationMs}ms`);
    console.info(`${CRON_PREFIX} summary`, summary);
  },
};
