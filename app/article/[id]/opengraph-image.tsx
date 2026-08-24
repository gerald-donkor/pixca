import { ImageResponse } from "next/og";
import { getArticleWithAnalysis } from "@/lib/supabase/queries/articles";
import { formatArticleDate, titleCase } from "@/lib/ui/format";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Article Analysis Preview";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let article = null;
  try {
    article = await getArticleWithAnalysis(id);
  } catch (error) {
    console.error(`[opengraph-image] Error retrieving article ${id}:`, error);
  }

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#070B13",
            padding: "54px 64px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#F8FAFC",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "900",
              }}
            >
              P
            </div>
            <div style={{ fontSize: "30px", fontWeight: "900", color: "#FFFFFF" }}>
              PIXCA<span style={{ color: "#38BDF8" }}>.</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "40px", fontWeight: "800", color: "#FFFFFF" }}>
              Article Details & AI Analysis
            </div>
            <div style={{ fontSize: "20px", color: "#94A3B8" }}>
              Real-time media bias, framing breakdown, and sentiment intelligence.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "16px",
              fontSize: "14px",
              color: "#64748B",
            }}
          >
            <div style={{ color: "#38BDF8", fontWeight: "700" }}>pixca.news</div>
            <div>Transparent AI-Driven Media Intelligence</div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const sourceName = article.source?.name || "News";
  const dateFormatted = article.published_at ? formatArticleDate(article.published_at) : "";
  const title =
    article.title.length > 120 ? `${article.title.slice(0, 117)}...` : article.title;

  const analysis = article.analysis;
  const leftPct = analysis?.left_percentage ?? 0;
  const centerPct = analysis?.center_percentage ?? 0;
  const rightPct = analysis?.right_percentage ?? 0;
  const sentiment = analysis?.sentiment_label;
  const biasLabel = analysis?.bias_label;

  const sentimentColor =
    sentiment === "positive"
      ? "#4ADE80"
      : sentiment === "negative"
      ? "#F87171"
      : "#94A3B8";

  const sentimentBg =
    sentiment === "positive"
      ? "rgba(34, 197, 94, 0.15)"
      : sentiment === "negative"
      ? "rgba(239, 68, 68, 0.15)"
      : "rgba(148, 163, 184, 0.15)";

  const biasColor =
    biasLabel === "left"
      ? "#38BDF8"
      : biasLabel === "right"
      ? "#FB923C"
      : biasLabel === "center"
      ? "#A78BFA"
      : "#94A3B8";

  const biasBg =
    biasLabel === "left"
      ? "rgba(56, 189, 248, 0.15)"
      : biasLabel === "right"
      ? "rgba(251, 146, 60, 0.15)"
      : biasLabel === "center"
      ? "rgba(167, 139, 250, 0.15)"
      : "rgba(148, 163, 184, 0.15)";

  const summaryText = analysis?.summary
    ? analysis.summary.length > 160
      ? `${analysis.summary.slice(0, 157)}...`
      : analysis.summary
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#070B13",
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.12), transparent 45%), radial-gradient(circle at 90% 90%, rgba(139, 92, 246, 0.12), transparent 45%)",
          padding: "48px 56px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#F8FAFC",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo & Source Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "900",
              }}
            >
              P
            </div>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#FFFFFF" }}>
              PIXCA<span style={{ color: "#38BDF8" }}>.</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "14px",
                fontWeight: "700",
                color: "#E2E8F0",
                marginLeft: "8px",
              }}
            >
              {sourceName}
            </div>
          </div>

          {/* Date */}
          {dateFormatted && (
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#94A3B8",
              }}
            >
              {dateFormatted}
            </div>
          )}
        </div>

        {/* Article Headline & Summary */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginTop: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "38px",
              fontWeight: "900",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            {title}
          </div>

          {summaryText && (
            <div
              style={{
                fontSize: "18px",
                color: "#94A3B8",
                lineHeight: 1.4,
              }}
            >
              {summaryText}
            </div>
          )}
        </div>

        {/* AI Metrics Card */}
        {analysis ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "20px 24px",
            }}
          >
            {/* Badges Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#64748B",
                  }}
                >
                  AI METRICS
                </span>

                {biasLabel && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: biasBg,
                      border: `1px solid ${biasColor}`,
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: biasColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Bias: {titleCase(biasLabel)}
                  </div>
                )}

                {sentiment && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: sentimentBg,
                      border: `1px solid ${sentimentColor}`,
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: sentimentColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Sentiment: {titleCase(sentiment)}
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#94A3B8",
                }}
              >
                Framing Distribution
              </div>
            </div>

            {/* Bias Meter Bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "12px",
                  borderRadius: "9999px",
                  overflow: "hidden",
                  backgroundColor: "#1E293B",
                }}
              >
                <div
                  style={{
                    width: `${leftPct}%`,
                    height: "100%",
                    backgroundColor: "#38BDF8",
                  }}
                />
                <div
                  style={{
                    width: `${centerPct}%`,
                    height: "100%",
                    backgroundColor: "#A78BFA",
                  }}
                />
                <div
                  style={{
                    width: `${rightPct}%`,
                    height: "100%",
                    backgroundColor: "#FB923C",
                  }}
                />
              </div>

              {/* Labels below meter */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                <span style={{ color: "#38BDF8" }}>Left {leftPct}%</span>
                <span style={{ color: "#A78BFA" }}>Center {centerPct}%</span>
                <span style={{ color: "#FB923C" }}>Right {rightPct}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "12px 18px",
              fontSize: "14px",
              color: "#94A3B8",
            }}
          >
            AI Framing & Sentiment Analysis Live at pixca.news
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "14px",
            fontSize: "14px",
            color: "#64748B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38BDF8", fontWeight: "700" }}>
            pixca.news/article/{id}
          </div>
          <div>Transparent AI News Analysis</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
