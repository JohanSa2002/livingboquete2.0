// One-off: copies content tables and the `images` storage bucket from the
// cloud Supabase project (shared with the Astro v1) into the local Supabase
// stack, so livingboquete2.0 can be developed against its own data.
//
// Read-only on the cloud side. Leads are NOT copied (personal data, and not
// needed to develop the site).
//
// Usage:
//   CLOUD_SUPABASE_URL=... CLOUD_SUPABASE_SERVICE_ROLE_KEY=... \
//   LOCAL_SUPABASE_URL=... LOCAL_SUPABASE_SERVICE_ROLE_KEY=... \
//   npx tsx scripts/copy-cloud-to-local.ts
import { createClient } from '@supabase/supabase-js'

const env = (k: string) => {
  const v = process.env[k]
  if (!v) { console.error(`Missing ${k}`); process.exit(1) }
  return v
}

const cloudUrl = env('CLOUD_SUPABASE_URL').replace(/\/$/, '')
const localUrl = env('LOCAL_SUPABASE_URL').replace(/\/$/, '')
const cloud = createClient(cloudUrl, env('CLOUD_SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
const local = createClient(localUrl, env('LOCAL_SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })

// `rentals` is the v1 catalogue; `listings` (migration 0004) replaced it here.
// Both are copied so whichever one the cloud project has comes across.
const TABLES = ['places', 'events', 'posts', 'gallery', 'rentals', 'listings'] as const
// Tables that may not exist yet on the cloud side (it's shared with the v1,
// which never ran 0004). Missing ones are skipped instead of aborting the copy.
const OPTIONAL: readonly string[] = ['listings']
const BUCKET = 'images'

// Public URLs stored inside the JSON rows point at the cloud bucket; after the
// files are copied they are rewritten to the same path on the local bucket.
const cloudPublic = `${cloudUrl}/storage/v1/object/public/${BUCKET}/`
const localPublic = `${localUrl}/storage/v1/object/public/${BUCKET}/`

async function listAll(prefix = ''): Promise<string[]> {
  const { data, error } = await cloud.storage.from(BUCKET).list(prefix, { limit: 1000 })
  if (error) throw new Error(`list ${prefix}: ${error.message}`)
  const out: string[] = []
  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    // Folders come back without an id.
    if (item.id == null) out.push(...await listAll(path))
    else out.push(path)
  }
  return out
}

async function copyStorage() {
  const { data: buckets } = await local.storage.listBuckets()
  if (!buckets?.some(b => b.name === BUCKET)) {
    const { error } = await local.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: '8MB',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
    })
    if (error) throw new Error(`create bucket: ${error.message}`)
  }
  const paths = await listAll()
  for (const path of paths) {
    const { data, error } = await cloud.storage.from(BUCKET).download(path)
    if (error || !data) throw new Error(`download ${path}: ${error?.message}`)
    const { error: upErr } = await local.storage.from(BUCKET).upload(path, data, { upsert: true, contentType: data.type || undefined })
    if (upErr) throw new Error(`upload ${path}: ${upErr.message}`)
  }
  console.log(`storage: ${paths.length} files copied`)
}

async function copyTables() {
  for (const table of TABLES) {
    // `listings.kind` is a generated column, so it's left out of the select and
    // the local database derives it again from `data`.
    const { data, error } = await cloud.from(table).select('id, data, created_at, updated_at')
    if (error && OPTIONAL.includes(table) && (error.code === 'PGRST205' || error.code === '42P01')) {
      console.log(`${table}: not on the cloud project, skipped`)
      continue
    }
    if (error) throw new Error(`read ${table}: ${error.message}`)
    const rows = (data ?? []).map(r => ({
      ...r,
      data: JSON.parse(JSON.stringify(r.data).split(cloudPublic).join(localPublic)),
    }))
    if (rows.length) {
      const { error: insErr } = await local.from(table).upsert(rows)
      if (insErr) throw new Error(`write ${table}: ${insErr.message}`)
    }
    console.log(`${table}: ${rows.length} rows`)
  }
}

await copyStorage()
await copyTables()
console.log('done')
