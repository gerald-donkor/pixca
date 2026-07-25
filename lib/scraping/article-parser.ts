// Article detail page parsing and `raw_text` cleanup (AGENTS.md section 13).
//
// Extracts title, canonical URL, image, published date, and article body from
// a detail page. Body extraction removes page chrome, ads, newsletter and
// related-content blocks, and splits a single large paragraph into sentences
// so validation is never failed purely on paragraph count.

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import {
  MAX_RAW_TEXT_CHARACTERS,
  MIN_PARAGRAPH_CHARACTERS,
} from "@/lib/config/limits";
import { normalizeUrl } from "@/lib/scraping/url";

export type ParsedArticle = {
  title: string | null;
  canonicalUrl: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  paragraphs: string[];
  rawText: string;
};

/** Everything that is never part of the article body. */
const BODY_NOISE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "form",
  "nav",
  "header",
  "footer",
  "aside",
  "figcaption",
  "figure figcaption",
  "button",
  "[role='navigation']",
  "[role='banner']",
  "[role='contentinfo']",
  "[role='complementary']",
  "[aria-hidden='true']",
  "[hidden]",
  "[class*='newsletter' i]",
  "[class*='subscribe' i]",
  "[class*='subscription' i]",
  "[class*='signup' i]",
  "[class*='related' i]",
  "[class*='recirc' i]",
  "[class*='most-read' i]",
  "[class*='most-viewed' i]",
  "[class*='mostpopular' i]",
  "[class*='most-popular' i]",
  "[class*='trending' i]",
  "[class*='read-more' i]",
  "[class*='readmore' i]",
  "[class*='more-from' i]",
  "[class*='advert' i]",
  "[class*='sponsor' i]",
  "[class*='promo' i]",
  "[class*='social' i]",
  "[class*='share' i]",
  "[class*='comment' i]",
  "[class*='caption' i]",
  "[class*='byline' i]",
  "[class*='author-bio' i]",
  "[class*='tags' i]",
  "[class*='breadcrumb' i]",
  "[class*='cookie' i]",
  "[class*='paywall' i]",
  "[class*='disclaimer' i]",
  "[data-testid*='ad-' i]",
  "[data-component='ad-slot']",
].join(", ");

/** Preferred article body containers, most specific first. */
const BODY_CONTAINER_SELECTORS = [
  "article [data-testid='article-body']",
  "[data-testid='article-body']",
  "[data-component='text-block']",
  "div[data-gu-name='body']",
  "#article-body",
  ".article-body",
  ".article__body",
  ".articleBody",
  ".story-body",
  ".storytext",
  ".story-text",
  ".entry-content",
  ".post-content",
  "[itemprop='articleBody']",
  "article",
  "main",
];

/** Boilerplate lines dropped from the body regardless of where they appear. */
const BOILERPLATE_PATTERNS: RegExp[] = [
  /^(advertisement|advertising|sponsored( content)?)$/i,
  /^(share|share this|share on \w+|tweet|copy link|print|email this)$/i,
  /^(read more|load more|show more|see more|more stories|related stories|related coverage)\b/i,
  /^(sign up|subscribe|newsletter|get the newsletter)\b/i,
  /^(follow us|follow \w+ on)\b/i,
  /^(photo|image|picture|credit|caption|getty images|reuters|ap photo|file photo)[:\s]/i,
  /^(by\s+[\w.\- ]+)$/i,
  /^\d+ (min|minute|hour|day)s? (read|ago)$/i,
  /^(comments?|\d+ comments?)$/i,
  /^(cookies?|privacy|terms)\b.*\b(policy|settings)\b/i,
  /^(this (article|video|page) )?(is|was) (no longer available|not available)/i,
  /\{[^}]*\}/, // CSS/JS dumps that survived tag removal
  /^(function|var|const|let|window\.|document\.)\b/,
  /^\s*$/,
];

/**
 * Parse an article detail page. Returns raw findings only — accept/reject
 * decisions live in `lib/scraping/validate.ts`.
 */
