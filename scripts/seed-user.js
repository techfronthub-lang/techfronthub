#!/usr/bin/env node

import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '../payload.config.ts'

const ADMIN_EMAIL = 'admin@techfronthub.com'
const ADMIN_PASSWORD = 'Admin@2026'

async function createOrUpdateAdmin() {
  try {
    const payload = await getPayloadHMR({ config })
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: ADMIN_EMAIL } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      const current = existing.docs[0]
      await payload.update({
        collection: 'users',
        id: current.id,
        data: {
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          emailVerified: true,
          phone: '+234 800 000 0001',
          password: ADMIN_PASSWORD,
        },
      })

      console.log('Admin user updated:')
      console.log(`  Email: ${ADMIN_EMAIL}`)
      console.log(`  Password: ${ADMIN_PASSWORD}`)
      process.exit(0)
    }

    await payload.create({
      collection: 'users',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        phone: '+234 800 000 0001',
      },
    })

    console.log('Admin user created:')
    console.log(`  Email: ${ADMIN_EMAIL}`)
    console.log(`  Password: ${ADMIN_PASSWORD}`)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createOrUpdateAdmin()
