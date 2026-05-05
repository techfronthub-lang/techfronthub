import { DeleteObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'

const endpoint = process.env.SUPABASE_STORAGE_S3_ENDPOINT || ''
const region = process.env.SUPABASE_STORAGE_S3_REGION || 'eu-west-1'
const accessKeyId = process.env.SUPABASE_STORAGE_S3_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY || ''
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'course-thumbnails'

export function getStorageBucket() {
  return bucket
}

export function getStorageClient() {
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Supabase storage credentials are not configured')
  }

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

export function getPublicBaseUrl() {
  if (!endpoint) return ''
  return endpoint.replace(/\/storage\/v1\/s3\/?$/, '/storage/v1/object/public').replace(/\/$/, '')
}

export function getPublicObjectUrl(key: string) {
  const base = getPublicBaseUrl()
  if (!base) return ''
  const encoded = key.split('/').map(encodeURIComponent).join('/')
  return `${base}/${bucket}/${encoded}`
}

export async function deleteStorageObject(key: string, bucketName = bucket) {
  const client = getStorageClient()
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )
}

export async function listStorageObjects(prefix = '') {
  const client = getStorageClient()
  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix || undefined,
    })
  )

  return (result.Contents || []).map((item) => ({
    key: item.Key || '',
    size: item.Size || 0,
    lastModified: item.LastModified ? item.LastModified.toISOString() : '',
    bucket,
    url: item.Key ? getPublicObjectUrl(item.Key) : '',
  })).filter((item) => item.key)
}
