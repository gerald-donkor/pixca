"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";

export interface BiasMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  leftValue?: number;
  centerValue?: number;
  rightValue?: number;
  showLabels?: boolean;
}

export const BiasMeter = React.forwardRef<HTMLDivElement, BiasMeterProps>(
  (
    {
      className,
      leftValue = 0,
      centerValue = 0,
      rightValue = 0,
      showLabels = false,
      ...props
    },
    forwardedRef
  ) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => localRef.current!);

    const safeLeft = Math.max(0, leftValue || 0);
    const safeCenter = Math.max(0, centerValue || 0);
    const safeRight = Math.max(0, rightValue || 0);
    const total = safeLeft + safeCenter + safeRight;

    const leftPct = total > 0 ? (safeLeft / total) * 100 : 0;
    const centerPct = total > 0 ? (safeCenter / total) * 100 : 0;
    const rightPct = total > 0 ? (safeRight / total) * 100 : 0;

    useGSAP(
      () => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            ".bias-segment",
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.5,
              ease: "power2.out",
              transformOrigin: "left center",
              stagger: 0.05,
            }
          );
        });
      },
      { scope: localRef, dependencies: [leftPct, centerPct, rightPct] }
    );

    const getLabel = (name: string, value: number, pct: number) => {
      if (pct <= 0) return "";
      if (pct >= 18) {
        return `${name} ${value}%`;
      } else if (pct >= 10) {
        return `${name.charAt(0)} ${value}%`;
      } else if (pct >= 6) {
        return `${value}%`;
      }
      return "";
    };

    const leftLabel = getLabel("Left", safeLeft, leftPct);
    const centerLabel = getLabel("Center", safeCenter, centerPct);
    const rightLabel = getLabel("Right", safeRight, rightPct);

    const hasLeft = leftPct > 0;
    const hasCenter = centerPct > 0;
    const hasRight = rightPct > 0;

    return (
      <div
        ref={localRef}
        className={cn("w-full flex flex-col gap-1.5", className)}
        {...props}
      >
        <div className="relative flex h-8 w-full overflow-hidden rounded-lg text-xs font-semibold select-none bg-zinc-200 dark:bg-zinc-800">
          {/* Left Segment */}
          {hasLeft && (
            <div
              className={cn(
                "bias-segment flex items-center justify-start bg-bias-left text-white transition-[width] duration-300 ease-out overflow-hidden px-2 shrink-0 will-change-transform origin-left",
                hasLeft && !hasCenter && !hasRight && "rounded-lg",
                hasLeft && (hasCenter || hasRight) && "rounded-l-lg"
              )}
              style={{ width: `${leftPct}%` }}
            >
              {leftLabel && (
                <span className="whitespace-nowrap text-[10px] tracking-tight sm:text-[11px] font-bold">
                  {leftLabel}
                </span>
              )}
            </div>
          )}

          {/* Center Segment */}
          {hasCenter && (
            <div
              className={cn(
                "bias-segment flex items-center justify-center bg-bias-center text-zinc-900 dark:text-zinc-100 transition-[width] duration-300 ease-out overflow-hidden px-2 shrink-0 will-change-transform origin-left",
                !hasLeft && !hasRight && "rounded-lg",
                !hasLeft && hasRight && "rounded-l-lg",
                hasLeft && !hasRight && "rounded-r-lg"
              )}
              style={{ width: `${centerPct}%` }}
            >
              {centerLabel && (
                <span className="whitespace-nowrap text-[10px] tracking-tight sm:text-[11px] font-bold">
                  {centerLabel}
                </span>
              )}
            </div>
          )}

          {/* Right Segment */}
          {hasRight && (
            <div
              className={cn(
                "bias-segment flex items-center justify-end bg-bias-right text-white transition-[width] duration-300 ease-out overflow-hidden px-2 shrink-0 will-change-transform origin-left",
                !hasLeft && !hasCenter && hasRight && "rounded-lg",
                (hasLeft || hasCenter) && hasRight && "rounded-r-lg"
              )}
              style={{ width: `${rightPct}%` }}
            >
              {rightLabel && (
                <span className="whitespace-nowrap text-[10px] tracking-tight sm:text-[11px] font-bold">
                  {rightLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {showLabels && (
          <div className="flex justify-between px-1 text-[10px] font-medium text-[var(--text-secondary)]">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        )}
      </div>
    );
  }
);
BiasMeter.displayName = "BiasMeter";
