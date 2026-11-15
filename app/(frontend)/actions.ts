"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { getPayload } from "payload"
import config from "@payload-config"
import { HUB_TAG } from "@/lib/revalidate-hub"

export type LinkInput = {
  title: string
  url: string
  category: string
  description?: string
  pinned: boolean
}

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string }

/** Runs `fn` only for a signed-in Payload user (the local API itself skips access control). */
async function asAdmin(fn: (payload: Awaited<ReturnType<typeof getPayload>>) => Promise<string | void>): Promise<ActionResult> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return { ok: false, error: "Entre em /admin para editar o hub." }
  try {
    const id = await fn(payload)
    updateTag(HUB_TAG)
    return { ok: true, id: id ?? undefined }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Não foi possível salvar." }
  }
}

async function nextPinOrder(payload: Awaited<ReturnType<typeof getPayload>>) {
  const { totalDocs } = await payload.count({ collection: "links", where: { pinned: { equals: true } } })
  return totalDocs
}

export async function saveLink(id: string | undefined, input: LinkInput) {
  return asAdmin(async (payload) => {
    const data = {
      title: input.title,
      url: input.url,
      category: Number(input.category),
      description: input.description ?? null,
      pinned: input.pinned,
    }
    if (!id) {
      const pinOrder = input.pinned ? await nextPinOrder(payload) : 0
      const doc = await payload.create({ collection: "links", data: { ...data, pinOrder } })
      return String(doc.id)
    }
    const current = await payload.findByID({ collection: "links", id: Number(id), depth: 0 })
    const pinOrder = input.pinned && !current.pinned ? await nextPinOrder(payload) : current.pinOrder
    await payload.update({ collection: "links", id: Number(id), data: { ...data, pinOrder } })
    return id
  })
}

export async function deleteLink(id: string) {
  return asAdmin(async (payload) => {
    await payload.delete({ collection: "links", id: Number(id) })
  })
}

export async function setPinned(id: string, pinned: boolean) {
  return asAdmin(async (payload) => {
    const pinOrder = pinned ? await nextPinOrder(payload) : 0
    await payload.update({ collection: "links", id: Number(id), data: { pinned, pinOrder } })
  })
}

export async function reorderPinned(ids: string[]) {
  return asAdmin(async (payload) => {
    await Promise.all(
      ids.map((id, pinOrder) => payload.update({ collection: "links", id: Number(id), data: { pinOrder } })),
    )
  })
}
