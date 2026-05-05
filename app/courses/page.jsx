import { getPayload } from 'payload'
import config from '@/payload.config'
import { CoursesPage } from '@/src/components/CoursesPage'

export const dynamic = 'force-dynamic'

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeFilter(value) {
  return String(firstValue(value) || '').trim()
}

function buildWhere(filters) {
  const and = []

  if (filters.q) {
    and.push({
      or: [
        { title: { like: filters.q } },
        { desc: { like: filters.q } },
        { code: { like: filters.q } },
        { tag: { like: filters.q } },
      ],
    })
  }

  if (filters.category) and.push({ category: { equals: filters.category } })
  if (filters.level) and.push({ level: { equals: filters.level } })
  if (filters.tag) and.push({ tag: { equals: filters.tag } })
  if (filters.format) and.push({ format: { equals: filters.format } })

  return and.length ? { and } : undefined
}

function buildSort(sort) {
  switch (sort) {
    case 'title':
      return 'title'
    case 'price-low':
      return 'price'
    case 'price-high':
      return '-price'
    case 'newest':
      return '-createdAt'
    default:
      return '-createdAt'
  }
}

export default async function Page({ searchParams }) {
  const payload = await getPayload({ config })
  const resolved = await searchParams

  const filters = {
    q: normalizeFilter(resolved?.q),
    category: normalizeFilter(resolved?.category),
    level: normalizeFilter(resolved?.level),
    tag: normalizeFilter(resolved?.tag),
    format: normalizeFilter(resolved?.format),
    sort: normalizeFilter(resolved?.sort) || 'newest',
  }

  const [categories, allCourses, filteredCourses, siteConfig] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 50,
      sort: 'title',
      depth: 1,
    }),
    payload.find({
      collection: 'courses',
      limit: 200,
      depth: 1,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'courses',
      limit: 200,
      depth: 1,
      sort: buildSort(filters.sort),
      where: buildWhere(filters),
    }),
    payload.findGlobal({
      slug: 'site-config',
    }).catch(() => ({})),
  ])

  const allDocs = allCourses?.docs || []
  const options = {
    levels: ['Beginner', 'Intermediate', 'Advanced', 'All levels'].filter(level =>
      allDocs.some(course => String(course?.level || '') === level),
    ),
    tags: [...new Set(allDocs.map(course => String(course?.tag || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    formats: [...new Set(allDocs.map(course => String(course?.format || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  }

  return (
    <CoursesPage
      categories={categories?.docs || []}
      courses={filteredCourses?.docs || []}
      siteConfig={siteConfig || {}}
      totalCourses={allDocs.length}
      filters={filters}
      options={options}
    />
  )
}
