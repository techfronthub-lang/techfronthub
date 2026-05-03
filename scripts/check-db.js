import dotenv from 'dotenv'
import { Pool } from 'pg'
import path from 'path'
import { fileURLToPath } from 'url'

 
//s
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('📊 Checking database state...\n')

    // Check courses
    const coursesRes = await pool.query('SELECT id, title, category_id FROM courses LIMIT 20')
    console.log(`Found ${coursesRes.rowCount} courses:`)
    coursesRes.rows.forEach(c => {
      console.log(`  - ID: ${c.id}, Title: ${c.title}, Category: ${c.category_id || 'NULL'}`)
    })

    console.log()

    // Check categories
    const catsRes = await pool.query('SELECT id, title FROM categories ORDER BY id')
    console.log(`\nFound ${catsRes.rowCount} categories:`)
    catsRes.rows.forEach(c => {
      console.log(`  - ID: ${c.id}, Title: ${c.title}`)
    })
  } catch (e) {
    console.error('❌ Error:', e.message)
  } finally {
    await pool.end()
  }
}

checkDatabase()
