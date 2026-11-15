import type { CollectionConfig } from 'payload'
import { afterChange, afterDelete } from './hub-hooks'

export const Routines: CollectionConfig = {
  slug: 'routines',
  labels: { singular: 'Rotina', plural: 'Rotinas' },
  defaultSort: 'startHour',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'startHour', 'endHour'],
  },
  hooks: { afterChange: [afterChange], afterDelete: [afterDelete] },
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    { name: 'description', label: 'Descrição', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'startHour', label: 'Começa (h)', type: 'number', required: true, min: 0, max: 23 },
        { name: 'endHour', label: 'Termina (h)', type: 'number', required: true, min: 1, max: 24 },
      ],
    },
    {
      name: 'links',
      label: 'Links',
      type: 'relationship',
      relationTo: 'links',
      hasMany: true,
      admin: { description: 'Abertos juntos ao rodar a rotina, nesta ordem.' },
    },
  ],
}
