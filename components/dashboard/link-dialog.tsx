"use client"

import { useState } from "react"
import { PushPinIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { normalizeUrl, titleFromUrl } from "@/lib/hub"
import { categories, type CategoryId, type LinkItem } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Favicon } from "./favicon"

export type LinkDraft = {
  title: string
  url: string
  category: CategoryId
  description?: string
  pinned: boolean
}

/** Parent remounts this form (via `key`) whenever the dialog opens for a different link. */
function LinkForm({
  link,
  initialUrl,
  initiallyPinned,
  onSubmit,
  onCancel,
}: {
  link?: LinkItem
  initialUrl?: string
  initiallyPinned: boolean
  onSubmit: (draft: LinkDraft) => void
  onCancel: () => void
}) {
  const [url, setUrl] = useState(link?.url ?? initialUrl ?? "")
  const [title, setTitle] = useState(link?.title ?? "")
  const [category, setCategory] = useState<CategoryId>(link?.category ?? "work")
  const [description, setDescription] = useState(link?.description ?? "")
  const [pinned, setPinned] = useState(initiallyPinned)
  const [touched, setTouched] = useState(false)

  const normalized = normalizeUrl(url)
  const urlError = touched && !normalized

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!normalized) return
    onSubmit({
      url: normalized,
      title: title.trim() || titleFromUrl(normalized),
      category,
      description: description.trim() || undefined,
      pinned,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="link-url">URL</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-2.5 grid size-5 -translate-y-1/2 place-items-center">
            {normalized ? <Favicon url={normalized} className="size-4" /> : <span className="size-2 rounded-full bg-muted-foreground/30" />}
          </span>
          <Input
            id="link-url"
            autoFocus
            inputMode="url"
            placeholder="github.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={urlError || undefined}
            className="h-10 pl-9"
          />
        </div>
        {urlError && <p className="text-xs text-destructive">Digite uma URL válida, ex: notion.so</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <div className="grid gap-2">
          <Label htmlFor="link-title">Título</Label>
          <Input
            id="link-title"
            placeholder={normalized ? titleFromUrl(normalized) : "Nome do site"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="grid gap-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
            <SelectTrigger className="h-10! w-full" aria-label="Categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="link-description">
          Descrição <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="link-description"
          rows={2}
          placeholder="Para que serve esse link?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={pinned}
        onClick={() => setPinned((p) => !p)}
        className="flex items-center gap-3 rounded-2xl border p-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <PushPinIcon weight={pinned ? "fill" : "regular"} className="size-4.5" />
        <span className="flex-1 text-sm">
          <span className="block font-medium">Fixar no dock</span>
          <span className="block text-xs text-muted-foreground">Acesso rápido pelas teclas 1–9</span>
        </span>
        <span className={cn("relative h-5 w-9 rounded-full transition-colors", pinned ? "bg-forest" : "bg-muted-foreground/25")}>
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow transition-transform",
              pinned && "translate-x-4",
            )}
          />
        </span>
      </button>

      <DialogFooter>
        <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="px-4">
          {link ? "Salvar alterações" : "Adicionar link"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function LinkDialog({
  open,
  onOpenChange,
  link,
  initialUrl,
  initiallyPinned,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: LinkItem
  initialUrl?: string
  initiallyPinned: boolean
  onSubmit: (draft: LinkDraft) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">{link ? "Editar link" : "Novo link"}</DialogTitle>
          <DialogDescription>
            {link ? "Ajuste os detalhes desse atalho." : "Cole uma URL — o título é preenchido automaticamente."}
          </DialogDescription>
        </DialogHeader>
        <LinkForm
          key={link?.id ?? initialUrl ?? "new"}
          link={link}
          initialUrl={initialUrl}
          initiallyPinned={initiallyPinned}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
