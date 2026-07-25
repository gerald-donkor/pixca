import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Source } from "@/lib/supabase/types";

export async function getActiveSources(): Promise<Source[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("sources")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function getSourceById(id: string): Promise<Source | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("sources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
