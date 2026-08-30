"use client";

import * as React from "react";
import {
  Share2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Bookmark,
  Scale,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
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
import { gsap, useGSAP } from "@/lib/gsap";

export interface ReadingDietStats {
  totalBookmarks: number;
  uniqueSourcesCount: number;
  leftPct: number;
  centerPct: number;
  rightPct: number;
  dominantLean: string;
  resilienceScore?: number;
  resilienceLabel?: string;
  topTopics?: string[];
}

export interface ReadingDietShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: ReadingDietStats;
}

const emptySubscribe = () => () => {};

function useCurrentUrl() {
  return React.useSyncExternalStore(
    (callback) => {
      window.addEventListener("popstate", callback);
      return () => window.removeEventListener("popstate", callback);
    },
    () => (typeof window !== "undefined" ? window.location.href : "https://pixca.vercel.app"),
    () => "https://pixca.vercel.app"
  );
}

function useCanNativeShare() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false
  );
}

/**
 * Generate a high-resolution 1200x630 branded PNG image on HTML5 Canvas.
 */
function generateReadingDietImage(stats: ReadingDietStats): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(null);
      return;
    }

    // Helper: Rounded Rectangle
    function drawRoundedRect(
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fill?: string,
      stroke?: string,
      strokeWidth = 1
    ) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    }

    // 1. Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, "#09090b");
    bgGradient.addColorStop(0.5, "#121216");
    bgGradient.addColorStop(1, "#0c0c0e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // 2. Ambient Radial Glows
    const glow1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 400);
    glow1.addColorStop(0, "rgba(37, 99, 235, 0.18)");
    glow1.addColorStop(1, "rgba(37, 99, 235, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1200, 630);

    const glow2 = ctx.createRadialGradient(1000, 500, 20, 1000, 500, 400);
    glow2.addColorStop(0, "rgba(124, 58, 237, 0.15)");
    glow2.addColorStop(1, "rgba(124, 58, 237, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1200, 630);

    // 3. Card Outer Frame
    drawRoundedRect(30, 30, 1140, 570, 24, "rgba(24, 24, 27, 0.65)", "rgba(63, 63, 70, 0.4)", 2);

    // 4. Header Brand & Title
    ctx.font = "900 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("PIXCA", 70, 95);

    ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("READING DIET & PERSPECTIVE PROFILE", 195, 93);

    // Header Pill Badge (Dominant Lean)
    const badgeText = stats.dominantLean;
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = badgeMetrics.width + 32;
    const badgeX = 1110 - badgeW;
    drawRoundedRect(badgeX, 68, badgeW, 36, 18, "rgba(59, 130, 246, 0.15)", "rgba(59, 130, 246, 0.4)", 1.5);
    ctx.fillStyle = "#60a5fa";
    ctx.fillText(badgeText, badgeX + 16, 92);

    // Divider Line
    ctx.strokeStyle = "rgba(63, 63, 70, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 125);
    ctx.lineTo(1130, 125);
    ctx.stroke();

    // 5. Perspective Balance Spectrum Section
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#e4e4e7";
    ctx.fillText("PERSPECTIVE BALANCE", 70, 165);

    // Labels with color indicators
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#60a5fa";
    ctx.fillText(`Left ${stats.leftPct}%`, 700, 165);
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText(`Center ${stats.centerPct}%`, 840, 165);
    ctx.fillStyle = "#f87171";
    ctx.fillText(`Right ${stats.rightPct}%`, 1000, 165);

    // 3-Segment Proportional Spectrum Bar
    const barX = 70;
    const barY = 185;
    const barW = 1060;
    const barH = 50;
    const barR = 14;

    // Draw background container
    drawRoundedRect(barX, barY, barW, barH, barR, "#18181b", "rgba(63, 63, 70, 0.5)", 1.5);

    // Clip for segments
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(barX + barR, barY);
    ctx.lineTo(barX + barW - barR, barY);
    ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + barR);
    ctx.lineTo(barX + barW, barY + barH - barR);
    ctx.quadraticCurveTo(barX + barW, barY + barH, barX + barW - barR, barY + barH);
    ctx.lineTo(barX + barR, barY + barH);
    ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barH - barR);
    ctx.lineTo(barX, barY + barR);
    ctx.quadraticCurveTo(barX, barY, barX + barR, barY);
    ctx.closePath();
    ctx.clip();

    const leftWidth = (stats.leftPct / 100) * barW;
    const centerWidth = (stats.centerPct / 100) * barW;
    const rightWidth = (stats.rightPct / 100) * barW;

    // Left segment
    if (leftWidth > 0) {
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(barX, barY, leftWidth, barH);
      if (stats.leftPct >= 8) {
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Left ${stats.leftPct}%`, barX + 16, barY + 31);
      }
    }

    // Center segment
    if (centerWidth > 0) {
      ctx.fillStyle = "#52525b";
      ctx.fillRect(barX + leftWidth, barY, centerWidth, barH);
      if (stats.centerPct >= 8) {
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(`Center ${stats.centerPct}%`, barX + leftWidth + centerWidth / 2, barY + 31);
        ctx.textAlign = "left";
      }
    }

    // Right segment
    if (rightWidth > 0) {
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(barX + leftWidth + centerWidth, barY, rightWidth, barH);
      if (stats.rightPct >= 8) {
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Right ${stats.rightPct}%`, barX + barW - 90, barY + 31);
      }
    }
    ctx.restore();

    // 6. Metric Cards Grid (4 boxes)
    const gridY = 275;
    const tileW = 245;
    const tileH = 175;
    const gap = 26;

    // Tile 1: Saved Stories
    const t1X = 70;
    drawRoundedRect(t1X, gridY, tileW, tileH, 16, "rgba(24, 24, 27, 0.8)", "rgba(63, 63, 70, 0.4)", 1.5);
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#93c5fd";
    ctx.fillText("SAVED LIBRARY", t1X + 22, gridY + 38);
    ctx.font = "800 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${stats.totalBookmarks}`, t1X + 22, gridY + 86);
    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("analyzed stories", t1X + 22, gridY + 114);

    // Tile 2: Publisher Diversity
    const t2X = t1X + tileW + gap;
    drawRoundedRect(t2X, gridY, tileW, tileH, 16, "rgba(24, 24, 27, 0.8)", "rgba(63, 63, 70, 0.4)", 1.5);
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("SOURCE BREADTH", t2X + 22, gridY + 38);
    ctx.font = "800 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${stats.uniqueSourcesCount}`, t2X + 22, gridY + 86);
    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("unique publishers", t2X + 22, gridY + 114);

    // Tile 3: Echo-Chamber Shield
    const t3X = t2X + tileW + gap;
    drawRoundedRect(t3X, gridY, tileW, tileH, 16, "rgba(24, 24, 27, 0.8)", "rgba(63, 63, 70, 0.4)", 1.5);
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#6ee7b7";
    ctx.fillText("SHIELD SCORE", t3X + 22, gridY + 38);
    ctx.font = "800 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    const shieldScoreVal = stats.resilienceScore ?? 85;
    ctx.fillText(`${shieldScoreVal}%`, t3X + 22, gridY + 86);
    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText(stats.resilienceLabel ?? "Echo-Chamber Shielded", t3X + 22, gridY + 114);

    // Tile 4: Dominant Lean / Focus
    const t4X = t3X + tileW + gap;
    drawRoundedRect(t4X, gridY, tileW, tileH, 16, "rgba(24, 24, 27, 0.8)", "rgba(63, 63, 70, 0.4)", 1.5);
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("TOP TOPICS", t4X + 22, gridY + 38);
    const topTopicStr =
      stats.topTopics && stats.topTopics.length > 0
        ? stats.topTopics.slice(0, 2).join(", ")
        : "General News";
    ctx.font = "700 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(topTopicStr.length > 15 ? topTopicStr.slice(0, 14) + "..." : topTopicStr, t4X + 22, gridY + 82);
    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("primary interests", t4X + 22, gridY + 114);

    // 7. Footer Watermark
    ctx.font = "500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("pixca.vercel.app  •  Multi-Perspective AI News Intelligence", 70, 545);

    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("Balanced News & Echo-Chamber Defense", 825, 545);

    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}

