import type { GlobalConfig } from 'payload'
import { revalidateHub } from '@/lib/revalidate-hub'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site',
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateHub()
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'ownerName',
      label: 'Seu nome',
      type: 'text',
      admin: { description: 'Aparece na saudação da página inicial.' },
    },
    { name: 'seoTitle', label: 'Título (SEO)', type: 'text', defaultValue: 'All for One' },
    {
      name: 'seoDescription',
      label: 'Descrição (SEO)',
      type: 'textarea',
      defaultValue: 'Todos os links e sites que você usa, num lugar só.',
    },
  ],
}
