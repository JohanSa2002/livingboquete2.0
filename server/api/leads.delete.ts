export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const { id } = await readBody<{ id?: number }>(event)
  const { error } = await getSupabase().from('leads').delete().eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
  }
  return { ok: true }
})
