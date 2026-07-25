import "server-only";

// Oxylabs Scheduler orchestration (AGENTS.md section 18).
//
// `syncSchedules` creates one hourly Oxylabs schedule per active source and
// deactivates orphaned upstream schedules.
//
// `processScheduledResults` turns completed job HTML into articles by running
// the *same* scrape-to-insert pipeline as manual scraping (section 9) — the
// only difference is where the homepage HTML comes from. No validation,
// cleanup, dedupe, or logging logic is duplicated here.

import {
  DEFAULT_ARTICLES_PER_SOURCE,
  OXYLABS_SCHEDULE_CRON,
  OXYLABS_SCHEDULE_END_TIME,
  OXYLABS_SCHEDULE_GEO_LOCATION,
  OXYLABS_SCHEDULE_MAX_RUNS_LOOKBACK,
} from "@/lib/config/limits";
import { fetchPageHtml } from "@/lib/oxylabs/client";
import {
  createSchedule,
  fetchJobResultHtml,
  getScheduleRuns,
  listOxylabsScheduleIds,
  setScheduleActive,
  type ScheduleItem,
  type ScheduleJob,
} from "@/lib/oxylabs/scheduler";
import { toMessage } from "@/lib/pipeline/run-logger";
import { processLog, syncLog } from "@/lib/pipeline/scheduler-logger";
import { runScrapePipeline } from "@/lib/pipeline/scrape";
import type {
  ScheduledJobResult,
  ScheduledProcessSummary,
  ScheduleSyncSourceResult,
  ScheduleSyncSummary,
} from "@/lib/pipeline/types";
import { sourceNeedsRender } from "@/lib/scraping/render-policy";
import {
  deactivateSchedule,
  findScheduleRunsByJobIds,
  insertScheduleRun,
  listSchedules,
  markScheduleRunProcessed,
  upsertScheduleForSource,
} from "@/lib/supabase/queries/oxylabs";
import { getActiveSources } from "@/lib/supabase/queries/sources";
import type { OxylabsSchedule, Source } from "@/lib/supabase/types";

/**
 * Create one hourly Oxylabs schedule per active source, then deactivate any
 * upstream schedule this database no longer references. Idempotent: a source
 * that already has an active stored row is left untouched.
 */
export async function syncSchedules(): Promise<ScheduleSyncSummary> {
  const startedAt = Date.now();

  const activeSources = await getActiveSources();
  syncLog.started(activeSources.length);

  const storedSchedules = await listSchedules();
  const bySourceId = new Map(storedSchedules.map((row) => [row.source_id, row]));

  const results: ScheduleSyncSourceResult[] = [];

  for (const source of activeSources) {
    // One source failing must not abort the sync.
    results.push(await syncSource(source, bySourceId.get(source.id)));
  }

  const activeSourceIds = new Set(activeSources.map((source) => source.id));
  const staleRows = storedSchedules.filter(
    (row) => row.is_active && !activeSourceIds.has(row.source_id)
  );

  const orphans = await deactivateOrphans(staleRows);

  const summary: ScheduleSyncSummary = {
    status: results.some((result) => result.status === "failed") ? "failed" : "completed",
    activeSources: activeSources.length,
    schedulesCreated: results.filter((result) => result.status === "created").length,
    schedulesExisting: results.filter((result) => result.status === "existing").length,
    schedulesFailed: results.filter((result) => result.status === "failed").length,
    orphansDeactivated: orphans.deactivated,
    orphanFailures: orphans.failures,
    durationMs: Date.now() - startedAt,
    sources: results,
  };

  syncLog.completed(summary);

  return summary;
}

async function syncSource(
  source: Source,
  stored: OxylabsSchedule | undefined
): Promise<ScheduleSyncSourceResult> {
  const base = {
    sourceId: source.id,
    sourceName: source.name,
    listingUrl: source.listing_url,
  };

  if (stored && stored.is_active) {
    syncLog.scheduleExists(source.name, stored.oxylabs_schedule_id);
    return {
      ...base,
      oxylabsScheduleId: stored.oxylabs_schedule_id,
      status: "existing",
      error: null,
    };
  }

  const item = buildScheduleItem(source.listing_url);

  try {
    const created = await createSchedule([item], OXYLABS_SCHEDULE_CRON, OXYLABS_SCHEDULE_END_TIME);

    await upsertScheduleForSource({
      sourceId: source.id,
      oxylabsScheduleId: created.scheduleId,
      scheduleConfig: {
        cron: OXYLABS_SCHEDULE_CRON,
        endTime: OXYLABS_SCHEDULE_END_TIME,
        item,
      },
      isActive: true,
    });

    syncLog.scheduleCreated(source.name, created.scheduleId, created.nextRunAt);

    return { ...base, oxylabsScheduleId: created.scheduleId, status: "created", error: null };
  } catch (error) {
    const message = toMessage(error);
    syncLog.scheduleFailed(source.name, message);
    return { ...base, oxylabsScheduleId: null, status: "failed", error: message };
  }
}

