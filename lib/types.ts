export type Tone = "peach" | "lilac" | "mint" | "sky" | "butter" | "rose"

export type Category = { id: string; label: string; tone: Tone }

/** A link as stored in Payload. */
export type HubLink = {
  id: string
  title: string
  url: string
  category: string
  description?: string
}

/** A link merged with this browser's usage stats. */
export type LinkItem = HubLink & { clicks: number; lastOpened?: number }

export type Routine = {
  id: string
  name: string
  description: string
  /** Hours [start, end) when this routine is suggested. */
  hours: [number, number]
  linkIds: string[]
}

export type Site = { ownerName: string; seoTitle: string; seoDescription: string }

/** Everything edited in Payload admin. */
export type Hub = {
  site: Site
  categories: Category[]
  links: HubLink[]
  pinnedOrder: string[]
  routines: Routine[]
}

export type ReadLaterItem = { id: string; title: string; url: string; done: boolean }

/** Personal, per-browser data kept in localStorage. */
export type LocalData = {
  usage: Record<string, { clicks: number; lastOpened: number }>
  readLater: ReadLaterItem[]
  notes: string
  /** Opens per local day, keyed YYYY-MM-DD. */
  activity: Record<string, number>
}
