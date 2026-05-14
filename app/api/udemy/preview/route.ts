function humanizeSlug(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeCount(value: string) {
  return value.replace(/,/g, '').trim()
}

function normalizePrice(value: string) {
  const compact = value.replace(/\s+/g, '').trim()
  if (!compact) return ''
  if (compact.includes('₦')) return compact
  if (/^NGN/i.test(compact)) return compact.replace(/^NGN/i, '₦')
  if (/^N\d/i.test(compact)) return compact.replace(/^N/i, '₦')
  return compact
}

function stripMarkdownLinks(value: string) {
  return value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1').trim()
}

function isNairaPrice(value: string) {
  return /^(NGN|N|\u20a6)\s?[0-9]/i.test(value)
}

function parseCurrentPrice(markdown: string) {
  const nairaPrice =
    markdown.match(/Current price\s*((?:NGN|N|\u20a6)\s?[0-9][0-9,.]*)/i)?.[1] ||
    markdown.match(/\bCurrent price\b[\s\S]{0,40}?((?:NGN|N|\u20a6)\s?[0-9][0-9,.]*)/i)?.[1] ||
    ''

  if (nairaPrice) {
    return { fetchedPrice: normalizePrice(nairaPrice), price: normalizePrice(nairaPrice) }
  }

  const fetchedPrice =
    markdown.match(/Current price\s*([$£€]\s?[0-9][0-9.,]*)/i)?.[1] ||
    markdown.match(/Current price([A-Z]{0,3}[$£€]\s?[0-9][0-9.,]*)/i)?.[1] ||
    markdown.match(/\bCurrent price\b[\s\S]{0,40}?([$£€]\s?[0-9][0-9.,]*)/i)?.[1] ||
    markdown.match(/From\s*([$£€]\s?[0-9][0-9.,]*\/month)/i)?.[1] ||
    ''

  const normalized = normalizePrice(fetchedPrice)
  return {
    fetchedPrice: normalized,
    price: normalized && isNairaPrice(normalized) ? normalized : '',
  }
}

function parseProxyPreview(markdown: string, source: string, fallbackTitle: string) {
  const compact = markdown.replace(/\r/g, '')
  const firstHeading =
    compact.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
    compact.match(/^Title:\s+(.+)$/m)?.[1]?.trim() ||
    fallbackTitle

  const rating = compact.match(/Rating:\s*([0-9.]+)\s*out of 5/i)?.[1]?.trim() || ''
  const count =
    compact.match(/\(([0-9,]+)\s+ratings?\)/i)?.[1]?.trim() ||
    compact.match(/([0-9,]+)\s+ratings?\b/i)?.[1]?.trim() ||
    ''
  const author =
    compact.match(/Created by\s*([^\n]+)/i)?.[1]?.trim() ||
    compact.match(/Instructor(?:\(s\))?:\s*([^\n]+)/i)?.[1]?.trim() ||
    ''
  const hours =
    compact.match(/([0-9]+h(?:\s*[0-9]+m)?)\s+total length/i)?.[1]?.trim() ||
    compact.match(/([0-9]+(?:\.[0-9]+)?\s*hours?)\s+total length/i)?.[1]?.trim() ||
    compact.match(/([0-9]+(?:\.[0-9]+)?\s*hrs?)/i)?.[1]?.trim() ||
    ''
  const thumbnail =
    compact.match(/!\[[^\]]*Image[^\]]*\]\((https?:\/\/img-c\.udemycdn\.com\/course\/[^)\s]+)\)/i)?.[1]?.trim() ||
    compact.match(/!\[[^\]]*\]\((https?:\/\/img-c\.udemycdn\.com\/course\/[^)\s]+)\)/i)?.[1]?.trim() ||
    ''
  const { price } = parseCurrentPrice(compact)

  const description =
    compact.match(/## What you'll learn\s+([\s\S]*?)(?:\n## |\n### |$)/i)?.[1]
      ?.replace(/^\s*[*-]\s*/gm, '')
      ?.split('\n')
      ?.map((line) => line.trim())
      ?.filter(Boolean)
      ?.slice(0, 3)
      ?.join(' ') || ''

  return {
    title: stripMarkdownLinks(firstHeading),
    thumbnail,
    description: stripMarkdownLinks(description),
    author: stripMarkdownLinks(author),
    rating,
    count: normalizeCount(count),
    hours,
    price,
    source,
    blocked: true,
  }
}

