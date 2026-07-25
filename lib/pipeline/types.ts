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
  status: "analyzed" | "failed";
  /** Populated when the article failed; null when it was analyzed. */
  reason: string | null;
};

/** The section 19 analysis run summary object. */
export type AnalysisRunSummary = {
  status: AnalysisRunStatus;
  model: string;
  articlesPending: number;
  articlesAnalyzed: number;
  articlesSkipped: number;
  articlesFailed: number;
  batchesRun: number;
  durationMs: number;
  failureReasons: AnalysisFailureCounts;
  articles: AnalysisItemResult[];
  /** Populated when the run itself aborted, e.g. the pending query failed. */
  error: string | null;
};
