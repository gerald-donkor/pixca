// Candidate URL filtering (AGENTS.md section 12).
//
// Runs after the non-article reject list and before any detail page is
// scraped. A candidate is kept only when it looks like a real article detail
// URL for that source. When the check is uncertain, reject.

import { matchesRejectList } from "@/lib/scraping/reject-list";
import { getHost, getPathSegments, getPathname } from "@/lib/scraping/url";

export type CandidateDecision =
  | { keep: true }
  | { keep: false; reason: string };

type SourceRule = {
  /** Matched against `sources.parser_strategy` first, then the host. */
  keys: string[];
  isArticleUrl: (url: string) => boolean;
};

/** `/2025/01/15/...` or `/2025/jan/15/...` anywhere in the path. */
const DATE_PATH_PATTERN = /\/(19|20)\d{2}\/(\d{1,2}|[a-z]{3})\/\d{1,2}\//i;

/** Reuters trailing date stamp, e.g. `...-tariffs-2025-01-15`. */
const REUTERS_DATED_SLUG_PATTERN = /-(19|20)\d{2}-\d{2}-\d{2}$/;

/** BBC story ids, e.g. `/news/articles/c8rl2v9x1n4o` or `/news/world-us-canada-68123456`. */
const BBC_ARTICLE_PATTERN = /^\/news\/(articles\/[a-z0-9]{8,}|[a-z]+(-[a-z]+)*-\d{6,})$/i;

/**
 * A story id segment: either a bare numeric id, or one of NPR's prefixed ids.
 * NPR uses several prefixes in parallel — `nx-s1-5905783`, `g-s1-135417` — so
 * the prefix is matched generically rather than hardcoded to `nx-s1-`.
 */
const STORY_ID_PATTERN = /^([a-z]{1,4}-s\d+-)?\d{5,}$/i;

const SOURCE_RULES: SourceRule[] = [
  {
    keys: ["reuters", "reuters.com"],
    isArticleUrl: (url) => {
      const segments = getPathSegments(url);
      return segments.length >= 2 && REUTERS_DATED_SLUG_PATTERN.test(segments[segments.length - 1]);
    },
  },
  {
    keys: ["npr", "npr.org"],
    isArticleUrl: (url) => {
      const segments = getPathSegments(url);
      // /2025/01/15/nx-s1-5236812/slug
      return (
        segments.length >= 4 &&
        /^(19|20)\d{2}$/.test(segments[0]) &&
        /^\d{1,2}$/.test(segments[1]) &&
        /^\d{1,2}$/.test(segments[2]) &&
        STORY_ID_PATTERN.test(segments[3])
      );
    },
  },
  {
    keys: ["foxnews", "foxnews.com"],
    isArticleUrl: (url) => {
      const segments = getPathSegments(url);
      return segments.length >= 2 && isLongSlug(segments[segments.length - 1]);
    },
  },
  {
    keys: ["bbc", "bbc.com", "bbc.co.uk"],
    isArticleUrl: (url) => BBC_ARTICLE_PATTERN.test(getPathname(url)),
  },
  {
    keys: ["guardian", "theguardian.com"],
    isArticleUrl: (url) => {
      const segments = getPathSegments(url);
      // A `/section/YYYY/mon/DD/slug` path is already strong evidence on its
      // own. Requiring a long slug on top of it rejected genuine breaking news
      // ("trump-european-union-tariffs" is only 28 chars) while keeping longer
      // feature slugs — a bias against exactly the stories we most want.
      return (
        segments.length >= 5 &&
        DATE_PATH_PATTERN.test(getPathname(url)) &&
        countSlugWords(segments[segments.length - 1]) >= 3
      );
    },
  },
];

/**
 * Decide whether a normalized candidate URL should be scraped as an article
 * detail page. `parserStrategy` comes from `sources.parser_strategy` and, when
 * set, wins over host matching.
 */
export function isArticleCandidate(url: string, parserStrategy: string | null): CandidateDecision {
  const rejectMatch = matchesRejectList(url);

  if (rejectMatch.rejected) {
    return { keep: false, reason: rejectMatch.detail ?? "non-article page" };
  }

  const segments = getPathSegments(url);

  if (segments.length === 0) {
    return { keep: false, reason: "homepage-like URL" };
  }

  const rule = findSourceRule(url, parserStrategy);

  if (rule) {
    return rule.isArticleUrl(url)
      ? { keep: true }
      : { keep: false, reason: "does not match source article URL pattern" };
  }

  return matchesGenericArticleShape(url)
    ? { keep: true }
    : { keep: false, reason: "no article URL signal (uncertain, rejected)" };
}

function findSourceRule(url: string, parserStrategy: string | null): SourceRule | null {
  if (parserStrategy) {
    const strategy = parserStrategy.trim().toLowerCase();
    const byStrategy = SOURCE_RULES.find((rule) => rule.keys.includes(strategy));

    if (byStrategy) {
      return byStrategy;
    }
  }

  const host = getHost(url);

  if (!host) {
    return null;
  }

  return (
    SOURCE_RULES.find((rule) =>
      rule.keys.some((key) => host === key || host.endsWith(`.${key}`))
    ) ?? null
  );
}

/**
 * Generic article-URL heuristics for sources without a specific rule: a date
 * path, a numeric story id, a trailing date stamp, or a long story slug.
 */
function matchesGenericArticleShape(url: string): boolean {
  const pathname = getPathname(url);
  const segments = getPathSegments(url);
  const lastSegment = segments[segments.length - 1];

  if (DATE_PATH_PATTERN.test(pathname)) {
    return true;
  }

  if (REUTERS_DATED_SLUG_PATTERN.test(lastSegment)) {
    return true;
  }

  if (segments.length >= 2 && segments.some((segment) => STORY_ID_PATTERN.test(segment))) {
    return true;
  }

  return segments.length >= 2 && isLongSlug(lastSegment);
}

/** A story slug: several hyphenated words, long enough not to be a section name. */
function isLongSlug(segment: string): boolean {
  const withoutExtension = segment.replace(/\.(html?|php|aspx)$/i, "");

  return countSlugWords(segment) >= 4 && withoutExtension.length >= 30;
}

function countSlugWords(segment: string): number {
  return segment
    .replace(/\.(html?|php|aspx)$/i, "")
    .split("-")
    .filter((word) => word.length > 0).length;
}
