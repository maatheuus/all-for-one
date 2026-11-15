import config from '@payload-config'
import { getPayload } from 'payload'

const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD

if (!email || !password) {
  console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env')
  process.exit(1)
}

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
})

if (existing.totalDocs > 0) {
  console.log(`User ${email} already exists, skipping.`)
} else {
  await payload.create({
    collection: 'users',
    data: { email, password },
  })
  console.log(`Created admin user ${email}.`)
}

process.exit(0)
