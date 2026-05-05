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

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return Response.json({ message: `Failed to load Udemy page (${res.status})` }, { status: 502 })
    }

    const html = await res.text()
    const pick = (attrs) => {
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

    const courseImage =
      Array.isArray(courseJson?.image)
        ? courseJson.image[0]
        : courseJson?.image || ''
    const courseAuthor =
      typeof courseJson?.author === 'object'
        ? courseJson.author?.name || ''
        : courseJson?.author || ''
    const ratingValue = courseJson?.aggregateRating?.ratingValue || ''
    const ratingCount = courseJson?.aggregateRating?.ratingCount || ''
    const timeRequired = courseJson?.timeRequired || courseJson?.duration || ''

    const title =
      pick(['og:title', 'twitter:title']) ||
      courseJson?.name ||
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ||
      ''
    const thumbnail =
      pick(['og:image', 'twitter:image']) ||
      courseImage ||
      ''
    const description =
      pick(['og:description', 'twitter:description']) ||
      courseJson?.description ||
      ''

    return Response.json({
      title,
      thumbnail,
      description,
      author: courseAuthor,
      rating: ratingValue,
      count: ratingCount,
      hours: timeRequired,
      source: parsed.toString(),
    })
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch preview' },
      { status: 500 },
    )
  }
}
