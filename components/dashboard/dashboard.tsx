"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react"
import { getDomain, loadHubData, normalizeUrl, openUrl, saveHubData, titleFromUrl } from "@/lib/hub"
import type { CategoryId, HubData, LinkItem, ReadLaterItem, Routine } from "@/lib/mock-data"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { ActivityChart } from "./activity-chart"
import { CommandPalette, type PaletteAction } from "./command-palette"
import { FocusTimer, type FocusTimerHandle } from "./focus-timer"
import { Hero } from "./hero"
import { LinkDialog, type LinkDraft } from "./link-dialog"
import { LinkGrid, type SortMode } from "./link-grid"
import { rise, stagger } from "./motion"
import { PinnedDock } from "./pinned-dock"
import { QuickNotes } from "./quick-notes"
import { ReadLater } from "./read-later"
import { Recents } from "./recents"
import { Routines } from "./routines"
import { ShortcutsDialog } from "./shortcuts-dialog"
import { SidebarRail, ThemeToggleIcon } from "./sidebar-rail"

type DialogState = { open: boolean; link?: LinkItem; initialUrl?: string }

function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

function recordOpens(data: HubData, ids: string[], now: number): HubData {
  const opened = new Set(ids)
  return {
    ...data,
    links: data.links.map((l) => (opened.has(l.id) ? { ...l, clicks: l.clicks + 1, lastOpened: now } : l)),
    activity: data.activity.map((n, i) => (i === data.activity.length - 1 ? n + ids.length : n)),
  }
}

