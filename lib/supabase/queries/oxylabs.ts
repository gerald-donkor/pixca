import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { OxylabsSchedule, OxylabsScheduleRun } from "@/lib/supabase/types";

/** Same bound as the article URL existence check — never more than 15 per `.in()`. */
const JOB_ID_CHUNK_SIZE = 15;

export async function upsertScheduleForSource(params: {
  sourceId: string;
  oxylabsScheduleId: string;
  scheduleConfig?: Record<string, unknown> | null;
  isActive?: boolean;
}): Promise<OxylabsSchedule> {
  const { data, error } = await getSupabaseAdminClient()
    .from("oxylabs_schedules")
    .upsert(
      {
        source_id: params.sourceId,
        oxylabs_schedule_id: params.oxylabsScheduleId,
        schedule_config: params.scheduleConfig ?? null,
        is_active: params.isActive ?? true,
      },
      { onConflict: "source_id" }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listSchedules(): Promise<OxylabsSchedule[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("oxylabs_schedules")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function deactivateSchedule(oxylabsScheduleId: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("oxylabs_schedules")
    .update({ is_active: false })
    .eq("oxylabs_schedule_id", oxylabsScheduleId);

  if (error) {
    throw error;
  }
}

export async function insertScheduleRun(params: {
  scheduleId: string;
  oxylabsJobId: string;
  resultStatus?: string | null;
}): Promise<OxylabsScheduleRun> {
  const { data, error } = await getSupabaseAdminClient()
    .from("oxylabs_schedule_runs")
    .insert({
      schedule_id: params.scheduleId,
      oxylabs_job_id: params.oxylabsJobId,
      result_status: params.resultStatus ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listUnprocessedDoneRuns(): Promise<OxylabsScheduleRun[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("oxylabs_schedule_runs")
    .select("*")
    .eq("result_status", "done")
    .eq("processed", false)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Which of these Oxylabs job IDs already have a `oxylabs_schedule_runs` row.
 * Chunked at 15 per `.in()`, mirroring the article URL existence check.
 */
export async function findScheduleRunsByJobIds(jobIds: string[]): Promise<Set<string>> {
  const existing = new Set<string>();

  for (let i = 0; i < jobIds.length; i += JOB_ID_CHUNK_SIZE) {
    const chunk = jobIds.slice(i, i + JOB_ID_CHUNK_SIZE);
    const { data, error } = await getSupabaseAdminClient()
      .from("oxylabs_schedule_runs")
      .select("oxylabs_job_id")
      .in("oxylabs_job_id", chunk);

    if (error) {
      throw error;
    }

    for (const row of data) {
      existing.add(row.oxylabs_job_id);
    }
  }

  return existing;
}

/** Newest-first stored runs for `GET /api/oxylabs/runs`. */
export async function listScheduleRuns(limit: number): Promise<OxylabsScheduleRun[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("oxylabs_schedule_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

export async function markScheduleRunProcessed(id: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .from("oxylabs_schedule_runs")
    .update({ processed: true })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
