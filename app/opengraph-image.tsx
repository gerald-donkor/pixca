import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "PIXCA — AI-Powered News Analysis & Media Bias Intelligence";

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
            "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15), transparent 45%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15), transparent 45%)",
          padding: "54px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#F8FAFC",
        }}
      >
        {/* Top bar: Brand + Tagline badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo & Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
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

          {/* Status Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
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
                backgroundColor: "#10B981",
                boxShadow: "0 0 10px #10B981",
              }}
            />
            AI News Intelligence
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
            AI-Powered News Analysis & Media Bias Intelligence
          </div>
          <div
            style={{
              fontSize: "21px",
              color: "#94A3B8",
              lineHeight: 1.4,
              maxWidth: "960px",
            }}
          >
            Deconstruct political framing, uncover media blindspots, and explore real-time sentiment distribution across global publications.
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: "flex",
            gap: "18px",
            width: "100%",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
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
              • Real-Time Sentiment
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#E2E8F0",
                lineHeight: 1.35,
              }}
            >
              Calibrated positive, neutral & negative tone extraction
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#A78BFA",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              • Political Framing
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#E2E8F0",
                lineHeight: 1.35,
              }}
            >
              Left, Center, and Right visual framing breakdown
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#FB923C",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              • Blindspot Detection
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#E2E8F0",
                lineHeight: 1.35,
              }}
            >
              Multi-source perspective and coverage divergence
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
            pixca.news
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
