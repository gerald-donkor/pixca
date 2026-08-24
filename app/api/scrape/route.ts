import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSecret } from "@/lib/api/admin-secret";
import {
  DEFAULT_ARTICLES_PER_SOURCE,
  MAX_ARTICLES_PER_SOURCE,
} from "@/lib/config/limits";
import { fetchPageHtml } from "@/lib/oxylabs/client";
import { toMessage } from "@/lib/pipeline/run-logger";
import { runScrapePipeline } from "@/lib/pipeline/scrape";
import { sourceNeedsRender } from "@/lib/scraping/render-policy";
import { getActiveSources } from "@/lib/supabase/queries/sources";
import type { Source } from "@/lib/supabase/types";
import { getPostHogClient } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const requestSchema = z
  .object({
    sourceIds: z.array(z.uuid()).optional(),
    sourceNames: z.array(z.string().min(1)).optional(),
    limitPerSource: z.number().int().min(1).max(MAX_ARTICLES_PER_SOURCE).optional(),
  })
  .strict();

type ScrapeRequest = z.infer<typeof requestSchema>;

/**
 * Manual scraping trigger (AGENTS.md sections 14-16). Thin handler: admin
 * secret -> validate body -> resolve sources -> run the pipeline -> summary.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const unauthorized = requireAdminSecret(request);

  if (unauthorized) {
    return unauthorized;
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return Response.json({ error: body.error }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body.value);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body.", issues: parsed.error.issues.map((issue) => issue.message) },
      { status: 400 }
    );
  }

  try {
    const activeSources = await getActiveSources();
    const selection = selectSources(activeSources, parsed.data);

    if (selection.sources.length === 0) {
      return Response.json(
        {
          error: "No matching active sources.",
          unknownSourceIds: selection.unknownSourceIds,
          unknownSourceNames: selection.unknownSourceNames,
        },
        { status: 400 }
      );
    }

    const fetchHtml = (url: string) => fetchPageHtml(url, { render: sourceNeedsRender(url) });

    const summary = await runScrapePipeline({
      sources: selection.sources,
      limitPerSource: parsed.data.limitPerSource ?? DEFAULT_ARTICLES_PER_SOURCE,
      fetchHomepageHtml: fetchHtml,
      fetchDetailHtml: fetchHtml,
    });

    const posthog = getPostHogClient();
    if (posthog) {
      posthog.capture({
        distinctId: "system",
        event: "scrape_run_completed",
        properties: {
          status: summary.status,
          sources_checked: summary.sourcesChecked,
          articles_inserted: summary.articlesInserted,
          articles_rejected: summary.articlesRejected,
          duplicates_skipped: summary.duplicatesSkipped,
          duration_ms: summary.durationMs,
        },
      });
      await posthog.flush();
    }

    return Response.json({
      ...summary,
      unknownSourceIds: selection.unknownSourceIds,
      unknownSourceNames: selection.unknownSourceNames,
    });
  } catch (error) {
    console.error("[api/scrape] run failed:", toMessage(error));
    return Response.json({ error: "Scrape run failed." }, { status: 500 });
  }
}

type SourceSelection = {
  sources: Source[];
  unknownSourceIds: string[];
  unknownSourceNames: string[];
};

/**
 * Section 8 scope selection. No ids and no names means every active source.
 * Unknown ids/names are reported back rather than silently ignored.
 */
function selectSources(activeSources: Source[], request: ScrapeRequest): SourceSelection {
  const ids = request.sourceIds ?? [];
  const names = request.sourceNames ?? [];

  if (ids.length === 0 && names.length === 0) {
    return { sources: activeSources, unknownSourceIds: [], unknownSourceNames: [] };
  }

  const selected = new Map<string, Source>();
  const unknownSourceIds: string[] = [];
  const unknownSourceNames: string[] = [];

  for (const id of ids) {
    const match = activeSources.find((source) => source.id === id);

    if (match) {
      selected.set(match.id, match);
    } else {
      unknownSourceIds.push(id);
    }
  }

  for (const name of names) {
    const needle = name.trim().toLowerCase();
    const match = activeSources.find((source) => source.name.toLowerCase() === needle);

    if (match) {
      selected.set(match.id, match);
    } else {
      unknownSourceNames.push(name);
    }
  }

  return { sources: [...selected.values()], unknownSourceIds, unknownSourceNames };
}

type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

/** An empty body is valid and means "use the defaults" (section 16). */
async function readJsonBody(request: NextRequest): Promise<JsonBodyResult> {
  const text = await request.text();

  if (text.trim().length === 0) {
    return { ok: true, value: {} };
  }

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, error: "Request body must be valid JSON." };
  }
}