export function Dashboard() {
  const [data, setData] = useState(loadHubData)
  const [category, setCategory] = useState<CategoryId | "all">("all")
  const [sort, setSort] = useState<SortMode>("popular")
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [dialog, setDialog] = useState<DialogState>({ open: false })
  const [hour] = useState(() => new Date().getHours())
  const focusRef = useRef<FocusTimerHandle>(null)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => saveHubData(data), [data])

  const linksById = new Map(data.links.map((l) => [l.id, l]))
  const pinnedLinks = data.pinnedOrder.flatMap((id) => linksById.get(id) ?? [])
  const pinnedIds = new Set(data.pinnedOrder)
  const suggested = data.routines.find((r) => hour >= r.hours[0] && hour < r.hours[1])
  const pendingReads = data.readLater.filter((i) => !i.done).length
  const anyDialogOpen = paletteOpen || shortcutsOpen || dialog.open

  // --- actions -------------------------------------------------------------

  function markOpened(ids: string[]) {
    const now = Date.now()
    setData((d) => recordOpens(d, ids, now))
  }

  function openLink(link: LinkItem) {
    openUrl(link.url)
    markOpened([link.id])
  }

  function openRoutine(routine: Routine) {
    const links = routine.linkIds.flatMap((id) => linksById.get(id) ?? [])
    links.forEach((l) => openUrl(l.url))
    markOpened(links.map((l) => l.id))
    toast(`Abrindo “${routine.name}”`, {
      description: `${links.length} abas. Se só uma abriu, permita pop-ups para este site.`,
    })
  }

  function togglePin(id: string) {
    const pinned = data.pinnedOrder.includes(id)
    setData((d) => ({
      ...d,
      pinnedOrder: pinned ? d.pinnedOrder.filter((p) => p !== id) : [...d.pinnedOrder, id],
    }))
    toast(pinned ? "Removido do dock" : "Fixado no dock")
  }

  function saveLink(draft: LinkDraft) {
    const id = dialog.link?.id ?? crypto.randomUUID()
    const { pinned, ...fields } = draft
    setData((d) => {
      const links = dialog.link
        ? d.links.map((l) => (l.id === id ? { ...l, ...fields } : l))
        : [...d.links, { id, clicks: 0, ...fields }]
      const without = d.pinnedOrder.filter((p) => p !== id)
      const pinnedOrder = pinned ? (d.pinnedOrder.includes(id) ? d.pinnedOrder : [...without, id]) : without
      return { ...d, links, pinnedOrder }
    })
    toast.success(dialog.link ? "Link atualizado" : `${draft.title} adicionado`)
    setDialog({ open: false })
  }

  function deleteLink(link: LinkItem) {
    const index = data.links.findIndex((l) => l.id === link.id)
    const pinIndex = data.pinnedOrder.indexOf(link.id)
    setData((d) => ({
      ...d,
      links: d.links.filter((l) => l.id !== link.id),
      pinnedOrder: d.pinnedOrder.filter((p) => p !== link.id),
    }))
    toast(`${link.title} excluído`, {
      action: {
        label: "Desfazer",
        onClick: () =>
          setData((d) => ({
            ...d,
            links: d.links.toSpliced(index, 0, link),
            pinnedOrder: pinIndex === -1 ? d.pinnedOrder : d.pinnedOrder.toSpliced(pinIndex, 0, link.id),
          })),
      },
    })
  }

  function addReadLater(url: string) {
    const item: ReadLaterItem = { id: crypto.randomUUID(), title: titleFromUrl(url), url, done: false }
    setData((d) => ({ ...d, readLater: [item, ...d.readLater] }))
  }

  function updateReadLater(fn: (items: ReadLaterItem[]) => ReadLaterItem[]) {
    setData((d) => ({ ...d, readLater: fn(d.readLater) }))
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  function startFocus() {
    focusRef.current?.start()
    document.getElementById("focus")?.scrollIntoView({ behavior: "smooth", block: "center" })
    toast("Foco iniciado · 25 min")
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
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
      const existing = data.links.find((l) => getDomain(l.url) === getDomain(url) && l.url === url)
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

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex max-w-[1680px] gap-3 p-2 sm:p-3">
        <SidebarRail onShortcuts={() => setShortcutsOpen(true)} />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-start"
        >
          <main
            id="top"
            className="flex min-w-0 flex-1 flex-col gap-10 rounded-[32px] bg-surface px-4 py-5 sm:px-8 sm:py-7"
          >
            <motion.header variants={rise} className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl bg-foreground font-serif text-xl text-background italic lg:hidden">
                a
              </span>
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
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
                  onClick={() => setDialog({ open: true })}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground pr-5 pl-4 text-sm font-semibold text-background outline-none focus-visible:ring-3 focus-visible:ring-ring/40 max-sm:size-11 max-sm:justify-center max-sm:p-0"
                >
                  <PlusIcon weight="bold" className="size-4" />
                  <span className="max-sm:sr-only">Novo link</span>
                </motion.button>
              </div>
            </motion.header>

            <Hero name="Matheus" pendingReads={pendingReads} suggestedName={suggested?.name} />

            <PinnedDock
              links={pinnedLinks}
              onReorder={(ids) => setData((d) => ({ ...d, pinnedOrder: ids }))}
              onOpen={openLink}
              onAdd={() => setDialog({ open: true })}
            />

            <Routines
              routines={data.routines}
              suggestedId={suggested?.id}
              linksById={linksById}
              onOpenAll={openRoutine}
            />

            <LinkGrid
              links={data.links}
              pinnedIds={pinnedIds}
              category={category}
              sort={sort}
              onCategoryChange={setCategory}
              onSortChange={setSort}
              onOpened={(link) => markOpened([link.id])}
              onTogglePin={togglePin}
              onEdit={(link) => setDialog({ open: true, link })}
              onDelete={deleteLink}
            />
          </main>

          <aside className="grid shrink-0 content-start gap-3 md:grid-cols-2 xl:sticky xl:top-3 xl:max-h-[calc(100dvh-1.5rem)] xl:w-[340px] xl:grid-cols-1 xl:overflow-y-auto xl:scrollbar-none">
            <FocusTimer ref={focusRef} />
            <ActivityChart activity={data.activity} totalLinks={data.links.length} />
            <ReadLater
              items={data.readLater}
              onAdd={addReadLater}
              onToggle={(id) => updateReadLater((items) => items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))}
              onRemove={(id) => updateReadLater((items) => items.filter((i) => i.id !== id))}
              onOpen={(item) => openUrl(item.url)}
            />
            <QuickNotes value={data.notes} onChange={(notes) => setData((d) => ({ ...d, notes }))} />
            <Recents links={data.links} onOpen={openLink} />
          </aside>
        </motion.div>
      </div>

      <LinkDialog
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
        links={data.links}
        routines={data.routines}
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
    </div>
  )
}
