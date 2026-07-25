// The **article content gate** (AGENTS.md sections 9 and 13).
//
// A parsed detail page is accepted only when it has an article-specific URL and
// title, one clear subject, a meaningful body, an image URL, and a published
// date. Body quality passes on >= 3 meaningful paragraphs OR >= 900 meaningful
// characters. A page is never rejected purely because paragraph extraction
// returned one paragraph — the parser splits first.

import {
  MIN_MEANINGFUL_CHARACTERS,
  MIN_MEANINGFUL_PARAGRAPHS,
  MIN_TITLE_CHARACTERS,
} from "@/lib/config/limits";
import type { ParsedArticle } from "@/lib/scraping/article-parser";
import { isGenericTitle, matchesRejectList } from "@/lib/scraping/reject-list";
import { isSameSourceHost } from "@/lib/scraping/url";

export type RejectionReason =
  | "missing_title"
  | "generic_title"
  | "missing_image"
  | "missing_published_date"
  | "missing_body"
  | "thin_body"
  | "non_article_canonical"
  | "canonical_off_site"
  | "no_clear_subject";

export type ValidatedArticle = {
  title: string;
  canonicalUrl: string;
  imageUrl: string;
  publishedAt: string;
  rawText: string;
};

export type ValidationResult =
  | { ok: true; article: ValidatedArticle }
  | { ok: false; reason: RejectionReason };

export function validateParsedArticle(
  parsed: ParsedArticle,
  originalUrl: string
): ValidationResult {
  if (!parsed.title) {
    return { ok: false, reason: "missing_title" };
  }

  const title = parsed.title.trim();

  if (title.length < MIN_TITLE_CHARACTERS) {
    return { ok: false, reason: "generic_title" };
  }

  if (isGenericTitle(title)) {
    return { ok: false, reason: "generic_title" };
  }

  if (!parsed.imageUrl) {
    return { ok: false, reason: "missing_image" };
  }

  if (!parsed.publishedAt) {
    return { ok: false, reason: "missing_published_date" };
  }

  // `canonical_url` is NOT NULL in the schema; fall back to the original URL
  // when the page declares no canonical link.
  const canonicalUrl = parsed.canonicalUrl ?? originalUrl;

  if (!isSameSourceHost(canonicalUrl, originalUrl)) {
    return { ok: false, reason: "canonical_off_site" };
  }

  if (matchesRejectList(canonicalUrl).rejected) {
    return { ok: false, reason: "non_article_canonical" };
  }

  const rawText = parsed.rawText.trim();

  if (parsed.paragraphs.length === 0 || rawText.length === 0) {
    return { ok: false, reason: "missing_body" };
  }

  const meaningfulCharacters = rawText.length;
  const bodyPasses =
    parsed.paragraphs.length >= MIN_MEANINGFUL_PARAGRAPHS ||
    meaningfulCharacters >= MIN_MEANINGFUL_CHARACTERS;

  if (!bodyPasses) {
    return { ok: false, reason: "thin_body" };
  }

  if (!hasClearSubject(title, parsed.paragraphs)) {
    return { ok: false, reason: "no_clear_subject" };
  }

  return {
    ok: true,
    article: {
      title,
      canonicalUrl,
      imageUrl: parsed.imageUrl,
      publishedAt: parsed.publishedAt,
      rawText,
    },
  };
}

/**
 * A listing page dressed up as an article reads as a pile of unrelated
 * headlines: many short blocks and no shared vocabulary with the title. Require
 * that the body either shares meaningful words with the title or contains
 * substantial prose.
 */
function hasClearSubject(title: string, paragraphs: string[]): boolean {
  const titleWords = new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9']+/i)
      .filter((word) => word.length >= 5)
  );

  const body = paragraphs.join(" ").toLowerCase();
  const overlap = [...titleWords].filter((word) => body.includes(word)).length;

  if (titleWords.size === 0) {
    // Nothing distinctive to match against — fall back to prose volume.
    return paragraphs.length >= MIN_MEANINGFUL_PARAGRAPHS;
  }

  if (overlap > 0) {
    return true;
  }

  const averageLength =
    paragraphs.reduce((total, paragraph) => total + paragraph.length, 0) / paragraphs.length;

  return averageLength >= 200;
}
