import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSecret } from "@/lib/api/admin-secret";
import { MAX_ARTICLES_PER_SOURCE } from "@/lib/config/limits";
import { toMessage } from "@/lib/pipeline/run-logger";
import { processScheduledResults } from "@/lib/pipeline/scheduler";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const requestSchema = z
  .object({
    limitPerSource: z.number().int().min(1).max(MAX_ARTICLES_PER_SOURCE).optional(),
  })
  .strict();

/**
 * Manual trigger for processing completed Oxylabs scheduled results (AGENTS.md
 * sections 14, 15, 18). The hourly cron calls the same orchestration; this
 * route exists for on-demand runs. Thin handler: admin secret -> validate body
 * -> run -> summary.
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
    return Response.json(await processScheduledResults(parsed.data));
  } catch (error) {
    console.error("[api/oxylabs/scheduled-results/process] run failed:", toMessage(error));
    return Response.json({ error: "Scheduled result processing failed." }, { status: 500 });
  }
}

type JsonBodyResult = { ok: true; value: unknown } | { ok: false; error: string };

/** An empty body is valid and means "use the defaults". */
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
