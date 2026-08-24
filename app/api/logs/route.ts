import type { NextRequest } from "next/server";
import { DEFAULT_LOGS_LIMIT, MAX_LOGS_LIMIT } from "@/lib/config/limits";
import { toMessage } from "@/lib/pipeline/run-logger";
import { getRecentLogs } from "@/lib/supabase/queries/logs";
import type { LogLevel } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const VALID_LOG_LEVELS: readonly LogLevel[] = ["info", "warn", "error"] as const;

function isLogLevel(value: string): value is LogLevel {
  return (VALID_LOG_LEVELS as readonly string[]).includes(value);
}

/**
 * Read route listing recent pipeline and system logs (AGENTS.md sections 1 and 14).
 * Unauthenticated status endpoint returning sanitized log records.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const levelParam = request.nextUrl.searchParams.get("level");

  const limit = parseLimit(limitParam);
  if (limit === null) {
    return Response.json(
      { error: `limit must be an integer between 1 and ${MAX_LOGS_LIMIT}.` },
      { status: 400 }
    );
  }

  const level = parseLevel(levelParam);
  if (levelParam !== null && levelParam.trim().length > 0 && level === null) {
    return Response.json(
      { error: `level must be one of: ${VALID_LOG_LEVELS.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const logs = await getRecentLogs({ limit, level: level ?? undefined });

    return Response.json({
      logs: logs.map((log) => ({
        id: log.id,
        level: log.level,
        message: log.message,
        context: log.context,
        createdAt: log.created_at,
      })),
      count: logs.length,
    });
  } catch (error) {
    console.error("[api/logs] failed to load logs:", toMessage(error));
    return Response.json({ error: "Failed to load logs." }, { status: 500 });
  }
}

/** Returns `null` for a present-but-invalid value so the caller can 400. */
function parseLimit(raw: string | null): number | null {
  if (raw === null || raw.trim().length === 0) {
    return DEFAULT_LOGS_LIMIT;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_LOGS_LIMIT) {
    return null;
  }

  return parsed;
}

function parseLevel(raw: string | null): LogLevel | null {
  if (raw === null || raw.trim().length === 0) {
    return null;
  }

  const trimmed = raw.trim().toLowerCase();
  if (isLogLevel(trimmed)) {
    return trimmed;
  }

  return null;
}
