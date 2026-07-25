import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSecret } from "@/lib/api/admin-secret";
import { MAX_ANALYSIS_BATCH_SIZE } from "@/lib/config/limits";
import { runAnalysisPipeline } from "@/lib/pipeline/analysis";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const requestSchema = z
  .object({
    limit: z.number().int().min(1).optional(),
    batchSize: z.number().int().min(1).max(MAX_ANALYSIS_BATCH_SIZE).optional(),
    articleIds: z.array(z.uuid()).min(1).optional(),
  })
  .strict();

/**
 * AI analysis trigger (AGENTS.md sections 14, 15, 19). Thin handler: admin
 * secret -> validate body -> run the pipeline -> summary. An empty body means
 * "analyze everything pending".
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
    const summary = await runAnalysisPipeline(parsed.data);

    return Response.json(summary);
  } catch (error) {
    console.error(
      "[api/analyze] run failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return Response.json({ error: "Analysis run failed." }, { status: 500 });
  }
}

type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

/** An empty body is valid and means "analyze everything pending". */
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
