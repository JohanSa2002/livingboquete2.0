const TABLES = ['leads', 'places', 'events', 'posts', 'listings', 'gallery'] as const

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabase()

  const counts = Object.fromEntries(
    await Promise.all(TABLES.map(async (table) => {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      return [table, count ?? 0] as const
    })),
  ) as Record<(typeof TABLES)[number], number>

  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return { counts, recentLeads: data ?? [] }
})
