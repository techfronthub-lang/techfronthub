'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ActionLink } from '@/src/components/public-ui'

function formatAmount(amountKobo) {
  const amount = Number(amountKobo || 0) / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function PromoCallbackPage() {
  const params = useSearchParams()
  const [status, setStatus] = React.useState('Verifying payment...')
  const [error, setError] = React.useState('')
  const [details, setDetails] = React.useState(null)

  React.useEffect(() => {
    const cancelled = params.get('status')
    if (cancelled === 'cancelled' || cancelled === 'failed') {
      setStatus('Payment was not completed.')
      setError('The checkout was cancelled or failed.')
      return
    }

    const reference = params.get('reference') || params.get('trxref')
    if (!reference) {
      setStatus('Could not verify payment.')
      setError('Missing payment reference.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/paystack/promotions/tsi-college-ai-automation/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.message || 'Verification failed.')
        }

        setDetails(data)
        setStatus('Payment verified successfully.')
      } catch (verifyError) {
        setStatus('Verification failed.')
        setError(verifyError?.message || 'Could not verify payment.')
      }
    }

    verify()
  }, [params])

  return (
    <div className="bg-[color:var(--bg-soft)] px-4 py-12">
      <div className="site-container">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[color:var(--border-soft)] bg-white p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Payment status</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[color:var(--text-strong)]">{status}</h1>
          {error ? <p className="mt-3 text-sm leading-6 text-red-700">{error}</p> : null}

          {details?.verified ? (
            <div className="mt-5 rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] p-4 text-sm leading-7 text-[color:var(--text-body)]">
              <div><strong className="text-[color:var(--text-strong)]">Reference:</strong> {details.reference}</div>
              <div><strong className="text-[color:var(--text-strong)]">Amount:</strong> {formatAmount(details.amount)}</div>
              <div><strong className="text-[color:var(--text-strong)]">Plan:</strong> {details.metadata?.planLabel || details.metadata?.plan}</div>
              <div><strong className="text-[color:var(--text-strong)]">School:</strong> {details.metadata?.school}</div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionLink href="/programs/tsi-college-ai-automation" variant="primary">
              Back to sales page
            </ActionLink>
            <Link href="/programs" className="inline-flex h-12 items-center justify-center rounded border border-[color:var(--border-soft)] bg-white px-5 text-sm font-extrabold text-[color:var(--text-strong)] transition hover:bg-[color:var(--brand-soft)]">
              Back to programs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
