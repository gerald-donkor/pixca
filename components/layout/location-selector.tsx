"use client";

import * as React from "react";
import { MapPin, Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LOCATIONS = [
  { id: "auto", label: "Automatic (IP)" },
  { id: "nyc", label: "New York, US" },
  { id: "lon", label: "London, UK" },
  { id: "tor", label: "Toronto, CA" },
  { id: "ber", label: "Berlin, DE" },
] as const;

export type LocationId = (typeof LOCATIONS)[number]["id"];

const STORAGE_KEY = "pixca_location";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "auto";
  } catch {
    return "auto";
  }
}

function getServerSnapshot(): string {
  return "auto";
}

export function LocationSelector({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [activeLocation, setActiveLocation] = React.useState<LocationId | null>(null);

  const storedLocation = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const selectedLocation = (activeLocation ?? (LOCATIONS.some((l) => l.id === storedLocation) ? storedLocation : "auto")) as LocationId;

  const handleSelect = (id: LocationId) => {
    setActiveLocation(id);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, id);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  };

  const currentLabel =
    selectedLocation === "auto"
      ? "Set Location"
      : LOCATIONS.find((l) => l.id === selectedLocation)?.label || "Set Location";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors text-[11px] font-medium outline-none",
          className
        )}
      >
        <MapPin className="w-3 h-3 text-zinc-400" />
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
          Select Location
        </div>
        <div className="flex flex-col gap-0.5">
          {LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors cursor-pointer",
                  isSelected
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
                )}
              >
                <span>{loc.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
