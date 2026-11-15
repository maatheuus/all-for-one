"use client"

import { motion } from "motion/react"
import { ArrowUpRightIcon, LightningIcon, PlayIcon, SparkleIcon } from "@phosphor-icons/react"
import type { LinkItem, Routine } from "@/lib/mock-data"
import { Favicon } from "./favicon"
import { rise } from "./motion"

function FaviconStack({ links, ring }: { links: LinkItem[]; ring: string }) {
  return (
    <div className="flex -space-x-2">
      {links.map((link, i) => (
        <motion.span
          key={link.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 + i * 0.06 }}
          className={`grid size-9 place-items-center rounded-full bg-white ring-2 ${ring}`}
        >
          <Favicon url={link.url} className="size-4.5" />
        </motion.span>
      ))}
    </div>
  )
}

export function Routines({
  routines,
  suggestedId,
  linksById,
  onOpenAll,
}: {
  routines: Routine[]
  suggestedId?: string
  linksById: Map<string, LinkItem>
  onOpenAll: (routine: Routine) => void
}) {
  const resolve = (r: Routine) => r.linkIds.flatMap((id) => linksById.get(id) ?? [])
  const suggested = routines.find((r) => r.id === suggestedId) ?? routines[0]
  const others = routines.filter((r) => r.id !== suggested?.id)

  return (
    <motion.section variants={rise} id="routines" aria-labelledby="routines-title" className="scroll-mt-6">
      <h2 id="routines-title" className="mb-3 text-sm font-semibold">
        Rotinas
      </h2>
      <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
        {suggested && (
          <div className="relative overflow-hidden rounded-[28px] bg-forest p-6 text-forest-foreground">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-lime/25 blur-3xl dark:bg-black/10"
            />
            <div className="relative flex h-full flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-foreground/10 px-2.5 py-1 text-xs font-medium">
                  <SparkleIcon weight="fill" className="size-3.5" />
                  Sugerido agora
                </span>
                <span className="font-mono text-xs opacity-70">
                  {String(suggested.hours[0]).padStart(2, "0")}h–{String(suggested.hours[1] % 24).padStart(2, "0")}h
                </span>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight">{suggested.name}</p>
                <p className="mt-1 text-sm opacity-70">{suggested.description}</p>
              </div>
              <div className="mt-auto flex items-end justify-between gap-4">
                <FaviconStack links={resolve(suggested)} ring="ring-forest" />
                <motion.button
                  type="button"
                  onClick={() => onOpenAll(suggested)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-lime pr-2 pl-5 text-sm font-semibold text-lime-foreground outline-none focus-visible:ring-3 focus-visible:ring-lime/50 dark:bg-foreground dark:text-background"
                >
                  Abrir tudo
                  <span className="grid size-7 place-items-center rounded-full bg-lime-foreground text-lime transition-transform duration-300 group-hover:rotate-45 dark:bg-background dark:text-foreground">
                    <ArrowUpRightIcon weight="bold" className="size-3.5" />
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        )}
        <ul className="grid gap-3">
          {others.map((routine) => {
            const links = resolve(routine)
            return (
              <li key={routine.id}>
                <button
                  type="button"
                  onClick={() => onOpenAll(routine)}
                  className="group flex w-full items-center gap-4 rounded-3xl border bg-card p-4 text-left transition-colors outline-none hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted">
                    <LightningIcon weight="duotone" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{routine.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {links.length} links · {routine.description}
                    </span>
                  </span>
                  <span className="hidden -space-x-1.5 sm:flex">
                    {links.slice(0, 3).map((l) => (
                      <span key={l.id} className="grid size-7 place-items-center rounded-full bg-white ring-2 ring-card">
                        <Favicon url={l.url} className="size-3.5" />
                      </span>
                    ))}
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:scale-110">
                    <PlayIcon weight="fill" className="size-3.5" />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </motion.section>
  )
}
