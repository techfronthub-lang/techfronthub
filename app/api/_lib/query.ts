function parseScalar(value: string) {
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

function setDeepValue(target: Record<string, any>, path: string[], value: any) {
  let current = target

  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index]
    if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }

  current[path[path.length - 1]] = value
}

export function buildFindOptions(url: URL) {
  const options: Record<string, any> = {}
  const where: Record<string, any> = {}

  for (const [key, rawValue] of url.searchParams.entries()) {
    if (key === 'limit' || key === 'page' || key === 'depth') {
      options[key] = Number(rawValue)
      continue
    }

    if (key === 'pagination') {
      options.pagination = rawValue !== 'false'
      continue
    }

    if (key === 'sort') {
      options.sort = rawValue
      continue
    }

    if (!key.startsWith('where[')) continue

    const matches = [...key.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1])
    if (!matches.length) continue
    setDeepValue(where, matches, parseScalar(rawValue))
  }

  if (Object.keys(where).length > 0) {
    options.where = where
  }

  return options
}
