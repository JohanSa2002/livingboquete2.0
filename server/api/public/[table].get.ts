// Public, read-only view of the content tables. Writes stay behind
// /api/content/[table] (admin token required) — this mirrors v1, where the
// public pages read Supabase directly during SSR and only the admin could
// mutate anything. Reads go through the memoised readPublicContent.
export default defineEventHandler(async (event) => {
  const table = assertContentTable(getRouterParam(event, 'table'))
  const { id, exclude, limit } = getQuery(event)

  const result = await readPublicContent(table, {
    id: id ? String(id) : undefined,
    exclude: exclude ? String(exclude) : undefined,
    limit: limit ? Number(limit) : undefined,
  })

  if (id && !result) {
    throw createError({ statusCode: 404, statusMessage: 'Not found', data: { error: 'Not found' } })
  }
  return result
})