export function ReadingDietShareModal({
  open,
  onOpenChange,
  stats,
}: ReadingDietShareModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const currentUrl = useCurrentUrl();
  const canNativeShare = useCanNativeShare();
  const previewRef = React.useRef<HTMLDivElement>(null);

  // GSAP animation on modal open
  useGSAP(
    () => {
      if (!open || !previewRef.current) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".reading-diet-preview-card",
          { scale: 0.96, autoAlpha: 0, y: 10 },
          {
            scale: 1,
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          ".reading-diet-preview-card",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
          }
        );
      });

      return () => mm.revert();
    },
    { scope: previewRef, dependencies: [open] }
  );

  // Formatted Text Summary for Clipboard and Social Sharing
  const formattedSummary = React.useMemo(() => {
    const shieldInfo = stats.resilienceScore
      ? `\n🛡️ Echo-Chamber Shield: ${stats.resilienceScore}% (${stats.resilienceLabel || "Shielded"})`
      : "";
    const topicsInfo =
      stats.topTopics && stats.topTopics.length > 0
        ? `\n🏷️ Top Interests: ${stats.topTopics.slice(0, 3).join(", ")}`
        : "";

    return `📊 My Pixca Reading Diet & Perspective Balance:
• Left: ${stats.leftPct}% | Center: ${stats.centerPct}% | Right: ${stats.rightPct}%
• Dominant Lean: ${stats.dominantLean}
• Source Breadth: ${stats.uniqueSourcesCount} Publishers (${stats.totalBookmarks} Stories)${shieldInfo}${topicsInfo}

Discover balanced news analysis and counter-perspectives on Pixca:
${currentUrl}`;
  }, [stats, currentUrl]);

  const handleCopySummary = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(formattedSummary);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = formattedSummary;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Reading diet summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  const handleDownloadImage = async () => {
    try {
      setDownloading(true);
      toast.info("Generating high-resolution card image...");
      const blob = await generateReadingDietImage(stats);

      if (!blob) {
        toast.error("Failed to generate card image");
        setDownloading(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pixca-reading-diet-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success("Reading diet card downloaded as PNG!");
    } catch {
      toast.error("Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "My Pixca Reading Diet & Perspective Balance",
          text: formattedSummary,
          url: currentUrl,
        });
        onOpenChange(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }
  };

  const shareShareText = `My Pixca Reading Diet: Left ${stats.leftPct}% | Center ${stats.centerPct}% | Right ${stats.rightPct}% (${stats.dominantLean})`;

  const socialLinks = [
    {
      name: "X (Twitter)",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareShareText)}&url=${encodeURIComponent(currentUrl)}`,
      colorClass: "hover:bg-black hover:text-white dark:hover:bg-zinc-100 dark:hover:text-black",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.77a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      colorClass: "hover:bg-[#0A66C2] hover:text-white dark:hover:bg-[#0A66C2] dark:hover:text-white",
    },
    {
      name: "Reddit",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
      href: `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareShareText)}`,
      colorClass: "hover:bg-[#FF4500] hover:text-white dark:hover:bg-[#FF4500] dark:hover:text-white",
    },
    {
      name: "WhatsApp",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareShareText + " " + currentUrl)}`,
      colorClass: "hover:bg-[#25D366] hover:text-white dark:hover:bg-[#25D366] dark:hover:text-white",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[540px] p-4 sm:p-6 gap-4 sm:gap-5 max-h-[calc(100dvh-2rem)] overflow-y-auto min-w-0">
        <DialogHeader className="pr-8 space-y-1.5 min-w-0">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 break-words">
            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Share Reading Diet</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 break-words">
            Share your balanced news perspective insights and publisher diversity with your network.
          </DialogDescription>
        </DialogHeader>

        {/* Branded Visual Preview Card */}
        <div ref={previewRef} className="space-y-2 w-full min-w-0">
          <div className="reading-diet-preview-card rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-4 sm:p-5 border border-zinc-800 shadow-xl space-y-3.5 sm:space-y-4 w-full min-w-0">
            {/* Top Card Row */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base font-extrabold tracking-tight text-white shrink-0">PIXCA</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                  Reading Diet Profile
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap shrink-0">
                {stats.dominantLean}
              </span>
            </div>

            {/* Perspective Spectrum Bar */}
            <div className="space-y-1.5 w-full min-w-0">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-zinc-300">
                <span className="text-blue-400 truncate">Left {stats.leftPct}%</span>
                <span className="text-zinc-400 truncate">Center {stats.centerPct}%</span>
                <span className="text-red-400 truncate">Right {stats.rightPct}%</span>
              </div>
              <div className="h-3.5 w-full bg-zinc-800 rounded-full overflow-hidden flex gap-0.5 p-0.5 min-w-0">
                {stats.leftPct > 0 && (
                  <div
                    className="h-full rounded-l-full bg-blue-500"
                    style={{ width: `${stats.leftPct}%` }}
                  />
                )}
                {stats.centerPct > 0 && (
                  <div
                    className={cn(
                      "h-full bg-zinc-400 dark:bg-zinc-500",
                      stats.leftPct === 0 && "rounded-l-full",
                      stats.rightPct === 0 && "rounded-r-full"
                    )}
                    style={{ width: `${stats.centerPct}%` }}
                  />
                )}
                {stats.rightPct > 0 && (
                  <div
                    className="h-full rounded-r-full bg-red-500"
                    style={{ width: `${stats.rightPct}%` }}
                  />
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 w-full min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5 min-w-0">
                <div className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 flex items-center justify-center gap-1 truncate">
                  <Bookmark className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">Stories</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white truncate">{stats.totalBookmarks}</div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5 min-w-0">
                <div className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 flex items-center justify-center gap-1 truncate">
                  <Scale className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">Sources</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white truncate">{stats.uniqueSourcesCount}</div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-center space-y-0.5 min-w-0">
                <div className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 flex items-center justify-center gap-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">Shield</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {stats.resilienceScore ?? 85}%
                </div>
              </div>
            </div>

            {/* Card Watermark */}
            <div className="pt-1 text-[9px] sm:text-[10px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 min-w-0">
              <span className="truncate">pixca.vercel.app</span>
              <span className="truncate">AI Perspective Intelligence</span>
            </div>
          </div>
        </div>

        {/* Primary Export Actions */}
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2.5 sm:gap-3 w-full min-w-0">
          <Button
            type="button"
            onClick={handleCopySummary}
            className={cn(
              "text-xs font-semibold min-h-[44px] h-auto py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs w-full",
              copied
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white"
            )}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 shrink-0" />
                <span className="truncate">Copied Summary!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 shrink-0" />
                <span className="truncate">Copy Summary</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            variant="outline"
            className="text-xs font-semibold min-h-[44px] h-auto py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shadow-xs w-full"
          >
            {downloading ? (
              <>
                <ImageIcon className="h-4 w-4 animate-spin text-blue-500 shrink-0" />
                <span className="truncate">Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="truncate">Download PNG</span>
              </>
            )}
          </Button>
        </div>

        {/* Social Share Grid */}
        <div className="space-y-2 w-full min-w-0">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Share to Platform
          </label>
          <div className="grid grid-cols-2 min-[440px]:grid-cols-4 gap-2 min-w-0">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenChange(false)}
                aria-label={`Share on ${social.name}`}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-w-0 min-h-[48px]",
                  social.colorClass
                )}
              >
                <div className="p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 shadow-xs shrink-0">
                  {social.icon}
                </div>
                <span className="text-[10px] font-semibold truncate max-w-full">{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Native Device Share Option if supported */}
        {canNativeShare && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-center w-full min-w-0">
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
