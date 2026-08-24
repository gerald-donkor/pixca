"use client";

import * as React from "react";

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  return () => window.removeEventListener("focus", callback);
}

function getSnapshot() {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  } catch {
    return new Date().toDateString();
  }
}

function getServerSnapshot() {
  return "";
}

export function DynamicDate({ className }: { className?: string }) {
  const formattedDate = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <div
      className={className}
      aria-label={formattedDate || "Current Date"}
    >
      <span
        className={`transition-opacity duration-300 ${
          formattedDate ? "opacity-100" : "opacity-0"
        }`}
      >
        {formattedDate || "\u00A0"}
      </span>
    </div>
  );
}