/** Homepage-only job payload — the same shape the Realtime client sends. */
function buildScheduleItem(listingUrl: string): ScheduleItem {
  return {
    source: "universal",
    url: listingUrl,
    user_agent_type: "desktop_chrome",
    geo_location: OXYLABS_SCHEDULE_GEO_LOCATION,
  };
}

type OrphanResult = { deactivated: number; failures: string[] };

/**
 * Schedules left running upstream after DB rows were deleted and re-created
 * keep billing hourly forever. Deactivate anything Oxylabs still lists that no
 * active stored row references, plus rows whose source is no longer active.
 */
async function deactivateOrphans(staleRows: OxylabsSchedule[]): Promise<OrphanResult> {
  const failures: string[] = [];
  let deactivated = 0;

  // Re-read: `syncSource` may have created rows since `storedSchedules` was loaded.
  const currentRows = await listSchedules();
  const staleIds = new Set(staleRows.map((row) => row.oxylabs_schedule_id));
  const keepIds = new Set(
    currentRows
      .filter((row) => !staleIds.has(row.oxylabs_schedule_id))
      .map((row) => row.oxylabs_schedule_id)
  );

  let upstreamIds: string[];

  try {
    upstreamIds = await listOxylabsScheduleIds();
  } catch (error) {
    failures.push(`failed to list Oxylabs schedules: ${toMessage(error)}`);
    return { deactivated, failures };
  }

  const orphanIds = upstreamIds.filter((id) => !keepIds.has(id));
  syncLog.orphansFound(orphanIds.length);

  for (const scheduleId of orphanIds) {
    try {
      await setScheduleActive(scheduleId, false);

      // A stale row still exists locally; mark it inactive so it stops being
      // processed. Rows with no DB presence at all need no update.
      if (staleIds.has(scheduleId)) {
        await deactivateSchedule(scheduleId);
      }

      deactivated += 1;
      syncLog.orphanDeactivated(scheduleId);
    } catch (error) {
      const message = toMessage(error);
      failures.push(`${scheduleId}: ${message}`);
      syncLog.orphanFailed(scheduleId, message);
    }
  }

  return { deactivated, failures };
}

export type ProcessScheduledResultsOptions = {
  /** Valid articles inserted per source. Defaults to the manual-scrape default. */
  limitPerSource?: number;
};

/**
 * Turn completed Oxylabs job HTML into articles. Only the newest unseen done
 * job per schedule is processed — older runs of the same homepage are stale and
 * would only re-scrape detail pages the URL existence check already covers.
 */
export async function processScheduledResults(
  options: ProcessScheduledResultsOptions = {}
): Promise<ScheduledProcessSummary> {
  const startedAt = Date.now();
  const limitPerSource = options.limitPerSource ?? DEFAULT_ARTICLES_PER_SOURCE;

  const jobs: ScheduledJobResult[] = [];

  // Joined data is fetched separately and matched in JS — supabase-js cannot
  // filter on a joined column (AGENTS.md section 21).
  const [schedules, sources] = await Promise.all([listSchedules(), getActiveSources()]);
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  const activeSchedules = schedules.filter(
    (schedule) => schedule.is_active && sourceById.has(schedule.source_id)
  );

  processLog.started(activeSchedules.length, limitPerSource);

  const selections: JobSelection[] = [];

  for (const schedule of activeSchedules) {
    const source = sourceById.get(schedule.source_id);

    if (!source) {
      continue;
    }

    const selection = await selectJobForSchedule(schedule, source, jobs);

    if (selection) {
      selections.push(selection);
    }
  }

  const htmlByListingUrl = new Map<string, string>();
  const processedSources: Source[] = [];
  const processedRunRowIds: string[] = [];
  let jobFetchFailures = 0;

  for (const selection of selections) {
    const { source, job, runRowId } = selection;

    try {
      const html = await fetchJobResultHtml(job.id);
      processLog.jobHtmlFetched(source.name, job.id, html.length);

      htmlByListingUrl.set(source.listing_url, html);
      processedSources.push(source);
      processedRunRowIds.push(runRowId);
      jobs.push(toJobResult(source, selection.oxylabsScheduleId, job.id, "processed", null));
    } catch (error) {
      const message = toMessage(error);
      jobFetchFailures += 1;
      processLog.jobFetchFailed(source.name, job.id, message);
      jobs.push(toJobResult(source, selection.oxylabsScheduleId, job.id, "fetch_failed", message));

      // A job's HTML is only worth one attempt.
      await markProcessedSafely(runRowId);
    }
  }

  let scrape: ScheduledProcessSummary["scrape"] = null;

  if (processedSources.length > 0) {
    processLog.pipelineStarted(processedSources.length);

    scrape = await runScrapePipeline({
      sources: processedSources,
      limitPerSource,
      fetchHomepageHtml: async (listingUrl: string) => {
        const html = htmlByListingUrl.get(listingUrl);

        if (!html) {
          throw new Error(`No scheduled job HTML available for ${listingUrl}.`);
        }

        return html;
      },
      // Detail pages are always fetched live; only homepage HTML is scheduled.
      fetchDetailHtml: (url: string) => fetchPageHtml(url, { render: sourceNeedsRender(url) }),
    });

    for (const runRowId of processedRunRowIds) {
      await markProcessedSafely(runRowId);
    }
  } else {
    processLog.nothingToProcess();
  }

  const summary: ScheduledProcessSummary = {
    status: "completed",
    schedulesChecked: activeSchedules.length,
    doneJobsFound: jobs.length,
    jobsSkippedAlreadySeen: jobs.filter((job) => job.status === "already_seen").length,
    jobsStaleSkipped: jobs.filter((job) => job.status === "stale_skipped").length,
    jobsProcessed: jobs.filter((job) => job.status === "processed").length,
    jobFetchFailures,
    durationMs: Date.now() - startedAt,
    jobs,
    scrape,
    error: null,
  };

  processLog.completed(summary);

  return summary;
}

