// Presentation helpers for the UI layer. No `server-only`, no Supabase, no
// Oxylabs, no AI imports — these must stay safe on either side of the
// server/client boundary (AGENTS.md section 5).

/** `2026-05-31T09:00:00Z` → `May 31, 2026`. */
export function formatArticleDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** `49` → `49%`. Percentages are stored 0–100. */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** `0.72` → `72%`. Confidence is stored 0–1. */
export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** `left` → `Left`, `positive` → `Positive`. */
export function titleCase(label: string): string {
  if (label.length === 0) {
    return label;
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Split stored `raw_text` into display paragraphs: blank lines first, single
 * newlines as a fallback, empties dropped.
 */
export function splitIntoParagraphs(rawText: string): string[] {
  const byBlankLine = rawText
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  if (byBlankLine.length > 1) {
    return byBlankLine;
  }

  return rawText
    .split("\n")
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}
