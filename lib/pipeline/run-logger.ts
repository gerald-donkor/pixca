import "server-only";

// Section 9 **run logging**: neat server-side console messages during the run
// plus one `logs` row holding the final summary object.

import { insertLog } from "@/lib/supabase/queries/logs";
import type { ScrapeRunSummary } from "@/lib/pipeline/types";

const PREFIX = "[scrape]";

export const runLog = {
  started(sourceCount: number, limitPerSource: number): void {
    console.info(
      `${PREFIX} scrape started — ${sourceCount} source(s), up to ${limitPerSource} article(s) per source`
    );
  },

  selectedSources(names: string[]): void {
    console.info(`${PREFIX} selected sources: ${names.join(", ") || "(none)"}`);
  },

  sourceStarted(name: string, listingUrl: string): void {
    console.info(`${PREFIX} [${name}] start — homepage ${listingUrl}`);
  },

  homepageFetched(name: string, bytes: number): void {
    console.info(`${PREFIX} [${name}] homepage fetched (${bytes} bytes)`);
  },

  candidatesFound(name: string, count: number): void {
    console.info(`${PREFIX} [${name}] candidate links found: ${count}`);
  },

  candidatesRejected(name: string, count: number, samples: string[]): void {
    console.info(
      `${PREFIX} [${name}] candidates rejected before detail scrape: ${count}` +
        (samples.length > 0 ? ` — e.g. ${samples.join("; ")}` : "")
    );
  },

  duplicatesSkipped(name: string, count: number): void {
    console.info(`${PREFIX} [${name}] duplicates skipped: ${count}`);
  },

  detailScraped(name: string, url: string): void {
    console.info(`${PREFIX} [${name}] detail page scraped — ${url}`);
  },

  articleInserted(name: string, title: string): void {
    console.info(`${PREFIX} [${name}] article inserted — "${truncate(title, 90)}"`);
  },

  articleRejected(name: string, url: string, reason: string): void {
    console.info(`${PREFIX} [${name}] article rejected (${reason}) — ${url}`);
  },

  articleFailed(name: string, url: string, message: string): void {
    console.warn(`${PREFIX} [${name}] article failed — ${url}: ${message}`);
  },

  sourceAborted(name: string, consecutiveFailures: number): void {
    console.warn(
      `${PREFIX} [${name}] aborting source — ${consecutiveFailures} consecutive detail failures; ` +
        `stopping to avoid spending further Oxylabs requests`
    );
  },

  sourceError(name: string, message: string): void {
    console.error(`${PREFIX} [${name}] source error: ${message}`);
  },

  sourceFinished(name: string, inserted: number, scraped: number): void {
    console.info(`${PREFIX} [${name}] done — ${inserted} inserted from ${scraped} detail page(s)`);
  },

  completed(summary: ScrapeRunSummary): void {
    console.info(`${PREFIX} scrape ${summary.status} in ${summary.durationMs}ms`);
    console.info(`${PREFIX} summary`, summary);
  },
};

/**
 * Persist the final summary to the `logs` table. Logging must never break a
 * run, so failures here are reported to the console only.
 */
export async function persistRunSummary(summary: ScrapeRunSummary): Promise<void> {
  try {
    await insertLog({
      level: summary.status === "completed" ? "info" : "error",
      message: `scrape run ${summary.status}`,
      context: summary as unknown as Record<string, unknown>,
    });
  } catch (error) {
    console.error(`${PREFIX} failed to persist run summary:`, toMessage(error));
  }
}

export function toMessage(error: unknown): string {
  if (error instanceof Error) {
    const err = error as Error & { details?: unknown; hint?: unknown; code?: unknown };
    const parts = [err.message];
    if (typeof err.details === "string" && err.details) parts.push(`details: ${err.details}`);
    if (typeof err.hint === "string" && err.hint) parts.push(`hint: ${err.hint}`);
    if ((typeof err.code === "string" || typeof err.code === "number") && err.code) {
      parts.push(`code: ${err.code}`);
    }
    return parts.join(" — ");
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    const message = typeof errObj.message === "string" ? errObj.message : null;
    const details = typeof errObj.details === "string" ? errObj.details : null;
    const code =
      typeof errObj.code === "string" || typeof errObj.code === "number"
        ? String(errObj.code)
        : null;
    const hint = typeof errObj.hint === "string" ? errObj.hint : null;

    if (message) {
      const parts = [message];
      if (details) parts.push(`details: ${details}`);
      if (hint) parts.push(`hint: ${hint}`);
      if (code) parts.push(`code: ${code}`);
      return parts.join(" — ");
    }

    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      // Ignore circular reference stringify errors
    }
  }

  return "Unknown error";
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
