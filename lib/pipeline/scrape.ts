import "server-only";

// The canonical scrape-to-insert pipeline (AGENTS.md section 9, steps 1-9).
//
// Homepage HTML arrives through the injected `fetchHomepageHtml` so the
// Oxylabs Scheduler (section 18) can reuse this module unchanged by supplying
// HTML from completed job results instead of a live fetch.

import {
  DETAIL_REQUEST_DELAY_MS,
  MAX_CONSECUTIVE_DETAIL_FAILURES,
  MAX_DETAIL_PAGES_PER_SOURCE,
} from "@/lib/config/limits";
import { persistRunSummary, runLog, toMessage } from "@/lib/pipeline/run-logger";
import type {
  HomepageHtmlFetcher,
  RejectionReasonCounts,
  ScrapeRunSummary,
  SourceRunResult,
} from "@/lib/pipeline/types";
import { parseArticlePage } from "@/lib/scraping/article-parser";
import { isArticleCandidate } from "@/lib/scraping/candidate-filter";
import { extractHomepageCandidates } from "@/lib/scraping/homepage-links";
import { validateParsedArticle } from "@/lib/scraping/validate";
import { findExistingOriginalUrls, insertArticle } from "@/lib/supabase/queries/articles";
import type { Source } from "@/lib/supabase/types";

export type RunScrapePipelineOptions = {
  sources: Source[];
  limitPerSource: number;
  /** Homepage HTML supplier — live Oxylabs fetch for manual scraping. */
  fetchHomepageHtml: HomepageHtmlFetcher;
  /** Detail-page HTML supplier. Always a live fetch, including for the scheduler. */
  fetchDetailHtml: HomepageHtmlFetcher;
};

export async function runScrapePipeline({
  sources,
  limitPerSource,
  fetchHomepageHtml,
  fetchDetailHtml,
}: RunScrapePipelineOptions): Promise<ScrapeRunSummary> {
  const startedAt = Date.now();

  runLog.started(sources.length, limitPerSource);
  runLog.selectedSources(sources.map((source) => source.name));

  const results: SourceRunResult[] = [];
  const rejectionReasons: RejectionReasonCounts = {};

  for (const source of sources) {
    // One source failing must not abort the run.
    const result = await processSource({
      source,
      limitPerSource,
      fetchHomepageHtml,
      fetchDetailHtml,
      rejectionReasons,
    });

    results.push(result);
  }

  const summary = buildSummary(results, rejectionReasons, Date.now() - startedAt);

  runLog.completed(summary);
  await persistRunSummary(summary);

  return summary;
}

type ProcessSourceOptions = {
  source: Source;
  limitPerSource: number;
  fetchHomepageHtml: HomepageHtmlFetcher;
  fetchDetailHtml: HomepageHtmlFetcher;
  rejectionReasons: RejectionReasonCounts;
};

