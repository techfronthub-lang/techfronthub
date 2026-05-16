import { I } from '@/src/components/Icons'
import { ActionLink, PageHero } from '@/src/components/public-ui'
import { getCachedPayload } from '@/app/api/[...rest]/payload'

export const dynamic = 'force-dynamic'

function sortOffers(offers) {
  return [...offers].sort((a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0))
}

async function loadSalesPage() {
  try {
    const payload = await getCachedPayload()
    return await payload.findGlobal({ slug: 'sales-page' })
  } catch {
    return {}
  }
}

export default async function SalesPage() {
  const page = await loadSalesPage()
  const rawOffers = Array.isArray(page?.offers) ? page.offers.filter((item) => item?.title && item?.paystackUrl) : []
  const offers = sortOffers(rawOffers)
  const primaryOffer = offers[0]

  return (
    <div className="bg-white">
      <PageHero
        eyebrow={page?.eyebrow || 'Sales page'}
        title={page?.headline || 'Promote a course and let people pay directly from one clean landing page.'}
        body={page?.body || 'This page is built for adverts and direct campaigns. Add your flyer, explain the course clearly, and send people straight to checkout.'}
        actions={
          <>
            {primaryOffer?.paystackUrl ? (
              <ActionLink href={primaryOffer.paystackUrl} variant="primary" size="lg" target="_blank" rel="noreferrer">
                Pay with Paystack <I.Arrow size={16} />
              </ActionLink>
            ) : (
              <ActionLink href="/partner-with-us" variant="primary" size="lg">
                Set up an offer <I.Arrow size={16} />
              </ActionLink>
            )}
            <ActionLink href="/courses" variant="ghost" size="lg">
              View all courses
            </ActionLink>
          </>
        }
      />

      <section className="py-12 sm:py-14">
        <div className="site-container">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-extrabold text-[color:var(--brand-strong)]">Campaign offers</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">Use one page per course promo.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Each card below can hold a flyer image, a short course pitch, and a direct Paystack link for paid conversion.
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-[color:var(--bg-surface-strong)] px-6 py-14 text-center">
              <h3 className="text-xl font-extrabold text-slate-950">No sales offers have been added yet.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Add sales cards from the admin Sales Page global to publish flyer-based campaign links here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {offers.map((offer, index) => (
                <article key={`${offer.title}-${index}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {offer.flyer ? (
                      <img src={offer.flyer} alt={offer.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">No flyer uploaded</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.82))] p-5">
                      {offer.badge ? (
                        <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-950">
                          {offer.badge}
                        </span>
                      ) : null}
                      {offer.priceLabel ? <div className="mt-3 text-lg font-extrabold text-white">{offer.priceLabel}</div> : null}
                    </div>
                  </div>
                  <div className="p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-slate-950">{offer.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{offer.description}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <ActionLink href={offer.paystackUrl} variant="primary" size="lg" className="sm:flex-1" target="_blank" rel="noreferrer">
                        {offer.buttonLabel || 'Pay now'} <I.Arrow size={16} />
                      </ActionLink>
                      <ActionLink href="/partner-with-us" variant="ghost" size="lg" className="sm:flex-1">
                        Ask a question
                      </ActionLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
