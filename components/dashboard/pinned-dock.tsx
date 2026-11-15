"use client"

import { useRef, useState, useSyncExternalStore } from "react"
import { motion, Reorder } from "motion/react"
import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react"
import type { LinkItem } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Favicon } from "./favicon"
import { rise } from "./motion"

const desktopQuery = "(min-width: 640px)"

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(desktopQuery)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

const tileButton = "group flex w-full flex-col items-center gap-2 outline-none sm:w-[76px]"

function Tile({ link, index }: { link: LinkItem; index: number }) {
  return (
    <>
      <span className="relative grid size-16 place-items-center rounded-[22px] border bg-card shadow-[0_1px_0_rgb(0_0_0/0.03),0_8px_24px_-12px_rgb(0_0_0/0.18)] transition-colors group-hover:border-foreground/15 group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
        <Favicon url={link.url} className="size-7 rounded-lg" />
        {index < 9 && (
          <span className="absolute -top-1.5 -left-1.5 hidden size-5 place-items-center rounded-full bg-foreground font-mono text-[10px] font-medium text-background sm:grid">
            {index + 1}
          </span>
        )}
        <DotsSixVerticalIcon className="absolute top-1 right-1 hidden size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
      </span>
      <span className="w-full truncate text-center text-xs font-medium">{link.title}</span>
    </>
  )
}

function AddTile({ onAdd }: { onAdd: () => void }) {
  return (
    <li className="list-none">
      <motion.button type="button" onClick={onAdd} whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} className={tileButton}>
        <span className="grid size-16 place-items-center rounded-[22px] border border-dashed border-foreground/20 text-muted-foreground transition-colors group-hover:border-foreground/40 group-hover:text-foreground group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
          <PlusIcon className="size-5" weight="bold" />
        </span>
        <span className="text-xs text-muted-foreground">Adicionar</span>
      </motion.button>
    </li>
  )
}

export function PinnedDock({
  links,
  onReorder,
  onOpen,
  onAdd,
}: {
  links: LinkItem[]
  onReorder: (ids: string[]) => void
  onOpen: (link: LinkItem) => void
  onAdd: () => void
}) {
  const dragged = useRef(false)
  // Reorder fires on every swap while dragging; keep the order locally and save once on drop.
  const [dragOrder, setDragOrder] = useState<string[] | null>(null)
  const dragOrderRef = useRef<string[] | null>(null)
  const byId = new Map(links.map((l) => [l.id, l]))
  const ordered = dragOrder ? dragOrder.flatMap((id) => byId.get(id) ?? []) : links

  function updateDragOrder(ids: string[]) {
    dragOrderRef.current = ids
    setDragOrder(ids)
  }

  function commitDragOrder() {
    const ids = dragOrderRef.current
    dragOrderRef.current = null
    setDragOrder(null)
    if (ids && ids.join() !== links.map((l) => l.id).join()) onReorder(ids)
  }
  // Drag-to-reorder captures touch pans, so phones get a plain wrapping grid instead.
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(desktopQuery).matches, () => true)

  return (
    <motion.section variants={rise} aria-labelledby="pinned-title">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="pinned-title" className="text-sm font-semibold">
          Fixados
        </h2>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Arraste para reordenar · teclas <span className="font-mono">1–9</span> abrem
        </p>
      </div>

      {isDesktop ? (
        // Padding gives the number badges and hover lift room inside the scroll container's clip box.
        <div className="-mx-2 overflow-x-auto px-2 pt-2 pb-2 scrollbar-none">
          <Reorder.Group
            axis="x"
            values={ordered.map((l) => l.id)}
            onReorder={updateDragOrder}
            className="flex w-max gap-3"
          >
            {ordered.map((link, i) => (
              <Reorder.Item
                key={link.id}
                value={link.id}
                onDragStart={() => (dragged.current = true)}
                onDragEnd={() => {
                  commitDragOrder()
                  setTimeout(() => (dragged.current = false))
                }}
                whileDrag={{ scale: 1.08, zIndex: 10 }}
                className="relative list-none"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      type="button"
                      onClick={() => !dragged.current && onOpen(link)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${tileButton} cursor-grab active:cursor-grabbing`}
                    >
                      <Tile link={link} index={i} />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{link.description ?? link.title}</TooltipContent>
                </Tooltip>
              </Reorder.Item>
            ))}
            <AddTile onAdd={onAdd} />
          </Reorder.Group>
        </div>
      ) : (
        <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
          {links.map((link, i) => (
            <li key={link.id} className="list-none">
              <motion.button type="button" onClick={() => onOpen(link)} whileTap={{ scale: 0.95 }} className={tileButton}>
                <Tile link={link} index={i} />
              </motion.button>
            </li>
          ))}
          <AddTile onAdd={onAdd} />
        </ul>
      )}
    </motion.section>
  )
}
