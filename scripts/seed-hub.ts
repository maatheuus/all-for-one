import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'categories' })
if (existing.totalDocs > 0) {
  console.log('Hub already seeded (categories exist), skipping.')
  process.exit(0)
}

const email = await payload.create({ collection: 'categories', data: { label: 'Email', tone: 'sky', order: 0 } })
const streaming = await payload.create({
  collection: 'categories',
  data: { label: 'Streaming', tone: 'rose', order: 1 },
})

const links = [
  { title: 'Gmail', url: 'https://mail.google.com/mail/u/0/#inbox', category: email.id, pin: 1 },
  { title: 'Gmail 2', url: 'https://mail.google.com/mail/u/1/#inbox', category: email.id, pin: 2 },
  { title: 'Netflix', url: 'https://www.netflix.com', category: streaming.id, pin: 3 },
  { title: 'HBO Max', url: 'https://www.hbomax.com', category: streaming.id, pin: 4 },
  { title: 'Globoplay', url: 'https://globoplay.globo.com/', category: streaming.id, pin: 5 },
  { title: 'Disney+', url: 'https://www.disneyplus.com', category: streaming.id, pin: 6 },
  { title: 'Prime Video', url: 'https://www.primevideo.com', category: streaming.id },
  { title: 'Apple TV', url: 'https://tv.apple.com', category: streaming.id },
  { title: 'BlackouTV', url: 'https://blackoutv.com/', category: streaming.id },
]

const ids: Record<string, number> = {}
for (const { pin, ...data } of links) {
  const doc = await payload.create({
    collection: 'links',
    data: { ...data, pinned: pin !== undefined, pinOrder: pin ?? 0 },
  })
  ids[data.title] = doc.id
}

await payload.create({
  collection: 'routines',
  data: {
    name: 'Caixa de entrada',
    description: 'As duas contas de email de uma vez.',
    startHour: 7,
    endHour: 12,
    links: [ids['Gmail'], ids['Gmail 2']],
  },
})
await payload.create({
  collection: 'routines',
  data: {
    name: 'Noite de série',
    description: 'Os streamings de sempre.',
    startHour: 19,
    endHour: 24,
    links: [ids['Netflix'], ids['HBO Max'], ids['Globoplay']],
  },
})

await payload.updateGlobal({ slug: 'site', data: { ownerName: 'Matheus' } })

console.log(`Seeded 2 categories, ${links.length} links, 2 routines.`)
process.exit(0)
