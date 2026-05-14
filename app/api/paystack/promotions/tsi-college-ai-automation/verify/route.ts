import { getPromotionMetadata, logPaystack, verifyPaystackTransaction } from '@/src/lib/paystack'

export async function POST(req: Request) {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackKey) return Response.json({ message: 'PAYSTACK_SECRET_KEY is missing.' }, { status: 500 })

    const { reference } = await req.json().catch(() => ({}))
    if (!reference) return Response.json({ message: 'reference is required.' }, { status: 400 })

    const { verifyRes, verifyData } = await verifyPaystackTransaction(String(reference), paystackKey)
    if (!verifyRes.ok || !verifyData?.status) {
      logPaystack('promo_verify_failed', {
        reference,
        status: verifyRes.status,
        message: verifyData?.message,
      })
      return Response.json({ message: verifyData?.message || 'Payment verification failed.' }, { status: 400 })
    }

    const tx = verifyData?.data
    if (tx?.status !== 'success') {
      logPaystack('promo_verify_not_successful', { reference, paystackStatus: tx?.status })
      return Response.json({ message: 'Payment not successful yet.' }, { status: 400 })
    }

    const metadata = getPromotionMetadata(tx)
    if (metadata.campaign !== 'tsi-college-ai-automation') {
      logPaystack('promo_verify_campaign_mismatch', {
        reference,
        campaign: metadata.campaign,
      })
      return Response.json({ message: 'Payment metadata mismatch.' }, { status: 400 })
    }

    logPaystack('promo_verify_success', {
      reference,
      plan: metadata.plan,
      email: metadata.email,
    })

    return Response.json({
      status: true,
      verified: true,
      reference: String(reference),
      amount: tx?.amount || 0,
      metadata,
    })
  } catch (error) {
    logPaystack('promo_verify_exception', error)
    return Response.json({ message: error?.message || 'Verification failed.' }, { status: 400 })
  }
}
