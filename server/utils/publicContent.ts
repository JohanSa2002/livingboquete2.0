import type { ContentTable } from '#shared/types/content'

interface ReadOpts {
  id?: string
  exclude?: string
  limit?: number
}

// Every Supabase round-trip costs 200–700ms and each client-side navigation
// re-requests its tables, so public reads are memoised here for the same 60s
// window the edge already serves (s-maxage in routeRules). Admin writes drop
// the table's entries so an edit shows on the next request from this instance;
// other warm instances on Vercel keep their copy until it expires.
const CACHE_NAME = 'public-content'
const MAX_AGE = 60

async function readFromSupabase(table: ContentTable, { id, exclude, limit }: ReadOpts) {
  if (id) {
    const { data: row, error } = await getSupabase()
      .from(table)
      .select('data')
      .eq('id', id)
      .maybeSingle()

    if (error) throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
    return row?.data ?? null
  }

  // posts read newest-first; every other section keeps its insertion order so
  // the admin controls the running order of the catalogue and the homepage.
  let query = getSupabase()
    .from(table)
    .select('data')
    .order('created_at', { ascending: table !== 'posts' })

  // `exclude` + `limit` keep the "related posts" strip on an article from
  // growing linearly with the whole blog — it only ever needs three rows.
  if (exclude) query = query.neq('id', exclude)
  if (limit) query = query.limit(limit)

  const { data: rows, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })

  const list = (rows ?? []).map((r: any) => r.data)

  // Listings only ever render the card fields; the article body is the bulk
  // of a post and it's fetched on its own (by id) when the article opens.
  if (table === 'posts') {
    return list.map(({ body: _body, ...summary }: any) => summary)
  }
  if (table === 'listings') {
    return list.map(({ desc: _desc, reviewsList: _reviews, images: _images, ...summary }: any) => summary)
  }
  return list
}

export const readPublicContent = defineCachedFunction(readFromSupabase, {
  name: CACHE_NAME,
  maxAge: MAX_AGE,
  swr: true,
  getKey: (table: ContentTable, { id, exclude, limit }: ReadOpts) =>
    `${table}:${id ?? '-'}_${exclude ?? '-'}_${limit ?? '-'}`,
})

export async function invalidatePublicContent(table: ContentTable) {
  await useStorage('cache').clear(`nitro:functions:${CACHE_NAME}:${table}`)
}
