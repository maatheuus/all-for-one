import { cacheTag } from "next/cache"
import { getPayload } from "payload"
import config from "@payload-config"
import { HUB_TAG } from "@/lib/revalidate-hub"
import type { Hub } from "@/lib/types"

const idOf = (value: number | { id: number }) => String(typeof value === "object" ? value.id : value)

/** Reads everything editable in Payload admin. Busted by the collection hooks and server actions. */
export async function getHub(): Promise<Hub> {
  "use cache"
  cacheTag(HUB_TAG)

  const payload = await getPayload({ config })
  const [categories, links, routines, site] = await Promise.all([
    payload.find({ collection: "categories", sort: "order", depth: 0, pagination: false }),
    payload.find({ collection: "links", sort: "title", depth: 0, pagination: false }),
    payload.find({ collection: "routines", sort: "startHour", depth: 0, pagination: false }),
    payload.findGlobal({ slug: "site", depth: 0 }),
  ])

  return {
    site: {
      ownerName: site.ownerName || "você",
      seoTitle: site.seoTitle || "All for One",
      seoDescription: site.seoDescription || "Todos os links e sites que você usa, num lugar só.",
    },
    categories: categories.docs.map((c) => ({ id: String(c.id), label: c.label, tone: c.tone })),
    links: links.docs.map((l) => ({
      id: String(l.id),
      title: l.title,
      url: l.url,
      category: idOf(l.category),
      description: l.description || undefined,
    })),
    pinnedOrder: links.docs
      .filter((l) => l.pinned)
      .sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0))
      .map((l) => String(l.id)),
    routines: routines.docs.map((r) => ({
      id: String(r.id),
      name: r.name,
      description: r.description ?? "",
      hours: [r.startHour, r.endHour],
      linkIds: (r.links ?? []).map(idOf),
    })),
  }
}
