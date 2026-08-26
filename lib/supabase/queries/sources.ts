import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Source } from "@/lib/supabase/types";
import { isValidUuid } from "@/lib/utils";

export async function getActiveSources(): Promise<Source[]> {
  try {
    const { data, error } = await getSupabaseAdminClient()
      .from("sources")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("[getActiveSources error]:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("[getActiveSources failed]:", err);
    return [];
  }
}

export async function getSourceById(id: string): Promise<Source | null> {
  if (!isValidUuid(id)) {
    return null;
  }

  try {
    const { data, error } = await getSupabaseAdminClient()
      .from("sources")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      if (error.code === "22P02" || error.code === "PGRST116") {
        return null;
      }
      console.error("[getSourceById error]:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[getSourceById failed]:", err);
    return null;
  }
}
