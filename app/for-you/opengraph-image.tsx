import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "PIXCA For You — Personalized News & Balanced Counter-Perspectives";

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
            "radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.15), transparent 45%), radial-gradient(circle at 85% 20%, rgba(168, 85, 247, 0.15), transparent 45%), radial-gradient(circle at 50% 80%, rgba(37, 99, 235, 0.15), transparent 45%)",
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

          {/* Feature Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "9999px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#38BDF8",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#38BDF8",
                boxShadow: "0 0 10px #38BDF8",
              }}
            />
            Personalized AI Intelligence
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
              fontSize: "52px",
              fontWeight: "900",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            For You: Tailored Stories & Counter-Perspectives
          </div>
          <div
            style={{
              fontSize: "21px",
              color: "#94A3B8",
              lineHeight: 1.4,
              maxWidth: "960px",
            }}
          >
            Discover news curated for your reading habits, coupled with diverse viewpoints to prevent echo chambers and expand your perspective.
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: "16px",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#38BDF8",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Curated Recommendations
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#E2E8F0",
                lineHeight: 1.35,
              }}
            >
              High-relevance stories from your preferred media outlets and saved topics
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#C084FC",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Echo-Chamber Defense
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#E2E8F0",
                lineHeight: 1.35,
              }}
            >
              Balanced counter-perspectives to illuminate angles from across the ideological spectrum
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#34D399",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Top Balanced Center
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#E2E8F0",
                lineHeight: 1.35,
              }}
            >
              Objectively framed journalism scored with highest neutral analysis confidence
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
            pixca.news/for-you
          </div>
          <div>Personalized AI News Intelligence</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
