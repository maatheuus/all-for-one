"use client"

import { motion } from "motion/react"
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react"
import type { LinkItem } from "@/lib/mock-data"
import { Favicon } from "./favicon"
import { rise } from "./motion"

const timeFormat = new Intl.DateTimeFormat("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" })

export function Recents({ links, onOpen }: { links: LinkItem[]; onOpen: (link: LinkItem) => void }) {
  const recent = links
    .filter((l) => l.lastOpened)
    .sort((a, b) => (b.lastOpened ?? 0) - (a.lastOpened ?? 0))
    .slice(0, 5)

  return (
    <motion.section variants={rise} aria-labelledby="recents-title" className="rounded-[28px] border bg-card p-5">
      <h2 id="recents-title" className="text-sm font-semibold">
        Abertos recentemente
      </h2>
      {recent.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <ClockCounterClockwiseIcon className="size-4" />
          Os links que você abrir aparecem aqui.
        </p>
      ) : (
        <ul className="mt-2 grid">
          {recent.map((link) => (
            <motion.li key={link.id} layout>
              <button
                type="button"
                onClick={() => onOpen(link)}
                className="flex w-full items-center gap-3 rounded-xl py-2 text-left outline-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="grid size-8 place-items-center rounded-xl border bg-background">
                  <Favicon url={link.url} className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{link.title}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{timeFormat.format(link.lastOpened)}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  )
}
