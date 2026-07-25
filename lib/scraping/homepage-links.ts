// Homepage article link extraction (AGENTS.md section 11).
//
// Only visible story/article card links are collected. Navigation, headers,
// footers, sidebars, and menus are removed from the DOM before extraction, and
// every surviving link is checked against the non-article reject list.

import * as cheerio from "cheerio";
import { MAX_CANDIDATES_PER_HOMEPAGE } from "@/lib/config/limits";
import { matchesRejectList } from "@/lib/scraping/reject-list";
import { isSameSourceHost, normalizeUrl } from "@/lib/scraping/url";

/** Chrome that never contains story cards — dropped before any link is read. */
const CHROME_SELECTORS = [
  "nav",
  "header",
  "footer",
  "aside",
  "script",
  "style",
  "noscript",
  "form",
  "[role='navigation']",
  "[role='banner']",
  "[role='contentinfo']",
  "[role='search']",
  "[aria-hidden='true']",
  "[hidden]",
  ".nav",
  ".navigation",
  ".navbar",
  ".menu",
  ".site-header",
  ".site-footer",
  ".global-header",
  ".global-footer",
  ".breadcrumb",
  ".breadcrumbs",
  ".social",
  ".share",
  ".newsletter",
  ".subscribe",
  ".advertisement",
  ".ad",
  ".ads",
  ".promo",
  ".sponsored",
].join(", ");

/**
 * Containers that typically wrap a story card. Links inside these are preferred;
 * if none match we fall back to headline-shaped anchors in the main content.
 */
const STORY_CARD_SELECTORS = [
  "article a[href]",
  "[data-testid*='card' i] a[href]",
  "[data-testid*='story' i] a[href]",
  "[class*='story-card' i] a[href]",
  "[class*='storycard' i] a[href]",
  "[class*='media-object' i] a[href]",
  "[class*='promo' i] a[href]",
  "[class*='teaser' i] a[href]",
  "[class*='headline' i] a[href]",
  "[class*='article-card' i] a[href]",
  "[class*='card' i] a[href]",
  "[class*='item-title' i] a[href]",
  "li.title a[href]",
  "h1 a[href]",
  "h2 a[href]",
  "h3 a[href]",
  "h4 a[href]",
  // The Guardian (and other DCR-style sites) invert the usual nesting: the
  // anchor wraps the heading rather than sitting inside it, and card classes
  // are obfuscated hashes. Match the anchor-wraps-heading shape and the
  // explicit link-name attribute instead.
  "a[href]:has(h1)",
  "a[href]:has(h2)",
  "a[href]:has(h3)",
  "a[href]:has(h4)",
  "a[data-link-name][href]",
  "[data-link-name] a[href]",
].join(", ");

export type HomepageExtraction = {
  /** Normalized, deduped, reject-list-cleared candidate URLs, page order preserved. */
  candidates: string[];
  /** Links seen before reject-list filtering — used for run logging. */
  linksSeen: number;
  /** Links dropped by the non-article reject list, grouped by reason. */
  rejected: Array<{ url: string; reason: string }>;
};

/**
 * Extract candidate article URLs from a source homepage. Never crawls — this
 * only reads anchors already present in the given HTML (section 9 step 3).
 */
export function extractHomepageCandidates(html: string, homepageUrl: string): HomepageExtraction {
  const $ = cheerio.load(html);

  $(CHROME_SELECTORS).remove();

  const hrefs = new Set<string>();

  $(STORY_CARD_SELECTORS).each((_index, element) => {
    const href = $(element).attr("href");
    if (href) {
      hrefs.add(href);
    }
  });

  const seen = new Set<string>();
  const candidates: string[] = [];
  const rejected: Array<{ url: string; reason: string }> = [];

  for (const href of hrefs) {
    const normalized = normalizeUrl(href, homepageUrl);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    if (!isSameSourceHost(normalized, homepageUrl)) {
      rejected.push({ url: normalized, reason: "off-site link" });
      continue;
    }

    const match = matchesRejectList(normalized);

    if (match.rejected) {
      rejected.push({ url: normalized, reason: match.detail ?? "non-article page" });
      continue;
    }

    candidates.push(normalized);

    if (candidates.length >= MAX_CANDIDATES_PER_HOMEPAGE) {
      break;
    }
  }

  return { candidates, linksSeen: seen.size, rejected };
}
