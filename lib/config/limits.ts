// Centralized limits and timeouts for the scraping pipeline (AGENTS.md
// section 21: "centralized limits"). Nothing here is source-specific.

/** Valid articles inserted per source when the caller gives no limit (section 16). */
export const DEFAULT_ARTICLES_PER_SOURCE = 5;

/** Upper bound the API will accept for `limitPerSource`. */
export const MAX_ARTICLES_PER_SOURCE = 25;

/**
 * How many candidate detail pages we are willing to scrape per source before
 * giving up on reaching `limitPerSource`. Keeps Oxylabs usage bounded when a
 * homepage yields mostly rejects.
 */
export const MAX_DETAIL_PAGES_PER_SOURCE = 20;

/**
 * Consecutive detail-page failures that abort the rest of a source. Protects
 * against burning the full detail budget (and Oxylabs credits) when a source's
 * parser or markup has changed — the failure mode where 20 pages were scraped
 * to insert nothing. Reset by any successful insert.
 */
export const MAX_CONSECUTIVE_DETAIL_FAILURES = 6;

/** Cap on links pulled out of a single homepage before filtering. */
export const MAX_CANDIDATES_PER_HOMEPAGE = 120;

/** Oxylabs Realtime client timeout. Rendered requests need ~180s (oxylabs skill). */
export const OXYLABS_REQUEST_TIMEOUT_MS = 180_000;

/** Retries after the first attempt for retryable Oxylabs failures (429/5xx/timeout). */
export const OXYLABS_MAX_RETRIES = 1;

/** Backoff before the retry attempt. */
export const OXYLABS_RETRY_DELAY_MS = 3_000;

/** Politeness delay between sequential detail-page scrapes. */
export const DETAIL_REQUEST_DELAY_MS = 750;

/** Article content gate — body passes on paragraph count OR character count (section 13). */
export const MIN_MEANINGFUL_PARAGRAPHS = 3;
export const MIN_MEANINGFUL_CHARACTERS = 900;

/** A text block shorter than this is not counted as a meaningful paragraph. */
export const MIN_PARAGRAPH_CHARACTERS = 60;

/** Titles shorter than this are treated as generic/section titles. */
export const MIN_TITLE_CHARACTERS = 15;

/** Hard cap on stored `raw_text` so one runaway page cannot bloat a row. */
export const MAX_RAW_TEXT_CHARACTERS = 60_000;

/** Articles analyzed per batch when `ANALYSIS_BATCH_SIZE` is unset (section 19). */
export const DEFAULT_ANALYSIS_BATCH_SIZE = 5;

/** Upper bound the API will accept for `batchSize`. */
export const MAX_ANALYSIS_BATCH_SIZE = 25;

/**
 * Article text sent to the model. Generous enough that a normal article goes
 * whole; bounds token cost on outliers.
 */
export const MAX_ANALYSIS_INPUT_CHARACTERS = 24_000;

/**
 * First attempt plus one retry on invalid model output (section 19). This
 * applies *only* to output-shape failures (`invalid_output`,
 * `percentages_unusable`) — asking the model again can plausibly fix those.
 * Transport errors and rate limits are never retried; retrying them just burns
 * more quota.
 */
export const ANALYSIS_MAX_ATTEMPTS = 2;

/**
 * Delay between sequential model calls. A conservative carry-over from the
 * previous analysis model's measured free-tier ceiling of 5 requests per minute
 * (60 ÷ 5 = 12s, plus headroom), kept pending confirmation of the real
 * free-tier RPM for the current `ANALYSIS_MODEL_ID` in AI Studio — Google no
 * longer publishes per-model free-tier limits in the public docs. Guessing lower risks
 * re-triggering the rate-limit failures this delay was added to fix.
 * Embeddings ride along inside the same per-article slot and need no separate
 * delay at their 100 RPM budget. Runs are slow by design; the hourly cron is
 * the intended consumer.
 */
export const ANALYSIS_REQUEST_DELAY_MS = 13_000;

/**
 * Wall-clock budget for one analysis run. Below the analyze route's
 * `maxDuration = 300` so a long backfill returns a real summary instead of
 * being killed mid-flight; whatever is left stays pending for the next run.
 */
export const MAX_ANALYSIS_RUN_MS = 240_000;

/** Analyzed articles listed on the homepage — matches the 12-card grid. */
export const HOMEPAGE_ARTICLES_LIMIT = 12;

/**
 * Article text sent to the embedding model. Smaller than the analysis budget:
 * embeddings capture topic, and the lead of an article carries it.
 */
export const MAX_EMBEDDING_INPUT_CHARACTERS = 8_000;

/** Related articles shown on the details page — section 20 says up to 5. */
export const RELATED_ARTICLES_LIMIT = 5;

/**
 * Oxylabs Scheduler cron — top of every hour (section 18). Vercel Cron then
 * fires at `15 * * * *` to give Oxylabs 15 minutes to finish its jobs.
 */
export const OXYLABS_SCHEDULE_CRON = "0 * * * *";

/**
 * The Scheduler API requires `end_time`. A fixed far-future constant (rather
 * than a computed date) keeps `schedule_config` byte-identical across sync
 * runs, so re-running sync never looks like a change.
 */
export const OXYLABS_SCHEDULE_END_TIME = "2099-12-31 23:59:59";

/** Geo location sent with scheduled homepage jobs — matches the Realtime client. */
export const OXYLABS_SCHEDULE_GEO_LOCATION = "United States";

/**
 * Newest done jobs inspected per schedule when processing results. Only the
 * newest unseen job is actually processed; the rest are recorded and marked
 * processed as stale, so this only bounds bookkeeping work.
 */
export const OXYLABS_SCHEDULE_MAX_RUNS_LOOKBACK = 20;

/** Stored schedule runs returned by `GET /api/oxylabs/runs` by default. */
export const DEFAULT_SCHEDULE_RUNS_LIMIT = 50;

/** Upper bound the runs route will accept for `?limit=`. */
export const MAX_SCHEDULE_RUNS_LIMIT = 200;
