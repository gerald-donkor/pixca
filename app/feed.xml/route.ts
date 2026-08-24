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

  const entriesXml = articles
    .map((article) => {
      const articleUrl = `${baseUrl}/article/${article.id}`;
      const published = new Date(article.published_at).toISOString();
      const updated = article.scraped_at ? new Date(article.scraped_at).toISOString() : published;
      const sourceName = article.source?.name || "Unknown Source";
      const summary = article.analysis?.summary || "";
      const analysis = article.analysis;

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

      return `  <entry>
    <id>${articleUrl}</id>
    <title><![CDATA[${escapeCdata(article.title)}]]></title>
    <link href="${articleUrl}" />
    <published>${published}</published>
    <updated>${updated}</updated>
    <author>
      <name><![CDATA[${escapeCdata(sourceName)}]]></name>
    </author>
    <summary><![CDATA[${escapeCdata(summary)}]]></summary>${pixcaTags}
  </entry>`;
    })
    .join("\n");

  const atomFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:pixca="${baseUrl}/xmlns">
  <id>${baseUrl}/</id>
  <title>Pixca News — Balanced news coverage, powered by AI</title>
  <subtitle>Get multiple viewpoints on top stories. Pixca is an AI-powered news aggregator analyzing framing, sentiment, and bias in real time.</subtitle>
  <link href="${baseUrl}" />
  <link href="${baseUrl}/feed.xml" rel="self" type="application/atom+xml" />
  <updated>${new Date().toISOString()}</updated>
${entriesXml}
</feed>`;

  return new Response(atomFeed, {
    status: 200,
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
