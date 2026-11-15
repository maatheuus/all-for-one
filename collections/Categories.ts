import type { CollectionConfig } from 'payload'
import { afterChange, afterDelete } from './hub-hooks'

export const tones = ['peach', 'lilac', 'mint', 'sky', 'butter', 'rose'] as const

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Pasta', plural: 'Pastas' },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'tone', 'order'],
  },
  hooks: { afterChange: [afterChange], afterDelete: [afterDelete] },
  fields: [
    { name: 'label', label: 'Nome', type: 'text', required: true },
    {
      name: 'tone',
      label: 'Cor',
      type: 'select',
      required: true,
      defaultValue: 'mint',
      options: tones.map((tone) => ({ label: tone, value: tone })),
    },
    {
      name: 'order',
      label: 'Ordem',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Menor aparece primeiro nas abas.' },
    },
  ],
}
