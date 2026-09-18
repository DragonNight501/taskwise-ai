import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — Turn a goal into a plan`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #ffffff 0%, #e7ebf5 55%, #dfe7f7 100%)",
          color: "#0d1117",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, color: "#4f46e5", letterSpacing: 6 }}>AI PLANNING ENGINE</div>
        <div style={{ marginTop: 24, fontSize: 92, fontWeight: 700 }}>{site.name}</div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#5a6376" }}>
          Turn any goal into a plan you can execute.
        </div>
      </div>
    ),
    size,
  );
}
