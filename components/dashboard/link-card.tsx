"use client"

import { motion } from "motion/react"
import { toast } from "sonner"
import {
  ArrowUpRightIcon,
  CopyIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  PushPinIcon,
  PushPinSlashIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { getDomain } from "@/lib/hub"
import { categoryById, type LinkItem, type Tone } from "@/lib/mock-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Favicon } from "./favicon"
import { ease } from "./motion"

const toneBg: Record<Tone, string> = {
  peach: "bg-peach",
  lilac: "bg-lilac",
  mint: "bg-mint",
  sky: "bg-sky",
  butter: "bg-butter",
  rose: "bg-rose",
}

export function LinkCard({
  link,
  pinned,
  onOpened,
  onTogglePin,
  onEdit,
  onDelete,
}: {
  link: LinkItem
  pinned: boolean
  onOpened: () => void
  onTogglePin: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const category = categoryById[link.category]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.45, ease }}
      className={cn(
        "group relative flex min-h-44 flex-col rounded-[26px] p-4 transition-shadow hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)]",
        toneBg[category.tone],
      )}
    >
      {/* Stretched link keeps native behaviour (cmd/middle click) while the whole card is clickable. */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onOpened}
        onAuxClick={onOpened}
        className="absolute inset-0 rounded-[26px] outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        <span className="sr-only">Abrir {link.title}</span>
      </a>

      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-white shadow-sm">
          <Favicon url={link.url} className="size-5.5" />
        </span>
        <div className="relative z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={pinned ? "Desafixar" : "Fixar"}
            aria-pressed={pinned}
            className={cn(
              "grid size-8 place-items-center rounded-full outline-none transition-all hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50",
              pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            )}
          >
            <PushPinIcon weight={pinned ? "fill" : "regular"} className="size-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Ações de ${link.title}`}
                className="grid size-8 place-items-center rounded-full outline-none hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <DotsThreeIcon weight="bold" className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onSelect={() => {
                  navigator.clipboard.writeText(link.url)
                  toast.success("URL copiada")
                }}
              >
                <CopyIcon /> Copiar URL
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onEdit}>
                <PencilSimpleIcon /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onTogglePin}>
                {pinned ? <PushPinSlashIcon /> : <PushPinIcon />} {pinned ? "Desafixar" : "Fixar no dock"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <TrashIcon /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <h3 className="truncate text-[17px] font-semibold tracking-tight">{link.title}</h3>
        <p className="truncate text-xs text-foreground/60">{link.description ?? getDomain(link.url)}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-foreground/[0.07] px-2 py-0.5 font-mono text-[11px] tabular-nums">
          {link.clicks} aberturas
        </span>
        <span className="grid size-8 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:rotate-45">
          <ArrowUpRightIcon weight="bold" className="size-3.5" />
        </span>
      </div>
    </motion.article>
  )
}
