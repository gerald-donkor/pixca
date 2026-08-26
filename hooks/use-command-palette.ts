"use client";

import * as React from "react";

const STORAGE_KEY = "pixca-recent-searches";
const MAX_RECENT_SEARCHES = 6;
const CHANGE_EVENT = "pixca-command-palette-change";
const TOGGLE_EVENT = "pixca-command-palette-toggle";

let cachedRaw: string | null = null;
let cachedSearches: string[] = [];

function subscribeSearches(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSearchesSnapshot(): string[] {
  if (typeof window === "undefined") {
    return cachedSearches;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedSearches;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedSearches = [];
    } else {
      const parsed = JSON.parse(raw);
      cachedSearches = Array.isArray(parsed) ? parsed : [];
    }
    return cachedSearches;
  } catch {
    return cachedSearches;
  }
}

const SERVER_SEARCHES: string[] = [];
function getServerSnapshot(): string[] {
  return SERVER_SEARCHES;
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);
  const recentSearches = React.useSyncExternalStore(
    subscribeSearches,
    getSearchesSnapshot,
    getServerSnapshot
  );

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  // Listen for global custom toggle events across components
  React.useEffect(() => {
    const handleToggle = (e: CustomEvent<{ open?: boolean }>) => {
      if (e.detail?.open !== undefined) {
        setIsOpen(e.detail.open);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener(TOGGLE_EVENT as unknown as string, handleToggle as EventListener);
    return () => {
      window.removeEventListener(TOGGLE_EVENT as unknown as string, handleToggle as EventListener);
    };
  }, []);

  // Global keyboard shortcuts (⌘K / Ctrl+K / /)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // '/' trigger when not in an editable element
      if (e.key === "/" && !isOpen) {
        const target = e.target as HTMLElement | null;
        const isEditable =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable ||
            target.getAttribute("role") === "textbox");

        if (!isEditable) {
          e.preventDefault();
          setIsOpen(true);
          return;
        }
      }

      // Escape key closing
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const addRecentSearch = React.useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed || typeof window === "undefined") return;

    try {
      const current = getSearchesSnapshot();
      const updated = [trimmed, ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      cachedRaw = JSON.stringify(updated);
      cachedSearches = updated;
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      // ignore local storage errors
    }
  }, []);

  const clearRecentSearches = React.useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      cachedRaw = null;
      cachedSearches = [];
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {
      // ignore local storage errors
    }
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}

/** Global dispatcher helper to open command palette from any button */
export function dispatchOpenCommandPalette(openState = true) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOGGLE_EVENT, { detail: { open: openState } }));
  }
}
