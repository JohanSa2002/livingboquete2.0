import type { ContentTable } from '#shared/types/content'

const VALID_TABLES: ContentTable[] = ['places', 'events', 'posts', 'rentals', 'gallery', 'listings']

export function assertContentTable(table: string | undefined): ContentTable {
  if (!table || !VALID_TABLES.includes(table as ContentTable)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid table', data: { error: 'Invalid table' } })
  }
  return table as ContentTable
}
