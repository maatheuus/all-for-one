"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import { ArrowUpRightIcon, CheckIcon, PlusIcon, XIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { getDomain, normalizeUrl } from "@/lib/hub"
import type { ReadLaterItem } from "@/lib/types"
import { rise } from "./motion"

export function ReadLater({
  items,
  onAdd,
  onToggle,
  onRemove,
  onOpen,
}: {
  items: ReadLaterItem[]
  onAdd: (url: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onOpen: (item: ReadLaterItem) => void
}) {
  const [value, setValue] = useState("")
  const pending = items.filter((i) => !i.done).length

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const url = normalizeUrl(value)
    if (!url) {
      toast.error("URL inválida")
      return
    }
    onAdd(url)
    setValue("")
  }

  return (
    <motion.section
      variants={rise}
      id="read-later"
      aria-labelledby="read-later-title"
      className="scroll-mt-6 rounded-[28px] border bg-card p-5"
    >
      <div className="flex items-baseline justify-between">
        <h2 id="read-later-title" className="text-sm font-semibold">
          Ler depois
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">{pending} pendentes</span>
      </div>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-full border bg-background px-1.5 py-1 focus-within:ring-3 focus-within:ring-ring/30">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cole um link e Enter"
          aria-label="Adicionar link para ler depois"
          className="h-7 min-w-0 flex-1 bg-transparent pl-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Adicionar"
          className="grid size-7 place-items-center rounded-full bg-foreground text-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <PlusIcon weight="bold" className="size-3.5" />
        </button>
      </form>

      <ul className="mt-3 grid">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="group flex items-center gap-3 py-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.done}
                  aria-label={item.done ? "Marcar como não lido" : "Marcar como lido"}
                  onClick={() => onToggle(item.id)}
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    item.done ? "border-forest bg-forest text-forest-foreground" : "border-foreground/25 hover:border-foreground/50",
                  )}
                >
                  <AnimatePresence>
                    {item.done && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckIcon weight="bold" className="size-3" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="min-w-0 flex-1 text-left outline-none focus-visible:underline"
                >
                  <span className="relative block truncate text-sm font-medium">
                    <span className={cn("transition-colors", item.done && "text-muted-foreground")}>{item.title}</span>
                    <motion.span
                      aria-hidden
                      className="absolute top-1/2 left-0 h-px w-full origin-left bg-muted-foreground"
                      initial={false}
                      animate={{ scaleX: item.done ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{getDomain(item.url)}</span>
                </button>
                <ArrowUpRightIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remover ${item.title}`}
                  className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 outline-none transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {items.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Fila vazia ✨</p>}
    </motion.section>
  )
}
