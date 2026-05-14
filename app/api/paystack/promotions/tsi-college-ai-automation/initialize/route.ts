import { getPaystackBaseUrl, logPaystack } from '@/src/lib/paystack'

const PROMO_PLANS = {
  one_day: {
    label: 'Full Cohort Program - one day per week',
    amountKobo: 50000000,
  },
  two_day: {
    label: 'Full Cohort Program - two days per week',
    amountKobo: 100000000,
  },
}

function getCallbackUrl(req: Request) {
  return new URL('/programs/tsi-college-ai-automation/callback', req.url).toString()
}

export async function POST(req: Request) {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackKey) return Response.json({ message: 'PAYSTACK_SECRET_KEY is missing.' }, { status: 500 })

    const body = await req.json().catch(() => ({}))
    const fullName = String(body?.fullName || '').trim()
    const email = String(body?.email || '').trim()
    const phone = String(body?.phone || '').trim()
    const school = String(body?.school || '').trim()
    const role = String(body?.role || '').trim()
    const cohort = String(body?.cohort || '').trim()
    const planKey = String(body?.plan || '').trim()
    const plan = PROMO_PLANS[planKey]

    if (!fullName || !email || !phone || !school || !plan) {
      return Response.json({ message: 'Full name, email, phone, school, and plan are required.' }, { status: 400 })
    }

    const paystackRes = await fetch(`${getPaystackBaseUrl()}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: plan.amountKobo,
        callback_url: getCallbackUrl(req),
        metadata: {
          campaign: 'tsi-college-ai-automation',
          fullName,
          email,
          phone,
          school,
          role,
          cohort,
          plan: planKey,
          planLabel: plan.label,
        },
      }),
    })

    const paystackData = await paystackRes.json().catch(() => null)
    if (!paystackRes.ok || !paystackData?.status) {
      logPaystack('promo_initialize_failed', {
        campaign: 'tsi-college-ai-automation',
        status: paystackRes.status,
        message: paystackData?.message,
      })
      return Response.json({ message: paystackData?.message || 'Failed to initialize payment.' }, { status: 400 })
    }

    logPaystack('promo_initialize_success', {
      campaign: 'tsi-college-ai-automation',
      reference: paystackData?.data?.reference,
      plan: planKey,
    })

    return Response.json({
      status: true,
      authorization_url: paystackData?.data?.authorization_url,
      reference: paystackData?.data?.reference,
    })
  } catch (error) {
    return Response.json({ message: error?.message || 'Initialization failed.' }, { status: 400 })
  }
}
