import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") || "Yoosr"
  const description =
    searchParams.get("description") ||
    "AI-Powered Customer Support Platform"
  const isDark = searchParams.get("theme") === "dark"

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#0C0B0F" : "#ffffff",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: isDark ? "#ffffff" : "#0f172a",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          🤖 {title}
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: isDark ? "#94a3b8" : "#64748b",
            fontWeight: 400,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
            padding: "0 40px",
          }}
        >
          {description}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            fontSize: 24,
            color: isDark ? "#475569" : "#94a3b8",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          yoosr.co
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
