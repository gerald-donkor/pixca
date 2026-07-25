// Per-source JavaScript rendering opt-in.
//
// Rendering is OFF by default. Every source currently configured serves its
// full article text server-side, verified by parsing raw (non-rendered) HTML
// from NPR, BBC News, Fox News, and The Guardian — all four produced complete
// article bodies. Requesting `render: "html"` from Oxylabs additionally
// returned body-less shells for Fox News detail pages, and rendered requests
// are slower and consume more Oxylabs credits.
//
// Add a host here only when a source is shown to need client-side rendering,
// i.e. its article text is genuinely absent from the raw HTML.

import { getHost } from "@/lib/scraping/url";

/** Hosts (without `www.`) whose pages must be fetched with rendering enabled. */
const RENDER_REQUIRED_HOSTS = new Set<string>([
  // intentionally empty — no configured source needs rendering
]);

export function sourceNeedsRender(url: string): boolean {
  const host = getHost(url);

  if (!host) {
    return false;
  }

  return [...RENDER_REQUIRED_HOSTS].some(
    (required) => host === required || host.endsWith(`.${required}`)
  );
}
