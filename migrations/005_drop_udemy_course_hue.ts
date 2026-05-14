import { sql } from 'drizzle-orm'

export const up = async ({ db }) => {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "udemy_courses"
    DROP COLUMN IF EXISTS "hue"
  `)
}

export const down = async ({ db }) => {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "udemy_courses"
    ADD COLUMN IF NOT EXISTS "hue" integer
  `)
}
