"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  X,
  Compass,
  Sparkles,
  Globe,
  Bookmark,
  CreditCard,
  Info,
  SlidersHorizontal,
  Building2,
  ArrowRight,
  Clock,
  Trash2,
  Loader2,
  CornerDownLeft,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { SearchArticleResult, SearchSourceResult, SearchApiResponse } from "@/app/api/search/route";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

interface PaletteActionItem {
  id: string;
  type: "nav" | "bias" | "source" | "article" | "search-home";
  title: string;
  subtitle?: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  biasLabel?: string;
  sentimentLabel?: string;
  imageUrl?: string;
  sourceName?: string;
}

const QUICK_NAV_ITEMS: PaletteActionItem[] = [
  { id: "nav-home", type: "nav", title: "Home Feed", subtitle: "Latest balanced news stories", href: "/", icon: Compass },
  { id: "nav-for-you", type: "nav", title: "For You Feed", subtitle: "Personalized intelligence & echo-chamber shield", href: "/for-you", icon: Sparkles, badge: "New" },
  { id: "nav-blindspot", type: "nav", title: "Blindspot Feed", subtitle: "Cross-spectrum perspective divergence", href: "/blindspot", icon: Globe },
  { id: "nav-saved", type: "nav", title: "Saved Articles", subtitle: "Personal reading diet & bookmarks", href: "/saved", icon: Bookmark },
  { id: "nav-pricing", type: "nav", title: "Pricing & Plans", subtitle: "Upgrade to Pixca Pro Intelligence", href: "/pricing", icon: CreditCard, badge: "Pro" },
  { id: "nav-about", type: "nav", title: "About & Methodology", subtitle: "AI bias detection transparency", href: "/about", icon: Info },
];

const PERSPECTIVE_ITEMS: PaletteActionItem[] = [
  { id: "bias-left", type: "bias", title: "Left-Leaning Coverage", subtitle: "Articles with progressive editorial framing", href: "/?bias=left", icon: SlidersHorizontal, badge: "Left" },
  { id: "bias-center", type: "bias", title: "Centrist & Balanced Ground", subtitle: "Neutral, multi-perspective reporting", href: "/?bias=center", icon: SlidersHorizontal, badge: "Center" },
  { id: "bias-right", type: "bias", title: "Right-Leaning Coverage", subtitle: "Articles with conservative editorial framing", href: "/?bias=right", icon: SlidersHorizontal, badge: "Right" },
];

