"use client";

import * as React from "react";
import { Copy, Check, Share2, Mail, ExternalLink, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: {
    id: string;
    title: string;
    original_url: string;
    source_name: string;
    image_url?: string;
  };
}

const emptySubscribe = () => () => {};

function useCurrentUrl(fallbackUrl: string) {
  return React.useSyncExternalStore(
    (callback) => {
      window.addEventListener("popstate", callback);
      return () => window.removeEventListener("popstate", callback);
    },
    () => window.location.href,
    () => fallbackUrl
  );
}

function useCanNativeShare() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false
  );
}

export function ShareModal({ open, onOpenChange, article }: ShareModalProps) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = useCurrentUrl(article.original_url);
  const canNativeShare = useCanNativeShare();

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for non-secure or restricted contexts
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `Read "${article.title}" on Pixca`,
          url: shareUrl,
        });
        onOpenChange(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }
  };

  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`,
      colorClass: "hover:bg-black hover:text-white dark:hover:bg-zinc-100 dark:hover:text-black",
      badgeColor: "bg-black text-white dark:bg-white dark:text-black",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.77a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      colorClass: "hover:bg-[#0A66C2] hover:text-white dark:hover:bg-[#0A66C2] dark:hover:text-white",
      badgeColor: "bg-[#0A66C2] text-white",
    },
    {
      name: "Reddit",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      href: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`,
      colorClass: "hover:bg-[#FF4500] hover:text-white dark:hover:bg-[#FF4500] dark:hover:text-white",
      badgeColor: "bg-[#FF4500] text-white",
    },
    {
      name: "WhatsApp",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " " + shareUrl)}`,
      colorClass: "hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] dark:hover:text-white",
      badgeColor: "bg-[#25D366] text-white",
    },
    {
      name: "Facebook",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      colorClass: "hover:bg-[#1877F2] hover:text-white dark:hover:bg-[#1877F2] dark:hover:text-white",
      badgeColor: "bg-[#1877F2] text-white",
    },
    {
      name: "Email",
      icon: <Mail className="h-4 w-4" aria-hidden="true" />,
      href: `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent("Read this news analysis on Pixca:\n\n" + shareUrl)}`,
      colorClass: "hover:bg-zinc-700 hover:text-white dark:hover:bg-zinc-600 dark:hover:text-white",
      badgeColor: "bg-zinc-700 text-white dark:bg-zinc-600",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[460px] p-4 sm:p-6 gap-4 sm:gap-5 max-h-[calc(100dvh-2rem)] overflow-y-auto min-w-0">
        <DialogHeader className="pr-8 space-y-1.5 min-w-0">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 break-words">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Share Article</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 break-words">
            Share this news analysis and balanced framing insights with your network.
          </DialogDescription>
        </DialogHeader>

        {/* Article Preview Card */}
        <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden min-w-0">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
            />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
              <Globe className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
              {article.source_name}
            </div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug break-words">
              {article.title}
            </h4>
          </div>
        </div>

        {/* Quick Copy Link Input */}
        <div className="space-y-1.5 min-w-0">
          <label
            htmlFor="share-article-url"
            className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            Article Link
          </label>
          <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2 min-w-0">
            <input
              id="share-article-url"
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Article link"
              className="flex-1 min-w-0 text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-2.5 outline-none select-all truncate"
            />
            <Button
              type="button"
              onClick={handleCopyLink}
              className={cn(
                "shrink-0 text-xs font-semibold px-4 py-2.5 h-auto rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]",
                copied
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div className="space-y-2 min-w-0">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Share to Platform
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 min-w-0">
            {socialLinks.map((social) => {
              const isMailto = social.href.startsWith("mailto:");
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target={isMailto ? undefined : "_blank"}
                  rel={isMailto ? undefined : "noopener noreferrer"}
                  onClick={() => onOpenChange(false)}
                  aria-label={`Share on ${social.name}`}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[52px] min-w-0",
                    social.colorClass
                  )}
                >
                  <div className="p-1.5 sm:p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-xs shrink-0">
                    {social.icon}
                  </div>
                  <span className="text-[11px] font-semibold truncate max-w-full">{social.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Native Device Share Option */}
        {canNativeShare && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-center min-w-0">
            <button
              type="button"
              onClick={handleNativeShare}
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5 py-2 px-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer min-h-[44px]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>More sharing options...</span>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
