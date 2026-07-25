// The **non-article reject list** (AGENTS.md section 9) expressed as URL
// segment / prefix rules. Defined once and used by both homepage extraction
// (section 11) and candidate filtering (section 12). When section 9's list
// changes, change it here too.

import { getPathSegments, getPathname } from "@/lib/scraping/url";

/**
 * Path segments that mark a page as a listing, hub, or non-news page whenever
 * they appear anywhere in the path.
 */
const REJECTED_SEGMENTS = new Set([
  // category / section / topic / tag hubs
  "section",
  "sections",
  "category",
  "categories",
  "topic",
  "topics",
  "tag",
  "tags",
  "index",
  "archive",
  "archives",
  "latest",
  "trending",
  // author pages
  "author",
  "authors",
  "byline",
  "profile",
  "profiles",
  "people",
  "staff",
  "contributors",
  // search
  "search",
  "results",
  // shows / programs / podcasts / video hubs
  "show",
  "shows",
  "program",
  "programs",
  "programmes",
  "podcast",
  "podcasts",
  "episode",
  "episodes",
  "series",
  "shortcuts",
  "watch",
  "listen",
  "radio",
  "audio",
  "player",
  "tv",
  // live pages
  "live",
  "livenow",
  "live-news",
  "liveblog",
  "live-blog",
  "livestream",
  "liveblogs",
  // games / puzzles
  "game",
  "games",
  "puzzle",
  "puzzles",
  "crossword",
  "crosswords",
  "quiz",
  "quizzes",
  "wordle",
  "sudoku",
  // product / review / shopping
  "shop",
  "shopping",
  "store",
  "deals",
  "coupons",
  "product",
  "products",
  "reviews",
  "buying-guides",
  "recommends",
  "picks",
  "thefilter",
  "thefilter-us",
  // corporate / support / legal
  "about",
  "about-us",
  "contact",
  "contact-us",
  "careers",
  "jobs",
  "help",
  "support",
  "faq",
  "legal",
  "terms",
  "privacy",
  "cookies",
  "cookie-policy",
  "accessibility",
  "advertise",
  "advertising",
  "press",
  "corporate",
  "investors",
  "sitemap",
  "info",
  "editorial-standards",
  // newsletter / subscription / account
  "newsletter",
  "newsletters",
  "subscribe",
  "subscription",
  "subscriptions",
  "signup",
  "sign-up",
  "signin",
  "sign-in",
  "login",
  "register",
  "account",
  "myaccount",
  "membership",
  "donate",
  "give",
  "support-us",
  "gift",
  "premium",
  "plus",
  "pro",
  "apps",
  "app",
  "feedback",
  "rss",
  "weather",
]);

/** Path prefixes that are never article detail pages regardless of what follows. */
const REJECTED_PATH_PREFIXES = [
  "/search",
  "/sections",
  "/series",
  "/podcasts",
  "/programmes",
  "/shows",
  "/games",
  "/live",
  "/newsletters",
  "/subscribe",
  "/account",
  "/tag",
  "/tags",
  "/topic",
  "/topics",
  "/author",
  "/authors",
  "/profile",
  "/video-hub",
  "/static",
  "/assets",
  "/sport",
  "/sports",
];

/** File extensions that are assets, feeds, or documents rather than articles. */
const REJECTED_EXTENSIONS = [
  ".pdf",
  ".xml",
  ".json",
  ".rss",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".mp3",
  ".mp4",
  ".zip",
];

export type RejectListMatch = {
  rejected: boolean;
  /** Human-readable reason for run logging; null when not rejected. */
  detail: string | null;
};

/**
 * True when the URL matches the non-article reject list. Applied before any
 * detail scrape (section 9 step 4) and again during candidate filtering.
 */
export function matchesRejectList(url: string): RejectListMatch {
  const pathname = getPathname(url).toLowerCase();

  if (pathname === "" || pathname === "/") {
    return { rejected: true, detail: "homepage root" };
  }

  const extension = REJECTED_EXTENSIONS.find((ext) => pathname.endsWith(ext));
  if (extension) {
    return { rejected: true, detail: `asset extension ${extension}` };
  }

  const prefix = REJECTED_PATH_PREFIXES.find(
    (candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`)
  );
  if (prefix) {
    return { rejected: true, detail: `rejected path prefix ${prefix}` };
  }

  const segments = getPathSegments(url).map((segment) => segment.toLowerCase());
  const rejectedSegment = segments.find((segment) => REJECTED_SEGMENTS.has(segment));
  if (rejectedSegment) {
    return { rejected: true, detail: `rejected path segment "${rejectedSegment}"` };
  }

  return { rejected: false, detail: null };
}

/**
 * Title-side companion to the URL reject list — catches pages whose URL looked
 * article-like but whose title is a section, show, or corporate page name
 * (section 13).
 */
const REJECTED_TITLE_PATTERNS: RegExp[] = [
  /^(home|homepage|latest news|breaking news|top stories|news)$/i,
  /^(world|us|uk|business|politics|technology|tech|sport|sports|health|science|entertainment|opinion|climate|culture)( news)?$/i,
  /\b(live updates|live blog|liveblog|live coverage)\b/i,
  /\b(newsletter|subscribe|subscription|sign in|sign up|log in)\b/i,
  /\b(privacy policy|terms of (use|service)|cookie policy|accessibility statement)\b/i,
  /\b(podcast|episodes?|full episodes|watch live|listen live)\b/i,
  /\b(crossword|sudoku|wordle|puzzles?|quiz)\b/i,
  /^page not found$/i,
  /^(403|404|error)\b/i,
];

export function isGenericTitle(title: string): boolean {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return true;
  }

  return REJECTED_TITLE_PATTERNS.some((pattern) => pattern.test(trimmed));
}
