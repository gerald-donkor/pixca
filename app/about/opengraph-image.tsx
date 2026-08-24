import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "About Pixca News — AI Methodology & Editorial Transparency";

export default function Image() {
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
            "radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.15), transparent 45%), radial-gradient(circle at 85% 20%, rgba(168, 85, 247, 0.15), transparent 45%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.12), transparent 45%)",
          padding: "54px 64px",
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
          {/* Logo & Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "26px",
                fontWeight: "900",
                letterSpacing: "-0.05em",
                boxShadow: "0 0 25px rgba(37, 99, 235, 0.5)",
              }}
            >
              P
            </div>
            <div
              style={{
                fontSize: "34px",
                fontWeight: "900",
                letterSpacing: "-0.04em",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
              }}
            >
              PIXCA
              <span style={{ color: "#38BDF8", marginLeft: "2px" }}>.</span>
            </div>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "9999px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#60A5FA",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#3B82F6",
                boxShadow: "0 0 10px #3B82F6",
              }}
            />
            AI Methodology & Ethics
          </div>
        </div>

        {/* Hero Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "1050px",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              fontWeight: "900",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            Empowering Readers with Media Transparency
          </div>
          <div
            style={{
              fontSize: "21px",
              color: "#94A3B8",
              lineHeight: 1.4,
              maxWidth: "960px",
            }}
          >
            Explore our automated 4-stage pipeline: Oxylabs multi-source scraping, Gemini AI structured framing analysis, bias scoring calibration, and pgvector semantic cross-referencing.
          </div>
        </div>

        {/* 3 Pipeline Summary Badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#60A5FA",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Oxylabs & Supabase
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#E2E8F0",
              }}
            >
              Hourly Ingestion & Deduplication
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#C084FC",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Gemini 3.6 Flash
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#E2E8F0",
              }}
            >
              Framing, Sentiment & Rhetoric
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#34D399",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              pgvector 1536-dim
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#E2E8F0",
              }}
            >
              Cosine Semantic Similarity
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "16px",
            fontSize: "14px",
            color: "#64748B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38BDF8", fontWeight: "700" }}>
            pixca.news/about
          </div>
          <div>Transparent AI-Driven Media Intelligence</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
