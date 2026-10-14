export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const { data: leads, error } = await getSupabase()
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
  }
  return leads ?? []
})
