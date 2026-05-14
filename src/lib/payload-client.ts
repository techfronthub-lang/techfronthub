const BASE = '/api'

async function fetchJSON(path: string) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`)
  }
  return res.json()
}

export function getCourses() {
  return fetchJSON('/courses?limit=100')
}

export function getTestimonials() {
  return fetchJSON('/testimonials?limit=100')
}

export function getEvents() {
  return fetchJSON('/events?limit=100')
}

export function getCategories() {
  return fetchJSON('/categories?limit=100')
}

export function getPackages() {
  return fetchJSON('/packages?limit=100')
}

export function getUdemyCourses() {
  return fetchJSON('/udemy-courses?limit=100')
}

export function getSiteConfig() {
  return fetchJSON('/globals/site-config')
}
