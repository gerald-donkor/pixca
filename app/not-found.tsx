"use client"

import * as React from "react"
import Link from "next/link"
import { Newspaper, Compass, Bookmark, ArrowLeft } from "lucide-react"
import { useGSAP, gsap } from "@/lib/gsap"

export default function NotFound() {
  const containerRef = React.useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current) return
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".not-found-anim",
          { y: 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.08,
            clearProps: "transform,opacity",
          }
        )
      })

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          ".not-found-anim",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
            stagger: 0.04,
            clearProps: "transform,opacity",
          }
        )
      })

      return () => mm.revert()
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16 bg-[var(--surface)] text-[var(--text-primary)] w-full min-w-0"
    >
      <div className="max-w-lg w-full min-w-0 bg-card rounded-2xl border border-[var(--border)] shadow-md p-6 sm:p-8 md:p-10 text-center space-y-6">
        {/* Badge & Icon */}
        <div className="not-found-anim inline-flex p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 shadow-xs">
          <Newspaper className="h-8 w-8 text-[var(--bias-right)]" />
        </div>

        <div className="not-found-anim space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            404 — Story Not Found
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            This Headline Has Moved or Doesn&apos;t Exist
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            The article, topic, or page you are looking for is unavailable, was archived, or may have had its link changed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="not-found-anim flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-[var(--text-primary)] text-[var(--background)] text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Top Stories
          </Link>
          <Link
            href="/blindspot"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-[var(--text-primary)] border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all shadow-xs"
          >
            <Compass className="h-3.5 w-3.5 text-[var(--bias-right)]" />
            Blindspot Feed
          </Link>
          <Link
            href="/saved"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-zinc-600 dark:text-zinc-400 hover:text-[var(--text-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-[0.98] text-xs font-semibold transition-all"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Saved
          </Link>
        </div>
      </div>
    </div>
  )
}
