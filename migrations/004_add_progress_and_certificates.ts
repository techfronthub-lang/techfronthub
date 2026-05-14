import { sql } from 'drizzle-orm'

export const up = async ({ db }) => {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "course_progress_id" integer
  `)

  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "certificates_id" integer
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "course_progress" (
      "id" serial PRIMARY KEY NOT NULL,
      "student_id" integer NOT NULL,
      "course_id" integer NOT NULL,
      "last_opened_lesson_index" integer DEFAULT 0,
      "completed_lesson_indexes" jsonb DEFAULT '[]'::jsonb,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    )
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "course_progress_student_course_idx"
    ON "course_progress" ("student_id", "course_id")
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "certificates" (
      "id" serial PRIMARY KEY NOT NULL,
      "student_id" integer NOT NULL,
      "course_id" integer NOT NULL,
      "instructor_id" integer NOT NULL,
      "issued_at" timestamp with time zone NOT NULL,
      "certificate_code" text NOT NULL,
      "student_name" text,
      "student_email" text,
      "course_title" text,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone DEFAULT now()
    )
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "certificates_student_course_idx"
    ON "certificates" ("student_id", "course_id")
  `)

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "certificates_code_idx"
    ON "certificates" ("certificate_code")
  `)
}

export const down = async ({ db }) => {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    DROP COLUMN IF EXISTS "certificates_id"
  `)

  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    DROP COLUMN IF EXISTS "course_progress_id"
  `)

  await db.execute(sql`DROP INDEX IF EXISTS "certificates_code_idx"`)
  await db.execute(sql`DROP INDEX IF EXISTS "certificates_student_course_idx"`)
  await db.execute(sql`DROP TABLE IF EXISTS "certificates"`)
  await db.execute(sql`DROP INDEX IF EXISTS "course_progress_student_course_idx"`)
  await db.execute(sql`DROP TABLE IF EXISTS "course_progress"`)
}
