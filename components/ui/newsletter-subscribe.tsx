"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

export function NewsletterSubscribe() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    posthog.capture("newsletter_subscribe_clicked", {
      has_email: email.trim().length > 0,
    });
  };

  return (
    <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-md text-xs font-medium py-2.5 px-4 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 flex-1 md:w-64 transition-colors"
      />
      <Button
        variant="default"
        onClick={handleSubscribe}
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs py-2.5 px-5 h-auto rounded-md transition-colors"
      >
        Subscribe
      </Button>
    </div>
  );
}
