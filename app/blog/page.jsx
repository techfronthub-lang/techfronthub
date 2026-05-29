import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { I } from '@/src/components/Icons'
import { ActionLink } from '@/src/components/public-ui'

export const metadata = {
  title: 'Blog - TECHFRONT HUB',
  description: 'Training notes, industry commentary, practical explainers, and community updates from TECHFRONT HUB.',
}

export const dynamic = 'force-dynamic'

function formatDate(value) {
  if (!value) return 'Coming soon'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Coming soon'
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed)
}

function getPostHref(post) {
  return `/blog/${post.slug || post.id}`
}

function PostCard({ post, featured = false }) {
  const href = getPostHref(post)
  const tags = Array.isArray(post.tags) ? post.tags.map((item) => item?.tag).filter(Boolean).slice(0, 3) : []

  return (
    <article className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)] ${featured ? 'lg:grid lg:grid-cols-[1.08fr_0.92fr]' : ''}`}>
      <div className={`bg-slate-950 ${featured ? 'min-h-[320px]' : 'aspect-[16/10]'}`}>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title || 'Blog cover image'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.45),_transparent_40%),linear-gradient(135deg,_#020617,_#0f172a_55%,_#0b84df)] p-8 text-white">
            <div>
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-[#cdeaff]">
                {post.category || 'Insights'}
              </div>
              <p className="mt-4 max-w-md text-2xl font-extrabold leading-tight sm:text-3xl">{post.title}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          <span>{post.category || 'Insights'}</span>
          <span className="text-slate-300">/</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span className="text-slate-300">/</span>
          <span>{post.readTime || '5 min read'}</span>
        </div>
        <h2 className={`mt-4 font-extrabold tracking-normal text-slate-950 ${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
          <Link href={href} className="transition hover:text-[color:var(--brand-strong)]">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{post.excerpt}</p>

        {tags.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">By</p>
            <p className="truncate text-sm font-extrabold text-slate-950">{post.author || 'TECHFRONT HUB'}</p>
          </div>
          <Link href={href} className="inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--brand-strong)] transition hover:text-[color:var(--brand)]">
            Read article <I.Arrow size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default async function BlogPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit: 24,
    depth: 0,
  }).catch(() => ({ docs: [] }))

  const posts = result.docs || []
  const [featuredPost, ...otherPosts] = posts

  return (
    <div className="bg-[color:var(--bg-surface-strong)]">
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container grid gap-8 py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,0.7fr)] lg:items-end lg:py-16">
          <div>
            <div className="inline-flex rounded-full border border-[color:var(--brand-soft)] bg-[color:var(--brand-soft)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.24em] text-[color:var(--brand-strong)]">
              TECHFRONT HUB Blog
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Practical articles for learners, teams, and builders.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Training notes, career breakdowns, AI explainers, and field updates from the same academy running the courses.
            </p>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Publishing focus</p>
              <p className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950">Learning, hiring, execution</p>
            </div>
            <div className="grid gap-3 text-sm leading-7 text-slate-600">
              <p>Articles are written to help readers understand what to learn, how to apply it, and where the market is moving.</p>
              <p>Use the blog alongside the catalog if you want lighter entry points before committing to a full program.</p>
            </div>
            <div className="pt-2">
              <ActionLink href="/courses" variant="primary">
                Browse courses <I.Arrow size={16} />
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="site-container">
          {featuredPost ? (
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[color:var(--brand-strong)]">Featured article</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">Start here</h2>
                </div>
              </div>
              <PostCard post={featuredPost} featured />
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-[0_18px_44px_rgba(15,23,42,0.04)] sm:px-10">
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[color:var(--brand-strong)]">Blog setup complete</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-normal text-slate-950">No published articles yet</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                The blog is live. Add posts from the admin panel under Blog Posts, publish them, and they will appear here automatically.
              </p>
              <div className="mt-6">
                <ActionLink href="/admin/collections/blog-posts" variant="ghost">
                  Open admin collection <I.Arrow size={16} />
                </ActionLink>
              </div>
            </div>
          )}
        </div>
      </section>

      {otherPosts.length ? (
        <section className="pb-14 sm:pb-16">
          <div className="site-container">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[color:var(--brand-strong)]">Latest posts</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">More from the journal</h2>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {otherPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
