import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

const pages = ["", "/links", "/rotinas", "/ler-depois", "/foco"]

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: path ? 0.7 : 1 }))
}
