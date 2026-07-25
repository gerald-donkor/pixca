import "server-only";

import {
  OXYLABS_MAX_RETRIES,
  OXYLABS_REQUEST_TIMEOUT_MS,
  OXYLABS_RETRY_DELAY_MS,
} from "@/lib/config/limits";

const REALTIME_ENDPOINT = "https://realtime.oxylabs.io/v1/queries";

export type OxylabsErrorCode =
  | "missing_credentials"
  | "invalid_request"
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "upstream_error"
  | "timeout"
  | "empty_content";

export class OxylabsError extends Error {
  readonly code: OxylabsErrorCode;
  readonly httpStatus: number | null;

  constructor(code: OxylabsErrorCode, message: string, httpStatus: number | null = null) {
    super(message);
    this.name = "OxylabsError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

type OxylabsQueryPayload = {
  source: "universal";
  url: string;
  user_agent_type: "desktop_chrome";
  geo_location: string;
  /** Omitted unless the source opts in — see `lib/scraping/render-policy.ts`. */
  render?: "html";
};

export type FetchPageOptions = {
  /**
   * Request JavaScript rendering. Off by default: every configured source
   * server-renders its article text, and rendering returned body-less shells
   * for Fox News while also being slower and costlier.
   */
  render?: boolean;
};

type OxylabsResult = {
  content?: unknown;
  status_code?: unknown;
  url?: unknown;
};

/**
 * Fetch a page's rendered HTML through the Oxylabs Web Scraper API (Realtime,
 * `universal` source). Server-only: credentials never reach browser code.
 *
 * Retries once on 429 / 5xx / timeout. All other failures throw immediately
 * with a typed `OxylabsError` that carries no credentials or raw payload.
 */
export async function fetchPageHtml(
  url: string,
  options: FetchPageOptions = {}
): Promise<string> {
  const payload: OxylabsQueryPayload = {
    source: "universal",
    url,
    user_agent_type: "desktop_chrome",
    geo_location: "United States",
    ...(options.render ? { render: "html" as const } : {}),
  };

  const authorization = buildAuthorizationHeader();

  let lastError: OxylabsError | null = null;

  for (let attempt = 0; attempt <= OXYLABS_MAX_RETRIES; attempt += 1) {
    if (attempt > 0) {
      await delay(OXYLABS_RETRY_DELAY_MS);
      console.warn(`[oxylabs] retry ${attempt} for ${url} (${lastError?.code})`);
    }

    try {
      return await requestHtml(REALTIME_ENDPOINT, authorization, payload);
    } catch (error) {
      const oxylabsError = toOxylabsError(error);

      if (!isRetryable(oxylabsError)) {
        throw oxylabsError;
      }

      lastError = oxylabsError;
    }
  }

  throw lastError ?? new OxylabsError("upstream_error", "Oxylabs request failed.");
}

async function requestHtml(
  endpoint: string,
  authorization: string,
  payload: OxylabsQueryPayload
): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(OXYLABS_REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new OxylabsError(
      mapStatusToCode(response.status),
      `Oxylabs responded with HTTP ${response.status}.`,
      response.status
    );
  }

  const body: unknown = await response.json();
  const html = extractContent(body);

  if (!html || html.trim().length === 0) {
    throw new OxylabsError("empty_content", "Oxylabs returned an empty result.");
  }

  return html;
}

function extractContent(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("results" in body)) {
    return null;
  }

  const { results } = body as { results: unknown };

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const [first] = results as OxylabsResult[];

  return typeof first?.content === "string" ? first.content : null;
}

/**
 * Basic auth header from the server-only Oxylabs credentials. Shared with the
 * Scheduler client (`lib/oxylabs/scheduler.ts`) so credential handling lives in
 * exactly one place. Throws `missing_credentials` when unset.
 */
export function buildAuthorizationHeader(): string {
  const username = process.env.OXY_WSA_USERNAME;
  const password = process.env.OXY_WSA_PASSWORD;

  if (!username || !password) {
    throw new OxylabsError(
      "missing_credentials",
      "Missing OXY_WSA_USERNAME / OXY_WSA_PASSWORD environment variables."
    );
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

export function mapStatusToCode(status: number): OxylabsErrorCode {
  if (status === 400) return "invalid_request";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 429) return "rate_limited";
  return "upstream_error";
}

function isRetryable(error: OxylabsError): boolean {
  if (error.code === "rate_limited" || error.code === "timeout") {
    return true;
  }

  return error.code === "upstream_error" && (error.httpStatus === null || error.httpStatus >= 500);
}

export function toOxylabsError(error: unknown): OxylabsError {
  if (error instanceof OxylabsError) {
    return error;
  }

  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return new OxylabsError("timeout", "Oxylabs request timed out.");
  }

  return new OxylabsError("upstream_error", "Oxylabs request failed.");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
