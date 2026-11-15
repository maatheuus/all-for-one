"use client"

import { createContext, startTransition, use, useEffect, useOptimistic, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { dayKey, getDomain, loadLocalData, normalizeUrl, openUrl, saveLocalData } from "@/lib/hub"
import type { Hub, HubLink, LinkItem, Routine } from "@/lib/types"
import * as actions from "@/app/(frontend)/actions"
import { Logo } from "@/components/logo"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { CommandPalette, type PaletteAction } from "./command-palette"
import { startTimer, useFocusTimer } from "./focus-timer"
import { LinkDialog, type LinkDraft } from "./link-dialog"
import { rise, stagger } from "./motion"
import { ShortcutsDialog } from "./shortcuts-dialog"
import { nav, SidebarRail, ThemeToggleIcon } from "./sidebar-rail"

type DialogState = { open: boolean; link?: LinkItem; initialUrl?: string }

type Change =
  | { type: "save"; link: HubLink; pinned: boolean }
  | { type: "delete"; id: string }
  | { type: "pin"; id: string; pinned: boolean }
  | { type: "reorder"; ids: string[] }

function applyChange(hub: Hub, change: Change): Hub {
  switch (change.type) {
    case "save": {
      const { link, pinned } = change
      const exists = hub.links.some((l) => l.id === link.id)
      const links = exists ? hub.links.map((l) => (l.id === link.id ? link : l)) : [...hub.links, link]
      return { ...hub, links, pinnedOrder: withPin(hub.pinnedOrder, link.id, pinned) }
    }
    case "delete":
      return {
        ...hub,
        links: hub.links.filter((l) => l.id !== change.id),
        pinnedOrder: hub.pinnedOrder.filter((p) => p !== change.id),
      }
    case "pin":
      return { ...hub, pinnedOrder: withPin(hub.pinnedOrder, change.id, change.pinned) }
    case "reorder":
      return { ...hub, pinnedOrder: change.ids }
  }
}

function withPin(order: string[], id: string, pinned: boolean) {
  if (!pinned) return order.filter((p) => p !== id)
  return order.includes(id) ? order : [...order, id]
}

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

function useHubState(serverHub: Hub) {
  const [hub, addChange] = useOptimistic(serverHub, applyChange)
  const [local, setLocal] = useState(loadLocalData)
  const [timer, setTimer] = useFocusTimer()
  const [hour] = useState(() => new Date().getHours())

  useEffect(() => saveLocalData(local), [local])

  const links: LinkItem[] = hub.links.map((l) => ({
    ...l,
    clicks: local.usage[l.id]?.clicks ?? 0,
    lastOpened: local.usage[l.id]?.lastOpened,
  }))
  const linksById = new Map(links.map((l) => [l.id, l]))

  return {
    hub,
    addChange,
    local,
    setLocal,
    timer,
    setTimer,
    links,
    linksById,
    pinnedLinks: hub.pinnedOrder.flatMap((id) => linksById.get(id) ?? []),
    pinnedIds: new Set(hub.pinnedOrder),
    suggested: hub.routines.find((r) => hour >= r.hours[0] && hour < r.hours[1]),
    pendingReads: local.readLater.filter((i) => !i.done).length,
    /** Opens per day for the last 7 days, oldest first. */
    activity: Array.from({ length: 7 }, (_, i) => local.activity[dayKey(i - 6)] ?? 0),
  }
}

type HubContextValue = ReturnType<typeof useHubState> & {
  openLink: (link: LinkItem) => void
  markOpened: (ids: string[]) => void
  openRoutine: (routine: Routine) => void
  togglePin: (id: string) => void
  reorderPinned: (ids: string[]) => void
  deleteLink: (link: LinkItem) => void
  newLink: () => void
  editLink: (link: LinkItem) => void
  openPalette: () => void
  toggleTheme: () => void
}

const HubContext = createContext<HubContextValue | null>(null)

export function useHub() {
  const value = use(HubContext)
  if (!value) throw new Error("useHub must be used inside HubShell")
  return value
}

export function HubShell({ hub: serverHub, children }: { hub: Hub; children: React.ReactNode }) {
  const state = useHubState(serverHub)
  const { hub, addChange, local, setLocal, setTimer, links, linksById, pinnedLinks, pinnedIds } = state
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [dialog, setDialog] = useState<DialogState>({ open: false })
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const anyDialogOpen = paletteOpen || shortcutsOpen || dialog.open

  // --- actions -------------------------------------------------------------

  /** Applies `change` optimistically, then persists it; the optimistic state reverts if the server refuses. */
  function persist(change: Change, run: () => Promise<actions.ActionResult>, onSaved?: (id?: string) => void) {
    startTransition(async () => {
      addChange(change)
      const result = await run()
      if (result.ok) {
        onSaved?.(result.id)
        return
      }
      toast.error(result.error, {
        action: { label: "Entrar", onClick: () => window.open("/admin", "_blank") },
      })
    })
  }

  function markOpened(ids: string[]) {
    const now = Date.now()
    const today = dayKey()
    setLocal((d) => ({
      ...d,
      usage: {
        ...d.usage,
        ...Object.fromEntries(ids.map((id) => [id, { clicks: (d.usage[id]?.clicks ?? 0) + 1, lastOpened: now }])),
      },
      activity: { ...d.activity, [today]: (d.activity[today] ?? 0) + ids.length },
    }))
  }

  function openLink(link: LinkItem) {
    openUrl(link.url)
    markOpened([link.id])
  }

  function openRoutine(routine: Routine) {
    const routineLinks = routine.linkIds.flatMap((id) => linksById.get(id) ?? [])
    routineLinks.forEach((l) => openUrl(l.url))
    markOpened(routineLinks.map((l) => l.id))
    toast(`Abrindo “${routine.name}”`, {
      description: `${routineLinks.length} abas. Se só uma abriu, permita pop-ups para este site.`,
    })
  }

  function togglePin(id: string) {
    const pinned = !pinnedIds.has(id)
    persist({ type: "pin", id, pinned }, () => actions.setPinned(id, pinned), () =>
      toast(pinned ? "Fixado no dock" : "Removido do dock"),
    )
  }

  function reorderPinned(ids: string[]) {
    persist({ type: "reorder", ids }, () => actions.reorderPinned(ids))
  }

  function saveLink(draft: LinkDraft) {
    const editing = dialog.link
    const { pinned, ...fields } = draft
    const link: HubLink = { id: editing?.id ?? `tmp-${crypto.randomUUID()}`, ...fields }
    setDialog({ open: false })
    persist({ type: "save", link, pinned }, () => actions.saveLink(editing?.id, draft), () =>
      toast.success(editing ? "Link atualizado" : `${draft.title} adicionado`),
    )
  }

  function deleteLink(link: LinkItem) {
    const wasPinned = pinnedIds.has(link.id)
    persist({ type: "delete", id: link.id }, () => actions.deleteLink(link.id), () =>
      toast(`${link.title} excluído`, {
        action: { label: "Desfazer", onClick: () => restoreLink(link, wasPinned) },
      }),
    )
  }

  function restoreLink(link: LinkItem, pinned: boolean) {
    const { id: oldId, title, url, category, description } = link
    const input = { title, url, category, description, pinned }
    persist({ type: "save", link: { id: oldId, title, url, category, description }, pinned }, () =>
      actions.saveLink(undefined, input),
      (newId) => {
        // Payload gives the restored link a new id; carry its usage stats over.
        if (!newId) return
        setLocal((d) => {
          const { [oldId]: usage, ...rest } = d.usage
          return usage ? { ...d, usage: { ...rest, [newId]: usage } } : d
        })
      },
    )
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  function startFocus() {
    setTimer(startTimer)
    toast("Foco iniciado · 25 min")
    const section = document.getElementById("focus")
    if (section) section.scrollIntoView({ behavior: "smooth", block: "center" })
    else router.push("/foco")
  }

  function exportBackup() {
    const backup = { hub: { categories: hub.categories, links: hub.links, routines: hub.routines }, local }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `all-for-one-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success("Backup exportado")
  }

  function runAction(action: PaletteAction) {
    setPaletteOpen(false)
    if (action === "new-link") setDialog({ open: true })
    if (action === "toggle-theme") toggleTheme()
    if (action === "focus") startFocus()
    if (action === "export") exportBackup()
    if (action === "shortcuts") setShortcutsOpen(true)
  }

  // --- keyboard & paste ----------------------------------------------------

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      if (anyDialogOpen || isEditable(e.target) || e.metaKey || e.ctrlKey || e.altKey) return

      const digit = Number(e.key)
      if (Number.isInteger(digit) && digit >= 1 && digit <= 9) {
        const link = pinnedLinks[digit - 1]
        if (link) openLink(link)
        return
      }
      const handlers: Record<string, () => void> = {
        "/": () => setPaletteOpen(true),
        n: () => setDialog({ open: true }),
        f: startFocus,
        t: toggleTheme,
        "?": () => setShortcutsOpen(true),
      }
      const handler = handlers[e.key.toLowerCase()]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    function onPaste(e: ClipboardEvent) {
      if (anyDialogOpen || isEditable(e.target)) return
      const url = normalizeUrl(e.clipboardData?.getData("text") ?? "")
      if (!url) return
      const existing = links.find((l) => getDomain(l.url) === getDomain(url) && l.url === url)
      if (existing) {
        toast(`${existing.title} já está no seu hub`)
        return
      }
      setDialog({ open: true, initialUrl: url })
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("paste", onPaste)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("paste", onPaste)
    }
  })

  // --- layout --------------------------------------------------------------

  const value: HubContextValue = {
    ...state,
    openLink,
    markOpened,
    openRoutine,
    togglePin,
    reorderPinned,
    deleteLink,
    newLink: () => setDialog({ open: true }),
    editLink: (link) => setDialog({ open: true, link }),
    openPalette: () => setPaletteOpen(true),
    toggleTheme,
  }

  return (
    <HubContext value={value}>
      <div className="min-h-dvh">
        <div className="mx-auto flex max-w-[1680px] gap-3 p-2 pb-24 sm:p-3 sm:pb-24 lg:pb-3">
          <SidebarRail onShortcuts={() => setShortcutsOpen(true)} />
          {children}
        </div>

        <nav
          aria-label="Seções"
          className="fixed inset-x-2 bottom-2 z-40 grid grid-cols-5 rounded-[24px] bg-sidebar p-1.5 text-sidebar-foreground shadow-lg lg:hidden"
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-[18px] py-1.5 text-[11px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-lime/50",
                  active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/60",
                )}
              >
                <Icon weight={active ? "fill" : "regular"} className="size-5" />
                <span className="max-w-full truncate px-1">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <LinkDialog
        categories={hub.categories}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        link={dialog.link}
        initialUrl={dialog.initialUrl}
        initiallyPinned={dialog.link ? pinnedIds.has(dialog.link.id) : false}
        onSubmit={saveLink}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        links={links}
        routines={hub.routines}
        onOpenLink={(link) => {
          setPaletteOpen(false)
          openLink(link)
        }}
        onOpenRoutine={(routine) => {
          setPaletteOpen(false)
          openRoutine(routine)
        }}
        onAction={runAction}
        onSearchWeb={(query) => {
          setPaletteOpen(false)
          openUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
        }}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </HubContext>
  )
}

/** Page layout: main column with the shared header, plus an optional side column. */
export function PageFrame({ aside, children }: { aside?: React.ReactNode; children: React.ReactNode }) {
  const { openPalette, newLink, toggleTheme } = useHub()

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-start"
    >
      <main className="flex min-w-0 flex-1 flex-col gap-10 rounded-[32px] bg-surface px-4 py-5 sm:px-8 sm:py-7">
        <motion.header variants={rise} className="flex items-center gap-2">
          <Link href="/" aria-label="All for One — início" className="rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40 lg:hidden">
            <Logo className="size-10" />
          </Link>
          <button
            type="button"
            onClick={openPalette}
            className="group flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full border bg-card px-4 text-sm text-muted-foreground outline-none transition-colors hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/40 sm:max-w-md"
          >
            <MagnifyingGlassIcon className="size-4.5 shrink-0" />
            <span className="truncate">Buscar ou abrir um link…</span>
            <KbdGroup className="ml-auto hidden sm:inline-flex">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="grid size-11 place-items-center rounded-full border bg-card outline-none hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/40 lg:hidden"
            >
              <ThemeToggleIcon />
            </button>
            <motion.button
              type="button"
              onClick={newLink}
              whileTap={{ scale: 0.96 }}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground pr-5 pl-4 text-sm font-semibold text-background outline-none focus-visible:ring-3 focus-visible:ring-ring/40 max-sm:size-11 max-sm:justify-center max-sm:p-0"
            >
              <PlusIcon weight="bold" className="size-4" />
              <span className="max-sm:sr-only">Novo link</span>
            </motion.button>
          </div>
        </motion.header>

        {children}
      </main>

      {aside && (
        <aside className="grid shrink-0 content-start gap-3 md:grid-cols-2 xl:sticky xl:top-3 xl:max-h-[calc(100dvh-1.5rem)] xl:w-[340px] xl:grid-cols-1 xl:overflow-y-auto xl:scrollbar-none">
          {aside}
        </aside>
      )}
    </motion.div>
  )
}