export function parseArticlePage(html: string, pageUrl: string): ParsedArticle {
  const $ = cheerio.load(html);

  const title = extractTitle($);
  const canonicalUrl = extractCanonicalUrl($, pageUrl);
  const imageUrl = extractImageUrl($, pageUrl);
  const publishedAt = extractPublishedAt($);
  const paragraphs = extractParagraphs($);

  return {
    title,
    canonicalUrl,
    imageUrl,
    publishedAt,
    paragraphs,
    rawText: paragraphs.join("\n\n").slice(0, MAX_RAW_TEXT_CHARACTERS),
  };
}

// -- title -----------------------------------------------------------------

function extractTitle($: CheerioAPI): string | null {
  const candidates = [
    $("meta[property='og:title']").attr("content"),
    $("meta[name='twitter:title']").attr("content"),
    $("h1").first().text(),
    $("title").first().text(),
  ];

  for (const candidate of candidates) {
    const cleaned = cleanTitle(candidate);
    if (cleaned) {
      return cleaned;
    }
  }

  return null;
}

function cleanTitle(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  // Strip the trailing " | Source Name" / " - Source Name" suffix.
  const withoutSuffix = value.replace(/\s+[|–—-]\s+[^|–—-]{2,40}$/u, "");
  const collapsed = collapseWhitespace(withoutSuffix.length >= 15 ? withoutSuffix : value);

  return collapsed.length > 0 ? collapsed : null;
}

// -- canonical -------------------------------------------------------------

function extractCanonicalUrl($: CheerioAPI, pageUrl: string): string | null {
  const candidates = [
    $("link[rel='canonical']").attr("href"),
    $("meta[property='og:url']").attr("content"),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = normalizeUrl(candidate, pageUrl);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

// -- image -----------------------------------------------------------------

function extractImageUrl($: CheerioAPI, pageUrl: string): string | null {
  const metaCandidates = [
    $("meta[property='og:image']").attr("content"),
    $("meta[property='og:image:url']").attr("content"),
    $("meta[name='twitter:image']").attr("content"),
    $("meta[name='twitter:image:src']").attr("content"),
  ];

  for (const candidate of metaCandidates) {
    const normalized = candidate ? normalizeUrl(candidate, pageUrl) : null;
    if (normalized) {
      return normalized;
    }
  }

  const jsonLdImage = findInJsonLd($, (node) => {
    const value = node.image;
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (isRecord(value) && typeof value.url === "string") return value.url;
    return null;
  });

  if (jsonLdImage) {
    const normalized = normalizeUrl(jsonLdImage, pageUrl);
    if (normalized) {
      return normalized;
    }
  }

  const inlineSrc = $("article img[src], main img[src]").first().attr("src");
  return inlineSrc ? normalizeUrl(inlineSrc, pageUrl) : null;
}

// -- published date --------------------------------------------------------

function extractPublishedAt($: CheerioAPI): string | null {
  const metaCandidates = [
    $("meta[property='article:published_time']").attr("content"),
    $("meta[name='article:published_time']").attr("content"),
  ];

  for (const candidate of metaCandidates) {
    const parsed = parseDate(candidate);
    if (parsed) {
      return parsed;
    }
  }

  const jsonLdDate = findInJsonLd($, (node) =>
    typeof node.datePublished === "string" ? node.datePublished : null
  );

  const fromJsonLd = parseDate(jsonLdDate);
  if (fromJsonLd) {
    return fromJsonLd;
  }

  const fallbackMeta = [
    $("meta[name='date']").attr("content"),
    $("meta[name='pubdate']").attr("content"),
    $("meta[name='parsely-pub-date']").attr("content"),
    $("meta[name='DC.date.issued']").attr("content"),
    $("meta[itemprop='datePublished']").attr("content"),
  ];

  for (const candidate of fallbackMeta) {
    const parsed = parseDate(candidate);
    if (parsed) {
      return parsed;
    }
  }

  const timeAttr = $("time[datetime]").first().attr("datetime");
  return parseDate(timeAttr);
}

function parseDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value.trim());

  if (Number.isNaN(timestamp)) {
    return null;
  }

  const date = new Date(timestamp);
  const year = date.getUTCFullYear();

  // Guard against placeholder dates parsed out of unrelated markup.
  if (year < 1990 || date.getTime() > Date.now() + 48 * 60 * 60 * 1000) {
    return null;
  }

  return date.toISOString();
}

