#!/usr/bin/env node

const BASE = process.env.SEED_API_BASE || 'http://localhost:3000/api'

async function api(method, path, data) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json.message || json.error || `${method} ${path} -> ${res.status}`
    throw new Error(msg)
  }
  return json
}

async function clearCollection(slug) {
  const res = await fetch(`${BASE}/${slug}?limit=200`, { headers: { 'Content-Type': 'application/json' } })
  const json = await res.json().catch(() => ({}))
  const docs = json.docs ?? []
  for (const doc of docs) {
    await fetch(`${BASE}/${slug}/${doc.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
  }
  if (docs.length) console.log(`cleared ${docs.length} existing records`)
}

async function getUdemyPreview(url) {
  const res = await fetch(`${BASE}/udemy/preview?url=${encodeURIComponent(url)}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return null
  return json
}

const UDEMY = [
  {
    title: 'Power BI - Business Intelligence for Beginners to Advance',
    author: 'Biztics Inc.',
    rating: 4.4,
    count: '18,110',
    hours: '45h 55m',
    price: 'N7,500',
    udemyUrl: 'https://www.udemy.com/course/business-data-analysis-using-microsoft-power-bi/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/2135486_856b_2.jpg?q=75&w=3840',
    sortOrder: 1,
  },
  {
    title: 'The Complete SQL For Absolute Beginners Course',
    author: 'Ivo Bernardo',
    rating: 4.6,
    count: '367',
    hours: '8h 32m',
    price: 'N5,000',
    udemyUrl: 'https://www.udemy.com/course/sql-for-absolute-beginners/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/4426742_6e45_7.jpg?q=75&w=3840',
    sortOrder: 2,
  },
  {
    title: 'The Complete Digital Marketing Course - Learn From Scratch',
    author: 'edureka! Institute',
    rating: 3.8,
    count: '399',
    hours: '7h 25m',
    price: 'N5,500',
    udemyUrl: 'https://www.udemy.com/course/learn-digital-marketing-from-scratch/',
    thumbnail: 'https://img-c.udemycdn.com/course/240x135/4456588_6d71_4.jpg',
    sortOrder: 3,
  },
  {
    title: 'AWS Certified Solutions Architect Associate SAA-C03 (2025)',
    author: 'Abhishek kumar Singh',
    rating: 4.5,
    count: '93',
    hours: '10h 8m',
    price: 'N9,000',
    udemyUrl: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03-m/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/6151897_0462_2.jpg?q=75&w=3840',
    sortOrder: 4,
  },
  {
    title: 'Microsoft Excel Data Analysis - Learn How The Experts Use It',
    author: 'Vincent Gomez',
    rating: 4.6,
    count: '5,692',
    hours: '2h 57m',
    price: 'N5,500',
    udemyUrl: 'https://www.udemy.com/course/excel-data-analysis/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/3001112_d6f4_2.jpg?q=75&w=3840',
    sortOrder: 5,
  },
  {
    title: 'Python for Data Science and Machine Learning',
    author: 'Hassan Fulaih',
    rating: 4.7,
    count: '1,243',
    hours: '17h 27m',
    price: 'N7,500',
    udemyUrl: 'https://www.udemy.com/course/python-science/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/4713798_d43a.jpg?q=75&w=3840',
    sortOrder: 6,
  },
  {
    title: 'Docker and Kubernetes: The Complete Course from Zero to Hero',
    author: 'Lauro Fialho Muller',
    rating: 4.6,
    count: '1,717',
    hours: '33h 39m',
    price: 'N8,000',
    udemyUrl: 'https://www.udemy.com/course/complete-docker-kubernetes/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/5967966_849d.jpg?q=75&w=3840',
    sortOrder: 7,
  },
  {
    title: 'React & Next.js : Formation Web Fullstack',
    author: 'Romuald Hansen',
    rating: 4.2,
    count: '17',
    hours: '7h 48m',
    price: 'N7,500',
    udemyUrl: 'https://www.udemy.com/course/react-nextjs-formation-web-fullstack/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/6551163_d804.jpg?q=75&w=3840',
    sortOrder: 8,
  },
  {
    title: 'Cybersecurity Essentials',
    author: 'Pedro Paulino',
    rating: 4.1,
    count: '106',
    hours: '1h 22m',
    price: 'N6,500',
    udemyUrl: 'https://www.udemy.com/course/cybersecurity-essentials/',
    thumbnail: 'https://img-c.udemycdn.com/course/240x135/3530614_5f97.jpg',
    sortOrder: 9,
  },
  {
    title: 'ChatGPT Quick AI Course for Working Professional & Beginners',
    author: 'Pankaj Gupta',
    rating: 4.2,
    count: '119',
    hours: '1h 18m',
    price: 'N6,000',
    udemyUrl: 'https://www.udemy.com/course/chatgpt-ai-chatbot/',
    thumbnail: 'https://img-c.udemycdn.com/course/480x270/5943830_8dd4_2.jpg?q=75&w=3840',
    sortOrder: 10,
  },
]

async function seedCollection() {
  console.log('Seeding udemy-courses...')
  await clearCollection('udemy-courses')

  let created = 0
  let skipped = 0

  for (const item of UDEMY) {
    try {
      const preview = await getUdemyPreview(item.udemyUrl)
      const payload = {
        ...item,
        thumbnail: preview?.thumbnail || item.thumbnail || '',
        title: preview?.title || item.title,
      }
      await api('POST', '/udemy-courses', payload)
      created++
    } catch (error) {
      console.warn(`warning: ${error.message}`)
      skipped++
    }
  }

  console.log(`done: ${created} created, ${skipped} skipped`)
}

seedCollection().catch((error) => {
  console.error(error)
  process.exit(1)
})
