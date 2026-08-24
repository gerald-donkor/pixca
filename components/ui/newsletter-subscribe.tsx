"use client";

import * as React from "react";
import posthog from "posthog-js";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type SubscribeStatus = "idle" | "submitting" | "success" | "error";

export function NewsletterSubscribe({ className }: { className?: string }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<SubscribeStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (status === "success") {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            ".newsletter-success-badge",
            { autoAlpha: 0, y: 8, scale: 0.96 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.35,
              ease: "back.out(1.5)",
            }
          );
        });

        return () => mm.revert();
      }
    },
    { scope: containerRef, dependencies: [status] }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    posthog.capture("newsletter_subscribe_clicked", {
      has_email: trimmedEmail.length > 0,
    });

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const message =
          data?.error || data?.message || "Failed to subscribe. Please try again.";
        setStatus("error");
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setStatus("success");
      toast.success(data.message || "Subscribed to the Pixca newsletter!");
      posthog.capture("newsletter_subscribed", {
        email: trimmedEmail.toLowerCase(),
      });
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  const handleReset = () => {
    setEmail("");
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div ref={containerRef} className={cn("w-full md:w-auto shrink-0", className)}>
      {status === "success" ? (
        <div className="newsletter-success-badge flex flex-col sm:flex-row items-center gap-3 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-lg py-2.5 px-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>You&apos;re subscribed! We&apos;ve added you to our weekly digest.</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-900 dark:hover:text-emerald-200 font-bold shrink-0 cursor-pointer ml-auto transition-colors"
          >
            Subscribe another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 w-full md:w-auto" noValidate>
          <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setErrorMessage("");
                }
              }}
              disabled={status === "submitting"}
              aria-label="Email address"
              aria-invalid={status === "error"}
              className={cn(
                "bg-white dark:bg-zinc-900 border text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-md text-xs font-medium py-2.5 px-4 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 flex-1 md:w-64 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
                status === "error"
                  ? "border-red-500 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500"
                  : "border-zinc-200 dark:border-zinc-800"
              )}
            />
            <Button
              type="submit"
              variant="default"
              disabled={status === "submitting" || !email.trim()}
              className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs py-2.5 px-5 h-auto rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[96px]"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 shrink-0" />
                  <span>Subscribing...</span>
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>
          {status === "error" && errorMessage && (
            <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 pl-1">
              {errorMessage}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
