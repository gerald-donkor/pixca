import "server-only";

// Shared classification for Gemini call failures (prompt 14). Kept separate
// from the analysis and embedding modules so both can use it without importing
// each other.

import { APICallError } from "ai";

/**
 * A 429 is detected from `APICallError.statusCode`, never from message text.
 * `generateText` can wrap the provider error (e.g. in `NoObjectGeneratedError`),
 * so the `cause` chain is walked.
 */
export function isRateLimitError(error: unknown): boolean {
  let current: unknown = error;

  for (let depth = 0; depth < 5 && current !== null && current !== undefined; depth += 1) {
    if (APICallError.isInstance(current) && current.statusCode === 429) {
      return true;
    }

    current = current instanceof Error ? current.cause : null;
  }

  return false;
}

/**
 * Detects whether the error was caused by a safety block, content moderation,
 * or model refusal.
 */
export function isSafetyOrRefusalError(error: unknown): boolean {
  let current: unknown = error;

  for (let depth = 0; depth < 5 && current !== null && current !== undefined; depth += 1) {
    if (current instanceof Error) {
      const msg = current.message.toLowerCase();
      if (
        msg.includes("safety") ||
        msg.includes("blocked") ||
        msg.includes("refusal") ||
        msg.includes("harm_category") ||
        msg.includes("finish_reason_safety") ||
        msg.includes("prohibited_content") ||
        msg.includes("block_reason") ||
        msg.includes("blockreason")
      ) {
        return true;
      }
    }

    if (typeof current === "object" && current !== null) {
      const obj = current as Record<string, unknown>;
      if (typeof obj.responseBody === "string") {
        const body = obj.responseBody.toLowerCase();
        if (
          body.includes("prohibited_content") ||
          body.includes("blockreason") ||
          body.includes("safety") ||
          body.includes("blocked")
        ) {
          return true;
        }
      }
      if (typeof obj.text === "string") {
        const text = obj.text.toLowerCase();
        if (
          text.includes("i cannot") ||
          text.includes("i am unable to") ||
          text.includes("prohibited") ||
          text.includes("safety")
        ) {
          return true;
        }
      }
      if (typeof obj.value === "object" && obj.value !== null) {
        try {
          const valStr = JSON.stringify(obj.value).toLowerCase();
          if (
            valStr.includes("prohibited_content") ||
            valStr.includes("blockreason") ||
            valStr.includes("safety")
          ) {
            return true;
          }
        } catch {
          // Ignore JSON serialization errors for circular structures
        }
      }
    }

    current = current instanceof Error ? current.cause : null;
  }

  return false;
}

/**
 * Message safe to log. Only `statusCode` and `message` are taken from an
 * `APICallError` — its request body and headers can carry the API key.
 */
export function toModelErrorMessage(error: unknown): string {
  if (isSafetyOrRefusalError(error)) {
    return "Content was blocked by Gemini safety or policy filters.";
  }

  if (APICallError.isInstance(error)) {
    return `${error.statusCode ?? "no status"}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Unknown model error";
}

