import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "PortiBoard Blog";
  const author = searchParams.get("author") ?? "PortiBoard";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #0b172a 0%, #102a47 48%, #1f7b70 100%)",
        padding: "48px",
        color: "#ecf6ff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          border: "1px solid rgba(200, 233, 255, 0.28)",
          borderRadius: "24px",
          padding: "36px",
          background: "rgba(7, 20, 38, 0.58)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            PortiBoard Journal
          </div>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.12,
              fontWeight: 700,
              maxWidth: "980px",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "999px",
                background: "#47e0ce",
              }}
            />
            <div style={{ fontSize: 32 }}>by {author}</div>
          </div>
          <div style={{ fontSize: 30, opacity: 0.9 }}>portiboard.dev</div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
