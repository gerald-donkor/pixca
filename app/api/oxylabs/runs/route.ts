import type { NextRequest } from "next/server";
import {
  DEFAULT_SCHEDULE_RUNS_LIMIT,
  MAX_SCHEDULE_RUNS_LIMIT,
} from "@/lib/config/limits";
import { toMessage } from "@/lib/pipeline/run-logger";
import { listScheduleRuns } from "@/lib/supabase/queries/oxylabs";

export const dynamic = "force-dynamic";

/**
 * Read route listing recorded Oxylabs schedule runs (AGENTS.md section 14).
 * Unauthenticated like the other GET status routes: it returns only job IDs and
 * processing flags, no secrets.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  if (limit === null) {
    return Response.json(
      { error: `limit must be an integer between 1 and ${MAX_SCHEDULE_RUNS_LIMIT}.` },
      { status: 400 }
    );
  }

  try {
    const runs = await listScheduleRuns(limit);

    return Response.json({
      runs: runs.map((run) => ({
        id: run.id,
        scheduleId: run.schedule_id,
        oxylabsJobId: run.oxylabs_job_id,
        resultStatus: run.result_status,
        processed: run.processed,
        createdAt: run.created_at,
      })),
    });
  } catch (error) {
    console.error("[api/oxylabs/runs] failed to load runs:", toMessage(error));
    return Response.json({ error: "Failed to load schedule runs." }, { status: 500 });
  }
}

/** Returns `null` for a present-but-invalid value so the caller can 400. */
function parseLimit(raw: string | null): number | null {
  if (raw === null || raw.trim().length === 0) {
    return DEFAULT_SCHEDULE_RUNS_LIMIT;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_SCHEDULE_RUNS_LIMIT) {
    return null;
  }

  return parsed;
}
