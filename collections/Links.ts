import type { CollectionConfig } from 'payload'
import { afterChange, afterDelete } from './hub-hooks'

export const Links: CollectionConfig = {
  slug: 'links',
  defaultSort: 'title',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'url', 'category', 'pinned'],
  },
  hooks: { afterChange: [afterChange], afterDelete: [afterDelete] },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        try {
          return /^https?:$/.test(new URL(value ?? '').protocol) || 'Use uma URL http(s) completa.'
        } catch {
          return 'Use uma URL http(s) completa.'
        }
      },
    },
    { name: 'category', label: 'Pasta', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'pinned', label: 'Fixado', type: 'checkbox', defaultValue: false },
        {
          name: 'pinOrder',
          label: 'Posição no dock',
          type: 'number',
          defaultValue: 0,
          admin: { condition: (data) => Boolean(data?.pinned) },
        },
      ],
    },
  ],
}
