// URL normalization helpers shared by homepage extraction, candidate
// filtering, and dedupe. Pure functions — safe to import anywhere.

const TRACKING_PARAM_PREFIXES = ["utm_", "pk_", "mc_", "_hs"];

const TRACKING_PARAMS = new Set([
  "amp",
  "cmpid",
  "ex_cid",
  "fbclid",
  "gclid",
  "icid",
  "igshid",
  "intcmp",
  "ito",
  "mbid",
  "msclkid",
  "ns_campaign",
  "ns_mchannel",
  "ns_source",
  "at_medium",
  "at_campaign",
  "srnd",
  "taid",
  "twclid",
  "cmp",
  "ref",
  "referrer",
  "sh",
]);

/**
 * Absolutize against the page URL, drop the hash and tracking params, lowercase
 * the host, and strip a trailing slash. Returns null for anything that is not
 * an http(s) URL we could resolve.
 */
export function normalizeUrl(href: string, baseUrl: string): string | null {
  const raw = href.trim();

  if (raw.length === 0 || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(raw, baseUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  url.username = "";
  url.password = "";

  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase();
    const isTracking =
      TRACKING_PARAMS.has(lower) || TRACKING_PARAM_PREFIXES.some((prefix) => lower.startsWith(prefix));

    if (isTracking) {
      url.searchParams.delete(key);
    }
  }

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}

/** True when `candidateUrl` lives on the same registrable host as `sourceUrl` (www ignored). */
export function isSameSourceHost(candidateUrl: string, sourceUrl: string): boolean {
  const candidateHost = getHost(candidateUrl);
  const sourceHost = getHost(sourceUrl);

  if (!candidateHost || !sourceHost) {
    return false;
  }

  return candidateHost === sourceHost;
}

export function getHost(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function getPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

/** Path segments with empty entries removed, e.g. `/world/africa` -> ["world", "africa"]. */
export function getPathSegments(url: string): string[] {
  return getPathname(url)
    .split("/")
    .filter((segment) => segment.length > 0);
}
