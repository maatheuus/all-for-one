"use client"

import { useRef } from "react"
import { motion, Reorder } from "motion/react"
import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react"
import type { LinkItem } from "@/lib/mock-data"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Favicon } from "./favicon"
import { rise } from "./motion"

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
      <div className="-mx-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
        <Reorder.Group
          axis="x"
          values={links.map((l) => l.id)}
          onReorder={onReorder}
          className="flex w-max gap-3"
        >
          {links.map((link, i) => (
            <Reorder.Item
              key={link.id}
              value={link.id}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={() => setTimeout(() => (dragged.current = false))}
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
                    className="group flex w-[76px] cursor-grab flex-col items-center gap-2 outline-none active:cursor-grabbing"
                  >
                    <span className="relative grid size-16 place-items-center rounded-[22px] border bg-card shadow-[0_1px_0_rgb(0_0_0/0.03),0_8px_24px_-12px_rgb(0_0_0/0.18)] transition-colors group-hover:border-foreground/15 group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
                      <Favicon url={link.url} className="size-7 rounded-lg" />
                      {i < 9 && (
                        <span className="absolute -top-1.5 -left-1.5 grid size-5 place-items-center rounded-full bg-foreground font-mono text-[10px] font-medium text-background">
                          {i + 1}
                        </span>
                      )}
                      <DotsSixVerticalIcon className="absolute top-1 right-1 size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <span className="w-full truncate text-center text-xs font-medium">{link.title}</span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{link.description ?? link.title}</TooltipContent>
              </Tooltip>
            </Reorder.Item>
          ))}
          <li className="list-none">
            <motion.button
              type="button"
              onClick={onAdd}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="group flex w-[76px] flex-col items-center gap-2 outline-none"
            >
              <span className="grid size-16 place-items-center rounded-[22px] border border-dashed border-foreground/20 text-muted-foreground transition-colors group-hover:border-foreground/40 group-hover:text-foreground group-focus-visible:ring-3 group-focus-visible:ring-ring/50">
                <PlusIcon className="size-5" weight="bold" />
              </span>
              <span className="text-xs text-muted-foreground">Adicionar</span>
            </motion.button>
          </li>
        </Reorder.Group>
      </div>
    </motion.section>
  )
}
