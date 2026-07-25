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
        className="bg-zinc-50 border border-zinc-200 rounded-md text-xs font-medium py-2.5 px-4 outline-none focus:border-zinc-400 flex-1 md:w-64"
      />
      <Button
        variant="default"
        onClick={handleSubscribe}
        className="bg-[#0D0D0F] hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-5 h-auto rounded-md"
      >
        Subscribe
      </Button>
    </div>
  );
}
