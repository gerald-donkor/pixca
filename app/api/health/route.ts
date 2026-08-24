import { checkDatabaseHealth } from "@/lib/supabase/queries/health";

export const dynamic = "force-dynamic";

/**
 * Public health check and service status endpoint.
 *
 * Provides safe verification of database connectivity, query latency,
 * and environment variable configuration without exposing any secrets,
 * tokens, or sensitive credentials.
 */
export async function GET(): Promise<Response> {
  const dbHealth = await checkDatabaseHealth();

  const environment = {
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    clerk: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
    ),
    gemini: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    oxylabs: Boolean(process.env.OXY_WSA_USERNAME && process.env.OXY_WSA_PASSWORD),
    cron: Boolean(process.env.CRON_SECRET),
    adminSecret: Boolean(process.env.PIXCA_ADMIN_SECRET),
  };

  const isHealthy =
    dbHealth.status === "connected" &&
    environment.supabase &&
    environment.gemini;

  const payload = {
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime() * 100) / 100,
    checks: {
      database: dbHealth,
      environment,
    },
  };

  return Response.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
