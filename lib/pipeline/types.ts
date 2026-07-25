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
