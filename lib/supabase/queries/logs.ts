import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LogEntry, LogEntryInsert, LogLevel } from "@/lib/supabase/types";

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

export async function getRecentLogs({
  limit,
  level,
}: {
  limit: number;
  level?: LogLevel;
}): Promise<LogEntry[]> {
  let query = getSupabaseAdminClient().from("logs").select("*");

  if (level) {
    query = query.eq("level", level);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

