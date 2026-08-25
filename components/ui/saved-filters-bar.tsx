"use client";

import * as React from "react";
import { Search, X, RotateCcw, SlidersHorizontal, ArrowDownUp, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

export type SavedSortOption = "newest" | "oldest" | "alphabetical" | "balanced" | "polarized";
export type SavedBiasFilter = "all" | "left" | "center" | "right";

export interface SavedFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeBias: SavedBiasFilter;
  onBiasChange: (bias: SavedBiasFilter) => void;
  availableSources: string[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
  sortOption: SavedSortOption;
  onSortChange: (sort: SavedSortOption) => void;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

const BIAS_OPTIONS: { label: string; value: SavedBiasFilter; colorClass?: string }[] = [
  { label: "All Framing", value: "all" },
  { label: "Left", value: "left", colorClass: "text-blue-600 dark:text-blue-400" },
  { label: "Center", value: "center", colorClass: "text-zinc-600 dark:text-zinc-400" },
  { label: "Right", value: "right", colorClass: "text-red-600 dark:text-red-400" },
];

const SORT_OPTIONS: { label: string; value: SavedSortOption }[] = [
  { label: "Recently Saved", value: "newest" },
  { label: "Oldest Saved", value: "oldest" },
  { label: "Title (A–Z)", value: "alphabetical" },
  { label: "Most Balanced", value: "balanced" },
  { label: "Most Polarized", value: "polarized" },
];

export function SavedFiltersBar({
  searchQuery,
  onSearchChange,
  activeBias,
  onBiasChange,
  availableSources,
  selectedSource,
  onSourceChange,
  sortOption,
  onSortChange,
  totalCount,
  filteredCount,
  onResetFilters,
}: SavedFiltersBarProps) {
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    activeBias !== "all" ||
    selectedSource !== "all" ||
    sortOption !== "newest";

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-card p-4 sm:p-5 shadow-xs">
      {/* Top row: Search input & Results stats & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search saved articles by title or source..."
            className="w-full h-10 pl-9 pr-8 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right side: Sort selector & Stats */}
        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <ArrowDownUp className="h-3.5 w-3.5 text-zinc-400" />
            <span>Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SavedSortOption)}
              className="h-9 px-2.5 rounded-lg text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Summary & Reset */}
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">
              Showing {filteredCount} of {totalCount}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Groups Divider */}
      <div className="border-t border-[var(--border)] pt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Political Framing Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)] mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            Framing:
          </span>
          {BIAS_OPTIONS.map((opt) => {
            const isSelected = activeBias === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onBiasChange(opt.value)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1",
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Source Dropdown Filter */}
        {availableSources.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <Newspaper className="h-3 w-3 text-zinc-400" />
              Source:
            </span>
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              className="h-8 px-2.5 rounded-lg text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">All Sources ({availableSources.length})</option>
              {availableSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
