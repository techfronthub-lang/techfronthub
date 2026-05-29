import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { I } from '@/src/components/Icons'
import { ActionLink } from '@/src/components/public-ui'

export const dynamic = 'force-dynamic'

function formatDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
}

function splitBody(content) {
  return String(content || '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
}

function normalizeSections(post) {
  if (Array.isArray(post?.bodySections) && post.bodySections.length) {
    return post.bodySections.filter((item) => item && (item.type || item.heading || item.body || item.image))
  }

  return splitBody(post?.content).map((body) => ({
    type: 'paragraph',
    body,
  }))
}

async function findPublishedPost(payload, slugOrId) {
  const slugMatch = await payload.find({
    collection: 'blog-posts',
    where: {
      and: [
        { slug: { equals: slugOrId } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 0,
  }).catch(() => ({ docs: [] }))

  if (slugMatch.docs?.[0]) return slugMatch.docs[0]

  try {
    const byId = await payload.findByID({
      collection: 'blog-posts',
      id: slugOrId,
      depth: 0,
    })

    if (byId?.status === 'published') return byId
  } catch {
    return null
  }

  return null
}

export async function generateMetadata({ params }) {
  const { slug } = await params

  try {
    const payload = await getPayload({ config })
    const post = await findPublishedPost(payload, slug)
    if (!post) return { title: 'Blog - TECHFRONT HUB' }

    return {
      title: `${post.title} - TECHFRONT HUB`,
      description: post.excerpt || 'Read the latest article from TECHFRONT HUB.',
    }
  } catch {
    return { title: 'Blog - TECHFRONT HUB' }
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const post = await findPublishedPost(payload, slug)

  if (!post) notFound()

  const relatedResult = await payload.find({
    collection: 'blog-posts',
    where: {
      and: [
        { status: { equals: 'published' } },
        { id: { not_equals: post.id } },
      ],
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 0,
  }).catch(() => ({ docs: [] }))

  const relatedPosts = relatedResult.docs || []
  const sections = normalizeSections(post)
  const publishedLabel = formatDate(post.publishedAt)
  const tags = Array.isArray(post.tags) ? post.tags.map((item) => item?.tag).filter(Boolean) : []

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="site-container py-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--brand-strong)] transition hover:text-[color:var(--brand)]">
            <I.Chev dir="left" size={16} /> Back to blog
          </Link>
        </div>
      </div>

      <section className="border-b border-slate-200 bg-[color:var(--bg-surface-strong)]">
        <div className="site-container grid gap-8 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.44fr)] lg:items-start lg:py-14">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
              <span>{post.category || 'Insights'}</span>
              {publishedLabel ? <span className="text-slate-300">/</span> : null}
              {publishedLabel ? <span>{publishedLabel}</span> : null}
              <span className="text-slate-300">/</span>
              <span>{post.readTime || '5 min read'}</span>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{post.excerpt}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)] lg:sticky lg:top-24">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">Author</p>
            <p className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950">{post.author || 'TECHFRONT HUB'}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Articles here are meant to turn industry topics into practical direction for learners and teams.
            </p>
            <div className="mt-6">
              <ActionLink href="/courses" variant="primary" className="w-full">
                Explore training <I.Arrow size={16} />
              </ActionLink>
            </div>
          </aside>
        </div>
      </section>

      {post.coverImage ? (
        <section className="border-b border-slate-200 bg-white">
          <div className="site-container py-8">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
              <img src={post.coverImage} alt={post.title || 'Blog cover image'} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-10 sm:py-12">
        <div className="site-container grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(220px,0.2fr)]">
          <article className="min-w-0">
            <div className="space-y-8">
              {sections.map((section, index) => {
                const type = String(section?.type || 'paragraph')
                const heading = String(section?.heading || '').trim()
                const body = String(section?.body || '').trim()
                const caption = String(section?.caption || '').trim()
                const image = String(section?.image || '').trim()
                const imageAlt = String(section?.imageAlt || heading || post.title || 'Article image').trim()

                if (type === 'heading') {
                  return (
                    <section key={index}>
                      <h2 className="text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">
                        {heading || body}
                      </h2>
                      {body && heading && body !== heading ? (
                        <p className="mt-3 text-base leading-8 text-slate-700 sm:text-lg">{body}</p>
                      ) : null}
                    </section>
                  )
                }

                if (type === 'quote') {
                  return (
                    <blockquote key={index} className="rounded-[28px] border border-slate-200 bg-[color:var(--bg-surface-strong)] px-6 py-6 text-lg font-semibold leading-8 text-slate-800 shadow-[0_18px_44px_rgba(15,23,42,0.05)] sm:px-8">
                      “{body || heading}”
                    </blockquote>
                  )
                }

                if (type === 'bullet-list') {
                  const items = body.split(/\n+/).map((item) => item.replace(/^[-*•]\s*/, '').trim()).filter(Boolean)
                  return (
                    <section key={index}>
                      {heading ? <h2 className="text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">{heading}</h2> : null}
                      <ul className="mt-4 space-y-3">
                        {items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex gap-3 text-base leading-8 text-slate-700 sm:text-lg">
                            <span className="mt-3 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--brand)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )
                }

                if (type === 'image' && image) {
                  return (
                    <figure key={index} className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                      <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
                      {caption ? <figcaption className="border-t border-slate-200 px-5 py-4 text-sm leading-7 text-slate-500">{caption}</figcaption> : null}
                    </figure>
                  )
                }

                if (type === 'callout') {
                  return (
                    <section key={index} className="rounded-[28px] border border-[color:var(--brand-soft)] bg-[linear-gradient(135deg,rgba(11,132,223,0.08),rgba(255,255,255,0.95))] px-6 py-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                      {heading ? <h2 className="text-2xl font-extrabold tracking-normal text-slate-950">{heading}</h2> : null}
                      <p className={`${heading ? 'mt-3' : ''} text-base leading-8 text-slate-700 sm:text-lg`}>{body || caption}</p>
                    </section>
                  )
                }

                return (
                  <section key={index}>
                    {heading ? <h2 className="mb-3 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">{heading}</h2> : null}
                    <p className="text-base leading-8 text-slate-700 sm:text-lg">{body || caption}</p>
                  </section>
                )
              })}
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-[color:var(--bg-surface-strong)] p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">Need structured help?</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950">Move from reading to doing.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Use the catalog if you want guided projects, live instruction, and a clearer execution path.
              </p>
              <div className="mt-5">
                <ActionLink href="/courses" variant="ghost">
                  View all courses <I.Arrow size={16} />
                </ActionLink>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {relatedPosts.length ? (
        <section className="border-t border-slate-200 bg-[color:var(--bg-surface-strong)] py-12">
          <div className="site-container">
            <div className="mb-6">
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[color:var(--brand-strong)]">Continue reading</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">Related articles</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {relatedPosts.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug || item.id}`}
                  className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)]"
                >
                  <div className="aspect-[16/10] bg-slate-950">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title || 'Blog cover image'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-end bg-[linear-gradient(135deg,_#020617,_#0b84df)] p-6 text-xl font-extrabold text-white">
                        {item.title}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">{item.category || 'Insights'}</p>
                    <h3 className="mt-3 text-xl font-extrabold tracking-normal text-slate-950 transition group-hover:text-[color:var(--brand-strong)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
