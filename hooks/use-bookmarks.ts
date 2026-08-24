"use client";

import * as React from "react";

export interface BookmarkedArticle {
  id: string;
  title: string;
  source_name: string;
  image_url?: string;
  saved_at: string;
}

const STORAGE_KEY = "pixca-bookmarks";
const CUSTOM_EVENT = "pixca-bookmarks-change";

let cachedRaw: string | null = null;
let cachedBookmarks: BookmarkedArticle[] = [];

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(CUSTOM_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CUSTOM_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): BookmarkedArticle[] {
  if (typeof window === "undefined") {
    return cachedBookmarks;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedBookmarks;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedBookmarks = [];
    } else {
      const parsed = JSON.parse(raw);
      cachedBookmarks = Array.isArray(parsed) ? parsed : [];
    }
    return cachedBookmarks;
  } catch {
    return cachedBookmarks;
  }
}

const SERVER_BOOKMARKS: BookmarkedArticle[] = [];
function getServerSnapshot(): BookmarkedArticle[] {
  return SERVER_BOOKMARKS;
}

function saveBookmarks(items: BookmarkedArticle[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedBookmarks = items;
    window.dispatchEvent(new Event(CUSTOM_EVENT));
  } catch (error) {
    console.error("[useBookmarks] failed to write to localStorage:", error);
  }
}

export function useBookmarks() {
  const bookmarks = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const isBookmarked = React.useCallback(
    (id: string) => {
      return bookmarks.some((b) => b.id === id);
    },
    [bookmarks]
  );

  const toggleBookmark = React.useCallback(
    (article: {
      id: string;
      title: string;
      source_name: string;
      image_url?: string;
    }): boolean => {
      const current = getSnapshot();
      const exists = current.some((b) => b.id === article.id);

      if (exists) {
        const next = current.filter((b) => b.id !== article.id);
        saveBookmarks(next);
        return false;
      } else {
        const nextItem: BookmarkedArticle = {
          id: article.id,
          title: article.title,
          source_name: article.source_name,
          image_url: article.image_url,
          saved_at: new Date().toISOString(),
        };
        const next = [nextItem, ...current];
        saveBookmarks(next);
        return true;
      }
    },
    []
  );

  const removeBookmark = React.useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.filter((b) => b.id !== id);
    saveBookmarks(next);
  }, []);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
  };
}
