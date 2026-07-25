import "server-only";

// Single-article Gemini embedding for pgvector similarity search (AGENTS.md
// section 20).
//
// Verified against the bundled docs for the installed packages (`ai@7.0.37`,
// `@ai-sdk/google@4.0.24`): `google.embedding(modelId)` returns an embedding
// model, `embed({ model, value, providerOptions })` resolves to
// `{ embedding: number[] }`, and `outputDimensionality` / `taskType` are
// `providerOptions.google` fields. `@ai-sdk/google` reads
// `GOOGLE_GENERATIVE_AI_API_KEY` from the environment by itself.

import { google, type GoogleEmbeddingModelOptions } from "@ai-sdk/google";
import { embed } from "ai";
import { isRateLimitError, toModelErrorMessage } from "@/lib/ai/errors";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL_ID } from "@/lib/config/ai";
import { MAX_EMBEDDING_INPUT_CHARACTERS } from "@/lib/config/limits";

export type EmbeddableArticle = {
  title: string;
  /** The neutral analysis summary; the strongest single topic signal we have. */
  summary: string;
  raw_text: string;
};

export type EmbedArticleResult =
  | { ok: true; embedding: number[] }
  | { ok: false; message: string; rateLimited: boolean };

/**
 * Embed one article. Errors are returned, never thrown — the pipeline contract
 * is that one article can never abort a run.
 */
export async function embedArticle(article: EmbeddableArticle): Promise<EmbedArticleResult> {
  try {
    const { embedding } = await embed({
      model: google.embedding(EMBEDDING_MODEL_ID),
      value: buildEmbeddingInput(article),
      providerOptions: {
        google: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
          // This powers a "related articles" feature, i.e. text similarity —
          // not document retrieval against a separate query embedding.
          taskType: "SEMANTIC_SIMILARITY",
        } satisfies GoogleEmbeddingModelOptions,
      },
      // One attempt = one API request, so quota accounting stays exact and a
      // rate limit surfaces to the pipeline immediately (prompt 14).
      maxRetries: 0,
    });

    // A wrong length would silently break the vector(1536) write, so treat it
    // as a failure rather than saving something the column cannot hold.
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      return {
        ok: false,
        message: `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}.`,
        rateLimited: false,
      };
    }

    return { ok: true, embedding };
  } catch (error) {
    return {
      ok: false,
      message: toModelErrorMessage(error),
      rateLimited: isRateLimitError(error),
    };
  }
}

function buildEmbeddingInput({ title, summary, raw_text }: EmbeddableArticle): string {
  const combined = [title.trim(), summary.trim(), raw_text.trim()]
    .filter(Boolean)
    .join("\n\n");

  return combined.slice(0, MAX_EMBEDDING_INPUT_CHARACTERS);
}

/**
 * Postgres `vector` wire format. PostgREST accepts (and returns) the text
 * literal `[0.1,0.2,...]`, so a `number[]` is normalized before any write or
 * RPC argument.
 */
export function toVectorLiteral(embedding: number[] | string): string {
  return typeof embedding === "string" ? embedding : `[${embedding.join(",")}]`;
}
