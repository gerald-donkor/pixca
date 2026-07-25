// Big-integer-safe parsing for Oxylabs responses (AGENTS.md section 18).
//
// Oxylabs `schedule_id`, run `id`, and job `id` values are 64-bit integers that
// exceed `Number.MAX_SAFE_INTEGER`. `JSON.parse` silently rounds them, so the
// last digits change and Oxylabs no longer recognises the ID. There is no way
// to recover the original digits once parsed — converting the parsed number
// back to a string returns the corrupted value.
//
// The fix is to rewrite those numeric values into JSON strings in the *raw
// response text*, before `JSON.parse` ever sees them. Every ID then stays an
// exact digit string end to end, matching the `text` columns in
// `supabase/schema.sql`.

/** Keys whose integer values must survive as exact digit strings. */
const ID_KEYS = ["schedule_id", "run_id", "id"] as const;

const ID_KEY_PATTERN = new RegExp(`"(${ID_KEYS.join("|")})"\\s*:\\s*(-?\\d+)`, "g");

/** `GET /v1/schedules` returns bare integers: `{ "schedules": [123, 456] }`. */
const SCHEDULES_ARRAY_PATTERN = /"schedules"\s*:\s*\[([^\]]*)\]/g;

/**
 * Parse an Oxylabs JSON payload, quoting large-integer IDs first so their
 * digits are preserved exactly.
 */
export function parseOxylabsJson<T>(rawText: string): T {
  return JSON.parse(quoteIdValues(rawText)) as T;
}

/** Read a `Response` body as text and parse it with ID precision preserved. */
export async function parseOxylabsResponse<T>(response: Response): Promise<T> {
  return parseOxylabsJson<T>(await response.text());
}

function quoteIdValues(rawText: string): string {
  const withQuotedIds = rawText.replace(ID_KEY_PATTERN, (_match, key: string, digits: string) => {
    return `"${key}":"${digits}"`;
  });

  return withQuotedIds.replace(SCHEDULES_ARRAY_PATTERN, (match, body: string) => {
    if (body.trim().length === 0) {
      return match;
    }

    // Only rewrite a plain list of bare integers. Anything else (objects,
    // already-quoted strings) is left untouched.
    if (!/^[\s\d,]+$/.test(body)) {
      return match;
    }

    const quoted = body
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .map((entry) => `"${entry}"`)
      .join(",");

    return `"schedules":[${quoted}]`;
  });
}
