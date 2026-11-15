import { ImageResponse } from "next/og"
import { BRAND } from "@/lib/site"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.lime }}>
        <svg width="112" height="112" viewBox="0 0 32 32" fill="none">
          <path d="M6 7 L19 16 M6 16 H19 M6 25 L19 16" stroke={BRAND.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="16" r="4" fill={BRAND.ink} />
        </svg>
      </div>
    ),
    size,
  )
}