// -- body ------------------------------------------------------------------

function extractParagraphs($: CheerioAPI): string[] {
  $(BODY_NOISE_SELECTORS).remove();

  for (const selector of BODY_CONTAINER_SELECTORS) {
    const containers = $(selector);

    if (containers.length === 0) {
      continue;
    }

    // Collect across *every* matching container, not just the first. Sites like
    // BBC News wrap each paragraph in its own `data-component="text-block"`
    // div, so taking only the first container yields a single paragraph and
    // the article gets rejected as thin.
    const blocks: string[] = [];

    containers.each((_containerIndex, containerElement) => {
      const container = $(containerElement);
      const blockChildren = container.find("p, li, blockquote, h2, h3");

      if (blockChildren.length > 0) {
        blockChildren.each((_index, element) => {
          blocks.push(collapseWhitespace($(element).text()));
        });
        return;
      }

      // A container holding text directly, with no block descendants at all.
      blocks.push(collapseWhitespace(container.text()));
    });

    const paragraphs = cleanParagraphs(blocks);

    if (paragraphs.length > 0) {
      return ensureMultipleParagraphs(paragraphs);
    }

    // No block elements — the body may be one text node. Split it instead of
    // giving up (section 13: never reject solely on paragraph count).
    const fallback = cleanParagraphs(
      splitIntoSentenceGroups(collapseWhitespace(containers.first().text()))
    );

    if (fallback.length > 0) {
      return fallback;
    }
  }

  return [];
}

/**
 * If extraction produced a single large paragraph, split it on sentence
 * boundaries so the body can be judged on content, not markup shape.
 */
function ensureMultipleParagraphs(paragraphs: string[]): string[] {
  if (paragraphs.length > 1) {
    return paragraphs;
  }

  const [only] = paragraphs;

  if (only.length < MIN_PARAGRAPH_CHARACTERS * 4) {
    return paragraphs;
  }

  const split = cleanParagraphs(splitIntoSentenceGroups(only));

  return split.length > 1 ? split : paragraphs;
}

/** Group sentences into ~3-sentence paragraphs. */
function splitIntoSentenceGroups(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z"'“])/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  if (sentences.length <= 1) {
    return sentences;
  }

  const groups: string[] = [];

  for (let i = 0; i < sentences.length; i += 3) {
    groups.push(sentences.slice(i, i + 3).join(" "));
  }

  return groups;
}

/**
 * Drop boilerplate, short fragments, and duplicates so the stored text reads
 * like one article rather than a page dump.
 */
function cleanParagraphs(blocks: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const block of blocks) {
    const text = collapseWhitespace(block);

    if (text.length < MIN_PARAGRAPH_CHARACTERS) {
      continue;
    }

    if (BOILERPLATE_PATTERNS.some((pattern) => pattern.test(text))) {
      continue;
    }

    if (looksLikeCode(text)) {
      continue;
    }

    const key = text.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    cleaned.push(text);
  }

  return cleaned;
}

function looksLikeCode(text: string): boolean {
  const symbolCount = (text.match(/[{}<>;=]/g) ?? []).length;
  return symbolCount / text.length > 0.03;
}

// -- shared helpers --------------------------------------------------------

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Walk every JSON-LD block (including `@graph` arrays) and return the first
 * non-null value produced by `pick`.
 */
function findInJsonLd(
  $: CheerioAPI,
  pick: (node: Record<string, unknown>) => string | null
): string | null {
  const scripts = $("script[type='application/ld+json']").toArray();

  for (const script of scripts) {
    const raw = $(script).text().trim();

    if (raw.length === 0) {
      continue;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const found = walkJsonLd(parsed, pick);

    if (found) {
      return found;
    }
  }

  return null;
}

function walkJsonLd(
  node: unknown,
  pick: (node: Record<string, unknown>) => string | null,
  depth = 0
): string | null {
  if (depth > 5) {
    return null;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = walkJsonLd(item, pick, depth + 1);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (!isRecord(node)) {
    return null;
  }

  const picked = pick(node);

  if (picked) {
    return picked;
  }

  if ("@graph" in node) {
    return walkJsonLd(node["@graph"], pick, depth + 1);
  }

  return null;
}
