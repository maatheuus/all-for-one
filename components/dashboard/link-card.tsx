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
import type { LinkItem, Tone } from "@/lib/types"
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
  tone,
  pinned,
  onOpened,
  onTogglePin,
  onEdit,
  onDelete,
  className,
}: {
  link: LinkItem
  tone: Tone
  pinned: boolean
  onOpened: () => void
  onTogglePin: () => void
  onEdit: () => void
  onDelete: () => void
  className?: string
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.45, ease }}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl p-2.5 transition-shadow hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)] sm:min-h-44 sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-[26px] sm:p-4",
        toneBg[tone],
        className,
      )}
    >
      {/* Stretched link keeps native behaviour (cmd/middle click) while the whole card is clickable. */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onOpened}
        onAuxClick={onOpened}
        className="absolute inset-0 rounded-2xl outline-none sm:rounded-[26px] focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        <span className="sr-only">Abrir {link.title}</span>
      </a>

      {/* Below sm the header dissolves (contents) so icon, title and actions sit in one compact row. */}
      <div className="contents sm:flex sm:items-start sm:justify-between">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm sm:size-11 sm:rounded-2xl">
          <Favicon url={link.url} className="size-5.5" />
        </span>
        <div className="relative z-10 order-last flex items-center gap-1 sm:order-none">
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={pinned ? "Desafixar" : "Fixar"}
            aria-pressed={pinned}
            className={cn(
              "grid size-8 place-items-center rounded-full outline-none transition-all hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50",
              pinned ? "opacity-100" : "max-sm:hidden opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
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

      <div className="min-w-0 flex-1 sm:mt-auto sm:flex-none sm:pt-6">
        <h3 className="truncate text-[15px] font-semibold tracking-tight sm:text-[17px]">{link.title}</h3>
        <p className="truncate text-xs text-foreground/60">{link.description ?? getDomain(link.url)}</p>
      </div>

      <div className="mt-3 hidden items-center justify-between sm:flex">
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
