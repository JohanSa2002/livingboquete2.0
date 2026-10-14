import type { ContentTable, GalleryItem, Listing, ListingSummary, Place, Post, PostSummary, Rental, EventItem } from '#shared/types/content'

type TableMap = {
  places: Place
  events: EventItem
  posts: Post
  rentals: Rental
  gallery: GalleryItem
  listings: Listing
}

// Lists of posts come without the article body; lists of listings without
// the description, reviews and extra photos.
type ListMap = Omit<TableMap, 'posts' | 'listings'> & { posts: PostSummary; listings: ListingSummary }

// Public read of a content table. Server-rendered on first load (the result
// travels in the Nuxt payload) and fetched over HTTP on client-side
// navigation — the same rows either way.
export function useContentList<T extends ContentTable>(
  table: T,
  opts: { exclude?: MaybeRefOrGetter<string>; limit?: number } = {},
) {
  return useFetch<ListMap[T][]>(`/api/public/${table}`, {
    key: () => `content:${table}:${toValue(opts.exclude) ?? ''}:${opts.limit ?? ''}`,
    query: {
      ...(opts.exclude ? { exclude: computed(() => toValue(opts.exclude!)) } : {}),
      ...(opts.limit ? { limit: opts.limit } : {}),
    },
    default: () => [] as ListMap[T][],
  })
}

export function useContentItem<T extends ContentTable>(table: T, id: MaybeRefOrGetter<string>) {
  return useFetch<TableMap[T]>(`/api/public/${table}`, {
    key: () => `content:${table}:${toValue(id)}`,
    query: { id: computed(() => toValue(id)) },
  })
}
