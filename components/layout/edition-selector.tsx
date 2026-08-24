"use client";

import * as React from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const EDITIONS = [
  { id: "global", label: "Global Edition" },
  { id: "us", label: "US Edition" },
  { id: "uk-eu", label: "UK & Europe" },
  { id: "apac", label: "Asia Pacific" },
] as const;

export type EditionId = (typeof EDITIONS)[number]["id"];

const STORAGE_KEY = "pixca_edition";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "global";
  } catch {
    return "global";
  }
}

function getServerSnapshot(): string {
  return "global";
}

export function EditionSelector({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [activeEdition, setActiveEdition] = React.useState<EditionId | null>(null);

  const storedEdition = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const selectedEdition = (activeEdition ?? (EDITIONS.some((e) => e.id === storedEdition) ? storedEdition : "global")) as EditionId;

  const handleSelect = (id: EditionId) => {
    setActiveEdition(id);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, id);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  };

  const currentLabel =
    EDITIONS.find((e) => e.id === selectedEdition)?.label || "International Edition";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors text-[11px] font-medium outline-none",
          className
        )}
      >
        <Globe className="w-3 h-3 text-zinc-400" />
        <span>{currentLabel}</span>
        <ChevronDown className="w-3 h-3 opacity-70 transition-transform duration-200" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-48 p-1.5 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-xl rounded-lg"
      >
        <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          Select Edition
        </div>
        <div className="flex flex-col gap-0.5">
          {EDITIONS.map((edition) => {
            const isSelected = selectedEdition === edition.id;
            return (
              <button
                key={edition.id}
                type="button"
                onClick={() => handleSelect(edition.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors cursor-pointer",
                  isSelected
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
                )}
              >
                <span>{edition.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
