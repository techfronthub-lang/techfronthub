'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { pageBg, shell, card, errorAlert } from '../_components/ui'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payingCourseId, setPayingCourseId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const token = localStorage.getItem('payload-token')
        if (!token) {
          router.push('/student/login')
          return
        }

        const [coursesRes, meRes, enrollmentRes] = await Promise.all([
          fetch('/api/courses?limit=100'),
          fetch('/api/users/me', { headers: authHeaders() }),
          fetch('/api/enrollments?limit=200', { headers: authHeaders() }),
        ])

        const coursesData = await coursesRes.json()
        const meData = await meRes.json()
        const enrollmentData = await enrollmentRes.json()
        const student = meData?.user ?? meData

        const enrolled = (enrollmentData?.docs || [])
          .filter(e => String(e?.student?.id ?? e?.student) === String(student?.id) && e?.status === 'paid')
          .map(e => String(e?.course?.id ?? e?.course))

        if (!active) return
        setCourses(coursesData?.docs || [])
        setEnrolledIds(enrolled)
        setLoading(false)
      } catch {
        if (!active) return
        setError('Failed to load courses')
        setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [router])

  async function handlePayAndEnroll(courseId) {
    setPayingCourseId(courseId)
    setError('')
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Payment initialization failed.')

      if (data?.enrolled) {
        setEnrolledIds(prev => prev.includes(String(courseId)) ? prev : [...prev, String(courseId)])
      } else if (data?.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('No checkout URL returned.')
      }
    } catch (e) {
      setError(e.message || 'Payment initialization failed.')
    } finally {
      setPayingCourseId(null)
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-400)' }}>Loading courses...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: pageBg.background }}>
      <div className="container" style={{ padding: shell.padding }}>
        <Link href="/student/dashboard" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontSize: 14 }}>Back to Dashboard</Link>

        <div style={{ marginTop: 14, marginBottom: 20 }}>
          <h1 style={{ margin: '0 0 8px', color: 'var(--ink-900)', fontSize: 'clamp(28px,4vw,38px)' }}>Courses</h1>
          <p style={{ margin: 0, color: 'var(--ink-600)' }}>Enroll with Paystack, then continue learning from your lesson workspace.</p>
        </div>

        {error && <div style={{ ...errorAlert, padding: 12, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 16 }}>
          {courses.map(course => {
            const enrolled = enrolledIds.includes(String(course.id))
            return (
              <div key={course.id} style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>{course.category?.title || 'General'}</div>
                <h3 style={{ margin: '0 0 8px', color: 'var(--ink-900)', fontSize: 20 }}>{course.title || 'Untitled Course'}</h3>
                <p style={{ margin: '0 0 14px', color: 'var(--ink-600)', lineHeight: 1.6, minHeight: 62 }}>{course.desc || 'No description yet.'}</p>
                <div style={{ marginTop: 'auto', marginBottom: 12, color: 'var(--brand-700)', fontWeight: 800, fontSize: 18 }}>{course.price || 'Price unavailable'}</div>

                {enrolled ? (
                  <Link href={`/student/dashboard/courses/${course.id}`} style={{ textDecoration: 'none', textAlign: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--brand-600)', color: '#fff', fontWeight: 700 }}>
                    Open Course
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePayAndEnroll(course.id)}
                    disabled={payingCourseId === course.id}
                    style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {payingCourseId === course.id ? 'Redirecting...' : 'Pay & Enroll'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
