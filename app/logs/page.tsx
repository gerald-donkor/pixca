import type { Metadata } from "next";
import * as React from "react";
import { connection } from "next/server";
import { Activity, Terminal } from "lucide-react";
import { LogsViewer } from "@/components/ui/logs-viewer";
import { checkDatabaseHealth } from "@/lib/supabase/queries/health";
import { getRecentLogs } from "@/lib/supabase/queries/logs";
import type { LogEntry } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "System Status & Pipeline Logs",
  description:
    "Real-time operational status, database connectivity metrics, and scraping/analysis pipeline logs for Pixca News.",
  openGraph: {
    title: "System Status & Pipeline Logs — Pixca News",
    description:
      "Real-time operational status, database connectivity metrics, and scraping/analysis pipeline logs for Pixca News.",
    url: "/logs",
    type: "website",
    siteName: "Pixca News",
  },
  twitter: {
    card: "summary_large_image",
    title: "System Status & Pipeline Logs — Pixca News",
    description:
      "Real-time operational status, database connectivity metrics, and scraping/analysis pipeline logs for Pixca News.",
  },
};

export default async function LogsPage() {
  // Read-at-request-time
  await connection();

  const [initialLogs, initialHealth] = await Promise.all([
    getRecentLogs({ limit: 100 }).catch((error) => {
      console.error("[app/logs] Failed to load initial logs:", error);
      return [] as LogEntry[];
    }),
    checkDatabaseHealth().catch((error) => {
      console.error("[app/logs] Failed to check initial database health:", error);
      return {
        status: "error" as const,
        latencyMs: 0,
        error: error instanceof Error ? error.message : "Health check failed",
      };
    }),
  ]);

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <main className="container mx-auto max-w-[1400px] px-6 py-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
                System Status & Logs
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <Activity className="w-3 h-3" />
                <span>Live Feed</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Real-time service health, query latency, and pipeline execution logs
            </p>
          </div>
        </div>

        {/* Logs Viewer & Health Status Inspector */}
        <LogsViewer
          initialLogs={initialLogs}
          initialHealth={initialHealth}
        />
      </main>
    </div>
  );
}
