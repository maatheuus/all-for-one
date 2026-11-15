"use client"

import { useState } from "react"
import { openUrl, titleFromUrl } from "@/lib/hub"
import type { ReadLaterItem } from "@/lib/types"
import { ActivityChart } from "./activity-chart"
import { FocusTimer } from "./focus-timer"
import { Hero } from "./hero"
import { PageFrame, useHub } from "./hub-shell"
import { LinkGrid, type SortMode } from "./link-grid"
import { PinnedDock } from "./pinned-dock"
import { QuickNotes } from "./quick-notes"
import { ReadLater } from "./read-later"
import { Recents } from "./recents"
import { Routines } from "./routines"

function HubFocusTimer() {
  const { timer, setTimer } = useHub()
  return <FocusTimer timer={timer} setTimer={setTimer} />
}

function HubActivity() {
  const { activity, links } = useHub()
  return <ActivityChart activity={activity} totalLinks={links.length} />
}

function HubRecents() {
  const { links, openLink } = useHub()
  return <Recents links={links} onOpen={openLink} />
}

function HubRoutines() {
  const { hub, suggested, linksById, openRoutine } = useHub()
  return <Routines routines={hub.routines} suggestedId={suggested?.id} linksById={linksById} onOpenAll={openRoutine} />
}

export function HomeView() {
  const { hub, pendingReads, suggested, pinnedLinks, reorderPinned, openLink, newLink } = useHub()
  return (
    <PageFrame
      aside={
        <>
          <HubFocusTimer />
          <HubActivity />
          <HubRecents />
        </>
      }
    >
      <Hero name={hub.site.ownerName} pendingReads={pendingReads} suggestedName={suggested?.name} />
      <PinnedDock links={pinnedLinks} onReorder={reorderPinned} onOpen={openLink} onAdd={newLink} />
      <HubRoutines />
    </PageFrame>
  )
}

export function LinksView() {
  const { hub, links, pinnedIds, markOpened, togglePin, editLink, deleteLink } = useHub()
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<SortMode>("popular")
  return (
    <PageFrame aside={<HubRecents />}>
      <LinkGrid
        links={links}
        categories={hub.categories}
        pinnedIds={pinnedIds}
        category={category}
        sort={sort}
        onCategoryChange={setCategory}
        onSortChange={setSort}
        onOpened={(link) => markOpened([link.id])}
        onTogglePin={togglePin}
        onEdit={editLink}
        onDelete={deleteLink}
      />
    </PageFrame>
  )
}

export function RoutinesView() {
  return (
    <PageFrame>
      <HubRoutines />
    </PageFrame>
  )
}

export function ReadLaterView() {
  const { local, setLocal } = useHub()
  const updateItems = (fn: (items: ReadLaterItem[]) => ReadLaterItem[]) =>
    setLocal((d) => ({ ...d, readLater: fn(d.readLater) }))

  return (
    <PageFrame
      aside={<QuickNotes value={local.notes} onChange={(notes) => setLocal((d) => ({ ...d, notes }))} />}
    >
      <ReadLater
        items={local.readLater}
        onAdd={(url) =>
          updateItems((items) => [{ id: crypto.randomUUID(), title: titleFromUrl(url), url, done: false }, ...items])
        }
        onToggle={(id) => updateItems((items) => items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))}
        onRemove={(id) => updateItems((items) => items.filter((i) => i.id !== id))}
        onOpen={(item) => openUrl(item.url)}
      />
    </PageFrame>
  )
}

export function FocusView() {
  return (
    <PageFrame>
      <div className="grid gap-3 md:grid-cols-2">
        <HubFocusTimer />
        <HubActivity />
      </div>
    </PageFrame>
  )
}
