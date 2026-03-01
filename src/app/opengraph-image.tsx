import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CodexLib — The Library of Alexandria for AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          <span style={{ color: "#D4A843" }}>Codex</span>
          <span style={{ color: "#e8e8ed" }}>Lib</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#D4A843",
            marginTop: 16,
            display: "flex",
          }}
        >
          The Library of Alexandria for AI
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#6b6b80",
            marginTop: 16,
            display: "flex",
          }}
        >
          10,000+ AI-optimized knowledge packs in compressed format
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 32,
            fontSize: 16,
            color: "#6b6b80",
          }}
        >
          <span>Free Tier</span>
          <span style={{ color: "#2a2a3a" }}>|</span>
          <span>Pro $12/mo</span>
          <span style={{ color: "#2a2a3a" }}>|</span>
          <span>REST API</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
