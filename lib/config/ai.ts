// Centralized AI model configuration (AGENTS.md section 19: "Centralize the
// model ID in `lib/config/`; never inline it in a route handler").
// No secrets and no client imports live here.

/** Gemini model used for article analysis; also stored in `article_analyses.model`. */
export const ANALYSIS_MODEL_ID = "gemini-2.5-flash";

/**
 * `article_analyses.disclaimer` is `not null`. Used only when the model omits
 * a disclaimer of its own.
 */
export const ANALYSIS_DISCLAIMER_FALLBACK =
  "This analysis is AI-estimated, not objective truth. Sentiment and political framing are automated estimates from the article text and may be wrong.";
