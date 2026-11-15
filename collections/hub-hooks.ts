import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateHub } from '@/lib/revalidate-hub'

export const afterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateHub()
  return doc
}

export const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateHub()
  return doc
}
