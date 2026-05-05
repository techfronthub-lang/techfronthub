'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : ''
  return { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' }
}

export default function PaymentCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState('Verifying payment...')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('payload-token')
    if (!token) {
      router.replace('/login')
      return
    }

    const statusParam = params.get('status')
    if (statusParam === 'cancelled' || statusParam === 'failed') {
      setError('Your payment was not completed. You can try again from My Courses.')
      setStatus('Payment not completed.')
      return
    }

    const reference = params.get('reference') || params.get('trxref')
    if (!reference) {
      setError('Missing payment reference.')
      setStatus('Could not verify payment.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ reference }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Payment verification failed.')

        const raw = localStorage.getItem('student-enrolled-course-ids') || '[]'
        const list = JSON.parse(raw)
        const cid = String(data?.courseId || '')
        if (cid && Array.isArray(list) && !list.includes(cid)) {
          list.push(cid)
          localStorage.setItem('student-enrolled-course-ids', JSON.stringify(list))
        }

        setStatus('Payment successful. Enrollment confirmed.')
        setTimeout(() => {
          router.replace(cid ? `/student/dashboard/courses/${cid}` : '/student/dashboard/courses')
        }, 1200)
      } catch (e) {
        setError(e.message)
        setStatus('Verification failed.')
      }
    }

    verify()
  }, [params, router])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ background: 'var(--canvas)', border: '1px solid var(--ink-100)', borderRadius: 12, padding: 24, width: 'min(560px, 100%)' }}>
        <h1 style={{ marginTop: 0, color: 'var(--ink-50)' }}>Payment Status</h1>
        <p style={{ color: 'var(--ink-300)' }}>{status}</p>
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        <Link href="/student/dashboard/courses" style={{ color: 'var(--brand-600)' }}>Back to courses</Link>
      </div>
    </div>
  )
}
