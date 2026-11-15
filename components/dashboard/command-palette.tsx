"use client"

import { useState } from "react"
import {
  DownloadSimpleIcon,
  GlobeIcon,
  KeyboardIcon,
  LightningIcon,
  MoonIcon,
  PlusIcon,
  TimerIcon,
} from "@phosphor-icons/react"
import { getDomain } from "@/lib/hub"
import type { LinkItem, Routine } from "@/lib/mock-data"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Favicon } from "./favicon"

export type PaletteAction = "new-link" | "toggle-theme" | "focus" | "export" | "shortcuts"

const actions: { id: PaletteAction; label: string; icon: React.ElementType; shortcut?: string }[] = [
  { id: "new-link", label: "Novo link", icon: PlusIcon, shortcut: "N" },
  { id: "focus", label: "Iniciar sessão de foco", icon: TimerIcon, shortcut: "F" },
  { id: "toggle-theme", label: "Alternar tema", icon: MoonIcon, shortcut: "T" },
  { id: "export", label: "Exportar backup (JSON)", icon: DownloadSimpleIcon },
  { id: "shortcuts", label: "Atalhos de teclado", icon: KeyboardIcon, shortcut: "?" },
]

/** Mounted only while the dialog is open, so the query resets on every open. */
function PaletteBody({
  links,
  routines,
  onOpenLink,
  onOpenRoutine,
  onAction,
  onSearchWeb,
}: {
  links: LinkItem[]
  routines: Routine[]
  onOpenLink: (link: LinkItem) => void
  onOpenRoutine: (routine: Routine) => void
  onAction: (action: PaletteAction) => void
  onSearchWeb: (query: string) => void
}) {
  const [query, setQuery] = useState("")
  const sorted = [...links].sort((a, b) => b.clicks - a.clicks)

  return (
    <Command className="rounded-none!">
      <CommandInput placeholder="Buscar links, rotinas e ações…" value={query} onValueChange={setQuery} />
      <CommandList className="max-h-[min(60vh,420px)]">
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Links">
          {sorted.map((link) => (
            <CommandItem
              key={link.id}
              value={`link-${link.id}`}
              keywords={[link.title, getDomain(link.url), link.description ?? ""]}
              onSelect={() => onOpenLink(link)}
            >
              <Favicon url={link.url} className="size-4" />
              <span className="truncate">{link.title}</span>
              <span className="truncate text-xs text-muted-foreground">{getDomain(link.url)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Rotinas">
          {routines.map((routine) => (
            <CommandItem
              key={routine.id}
              value={`routine-${routine.id}`}
              keywords={[routine.name, routine.description, "rotina", "abrir tudo"]}
              onSelect={() => onOpenRoutine(routine)}
            >
              <LightningIcon weight="duotone" />
              <span className="truncate">Abrir “{routine.name}”</span>
              <CommandShortcut>{routine.linkIds.length} links</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações">
          {actions.map(({ id, label, icon: Icon, shortcut }) => (
            <CommandItem key={id} value={`action-${id}`} keywords={[label]} onSelect={() => onAction(id)}>
              <Icon />
              {label}
              {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>
        {query.trim() && (
          <>
            <CommandSeparator alwaysRender />
            <CommandGroup heading="Web" forceMount>
              <CommandItem forceMount value="web-search" onSelect={() => onSearchWeb(query.trim())}>
                <GlobeIcon />
                <span className="truncate">
                  Buscar “<span className="font-medium">{query.trim()}</span>” no Google
                </span>
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  )
}

export function CommandPalette({
  open,
  onOpenChange,
  ...props
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
} & React.ComponentProps<typeof PaletteBody>) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Busca rápida"
      description="Busque links, rotinas e ações"
      className="rounded-2xl! sm:max-w-xl"
    >
      <PaletteBody {...props} />
    </CommandDialog>
  )
}
