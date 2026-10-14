import type { ListingKind, ListingSummary as Listing } from '#shared/types/content'
import { KIND_SLUGS, kindFromSlug } from '#shared/utils/listings'

export type SortKey = 'relevancia' | 'precio-asc' | 'precio-desc' | 'recientes'

// A lat/lng box the visitor asked to search ("Buscar en esta zona").
export interface Bbox { south: number; west: number; north: number; east: number }

// Filter state for /propiedades, seeded from the URL so the first render is
// server-side and any search is a shareable link. Every change is written back
// with router.replace (no history spam) and filtering itself is client-side:
// the whole catalogue is small and already loaded. (router.replace rather than
// history.replaceState: profiling showed no measurable cost difference, and
// the router has to know the query — the language toggle carries it over.)
export function useListingFilters(listings: Ref<Listing[]>) {
  const route = useRoute()
  const router = useRouter()
  const q = route.query

  const kind = ref<ListingKind | 'all'>(kindFromSlug(q.tipo) ?? 'all')
  const zone = ref(typeof q.zona === 'string' ? q.zona : '')
  const maxPrice = ref(Number(q.precio_max) || 0)
  const minBeds = ref(Number(q.recamaras) || 0)
  const sort = ref<SortKey>((['relevancia', 'precio-asc', 'precio-desc', 'recientes'] as const).includes(q.orden as SortKey) ? q.orden as SortKey : 'relevancia')
  const selectedId = ref<string | null>(typeof q.sel === 'string' ? q.sel : null)
  const bbox = ref<Bbox | null>(null)

  // Price and bedrooms only mean something for a given kind; switching kind
  // drops them rather than silently filtering by a stale, unrelated number.
  watch(kind, () => {
    maxPrice.value = 0
    if (kind.value === 'land') minBeds.value = 0
  })

  // Counts per kind ignore the kind filter itself, so each tab shows how many
  // results it would give.
  function matches(l: Listing, ignoreKind = false) {
    if (!ignoreKind && kind.value !== 'all' && l.kind !== kind.value) return false
    if (zone.value && l.zone !== zone.value) return false
    if (maxPrice.value && l.price > maxPrice.value) return false
    if (minBeds.value && (l.kind === 'land' || l.beds < minBeds.value)) return false
    if (bbox.value) {
      const b = bbox.value
      if (l.lat < b.south || l.lat > b.north || l.lng < b.west || l.lng > b.east) return false
    }
    return true
  }

  const counts = computed(() => {
    const c: Record<ListingKind | 'all', number> = { all: 0, rent: 0, sale: 0, land: 0 }
    for (const l of listings.value) {
      if (!matches(l, true)) continue
      c.all++
      c[l.kind]++
    }
    return c
  })

  const results = computed(() => {
    const list = listings.value
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => matches(l))
    const score = (l: Listing) => (l.featured ? 2 : 0) + (l.verified ? 1 : 0)
    list.sort((a, b) => {
      if (sort.value === 'precio-asc') return a.l.price - b.l.price
      if (sort.value === 'precio-desc') return b.l.price - a.l.price
      if (sort.value === 'recientes') return b.i - a.i
      return score(b.l) - score(a.l) || a.i - b.i
    })
    return list.map(({ l }) => l)
  })

  const hasFilters = computed(() => kind.value !== 'all' || !!zone.value || !!maxPrice.value || !!minBeds.value || !!bbox.value)

  function reset() {
    kind.value = 'all'
    zone.value = ''
    maxPrice.value = 0
    minBeds.value = 0
    bbox.value = null
  }

  watch([kind, zone, maxPrice, minBeds, sort, selectedId], () => {
    const query: Record<string, string> = {}
    if (kind.value !== 'all') query.tipo = KIND_SLUGS[kind.value]
    if (zone.value) query.zona = zone.value
    if (maxPrice.value) query.precio_max = String(maxPrice.value)
    if (minBeds.value) query.recamaras = String(minBeds.value)
    if (sort.value !== 'relevancia') query.orden = sort.value
    if (selectedId.value) query.sel = selectedId.value
    router.replace({ query })
  })

  return { kind, zone, maxPrice, minBeds, sort, selectedId, bbox, counts, results, hasFilters, reset }
}
