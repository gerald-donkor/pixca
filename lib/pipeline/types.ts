// Typed pipeline results shared by the scrape pipeline, the run logger, and
// the API routes. Kept free of server-only imports so route handlers and
// future scheduler code can both use them.

import type { RejectionReason } from "@/lib/scraping/validate";

export type ScrapeRunStatus = "completed" | "failed";

/** Counts grouped by rejection reason, e.g. `{ missing_image: 4 }`. */
export type RejectionReasonCounts = Partial<Record<RejectionReason | "candidate_filtered", number>>;

export type SourceRunResult = {
  sourceId: string;
  sourceName: string;
  listingUrl: string;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  /** Populated when the source itself failed (homepage fetch, parse, etc.). */
  error: string | null;
};

/** The section 9 **run logging** summary object. */
export type ScrapeRunSummary = {
  status: ScrapeRunStatus;
  sourcesChecked: number;
  candidatesFound: number;
  candidatesRejected: number;
  duplicatesSkipped: number;
  detailPagesScraped: number;
  articlesInserted: number;
  articlesRejected: number;
  articlesFailed: number;
  durationMs: number;
  rejectionReasons: RejectionReasonCounts;
  sources: SourceRunResult[];
};

/** Supplies homepage HTML — a live Oxylabs fetch now, Oxylabs job results later. */
export type HomepageHtmlFetcher = (listingUrl: string) => Promise<string>;

export type AnalysisRunStatus = "completed" | "failed";

/** Counts grouped by failure reason, e.g. `{ invalid_output: 2 }`. */
export type AnalysisFailureCounts = Record<string, number>;

export type AnalysisItemResult = {
  articleId: string;
  title: string;
  /** `embedded` means an existing analysis was backfilled with an embedding. */
  status: "analyzed" | "embedded" | "failed";
  /** Populated when the article failed; null otherwise. */
  reason: string | null;
};

/**
 * Why a run ended before all pending articles were attempted. `null` means it
 * ran to completion — nothing was left to do.
 */
export type AnalysisStoppedReason = "rate_limited" | "time_budget" | null;

/** The section 19 analysis run summary object. */
export type AnalysisRunSummary = {
  status: AnalysisRunStatus;
  model: string;
  embeddingModel: string;
  articlesPending: number;
  articlesAnalyzed: number;
  /** Articles that got an embedding this run, including backfilled ones. */
  articlesEmbedded: number;
  articlesSkipped: number;
  articlesFailed: number;
  batchesRun: number;
  durationMs: number;
  failureReasons: AnalysisFailureCounts;
  articles: AnalysisItemResult[];
  /** Set when the run stopped early; articles it never attempted stay pending. */
  stoppedReason: AnalysisStoppedReason;
  /** Populated when the run itself aborted, e.g. the pending query failed. */
  error: string | null;
};

// --- Oxylabs Scheduler (section 18) -----------------------------------------

export type SchedulerRunStatus = "completed" | "failed";

export type ScheduleSyncSourceResult = {
  sourceId: string;
  sourceName: string;
  listingUrl: string;
  /** Exact digit string; null when creation failed. */
  oxylabsScheduleId: string | null;
  status: "created" | "existing" | "failed";
  error: string | null;
};

/** Result of `POST /api/oxylabs/schedules`. */
export type ScheduleSyncSummary = {
  status: SchedulerRunStatus;
  activeSources: number;
  schedulesCreated: number;
  schedulesExisting: number;
  schedulesFailed: number;
  /** Upstream schedules deactivated because no DB row references them. */
  orphansDeactivated: number;
  orphanFailures: string[];
  durationMs: number;
  sources: ScheduleSyncSourceResult[];
};

export type ScheduledJobResult = {
  sourceName: string;
  oxylabsScheduleId: string;
  oxylabsJobId: string;
  status: "processed" | "stale_skipped" | "already_seen" | "fetch_failed";
  error: string | null;
};

/** Result of `POST /api/oxylabs/scheduled-results/process`. */
export type ScheduledProcessSummary = {
  status: SchedulerRunStatus;
  schedulesChecked: number;
  doneJobsFound: number;
  jobsSkippedAlreadySeen: number;
  jobsStaleSkipped: number;
  jobsProcessed: number;
  jobFetchFailures: number;
  durationMs: number;
  jobs: ScheduledJobResult[];
  /** Absent when no source had fresh HTML, so the pipeline never ran. */
  scrape: ScrapeRunSummary | null;
  /** Populated when the run itself aborted before processing anything. */
  error: string | null;
};

/** Result of `GET /api/cron/pipeline` — step one then step two (section 18). */
export type CronPipelineSummary = {
  status: SchedulerRunStatus;
  durationMs: number;
  scrape: ScheduledProcessSummary | null;
  scrapeError: string | null;
  analysis: AnalysisRunSummary | null;
  analysisError: string | null;
};
