"use client";

import * as React from "react"
import { Menu, MapPin, Globe } from "lucide-react"
import { Show, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/layout/theme-provider"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* UTILITY BAR */}
      <div className="hidden md:block bg-[#0D0D0F] text-[#CCCCCC] text-[11px] py-1.5 px-6 border-b border-zinc-800">
        <div className="container mx-auto max-w-[1400px] flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-white transition-colors flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Browser Extension
            </span>
            <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-4">
              <span className="text-zinc-400 mr-1">Theme:</span>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                  theme === "light"
                    ? "bg-zinc-800 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                  theme === "dark"
                    ? "bg-zinc-800 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer",
                  theme === "system"
                    ? "bg-zinc-800 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                Auto
              </button>
            </div>
          </div>
          {/* Center Date */}
          <div className="font-medium tracking-wide">
            Monday, June 1, 2026
          </div>
          {/* Right Side */}
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-white transition-colors flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-400" />
              Set Location
            </span>
            <div className="flex items-center gap-1 border-l border-zinc-800 pl-4 cursor-pointer hover:text-white">
              <Globe className="w-3 h-3 text-zinc-400" />
              <span>International Edition</span>
              <span className="text-[9px]">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#121215] border-b border-[var(--border)] shadow-xs">
        <div className="container mx-auto max-w-[1400px] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          {/* Left Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 text-[var(--text-primary)]">
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-extrabold tracking-tight select-none text-[var(--text-primary)]">
              Pixca<span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 ml-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-sm align-middle">News</span>
            </Link>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/" className="text-[var(--text-primary)] cursor-pointer pb-1 border-b-2 border-[var(--text-primary)]">
              Home
            </Link>
            <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors flex items-center gap-1">
              For You
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            </span>
            <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
              Local
            </span>
            <span className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
              Blindspot
            </span>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="default"
              className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-bold text-[10px] sm:text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-md"
            >
              Subscribe
            </Button>
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-bold text-[10px] sm:text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-md"
                >
                  Sign In
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </header>
    </>
  )
}