async function fetchProxyFallback(targetUrl: string, fallbackTitle: string) {
  const proxyUrl = `https://r.jina.ai/http://${targetUrl.replace(/^https?:\/\//, '')}`
  const proxyResponse = await fetch(proxyUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      accept: 'text/plain,text/markdown;q=0.9,*/*;q=0.8',
    },
    cache: 'no-store',
  })

  if (!proxyResponse.ok) {
    throw new Error(`Fallback metadata fetch failed (${proxyResponse.status})`)
  }

  const markdown = await proxyResponse.text()
  return parseProxyPreview(markdown, targetUrl, fallbackTitle)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const target = url.searchParams.get('url') || ''

  if (!target) {
    return Response.json({ message: 'Missing url' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return Response.json({ message: 'Invalid url' }, { status: 400 })
  }

  const host = parsed.hostname.toLowerCase()
  if (!host.endsWith('udemy.com')) {
    return Response.json({ message: 'Only Udemy URLs are supported' }, { status: 400 })
  }

  const canonical = new URL(parsed.toString())
  canonical.search = ''
  canonical.hash = ''

  const pricingUrl = new URL(parsed.toString())
  pricingUrl.hash = ''

  const slugMatch = canonical.pathname.match(/\/course\/([^/]+)/i)
  const slugTitle = slugMatch?.[1] ? humanizeSlug(slugMatch[1]) : ''

  try {
    const res = await fetch(pricingUrl.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-NG,en;q=0.9',
        referer: 'https://www.udemy.com/',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      try {
        const fallback = await fetchProxyFallback(pricingUrl.toString(), slugTitle)
        return Response.json(fallback)
      } catch {
        return Response.json({
          title: slugTitle,
          thumbnail: '',
          description: '',
          author: '',
          rating: '',
          count: '',
          hours: '',
          price: '',
          source: pricingUrl.toString(),
          blocked: true,
        })
      }
    }

    const html = await res.text()
    const pick = (attrs: string[]) => {
      for (const attr of attrs) {
        const pattern = new RegExp(
          `<meta[^>]+(?:property|name)=["']${attr}["'][^>]+content=["']([^"']+)["']`,
          'i',
        )
        const match = html.match(pattern)
        if (match?.[1]) return match[1]
      }
      return ''
    }

    const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    const courseJson = scripts
      .map((match) => {
        try {
          return JSON.parse(match[1])
        } catch {
          return null
        }
      })
      .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
      .find((item) => {
        const type = item?.['@type']
        return type === 'Course' || (Array.isArray(type) && type.includes('Course'))
      })

    const courseImage = Array.isArray(courseJson?.image) ? courseJson.image[0] : courseJson?.image || ''
    const courseAuthor = typeof courseJson?.author === 'object' ? courseJson.author?.name || '' : courseJson?.author || ''
    const ratingValue = courseJson?.aggregateRating?.ratingValue || ''
    const ratingCount = courseJson?.aggregateRating?.ratingCount || ''
    const timeRequired = courseJson?.timeRequired || courseJson?.duration || ''
    const { price } = parseCurrentPrice(html)

    const title =
      pick(['og:title', 'twitter:title']) ||
      courseJson?.name ||
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ||
      ''
    const thumbnail = pick(['og:image', 'twitter:image']) || courseImage || ''
    const description = pick(['og:description', 'twitter:description']) || courseJson?.description || ''

    return Response.json({
      title,
      thumbnail,
      description,
      author: courseAuthor,
      rating: ratingValue,
      count: ratingCount,
      hours: timeRequired,
      price,
      source: pricingUrl.toString(),
    })
  } catch {
    try {
      const fallback = await fetchProxyFallback(pricingUrl.toString(), slugTitle)
      return Response.json(fallback)
    } catch {
      return Response.json({
        title: slugTitle,
        thumbnail: '',
        description: '',
        author: '',
        rating: '',
        count: '',
        hours: '',
        price: '',
        source: pricingUrl.toString(),
        blocked: true,
      })
    }
  }
}
