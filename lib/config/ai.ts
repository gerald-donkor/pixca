// Centralized AI model configuration (AGENTS.md section 19: "Centralize the
// model ID in `lib/config/`; never inline it in a route handler").
// No secrets and no client imports live here.

/** Gemini model used for article analysis; also stored in `article_analyses.model`. */
export const ANALYSIS_MODEL_ID = "gemini-2.5-flash";

/** Gemini embedding model behind pgvector similarity search (section 20). */
export const EMBEDDING_MODEL_ID = "gemini-embedding-001";

/**
 * `gemini-embedding-001` defaults to 3072 dimensions; we ask for 1536 so the
 * `article_analyses.embedding vector(1536)` column and its IVFFlat cosine
 * index never need a migration or a re-embedding pass.
 */
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * `article_analyses.disclaimer` is `not null`. Used only when the model omits
 * a disclaimer of its own.
 */
export const ANALYSIS_DISCLAIMER_FALLBACK =
  "This analysis is AI-estimated, not objective truth. Sentiment and political framing are automated estimates from the article text and may be wrong.";
