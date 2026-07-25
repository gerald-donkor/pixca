import "server-only";

// Oxylabs Scheduler API client (AGENTS.md section 18). Server-only: Oxylabs
// credentials never reach browser code, and no error carries credentials or a
// raw payload.
//
// Endpoints (from the live Scheduler docs, per section 18):
//   POST /v1/schedules                 create an hourly schedule
//   GET  /v1/schedules                 list schedule IDs
//   GET  /v1/schedules/{id}/runs       runs with per-job `result_status`
//   PUT  /v1/schedules/{id}/state      activate / deactivate
//   GET  /v1/queries/{job_id}/results  job results
//
// `/schedules/{id}/jobs` is deliberately unused: it returns bare job IDs with
// no status, so there is no way to tell done from pending or faulted.

import { OXYLABS_REQUEST_TIMEOUT_MS } from "@/lib/config/limits";
import {
  buildAuthorizationHeader,
  mapStatusToCode,
  OxylabsError,
  toOxylabsError,
} from "@/lib/oxylabs/client";
import { parseOxylabsResponse } from "@/lib/oxylabs/precise-json";

const SCHEDULER_BASE_URL = "https://data.oxylabs.io/v1";

/** One `items` entry of a schedule — the same payload shape as a Realtime query. */
export type ScheduleItem = {
  source: "universal";
  url: string;
  user_agent_type: "desktop_chrome";
  geo_location: string;
};

export type CreatedSchedule = {
  scheduleId: string;
  nextRunAt: string | null;
};

export type ScheduleJob = {
  /** Exact digit string — never a parsed number (see `precise-json.ts`). */
  id: string;
  resultStatus: string | null;
  createdAt: string | null;
  resultCreatedAt: string | null;
};

export type ScheduleRun = {
  runId: string;
  jobs: ScheduleJob[];
};

export async function createSchedule(
  items: ScheduleItem[],
  cron: string,
  endTime: string
): Promise<CreatedSchedule> {
  const body = await schedulerRequest("POST", "/schedules", {
    cron,
    items,
    end_time: endTime,
  });

  const payload = await parseOxylabsResponse<{
    schedule_id?: unknown;
    next_run_at?: unknown;
  }>(body);

  const scheduleId = asIdString(payload.schedule_id);

  if (!scheduleId) {
    throw new OxylabsError(
      "upstream_error",
      "Oxylabs did not return a schedule_id for the created schedule."
    );
  }

  return {
    scheduleId,
    nextRunAt: typeof payload.next_run_at === "string" ? payload.next_run_at : null,
  };
}

export async function listOxylabsScheduleIds(): Promise<string[]> {
  const response = await schedulerRequest("GET", "/schedules");
  const payload = await parseOxylabsResponse<{ schedules?: unknown }>(response);

  if (!Array.isArray(payload.schedules)) {
    return [];
  }

  return payload.schedules
    .map((entry) => asIdString(entry))
    .filter((id): id is string => id !== null);
}

export async function getScheduleRuns(scheduleId: string): Promise<ScheduleRun[]> {
  const response = await schedulerRequest("GET", `/schedules/${scheduleId}/runs`);
  const payload = await parseOxylabsResponse<{ runs?: unknown }>(response);

  if (!Array.isArray(payload.runs)) {
    return [];
  }

  return payload.runs.map((entry) => toScheduleRun(entry));
}

export async function setScheduleActive(scheduleId: string, active: boolean): Promise<void> {
  // Returns 202 with an empty body; nothing to parse.
  await schedulerRequest("PUT", `/schedules/${scheduleId}/state`, { active });
}

/**
 * Fetch a completed job's stored HTML. The results payload carries no
 * large-integer IDs we depend on, so plain `response.json()` is safe here.
 */
export async function fetchJobResultHtml(jobId: string): Promise<string> {
  const response = await schedulerRequest("GET", `/queries/${jobId}/results`);
  const payload: unknown = await response.json();
  const html = extractResultContent(payload);

  if (!html || html.trim().length === 0) {
    throw new OxylabsError("empty_content", `Oxylabs job ${jobId} returned empty content.`);
  }

  return html;
}

async function schedulerRequest(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: Record<string, unknown>
): Promise<Response> {
  const authorization = buildAuthorizationHeader();

  let response: Response;

  try {
    response = await fetch(`${SCHEDULER_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: authorization,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(OXYLABS_REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw toOxylabsError(error);
  }

  if (!response.ok) {
    throw new OxylabsError(
      mapStatusToCode(response.status),
      `Oxylabs Scheduler responded with HTTP ${response.status} for ${method} ${path}.`,
      response.status
    );
  }

  return response;
}

function toScheduleRun(entry: unknown): ScheduleRun {
  if (typeof entry !== "object" || entry === null) {
    return { runId: "", jobs: [] };
  }

  const record = entry as { run_id?: unknown; id?: unknown; jobs?: unknown };
  const runId = asIdString(record.run_id) ?? asIdString(record.id) ?? "";

  if (!Array.isArray(record.jobs)) {
    return { runId, jobs: [] };
  }

  const jobs = record.jobs
    .map((job) => toScheduleJob(job))
    .filter((job): job is ScheduleJob => job !== null);

  return { runId, jobs };
}

function toScheduleJob(entry: unknown): ScheduleJob | null {
  if (typeof entry !== "object" || entry === null) {
    return null;
  }

  const record = entry as {
    id?: unknown;
    result_status?: unknown;
    created_at?: unknown;
    result_created_at?: unknown;
  };

  const id = asIdString(record.id);

  if (!id) {
    return null;
  }

  return {
    id,
    resultStatus: typeof record.result_status === "string" ? record.result_status : null,
    createdAt: typeof record.created_at === "string" ? record.created_at : null,
    resultCreatedAt:
      typeof record.result_created_at === "string" ? record.result_created_at : null,
  };
}

/**
 * IDs arrive as strings thanks to `precise-json.ts`. A number here means the
 * quoting missed it, and its digits are already unreliable — reject rather than
 * store a corrupted ID.
 */
function asIdString(value: unknown): string | null {
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return value.trim();
  }

  return null;
}

function extractResultContent(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null || !("results" in payload)) {
    return null;
  }

  const { results } = payload as { results: unknown };

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const [first] = results as { content?: unknown }[];

  return typeof first?.content === "string" ? first.content : null;
}
