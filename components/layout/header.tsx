"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { DynamicDate } from "@/components/layout/dynamic-date";
import { EditionSelector } from "@/components/layout/edition-selector";
import { LocationSelector } from "@/components/layout/location-selector";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { SubscribeModal } from "@/components/ui/subscribe-modal";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useSubscription } from "@/hooks/use-subscription";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { bookmarks } = useBookmarks();
  const { tier } = useSubscription();
  const { theme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [subscribeOpen, setSubscribeOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // GSAP Choreographed Entrance Animation
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(".header-anim-item", {
          autoAlpha: 0,
          stagger: 0.02,
          duration: 0.3,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".header-anim-item", {
          y: -8,
          autoAlpha: 0,
          stagger: 0.04,
          duration: 0.45,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      {/* MOBILE DRAWER */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenSubscribe={() => setSubscribeOpen(true)}
      />

      {/* SUBSCRIBE MODAL */}
      <SubscribeModal
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
      />

      {/* UTILITY BAR */}
      <div className="hidden md:block bg-[#0D0D0F] text-[#CCCCCC] text-[11px] py-1.5 px-6 border-b border-zinc-800">
        <div className="container mx-auto max-w-[1400px] flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Left Side */}
          <div className="header-anim-item flex items-center gap-1.5">
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

          {/* Center Dynamic Date */}
          <DynamicDate className="header-anim-item font-medium tracking-wide" />

          {/* Right Side Selectors */}
          <div className="flex items-center gap-4">
            <div className="header-anim-item">
              <LocationSelector />
            </div>
            <div className="header-anim-item border-l border-zinc-800 pl-4">
              <EditionSelector />
            </div>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#121215] border-b border-border shadow-xs">
        <div className="container mx-auto max-w-[1400px] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          {/* Left Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="header-anim-item p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 text-text-primary cursor-pointer"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <Link
              href="/"
              className="header-anim-item text-xl sm:text-2xl font-extrabold tracking-tight select-none text-text-primary"
            >
              Pixca
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 ml-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-sm align-middle">
                News
              </span>
            </Link>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className={cn(
                "header-anim-item cursor-pointer pb-1 transition-colors",
                pathname === "/"
                  ? "text-text-primary border-b-2 border-text-primary font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Home
            </Link>
            <Link
              href="/for-you"
              className={cn(
                "header-anim-item cursor-pointer pb-1 transition-colors flex items-center gap-1",
                pathname === "/for-you"
                  ? "text-text-primary border-b-2 border-text-primary font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span>For You</span>
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            </Link>
            <Link
              href="/blindspot"
              className={cn(
                "header-anim-item cursor-pointer pb-1 transition-colors",
                pathname === "/blindspot"
                  ? "text-text-primary border-b-2 border-text-primary font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Blindspot
            </Link>
            <Link
              href="/saved"
              className={cn(
                "header-anim-item cursor-pointer pb-1 transition-colors flex items-center gap-1.5",
                pathname === "/saved"
                  ? "text-text-primary border-b-2 border-text-primary font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span>Saved</span>
              {bookmarks.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-full leading-none">
                  {bookmarks.length}
                </span>
              )}
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "header-anim-item cursor-pointer pb-1 transition-colors flex items-center gap-1.5",
                pathname === "/pricing"
                  ? "text-text-primary border-b-2 border-text-primary font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <span>Pricing</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-500/15 text-blue-600 dark:text-blue-400 leading-none">
                Pro
              </span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="header-anim-item">
              <Button
                type="button"
                variant="default"
                onClick={() => setSubscribeOpen(true)}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-bold text-[10px] sm:text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-md cursor-pointer"
              >
                Subscribe
              </Button>
            </div>
            <div className="header-anim-item">
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
                <div className="flex items-center gap-2">
                  {tier === "starter" ? (
                    <Link
                      href="/pricing"
                      className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider hover:bg-emerald-500/25 transition-colors"
                      title="Pixca Starter Active"
                    >
                      Starter
                    </Link>
                  ) : tier === "pro" ? (
                    <Link
                      href="/pricing"
                      className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-blue-600/15 to-indigo-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase tracking-wider hover:from-blue-600/25 hover:to-indigo-600/25 transition-all"
                      title="Pixca Pro Active"
                    >
                      Pro
                    </Link>
                  ) : tier === "enterprise" ? (
                    <Link
                      href="/pricing"
                      className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-purple-600/15 to-amber-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 uppercase tracking-wider hover:from-purple-600/25 hover:to-amber-600/25 transition-all"
                      title="Pixca Enterprise Active"
                    >
                      Enterprise
                    </Link>
                  ) : (
                    <Link
                      href="/pricing"
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Upgrade to Pro"
                    >
                      Upgrade
                    </Link>
                  )}
                  <UserButton />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
