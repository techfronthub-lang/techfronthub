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

function matchesText(value, query) {
  return String(value || '').toLowerCase().includes(query)
}

function getCategoryId(course) {
  return course.category?.id ?? course.category
}

function getComparablePrice(course) {
  const raw = course.priceKobo || course.price || ''
  const number = Number(String(raw).replace(/[^\d.]/g, ''))
  return Number.isFinite(number) ? number : 0
}

function filterCourses(courses, filters) {
  const query = filters.q.toLowerCase()

  return courses.filter((course) => {
    if (query) {
      const haystack = [
        course.title,
        course.desc,
        course.code,
        course.tag,
        course.level,
        course.format,
        course.category?.title,
      ]
      if (!haystack.some((value) => matchesText(value, query))) return false
    }

    if (filters.category && String(getCategoryId(course)) !== String(filters.category)) return false
    if (filters.level && String(course.level || '') !== filters.level) return false
    if (filters.tag && String(course.tag || '') !== filters.tag) return false
    if (filters.format && String(course.format || '') !== filters.format) return false

    return true
  })
}

function sortCourses(courses, sort) {
  const sorted = [...courses]

  switch (sort) {
    case 'title':
      return sorted.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
    case 'price-low':
      return sorted.sort((a, b) => getComparablePrice(a) - getComparablePrice(b))
    case 'price-high':
      return sorted.sort((a, b) => getComparablePrice(b) - getComparablePrice(a))
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }
}

function buildSearchSuggestions(courses, categories) {
  const courseItems = courses.slice(0, 24).map((course) => ({
    label: course.title,
    type: course.category?.title || course.level || 'Course',
    href: `/courses?q=${encodeURIComponent(course.title || '')}`,
  }))
  const categoryItems = categories.slice(0, 12).map((category) => ({
    label: category.title,
    type: 'Category',
    href: `/courses?category=${category.id}`,
  }))
  const tagItems = [...new Set(courses.map((course) => String(course.tag || '').trim()).filter(Boolean))]
    .slice(0, 8)
    .map((tag) => ({ label: tag, type: 'Topic', href: `/courses?tag=${encodeURIComponent(tag)}` }))

  return [...courseItems, ...categoryItems, ...tagItems]
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

  const [categories, allCourses, siteConfig] = await Promise.all([
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
    payload.findGlobal({
      slug: 'site-config',
    }).catch(() => ({})),
  ])

  const allDocs = allCourses?.docs || []
  const categoryDocs = categories?.docs || []
  const filteredDocs = sortCourses(filterCourses(allDocs, filters), filters.sort)
  const options = {
    levels: ['Beginner', 'Intermediate', 'Advanced', 'All levels'].filter(level =>
      allDocs.some(course => String(course?.level || '') === level),
    ),
    tags: [...new Set(allDocs.map(course => String(course?.tag || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    formats: [...new Set(allDocs.map(course => String(course?.format || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  }

  return (
    <CoursesPage
      categories={categoryDocs}
      courses={filteredDocs}
      siteConfig={siteConfig || {}}
      totalCourses={allDocs.length}
      filters={filters}
      options={options}
      searchSuggestions={buildSearchSuggestions(allDocs, categoryDocs)}
    />
  )
}
