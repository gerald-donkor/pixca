import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/supabase/queries/articles";

export const revalidate = 3600; // Revalidate dynamic sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://pixca.vercel.app").replace(/\/+$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blindspot`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/saved`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  try {
    const articles = await getPublishedArticles({
      limit: 100,
      offset: 0,
    });

    const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
      const rawDate = article.analysis?.created_at || article.published_at;
      const parsed = rawDate ? new Date(rawDate) : new Date();
      const lastModified = !isNaN(parsed.getTime()) ? parsed : new Date();

      return {
        url: `${baseUrl}/article/${article.id}`,
        lastModified,
        changeFrequency: "hourly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...articleRoutes];
  } catch (error) {
    console.error("[sitemap] Failed to generate article sitemap entries:", error);
    return staticRoutes;
  }
}
