import { listStorageObjects } from '@/src/lib/supabase-storage'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const prefix = url.searchParams.get('prefix') || ''
    const items = await listStorageObjects(prefix)
    return Response.json({ items })
  } catch (error: any) {
    return Response.json({ message: error?.message || 'List failed.' }, { status: 400 })
  }
}
