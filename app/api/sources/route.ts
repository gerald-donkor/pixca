import { getActiveSources } from "@/lib/supabase/queries/sources";

export const dynamic = "force-dynamic";

/**
 * Read route listing the active sources available for scraping (AGENTS.md
 * sections 8 and 14). Thin handler — no pipeline logic here.
 *
 * No admin secret: section 15 scopes that guard to routes that start or mutate
 * work, and this returns only source names and public homepage URLs.
 */
export async function GET(): Promise<Response> {
  try {
    const sources = await getActiveSources();

    return Response.json({
      sources: sources.map((source) => ({
        id: source.id,
        name: source.name,
        listingUrl: source.listing_url,
        isActive: source.is_active,
      })),
    });
  } catch (error) {
    console.error("[api/sources] failed to load sources:", toSafeMessage(error));
    return Response.json({ error: "Failed to load sources." }, { status: 500 });
  }
}

function toSafeMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
