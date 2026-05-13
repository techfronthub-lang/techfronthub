import Link from 'next/link'

function isExternalHref(href = '') {
  return /^(https?:|mailto:|tel:)/i.test(href)
}

function cn(...values) {
  return values.filter(Boolean).join(' ')
}

export function formatMetricValue(value) {
  const raw = value == null ? '' : String(value).trim()
  if (!raw) return raw
  if (/^\d{4,}$/.test(raw)) return Number(raw).toLocaleString('en-US')
  return raw
}

const buttonVariants = {
  primary:
    'bg-[color:var(--brand)] text-white shadow-[var(--shadow-blue)] hover:bg-[color:var(--brand-strong)]',
  ghost:
    'border border-[color:var(--border-soft)] bg-white text-[color:var(--text-strong)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--brand-soft)]',
  subtle:
    'border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-strong)] text-[color:var(--text-strong)] hover:bg-[color:var(--brand-soft)]',
}

const buttonSizes = {
  sm: 'h-11 rounded px-4 text-sm font-extrabold',
  md: 'h-12 rounded px-5 text-sm font-extrabold',
  lg: 'min-h-12 rounded px-5 py-3 text-[15px] font-extrabold sm:h-13 sm:px-6 sm:py-0',
}

export function ActionLink({
  href = '#',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex min-w-0 items-center justify-center gap-2 whitespace-normal text-center transition duration-200',
    buttonVariants[variant] || buttonVariants.primary,
    buttonSizes[size] || buttonSizes.md,
    className,
  )

  if (!href || href.startsWith('#') || isExternalHref(href)) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  )
}

export function Eyebrow({ children, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-sm bg-[color:var(--brand-soft)] px-2.5 py-1 text-[11px] font-extrabold uppercase text-[color:var(--brand-strong)]',
        'shadow-[inset_0_0_0_1px_rgba(11,132,223,0.18)]',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  action = null,
  align = 'left',
}) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between',
        centered && 'items-center text-center',
      )}
    >
      <div className={cn('max-w-2xl', centered && 'mx-auto')}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-4 font-[var(--font-display)] text-2xl font-extrabold tracking-normal text-[color:var(--text-strong)] sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {body ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-body)] sm:text-base sm:leading-8">
            {body}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function PageHero({ eyebrow, title, body, actions, stats }) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--border-soft)] bg-[linear-gradient(180deg,#ffffff_0%,#eef7ff_100%)] py-14 sm:py-18 lg:py-20 xl:py-24">
      <div className="site-container relative">
        <div className="mx-auto max-w-4xl text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-wrap-balance font-[var(--font-display)] text-3xl font-extrabold tracking-normal text-[color:var(--text-strong)] sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-body)] sm:text-base sm:leading-8">
            {body}
          </p>
          {actions ? <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">{actions}</div> : null}
          {stats?.length ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="surface-card-soft px-4 py-4 text-left sm:px-5 sm:py-5">
                  <div className="text-2xl font-extrabold tracking-normal text-[color:var(--text-strong)] sm:text-3xl">{formatMetricValue(item.value)}</div>
                  <div className="mt-1 text-xs text-[color:var(--text-body)] sm:text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
