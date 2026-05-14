export const USER_TOKEN_KEY = 'payload-token'
export const USER_EMAIL_KEY = 'user-email'
export const INSTRUCTOR_TOKEN_KEY = 'instructor-token'
export const INSTRUCTOR_EMAIL_KEY = 'instructor-email'
const PRIVILEGED_ADMIN_EMAILS = new Set(['admin@techfronthub.com'])

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function clearUserSession() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(USER_TOKEN_KEY)
  window.localStorage.removeItem(USER_EMAIL_KEY)
}

export function clearInstructorSession() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(INSTRUCTOR_TOKEN_KEY)
  window.localStorage.removeItem(INSTRUCTOR_EMAIL_KEY)
}

export function storeUserSession(token, email) {
  if (!canUseStorage()) return
  clearInstructorSession()
  window.localStorage.setItem(USER_TOKEN_KEY, token)
  window.localStorage.setItem(USER_EMAIL_KEY, email)
  window.dispatchEvent(new Event('storage'))
}

export function storeInstructorSession(token, email) {
  if (!canUseStorage()) return
  clearUserSession()
  window.localStorage.setItem(INSTRUCTOR_TOKEN_KEY, token)
  window.localStorage.setItem(INSTRUCTOR_EMAIL_KEY, email)
}

export function isPrivilegedAdminUser(user) {
  const email = user?.email?.trim?.().toLowerCase?.()
  return user?.role === 'admin' || user?.role === 'staff' || PRIVILEGED_ADMIN_EMAILS.has(email)
}

export function getUserDestination(user) {
  if (isPrivilegedAdminUser(user)) return '/admin'
  return '/student/dashboard'
}

async function parseJson(res) {
  return res.json().catch(() => ({}))
}

function isAccountNotFound(data) {
  return data?.code === 'AUTH_ACCOUNT_NOT_FOUND'
}

export async function loginThroughUsers(email, password) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson(res)
  if (res.status === 404 && isAccountNotFound(data)) return null
  if (res.status === 401 && data?.message) throw new Error(data.message)
  if (res.status === 403 && data?.message) throw new Error(data.message)
  if (!res.ok || !data?.token) return null
  storeUserSession(data.token, email)
  return { kind: 'user', data, destination: getUserDestination(data.user) }
}

export async function loginThroughInstructors(email, password) {
  const res = await fetch('/api/instructors/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson(res)
  if (res.status === 404 && isAccountNotFound(data)) return null
  if (res.status === 401 && data?.message) throw new Error(data.message)
  if (res.status === 403 && data?.message) throw new Error(data.message)
  if (!res.ok || !data?.token) return null
  storeInstructorSession(data.token, email)
  return { kind: 'instructor', data, destination: '/instructor/dashboard' }
}

export async function loginWithSmartRouting(email, password) {
  const userLogin = await loginThroughUsers(email, password)
  if (userLogin) return userLogin

  const instructorLogin = await loginThroughInstructors(email, password)
  if (instructorLogin) return instructorLogin

  throw new Error('Invalid credentials. Check your email and password.')
}

export async function resolveExistingSession() {
  if (!canUseStorage()) return null

  const userToken = window.localStorage.getItem(USER_TOKEN_KEY)
  if (userToken) {
    const res = await fetch('/api/users/me', {
      headers: { Authorization: `JWT ${userToken}` },
    })
    if (res.ok) {
      const data = await parseJson(res)
      return getUserDestination(data?.user ?? data)
    }
    clearUserSession()
  }

  const instructorToken = window.localStorage.getItem(INSTRUCTOR_TOKEN_KEY)
  if (instructorToken) {
    const res = await fetch('/api/instructors/me', {
      headers: { Authorization: `JWT ${instructorToken}` },
    })
    if (res.ok) return '/instructor/dashboard'
    clearInstructorSession()
  }

  return null
}
