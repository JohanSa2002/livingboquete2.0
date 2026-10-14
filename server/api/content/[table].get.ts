export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const table = assertContentTable(getRouterParam(event, 'table'))

  const { data: rows, error } = await getSupabase()
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
  }

  return (rows ?? []).map((r: any) => ({ ...r.data, _created: r.created_at, _updated: r.updated_at }))
})