type JobSelection = {
  source: Source;
  oxylabsScheduleId: string;
  job: ScheduleJob;
  /** `oxylabs_schedule_runs.id` of the row recorded for this job. */
  runRowId: string;
};

/**
 * Record every newly seen done job for a schedule and return the newest one as
 * the single job to process. Older unseen jobs are marked processed straight
 * away — their homepage HTML is stale.
 */
async function selectJobForSchedule(
  schedule: OxylabsSchedule,
  source: Source,
  jobs: ScheduledJobResult[]
): Promise<JobSelection | null> {
  let doneJobs: ScheduleJob[];

  try {
    const runs = await getScheduleRuns(schedule.oxylabs_schedule_id);

    // Only `done` jobs have results; `pending` and `faulted` are never fetched.
    doneJobs = runs
      .flatMap((run) => run.jobs)
      .filter((job) => job.resultStatus === "done")
      .sort(byNewestFirst)
      .slice(0, OXYLABS_SCHEDULE_MAX_RUNS_LOOKBACK);
  } catch (error) {
    const message = toMessage(error);
    processLog.runsFetchFailed(source.name, message);
    return null;
  }

  processLog.runsFetched(source.name, doneJobs.length);

  if (doneJobs.length === 0) {
    return null;
  }

  const alreadySeen = await findScheduleRunsByJobIds(doneJobs.map((job) => job.id));
  let selection: JobSelection | null = null;

  for (const job of doneJobs) {
    if (alreadySeen.has(job.id)) {
      processLog.jobAlreadySeen(source.name, job.id);
      jobs.push(toJobResult(source, schedule.oxylabs_schedule_id, job.id, "already_seen", null));
      continue;
    }

    let runRowId: string;

    try {
      const row = await insertScheduleRun({
        scheduleId: schedule.id,
        oxylabsJobId: job.id,
        resultStatus: job.resultStatus,
      });
      runRowId = row.id;
    } catch (error) {
      // A concurrent run recorded the same job first — treat it as seen.
      processLog.jobAlreadySeen(source.name, job.id);
      jobs.push(
        toJobResult(source, schedule.oxylabs_schedule_id, job.id, "already_seen", toMessage(error))
      );
      continue;
    }

    if (!selection) {
      processLog.jobSelected(source.name, job.id);
      selection = {
        source,
        oxylabsScheduleId: schedule.oxylabs_schedule_id,
        job,
        runRowId,
      };
      continue;
    }

    processLog.jobStaleSkipped(source.name, job.id);
    jobs.push(toJobResult(source, schedule.oxylabs_schedule_id, job.id, "stale_skipped", null));
    await markProcessedSafely(runRowId);
  }

  return selection;
}

function byNewestFirst(a: ScheduleJob, b: ScheduleJob): number {
  const timeOf = (job: ScheduleJob): number => {
    const raw = job.resultCreatedAt ?? job.createdAt;
    const parsed = raw ? Date.parse(raw) : Number.NaN;
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  return timeOf(b) - timeOf(a);
}

function toJobResult(
  source: Source,
  oxylabsScheduleId: string,
  oxylabsJobId: string,
  status: ScheduledJobResult["status"],
  error: string | null
): ScheduledJobResult {
  return { sourceName: source.name, oxylabsScheduleId, oxylabsJobId, status, error };
}

/** Bookkeeping must never break a run that already did its real work. */
async function markProcessedSafely(runRowId: string): Promise<void> {
  try {
    await markScheduleRunProcessed(runRowId);
  } catch (error) {
    processLog.failed(`failed to mark run ${runRowId} processed: ${toMessage(error)}`);
  }
}