export function CommandPalette({
  isOpen,
  onClose,
  recentSearches,
  addRecentSearch,
  clearRecentSearches,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [isMounted, setIsMounted] = React.useState(isOpen);
  const [isLoading, setIsLoading] = React.useState(false);
  const [articles, setArticles] = React.useState<SearchArticleResult[]>([]);
  const [sources, setSources] = React.useState<SearchSourceResult[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Focus input on mount
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced Search API query
  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data: SearchApiResponse = await res.json();
          setArticles(data.articles || []);
          setSources(data.sources || []);
          setSelectedIndex(0);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("[CommandPalette] search fetch failed:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  // Build active items list for keyboard navigation
  const activeItems: PaletteActionItem[] = React.useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return [...QUICK_NAV_ITEMS, ...PERSPECTIVE_ITEMS];
    }

    const items: PaletteActionItem[] = [];

    // Fallback: search query on home page
    items.push({
      id: "search-home",
      type: "search-home",
      title: `Search "${trimmed}" on Home Feed`,
      subtitle: "Filter all articles by keyword",
      href: `/?q=${encodeURIComponent(trimmed)}`,
      icon: Search,
    });

    // Sources matching
    sources.forEach((src) => {
      items.push({
        id: `source-${src.id}`,
        type: "source",
        title: src.name,
        subtitle: "Publisher filter",
        href: `/?source=${encodeURIComponent(src.name)}`,
        icon: Building2,
      });
    });

    // Articles matching
    articles.forEach((art) => {
      items.push({
        id: `art-${art.id}`,
        type: "article",
        title: art.title,
        subtitle: art.analysis?.summary || (art.published_at ? new Date(art.published_at).toLocaleDateString() : undefined),
        href: `/article/${art.id}`,
        biasLabel: art.analysis?.bias_label,
        sentimentLabel: art.analysis?.sentiment_label,
        imageUrl: art.image_url,
        sourceName: art.source?.name,
      });
    });

    return items;
  }, [query, sources, articles]);

  // Navigate handler
  const handleSelect = React.useCallback(
    (item: PaletteActionItem) => {
      if (query.trim()) {
        addRecentSearch(query.trim());
      }
      onClose();
      router.push(item.href);
    },
    [query, addRecentSearch, onClose, router]
  );

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (activeItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % activeItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = activeItems[selectedIndex];
      if (current) {
        handleSelect(current);
      }
    }
  };

  // Scroll active item into view
  React.useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // GSAP animation
  useGSAP(
    () => {
      if (!isMounted || !containerRef.current || !dialogRef.current || !backdropRef.current) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (isOpen) {
          gsap.fromTo(
            backdropRef.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15, ease: "power2.out" }
          );
          gsap.fromTo(
            dialogRef.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.15, ease: "power2.out" }
          );
        } else {
          gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.1, ease: "power2.in" });
          gsap.to(dialogRef.current, {
            autoAlpha: 0,
            duration: 0.1,
            ease: "power2.in",
            onComplete: () => setIsMounted(false),
          });
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (isOpen) {
          gsap.fromTo(
            backdropRef.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.25, ease: "power2.out" }
          );
          gsap.fromTo(
            dialogRef.current,
            { autoAlpha: 0, y: -16, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: "back.out(1.2)" }
          );
        } else {
          gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.2, ease: "power2.in" });
          gsap.to(dialogRef.current, {
            autoAlpha: 0,
            y: -10,
            scale: 0.97,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => setIsMounted(false),
          });
        }
      });

      return () => mm.revert();
    },
    { dependencies: [isOpen, isMounted], scope: containerRef }
  );

  if (!isMounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette & Search"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
      />

      {/* Palette Modal */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl bg-white dark:bg-[#131316] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
      >
        {/* Search Header Bar */}
        <div className="flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-zinc-200 dark:border-zinc-800 gap-2.5 sm:gap-3 min-w-0">
          <div className="text-zinc-400 dark:text-zinc-500 shrink-0">
            {isLoading ? (
              <Loader2 className="h-4.5 w-4.5 sm:h-5 sm:w-5 animate-spin text-blue-500" />
            ) : (
              <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search news, topics, perspectives..."
            className="flex-1 min-w-0 bg-transparent text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none placeholder:truncate"
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setArticles([]);
                setSources([]);
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md shrink-0">
            ESC
          </kbd>
        </div>

        {/* Scrollable Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-4">
          {/* Recent Searches (when query is empty and recent searches exist) */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="px-2 pt-1">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Search className="h-3 w-3 opacity-60" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation Section (when query is empty) */}
          {!query.trim() && (
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Navigation & Views
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {QUICK_NAV_ITEMS.map((item, idx) => {
                  const Icon = item.icon || Compass;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer w-full",
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg shrink-0",
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{item.title}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded-sm",
                                item.badge === "New"
                                   ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                   : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Perspective Filters (when query is empty) */}
          {!query.trim() && (
            <div className="space-y-1 pt-1">
              <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Editorial Perspective Filters
              </div>
              <div className="space-y-1">
                {PERSPECTIVE_ITEMS.map((item, idx) => {
                  const actualIdx = QUICK_NAV_ITEMS.length + idx;
                  const isSelected = selectedIndex === actualIdx;
                  return (
                    <button
                      key={item.id}
                      data-index={actualIdx}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(actualIdx)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer w-full",
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full shrink-0",
                            item.badge === "Left"
                              ? "bg-blue-600"
                              : item.badge === "Right"
                              ? "bg-red-600"
                              : "bg-purple-600"
                          )}
                        />
                        <div>
                          <div className="text-xs font-bold">{item.title}</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Query Results (when query is active) */}
          {query.trim() && (
            <div className="space-y-2">
              {/* Fallback Search Action */}
              <button
                data-index={0}
                type="button"
                onClick={() => handleSelect(activeItems[0])}
                onMouseEnter={() => setSelectedIndex(0)}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer w-full border border-blue-500/20 gap-2",
                  selectedIndex === 0
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "bg-blue-500/5 text-zinc-800 dark:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Search className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-bold truncate">Search &ldquo;{query.trim()}&rdquo; on Home Feed</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0">
                  <span className="hidden sm:inline">Enter</span>
                  <CornerDownLeft className="h-3 w-3" />
                </div>
              </button>

              {/* Publisher Sources Section */}
              {sources.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Publishers & Sources
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {sources.map((src) => {
                      const itemIdx = activeItems.findIndex((it) => it.id === `source-${src.id}`);
                      const isSelected = selectedIndex === itemIdx;
                      return (
                        <button
                          key={src.id}
                          data-index={itemIdx}
                          type="button"
                          onClick={() => itemIdx >= 0 && handleSelect(activeItems[itemIdx])}
                          onMouseEnter={() => itemIdx >= 0 && setSelectedIndex(itemIdx)}
                          className={cn(
                            "flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer w-full",
                            isSelected
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          )}
                        >
                          <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {src.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">{src.name}</div>
                            <div className="text-[10px] text-zinc-400">Filter news by this source</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Articles Section */}
              {articles.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Matching Stories ({articles.length})
                  </div>
                  <div className="space-y-1">
                    {articles.map((art) => {
                      const itemIdx = activeItems.findIndex((it) => it.id === `art-${art.id}`);
                      const isSelected = selectedIndex === itemIdx;
                      const bias = art.analysis?.bias_label || "unclear";

                      return (
                        <button
                          key={art.id}
                          data-index={itemIdx}
                          type="button"
                          onClick={() => itemIdx >= 0 && handleSelect(activeItems[itemIdx])}
                          onMouseEnter={() => itemIdx >= 0 && setSelectedIndex(itemIdx)}
                          className={cn(
                            "flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer w-full",
                            isSelected
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          )}
                        >
                          {art.image_url ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                              <Image
                                src={art.image_url}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                              <Compass className="h-5 w-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {art.source?.name && (
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                  {art.source.name}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide",
                                  bias === "left" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                                  bias === "right" && "bg-red-500/15 text-red-600 dark:text-red-400",
                                  bias === "center" && "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                                  (bias === "mixed" || bias === "unclear") && "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                                )}
                              >
                                {bias}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold leading-snug line-clamp-1 text-zinc-900 dark:text-zinc-100">
                              {art.title}
                            </h4>
                            {art.analysis?.summary && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                {art.analysis.summary}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No results message */}
              {!isLoading && articles.length === 0 && sources.length === 0 && (
                <div className="py-8 text-center px-4 space-y-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No articles or sources found matching &ldquo;{query}&rdquo;.
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Try searching with broader terms or browse the feeds.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper Bar */}
        <div className="px-3 sm:px-4 py-2 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 min-w-0 gap-2">
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">↑</kbd>
              <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <div className="flex sm:hidden items-center gap-1 text-[10px] text-zinc-400 shrink-0">
            <span>Tap item to open</span>
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap shrink-0">
            Pixca Intelligence Search
          </span>
        </div>
      </div>
    </div>
  );
}
