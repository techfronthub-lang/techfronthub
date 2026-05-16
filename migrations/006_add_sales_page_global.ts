import { sql } from 'drizzle-orm'

export const up = async ({ db }) => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sales_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "eyebrow" text DEFAULT 'Sales page',
      "headline" text DEFAULT 'Promote a course with a page that can close directly.',
      "body" text DEFAULT 'Use this hidden page for adverts, campaign links, and direct enrollments. Add flyer images, explain the offer, and attach the Paystack checkout link for each course.',
      "updated_at" timestamp with time zone DEFAULT now(),
      "created_at" timestamp with time zone DEFAULT now()
    )
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sales_page_offers" (
      "id" serial PRIMARY KEY NOT NULL,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "badge" text,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "flyer" text NOT NULL,
      "paystack_url" text NOT NULL,
      "button_label" text,
      "price_label" text,
      "sort_order" numeric,
      CONSTRAINT "sales_page_offers_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "sales_page"("id") ON DELETE CASCADE
    )
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "sales_page_offers_order_idx"
    ON "sales_page_offers" ("_order")
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "sales_page_offers_parent_id_idx"
    ON "sales_page_offers" ("_parent_id")
  `)

  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "sales_page_id" integer
  `)
}

export const down = async ({ db }) => {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    DROP COLUMN IF EXISTS "sales_page_id"
  `)

  await db.execute(sql`DROP INDEX IF EXISTS "sales_page_offers_parent_id_idx"`)
  await db.execute(sql`DROP INDEX IF EXISTS "sales_page_offers_order_idx"`)
  await db.execute(sql`DROP TABLE IF EXISTS "sales_page_offers"`)
  await db.execute(sql`DROP TABLE IF EXISTS "sales_page"`)
}
