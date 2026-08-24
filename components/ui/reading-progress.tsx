"use client";

import * as React from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function ReadingProgress() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!barRef.current) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(barRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.15,
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full bg-zinc-900 dark:bg-white origin-left transform-gpu scale-x-0 will-change-transform"
      />
    </div>
  );
}
