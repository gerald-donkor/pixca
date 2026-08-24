import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pixca News — AI News Analysis & Media Bias Intelligence",
    short_name: "Pixca",
    description:
      "Real-time AI-powered news analysis, sentiment scoring, and political framing insights across top global news sources.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0B0F19",
    theme_color: "#0B0F19",
    categories: ["news", "politics", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Top Stories",
        short_name: "Stories",
        url: "/",
        description: "Discover the latest news with AI sentiment & framing",
      },
      {
        name: "Blindspot Feed",
        short_name: "Blindspot",
        url: "/blindspot",
        description: "Explore divergent perspectives and coverage gaps",
      },
      {
        name: "Saved Articles",
        short_name: "Saved",
        url: "/saved",
        description: "Access your bookmarked reading list and intelligence archive",
      },
    ],
  };
}
