import { revalidateTag } from "next/cache"

export const HUB_TAG = "hub"

/** Called from Payload hooks. Outside a Next request (e.g. `payload run` scripts) there is no cache to bust. */
export function revalidateHub() {
  try {
    revalidateTag(HUB_TAG, { expire: 0 })
  } catch {}
}
