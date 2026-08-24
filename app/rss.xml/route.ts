import { getPublishedArticles } from "@/lib/supabase/queries/articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeCdata(str: string): string {
  return str.replace(/]]>/g, "]]]]><![CDATA[>");
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://pixca.vercel.app").replace(/\/+$/, "");
  const articles = await getPublishedArticles({ limit: 50, offset: 0 });

  const itemsXml = articles
    .map((article) => {
      const articleUrl = `${baseUrl}/article/${article.id}`;
      const pubDate = new Date(article.published_at).toUTCString();
      const sourceName = article.source?.name || "Unknown Source";
      const summary = article.analysis?.summary || "";
      const analysis = article.analysis;

      const mediaContent = article.image_url
        ? `<media:content url="${escapeXml(article.image_url)}" medium="image" />\n      <enclosure url="${escapeXml(article.image_url)}" type="image/jpeg" length="0" />`
        : "";

      const pixcaTags = analysis
        ? `
      <pixca:sourceName><![CDATA[${escapeCdata(sourceName)}]]></pixca:sourceName>
      <pixca:sentimentLabel>${escapeXml(analysis.sentiment_label)}</pixca:sentimentLabel>
      <pixca:sentimentScore>${analysis.sentiment_score}</pixca:sentimentScore>
      <pixca:biasLabel>${escapeXml(analysis.bias_label)}</pixca:biasLabel>
      <pixca:biasScore>${analysis.bias_score}</pixca:biasScore>
      <pixca:leftPercentage>${analysis.left_percentage}</pixca:leftPercentage>
      <pixca:centerPercentage>${analysis.center_percentage}</pixca:centerPercentage>
      <pixca:rightPercentage>${analysis.right_percentage}</pixca:rightPercentage>
      <pixca:confidence>${analysis.confidence}</pixca:confidence>`
        : `
      <pixca:sourceName><![CDATA[${escapeCdata(sourceName)}]]></pixca:sourceName>`;

      return `    <item>
      <title><![CDATA[${escapeCdata(article.title)}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${escapeCdata(sourceName)}]]></dc:creator>
      <author><![CDATA[${escapeCdata(sourceName)}]]></author>
      <description><![CDATA[${escapeCdata(summary)}]]></description>
      ${mediaContent}${pixcaTags}
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:pixca="${baseUrl}/xmlns">
  <channel>
    <title>Pixca News — Balanced news coverage, powered by AI</title>
    <link>${baseUrl}</link>
    <description>Get multiple viewpoints on top stories. Pixca is an AI-powered news aggregator analyzing framing, sentiment, and bias in real time.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
