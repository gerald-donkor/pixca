"use client";

import * as React from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Database,
  Info,
  Radio,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { gsap, useGSAP } from "@/lib/gsap";
import type { DatabaseHealthCheck } from "@/lib/supabase/queries/health";
import type { LogEntry, LogLevel } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface LogsViewerProps {
  initialLogs: LogEntry[];
  initialHealth: DatabaseHealthCheck;
}

export function LogsViewer({ initialLogs, initialHealth }: LogsViewerProps) {
  const [logs, setLogs] = React.useState<LogEntry[]>(initialLogs);
  const [health, setHealth] = React.useState<DatabaseHealthCheck>(initialHealth);
  const [filterLevel, setFilterLevel] = React.useState<"all" | LogLevel>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = React.useState<Date>(new Date());
  const [selectedLog, setSelectedLog] = React.useState<LogEntry | null>(null);
  const [hasCopied, setHasCopied] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const pollTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch fresh logs and health metrics from public read endpoints
  const fetchFreshData = React.useCallback(async (showFeedback = false) => {
    setIsRefreshing(true);
    try {
      const [logsRes, healthRes] = await Promise.all([
        fetch("/api/logs?limit=100", { cache: "no-store" }),
        fetch("/api/health", { cache: "no-store" }),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        if (Array.isArray(data.logs)) {
          const formattedLogs: LogEntry[] = data.logs.map(
            (item: {
              id: string;
              level: LogLevel;
              message: string;
              context: Record<string, unknown> | null;
              createdAt?: string;
              created_at?: string;
            }) => ({
              id: item.id,
              level: item.level,
              message: item.message,
              context: item.context,
              created_at: item.createdAt || item.created_at || new Date().toISOString(),
            })
          );
          setLogs(formattedLogs);
        }
      }

      if (healthRes.ok || healthRes.status === 503) {
        const healthData = await healthRes.json();
        if (healthData?.checks?.database) {
          setHealth(healthData.checks.database);
        }
      }

      setLastRefreshedAt(new Date());
      if (showFeedback) {
        toast.success("System status & logs refreshed");
      }
    } catch (err) {
      console.error("Failed to refresh status logs:", err);
      if (showFeedback) {
        toast.error("Failed to refresh logs");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Handle auto-refresh interval
  React.useEffect(() => {
    if (!autoRefresh) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    pollTimerRef.current = setInterval(() => {
      fetchFreshData(false);
    }, 10000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [autoRefresh, fetchFreshData]);

  // Compute level counts
  const counts = React.useMemo(() => {
    const total = logs.length;
    let info = 0;
    let warn = 0;
    let error = 0;

    for (const log of logs) {
      if (log.level === "info") info++;
      else if (log.level === "warn") warn++;
      else if (log.level === "error") error++;
    }

    return { total, info, warn, error };
  }, [logs]);

  // Filtered log entries
  const filteredLogs = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return logs.filter((log) => {
      // Level filter
      if (filterLevel !== "all" && log.level !== filterLevel) {
        return false;
      }

      // Search query filter
      if (query.length > 0) {
        const matchesMessage = log.message.toLowerCase().includes(query);
        const matchesContext =
          log.context !== null &&
          JSON.stringify(log.context).toLowerCase().includes(query);
        const matchesLevel = log.level.toLowerCase().includes(query);
        const matchesId = log.id.toLowerCase().includes(query);

        return matchesMessage || matchesContext || matchesLevel || matchesId;
      }

      return true;
    });
  }, [logs, filterLevel, searchQuery]);

  // GSAP Choreographed Entrance Animation on log items
  useGSAP(
    () => {
      if (!containerRef.current || filteredLogs.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".log-row-item",
          { y: 8, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.25,
            ease: "power2.out",
            stagger: 0.02,
            clearProps: "transform,opacity",
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          ".log-row-item",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.15,
            stagger: 0.01,
            clearProps: "transform,opacity",
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [filteredLogs.length, filterLevel] }
  );

  const handleCopyJson = (content: Record<string, unknown> | null) => {
    if (!content) return;
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setHasCopied(true);
    toast.success("Log context copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const formatLogTime = (iso: string) => {
    try {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;

      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const formatFullDate = (iso: string) => {
    try {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) + " " + date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return iso;
    }
  };

  const isHealthy = health.status === "connected";

  return (
    <div ref={containerRef} className="w-full min-w-0 space-y-6">
      {/* Top Health Status & Metrics Grid */}
      <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: System Status */}
        <div className="w-full min-w-0 p-4 rounded-xl bg-card border border-[var(--border)] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Overall Status
            </span>
            <div
              className={cn(
                "shrink-0 w-2.5 h-2.5 rounded-full",
                isHealthy
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"
                  : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              )}
            />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-[var(--text-primary)] truncate">
              {isHealthy ? "Operational" : "Degraded"}
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 break-words">
              {isHealthy ? "All services healthy" : health.error || "System warning"}
            </div>
          </div>
        </div>

        {/* Metric 2: Database Connectivity */}
        <div className="w-full min-w-0 p-4 rounded-xl bg-card border border-[var(--border)] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Database
            </span>
            <Database className="shrink-0 w-4 h-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-[var(--text-primary)]">
                Supabase
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                  isHealthy
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                )}
              >
                {health.status}
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 break-words">
              PostgreSQL & pgvector
            </div>
          </div>
        </div>

        {/* Metric 3: Round-Trip Latency */}
        <div className="w-full min-w-0 p-4 rounded-xl bg-card border border-[var(--border)] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Query Latency
            </span>
            <Activity className="shrink-0 w-4 h-4 text-purple-500" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {health.latencyMs}
              </span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                ms
              </span>
              <span
                className={cn(
                  "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0",
                  health.latencyMs < 60
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : health.latencyMs < 200
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {health.latencyMs < 60
                  ? "Optimal"
                  : health.latencyMs < 200
                  ? "Normal"
                  : "Elevated"}
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 break-words">
              Probe round-trip time
            </div>
          </div>
        </div>

        {/* Metric 4: Active News Sources */}
        <div className="w-full min-w-0 p-4 rounded-xl bg-card border border-[var(--border)] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Active Sources
            </span>
            <Radio className="shrink-0 w-4 h-4 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-[var(--text-primary)] truncate">
              {health.activeSources ?? "—"}
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 break-words">
              Monitored publications
            </div>
          </div>
        </div>
      </div>

      {/* Main Logs Card Container */}
      <div className="w-full min-w-0 bg-card rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
        {/* Controls Toolbar: Filters, Search, and Refresh Action */}
        <div className="p-3.5 sm:p-5 border-b border-[var(--border)] flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
          {/* Level Filter Tabs */}
          <div className="w-full lg:w-auto min-w-0 flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterLevel("all")}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                filterLevel === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "bg-muted text-text-secondary hover:text-text-primary hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <span>All Logs</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-black/20">
                {counts.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterLevel("info")}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                filterLevel === "info"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-muted text-text-secondary hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Info</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20">
                {counts.info}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterLevel("warn")}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                filterLevel === "warn"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-muted text-text-secondary hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Warn</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20">
                {counts.warn}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterLevel("error")}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                filterLevel === "error"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-muted text-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Error</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20">
                {counts.error}
              </span>
            </button>
          </div>

          {/* Search Bar & Auto-Refresh Controls */}
          <div className="w-full lg:w-auto min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages & context..."
                aria-label="Search messages and context"
                className="w-full h-9 sm:h-8.5 pl-8.5 pr-8 bg-zinc-50 dark:bg-zinc-900 border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Live Auto-Refresh Toggle */}
              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className={cn(
                  "flex-1 sm:flex-initial h-9 sm:h-8.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border min-w-0",
                  autoRefresh
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-muted text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                )}
                title={autoRefresh ? "Live polling active (10s)" : "Enable live polling"}
              >
                <span
                  className={cn(
                    "shrink-0 w-1.5 h-1.5 rounded-full",
                    autoRefresh ? "bg-emerald-500 animate-ping" : "bg-zinc-400"
                  )}
                />
                <span className="truncate">{autoRefresh ? "Live: 10s" : "Auto-Refresh"}</span>
              </button>

              {/* Manual Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFreshData(true)}
                disabled={isRefreshing}
                className="flex-1 sm:flex-initial h-9 sm:h-8.5 px-3 text-xs font-semibold border-[var(--border)] cursor-pointer min-w-0"
              >
                <RefreshCw
                  className={cn(
                    "shrink-0 w-3.5 h-3.5 mr-1.5",
                    isRefreshing && "animate-spin text-blue-600 dark:text-blue-400"
                  )}
                />
                <span className="truncate">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stream Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-[var(--border)] text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Level</div>
          <div className="col-span-6">Message</div>
          <div className="col-span-2 text-right">Context</div>
        </div>

        {/* Logs Feed List */}
        <div className="w-full min-w-0 divide-y divide-[var(--border)] max-h-[640px] overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 sm:p-12 text-center space-y-3 font-sans w-full min-w-0 max-w-full">
              <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                No logs match your filter
              </div>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto break-words">
                {searchQuery
                  ? `No entries found for "${searchQuery}". Try changing your search keywords.`
                  : "No events logged for this severity level yet."}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const hasContext =
                log.context !== null &&
                typeof log.context === "object" &&
                Object.keys(log.context).length > 0;

              return (
                <div
                  key={log.id}
                  className="log-row-item w-full min-w-0 p-3.5 sm:p-4 md:px-5 hover:bg-zinc-50/75 dark:hover:bg-zinc-900/50 transition-colors flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center gap-2 sm:gap-2.5 group"
                >
                  {/* Column 1 & 2 wrapper for mobile flex, unpacked by md:contents on desktop */}
                  <div className="w-full min-w-0 flex items-center justify-between md:contents">
                    {/* Column 1: Time */}
                    <div className="col-span-2 flex md:flex-col items-center md:items-start gap-1.5 md:gap-0 text-[11px] text-[var(--text-secondary)] min-w-0">
                      <span className="font-semibold text-[var(--text-primary)]" title={formatFullDate(log.created_at)}>
                        {formatLogTime(log.created_at)}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(log.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Column 2: Level Badge */}
                    <div className="col-span-2 shrink-0">
                      {log.level === "info" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-sans">
                          <Info className="w-3 h-3 shrink-0" />
                          <span>INFO</span>
                        </span>
                      )}
                      {log.level === "warn" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-sans">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>WARN</span>
                        </span>
                      )}
                      {log.level === "error" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-sans">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>ERROR</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Message Text */}
                  <div className="col-span-6 w-full min-w-0 break-words font-sans text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                    {log.message}
                  </div>

                  {/* Column 4: Context Button */}
                  <div className="col-span-2 w-full md:w-auto flex items-center justify-between md:justify-end gap-2 pt-1 md:pt-0 border-t border-[var(--border)]/40 md:border-t-0">
                    <span className="md:hidden text-[10px] text-zinc-400 font-sans">Context</span>
                    {hasContext ? (
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-sans shrink-0"
                      >
                        <span>JSON</span>
                        <span className="text-[10px] opacity-60">
                          ({Object.keys(log.context ?? {}).length})
                        </span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic font-sans shrink-0">
                        No context
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary Strip */}
        <div className="p-3.5 sm:px-5 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-secondary)] font-medium">
          <div className="min-w-0 truncate">
            Showing {filteredLogs.length} of {logs.length} logged events
          </div>
          <div className="flex items-center gap-1.5 text-[11px] shrink-0">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">
              Last refreshed at {lastRefreshedAt.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable JSON Context Inspector Dialog */}
      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-2xl max-h-[85vh] p-4 sm:p-6 flex flex-col overflow-hidden">
          <DialogHeader className="space-y-2 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                Log Inspector
              </span>
              {selectedLog && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0",
                    selectedLog.level === "info" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    selectedLog.level === "warn" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    selectedLog.level === "error" && "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  {selectedLog.level}
                </span>
              )}
            </div>
            <DialogTitle className="text-sm sm:text-base font-bold text-[var(--text-primary)] break-words leading-snug">
              {selectedLog?.message}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-[var(--text-secondary)] break-all">
              ID: {selectedLog?.id} • {selectedLog && formatFullDate(selectedLog.created_at)}
            </DialogDescription>
          </DialogHeader>

          {/* Context JSON Viewer */}
          <div className="flex-1 overflow-y-auto overflow-x-auto my-2 rounded-xl bg-zinc-950 p-3 sm:p-4 border border-zinc-800 font-mono text-xs text-zinc-200 min-w-0 max-w-full">
            <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono">
              {selectedLog?.context ? JSON.stringify(selectedLog.context, null, 2) : "{}"}
            </pre>
          </div>

          <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyJson(selectedLog?.context ?? null)}
              className="w-full sm:w-auto text-xs font-semibold cursor-pointer justify-center"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>Copy JSON Payload</span>
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setSelectedLog(null)}
              className="w-full sm:w-auto text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer justify-center"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
