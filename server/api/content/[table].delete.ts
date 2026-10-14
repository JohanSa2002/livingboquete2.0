export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const table = assertContentTable(getRouterParam(event, 'table'))

  const { id } = await readBody<{ id?: string }>(event)
  const { error } = await getSupabase().from(table).delete().eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
  }
  await invalidatePublicContent(table)
  return { ok: true }
})
