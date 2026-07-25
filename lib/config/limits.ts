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

/** First attempt plus one retry on invalid model output (section 19). */
export const ANALYSIS_MAX_ATTEMPTS = 2;

/** Politeness delay between sequential model calls. */
export const ANALYSIS_REQUEST_DELAY_MS = 500;

/** Analyzed articles listed on the homepage — matches the 12-card grid. */
export const HOMEPAGE_ARTICLES_LIMIT = 12;
