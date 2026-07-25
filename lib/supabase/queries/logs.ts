import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LogEntry, LogEntryInsert } from "@/lib/supabase/types";

export async function insertLog(entry: LogEntryInsert): Promise<LogEntry> {
  const { data, error } = await getSupabaseAdminClient()
    .from("logs")
    .insert(entry)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRecentLogs({ limit }: { limit: number }): Promise<LogEntry[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}
