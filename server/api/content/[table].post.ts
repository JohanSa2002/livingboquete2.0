export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const table = assertContentTable(getRouterParam(event, 'table'))

  const body = await readBody<Record<string, unknown>>(event)
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: 'id required', data: { error: 'id required' } })
  }

  // Merge onto the existing row instead of overwriting it outright: the admin
  // form schema doesn't cover every field a row can have (e.g. rentals'
  // reviewsList), so a plain overwrite silently drops anything the form
  // doesn't know about.
  const { data: existing } = await getSupabase()
    .from(table)
    .select('data')
    .eq('id', body.id)
    .maybeSingle()

  const mergedData = { ...((existing?.data as object) ?? {}), ...body }
  const { error } = await getSupabase()
    .from(table)
    .upsert({ id: body.id, data: mergedData, updated_at: new Date().toISOString() })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
  }
  await invalidatePublicContent(table)
  return { ok: true }
})