async function processSource({
  source,
  limitPerSource,
  fetchHomepageHtml,
  fetchDetailHtml,
  rejectionReasons,
}: ProcessSourceOptions): Promise<SourceRunResult> {
  const result: SourceRunResult = {
    sourceId: source.id,
    sourceName: source.name,
    listingUrl: source.listing_url,
    candidatesFound: 0,
    candidatesRejected: 0,
    duplicatesSkipped: 0,
    detailPagesScraped: 0,
    articlesInserted: 0,
    articlesRejected: 0,
    articlesFailed: 0,
    error: null,
  };

  runLog.sourceStarted(source.name, source.listing_url);

  let homepageHtml: string;

  try {
    // Step 2 — homepage HTML only; never crawl into sublinks.
    homepageHtml = await fetchHomepageHtml(source.listing_url);
    runLog.homepageFetched(source.name, homepageHtml.length);
  } catch (error) {
    result.error = toMessage(error);
    runLog.sourceError(source.name, result.error);
    return result;
  }

  // Step 3 + 4 — visible story-card links, non-article reject list applied.
  const extraction = extractHomepageCandidates(homepageHtml, source.listing_url);

  // `candidatesFound` counts every story-card link found on the homepage before
  // any filtering, so that found - rejected equals what reaches dedupe.
  result.candidatesFound = extraction.candidates.length + extraction.rejected.length;
  result.candidatesRejected = extraction.rejected.length;

  runLog.candidatesFound(source.name, result.candidatesFound);
  runLog.candidatesRejected(
    source.name,
    extraction.rejected.length,
    extraction.rejected.slice(0, 3).map((entry) => `${entry.url} (${entry.reason})`)
  );

  // Step 6 (URL check) — apply the section 12 candidate filter before dedupe so
  // we never send obvious non-articles to the URL existence check.
  const articleCandidates: string[] = [];

  for (const candidate of extraction.candidates) {
    const decision = isArticleCandidate(candidate, source.parser_strategy);

    if (decision.keep) {
      articleCandidates.push(candidate);
    } else {
      result.candidatesRejected += 1;
      countReason(rejectionReasons, "candidate_filtered");
      runLog.articleRejected(source.name, candidate, decision.reason);
    }
  }

  // Step 5 — skip URLs already stored (URL existence check, chunks of <= 15).
  let existingUrls: Set<string>;

  try {
    existingUrls = await findExistingOriginalUrls(articleCandidates);
  } catch (error) {
    result.error = toMessage(error);
    runLog.sourceError(source.name, result.error);
    return result;
  }

  const freshCandidates = articleCandidates.filter((url) => {
    if (existingUrls.has(url)) {
      result.duplicatesSkipped += 1;
      return false;
    }
    return true;
  });

  runLog.duplicatesSkipped(source.name, result.duplicatesSkipped);

  const detailBudget = Math.min(freshCandidates.length, MAX_DETAIL_PAGES_PER_SOURCE);
  let consecutiveFailures = 0;

  for (let index = 0; index < detailBudget; index += 1) {
    if (result.articlesInserted >= limitPerSource) {
      break;
    }

    // Circuit breaker: stop paying for detail fetches once a source is clearly
    // failing systematically rather than hitting a few bad pages.
    if (consecutiveFailures >= MAX_CONSECUTIVE_DETAIL_FAILURES) {
      runLog.sourceAborted(source.name, consecutiveFailures);
      break;
    }

    const url = freshCandidates[index];

    if (index > 0) {
      await delay(DETAIL_REQUEST_DELAY_MS);
    }

    try {
      // Step 6 — scrape the article detail page.
      const html = await fetchDetailHtml(url);
      result.detailPagesScraped += 1;
      runLog.detailScraped(source.name, url);

      // Step 7 — validate and clean against the article content gate.
      const parsed = parseArticlePage(html, url);
      const validation = validateParsedArticle(parsed, url);

      if (!validation.ok) {
        result.articlesRejected += 1;
        consecutiveFailures += 1;
        countReason(rejectionReasons, validation.reason);
        runLog.articleRejected(source.name, url, validation.reason);
        continue;
      }

      // Step 8 — append-only insert. Nothing is ever deleted or reset.
      const inserted = await insertArticle({
        source_id: source.id,
        original_url: url,
        canonical_url: validation.article.canonicalUrl,
        title: validation.article.title,
        image_url: validation.article.imageUrl,
        published_at: validation.article.publishedAt,
        raw_text: validation.article.rawText,
      });

      if (!inserted.ok) {
        result.duplicatesSkipped += 1;
        runLog.articleRejected(source.name, url, "duplicate");
        continue;
      }

      result.articlesInserted += 1;
      consecutiveFailures = 0;
      runLog.articleInserted(source.name, validation.article.title);
    } catch (error) {
      result.articlesFailed += 1;
      consecutiveFailures += 1;
      runLog.articleFailed(source.name, url, toMessage(error));
    }
  }

  runLog.sourceFinished(source.name, result.articlesInserted, result.detailPagesScraped);

  return result;
}

function buildSummary(
  results: SourceRunResult[],
  rejectionReasons: RejectionReasonCounts,
  durationMs: number
): ScrapeRunSummary {
  const total = (pick: (result: SourceRunResult) => number): number =>
    results.reduce((sum, result) => sum + pick(result), 0);

  const allSourcesFailed = results.length > 0 && results.every((result) => result.error !== null);

  return {
    status: allSourcesFailed ? "failed" : "completed",
    sourcesChecked: results.length,
    candidatesFound: total((result) => result.candidatesFound),
    candidatesRejected: total((result) => result.candidatesRejected),
    duplicatesSkipped: total((result) => result.duplicatesSkipped),
    detailPagesScraped: total((result) => result.detailPagesScraped),
    articlesInserted: total((result) => result.articlesInserted),
    articlesRejected: total((result) => result.articlesRejected),
    articlesFailed: total((result) => result.articlesFailed),
    durationMs,
    rejectionReasons,
    sources: results,
  };
}

function countReason(counts: RejectionReasonCounts, reason: keyof RejectionReasonCounts): void {
  counts[reason] = (counts[reason] ?? 0) + 1;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
