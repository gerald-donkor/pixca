"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Sun, Moon, Laptop, Globe, MapPin, Bookmark, Compass, Sparkles, LayoutTemplate } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Compass },
  { label: "For You", href: "/#for-you", icon: Sparkles, badge: "New" },
  { label: "Local News", href: "/#local", icon: MapPin },
  { label: "Blindspot Feed", href: "/blindspot", icon: Globe },
  { label: "Saved Articles", href: "/saved", icon: Bookmark },
  { label: "Design System", href: "/design-system", icon: LayoutTemplate },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { bookmarks } = useBookmarks();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(isOpen);

  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key press
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // GSAP animation
  useGSAP(
    () => {
      if (!isMounted || !containerRef.current || !panelRef.current || !backdropRef.current) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (isOpen) {
          gsap.to(backdropRef.current, { autoAlpha: 1, duration: 0.2 });
          gsap.to(panelRef.current, { autoAlpha: 1, xPercent: 0, duration: 0.2 });
        } else {
          gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.15 });
          gsap.to(panelRef.current, {
            autoAlpha: 0,
            duration: 0.15,
            onComplete: () => setIsMounted(false),
          });
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (isOpen) {
          gsap.fromTo(
            backdropRef.current,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, ease: "power2.out" }
          );
          gsap.fromTo(
            panelRef.current,
            { xPercent: -100, autoAlpha: 1 },
            { xPercent: 0, duration: 0.35, ease: "power3.out" }
          );
        } else {
          gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.25, ease: "power2.in" });
          gsap.to(panelRef.current, {
            xPercent: -100,
            duration: 0.25,
            ease: "power3.in",
            onComplete: () => setIsMounted(false),
          });
        }
      });

      return () => mm.revert();
    },
    { dependencies: [isOpen, isMounted], scope: containerRef }
  );

  if (!isMounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer opacity-0"
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-[320px] max-w-[85vw] h-full bg-card border-r border-border flex flex-col justify-between overflow-y-auto p-6 shadow-2xl opacity-0"
        style={{ transform: "translateX(-100%)" }}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <Link
              href="/"
              onClick={onClose}
              className="text-xl font-extrabold tracking-tight select-none text-text-primary"
            >
              Pixca
              <span className="text-[10px] font-bold px-1.5 py-0.5 ml-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-sm align-middle">
                News
              </span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase px-3 mb-1">
              Menu
            </span>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isSaved = item.href === "/saved";
              const badge = isSaved && bookmarks.length > 0 ? String(bookmarks.length) : item.badge;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-text-primary font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", isActive ? "text-text-primary" : "text-text-muted")} />
                    <span>{item.label}</span>
                  </div>
                  {badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                        isSaved
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Appearance Section */}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase px-3">
              Theme Mode
            </span>
            <div className="grid grid-cols-3 gap-1.5 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                  theme === "light"
                    ? "bg-card text-text-primary shadow-xs font-semibold"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                  theme === "dark"
                    ? "bg-card text-text-primary shadow-xs font-semibold"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                  theme === "system"
                    ? "bg-card text-text-primary shadow-xs font-semibold"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section / Auth */}
        <div className="pt-6 border-t border-border flex flex-col gap-3">
          <Show when="signed-in">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <UserButton />
                <span className="text-xs font-medium text-text-primary">
                  My Account
                </span>
              </div>
            </div>
          </Show>

          <Show when="signed-out">
            <Link href="/sign-in" onClick={onClose} className="w-full">
              <Button
                variant="outline"
                className="w-full justify-center text-xs font-semibold h-9"
              >
                Sign In
              </Button>
            </Link>
          </Show>

          <Button
            variant="default"
            className="w-full justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-bold h-9"
          >
            Subscribe to Pixca Pro
          </Button>

          <p className="text-[11px] text-text-muted text-center mt-1">
            Unbiased AI news intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
