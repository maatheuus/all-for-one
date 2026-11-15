import { ImageResponse } from "next/og"
import { getHub } from "@/lib/hub-server"
import { BRAND } from "@/lib/site"

export const alt = "All for One — todos os seus links num lugar só"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const { site } = await getHub()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BRAND.ink,
          color: BRAND.paper,
        }}
      >
        <div style={{ display: "flex", width: 120, height: 120, alignItems: "center", justifyContent: "center", borderRadius: 32, background: BRAND.lime }}>
          <svg width="76" height="76" viewBox="0 0 32 32" fill="none">
            <path d="M6 7 L19 16 M6 16 H19 M6 25 L19 16" stroke={BRAND.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="16" r="4" fill={BRAND.ink} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>{site.seoTitle}</div>
          <div style={{ fontSize: 40, color: BRAND.lime, maxWidth: 900 }}>{site.seoDescription}</div>
        </div>
      </div>
    ),
    size,
  )
}
