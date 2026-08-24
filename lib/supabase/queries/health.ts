import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { toMessage } from "@/lib/pipeline/run-logger";

export interface DatabaseHealthCheck {
  status: "connected" | "error";
  latencyMs: number;
  activeSources?: number;
  error?: string | null;
}

/**
 * Executes a lightweight probe against the Supabase database (counting active sources)
 * and measures round-trip query latency in milliseconds.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const startTime = performance.now();

  try {
    const supabase = getSupabaseAdminClient();
    const { count, error } = await supabase
      .from("sources")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;

    if (error) {
      return {
        status: "error",
        latencyMs,
        error: toMessage(error),
      };
    }

    return {
      status: "connected",
      latencyMs,
      activeSources: count ?? 0,
      error: null,
    };
  } catch (error) {
    const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;
    return {
      status: "error",
      latencyMs,
      error: toMessage(error),
    };
  }
}
