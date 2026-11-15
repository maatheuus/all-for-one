import type { MetadataRoute } from "next"
import { BRAND } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "All for One",
    short_name: "All for One",
    description: "Todos os links e sites que você usa, num lugar só.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND.paper,
    theme_color: BRAND.ink,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  }
}
