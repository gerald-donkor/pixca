import type { NextRequest } from "next/server";
import { requireAdminSecret } from "@/lib/api/admin-secret";
import { syncSchedules } from "@/lib/pipeline/scheduler";
import { listSchedules } from "@/lib/supabase/queries/oxylabs";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Sync Oxylabs schedules with the active sources (AGENTS.md sections 14, 15,
 * 18). Thin handler: admin secret -> run the sync -> summary. No body.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const unauthorized = requireAdminSecret(request);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    return Response.json(await syncSchedules());
  } catch (error) {
    console.error("[api/oxylabs/schedules] sync failed:", toSafeMessage(error));
    return Response.json({ error: "Schedule sync failed." }, { status: 500 });
  }
}

/**
 * Read route listing stored schedule rows (section 14). No admin secret —
 * section 15 scopes that guard to routes that start or mutate work, and this
 * returns only source IDs, Oxylabs schedule IDs, and flags.
 */
export async function GET(): Promise<Response> {
  try {
    const schedules = await listSchedules();

    return Response.json({
      schedules: schedules.map((schedule) => ({
        id: schedule.id,
        sourceId: schedule.source_id,
        oxylabsScheduleId: schedule.oxylabs_schedule_id,
        scheduleConfig: schedule.schedule_config,
        isActive: schedule.is_active,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
      })),
    });
  } catch (error) {
    console.error("[api/oxylabs/schedules] failed to load schedules:", toSafeMessage(error));
    return Response.json({ error: "Failed to load schedules." }, { status: 500 });
  }
}

function toSafeMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
