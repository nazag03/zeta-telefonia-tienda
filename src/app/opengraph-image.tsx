import { ImageResponse } from "next/og";

export const alt = "Zeta Telefonía - San Francisco, Córdoba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";


export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 85% 15%, #f76a12 0%, #3a1505 35%, #070707 70%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 150, fontWeight: 900, color: "#f76a12", lineHeight: 0.9, letterSpacing: -6 }}>ZETA</div>
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>TELEFONÍA</div>
        <div style={{ marginTop: 40, fontSize: 34, color: "#cfcfd4" }}>iPhone sellados y usados · Celulares · Accesorios</div>
        <div style={{ marginTop: 12, fontSize: 26, color: "#a3a3ab", letterSpacing: 8 }}>SAN FRANCISCO · CÓRDOBA</div>
      </div>
    ),
    size
  );
}
