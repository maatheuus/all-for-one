"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { Category, LinkItem } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LinkCard } from "./link-card"
import { rise } from "./motion"

const MOBILE_LIMIT = 8

export type SortMode = "popular" | "recent" | "alpha"

const sorters: Record<SortMode, (a: LinkItem, b: LinkItem) => number> = {
  popular: (a, b) => b.clicks - a.clicks,
  recent: (a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0) || b.clicks - a.clicks,
  alpha: (a, b) => a.title.localeCompare(b.title, "pt-BR"),
}

export function LinkGrid({
  links,
  categories,
  pinnedIds,
  category,
  sort,
  onCategoryChange,
  onSortChange,
  onOpened,
  onTogglePin,
  onEdit,
  onDelete,
}: {
  links: LinkItem[]
  categories: Category[]
  pinnedIds: Set<string>
  category: string
  sort: SortMode
  onCategoryChange: (category: string) => void
  onSortChange: (sort: SortMode) => void
  onOpened: (link: LinkItem) => void
  onTogglePin: (id: string) => void
  onEdit: (link: LinkItem) => void
  onDelete: (link: LinkItem) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const toneOf = new Map(categories.map((c) => [c.id, c.tone]))
  const visible = links.filter((l) => category === "all" || l.category === category).sort(sorters[sort])
  const filters = [
    { id: "all", label: "Todos", count: links.length },
    ...categories.map((c) => ({ id: c.id, label: c.label, count: links.filter((l) => l.category === c.id).length })),
  ].filter((f) => f.count > 0)

  return (
    <motion.section variants={rise} id="links" aria-labelledby="links-title" className="scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="links-title" className="text-sm font-semibold">
          Todos os links <span className="font-normal text-muted-foreground">· {links.length}</span>
        </h2>
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortMode)}>
          <SelectTrigger size="sm" className="rounded-full" aria-label="Ordenar">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="popular">Mais usados</SelectItem>
            <SelectItem value="recent">Recentes</SelectItem>
            <SelectItem value="alpha">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Padding keeps the focus ring inside the scroll container's clip box. */}
      <div className="-mx-4 mb-4 overflow-x-auto px-4 py-1 scrollbar-none sm:-mx-1 sm:px-1">
        <div role="tablist" aria-label="Categorias" className="flex w-max gap-1.5">
          {filters.map((f) => {
            const active = f.id === category
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategoryChange(f.id)}
                className={cn(
                  "relative h-9 rounded-full px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">
                  {f.label}
                  <span className={cn("ml-1.5 text-xs tabular-nums", active ? "opacity-60" : "opacity-50")}>
                    {f.count}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((link, i) => (
            <LinkCard
              key={link.id}
              link={link}
              tone={toneOf.get(link.category) ?? "sky"}
              className={!expanded && i >= MOBILE_LIMIT ? "max-sm:hidden" : undefined}
              pinned={pinnedIds.has(link.id)}
              onOpened={() => onOpened(link)}
              onTogglePin={() => onTogglePin(link.id)}
              onEdit={() => onEdit(link)}
              onDelete={() => onDelete(link)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length > MOBILE_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 h-10 w-full rounded-full border text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 sm:hidden"
        >
          {expanded ? "Mostrar menos" : `Ver todos · ${visible.length}`}
        </button>
      )}

      {visible.length === 0 && (
        <div className="grid place-items-center gap-2 rounded-3xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          <MagnifyingGlassIcon className="size-6" />
          Nenhum link nessa categoria ainda.
        </div>
      )}
    </motion.section>
  )
}
