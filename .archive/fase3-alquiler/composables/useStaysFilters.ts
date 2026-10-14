import type { InjectionKey, Ref } from 'vue'
import { TYPE_LABELS } from '#shared/utils/constants'
import type { Bilingual, Rental } from '#shared/types/content'

// __idx preserves the original created_at-ascending order so re-sorting can
// restore "relevancia" or derive "recientes" without a separate timestamp.
export type IndexedRental = Rental & { __idx: number }

export const DURATION_BUCKETS = [
  { value: '', es: 'Cualquiera', en: 'Any' },
  { value: '1-3', es: '1–3 meses', en: '1–3 months' },
  { value: '3-6', es: '3–6 meses', en: '3–6 months' },
  { value: '6-12', es: '6–12 meses', en: '6–12 months' },
  { value: '12+', es: '12+ meses', en: '12+ months' },
] as const

const DURATION_LABELS: Record<string, Bilingual> = {
  '1-3': { es: '1–3 meses', en: '1–3 months' },
  '3-6': { es: '3–6 meses', en: '3–6 months' },
  '6-12': { es: '6–12 meses', en: '6–12 months' },
  '12+': { es: '12+ meses', en: '12+ months' },
}
const AMENITY_LABELS: Record<string, Bilingual> = {
  view: { es: 'Vista panorámica', en: 'Panoramic view' },
  pets: { es: 'Acepta mascotas', en: 'Pet friendly' },
  furnished: { es: 'Amueblado', en: 'Furnished' },
}

export const PRICE_MIN = 300
export const PRICE_MAX = 1500

export interface Chip { label: Bilingual; kind: string; value?: string }

function matchesDuracion(minMonths: number, bucket: string) {
  if (!bucket) return true
  if (bucket === '1-3') return minMonths <= 3
  if (bucket === '3-6') return minMonths > 3 && minMonths <= 6
  if (bucket === '6-12') return minMonths > 6 && minMonths <= 12
  if (bucket === '12+') return minMonths > 12
  return true
}

// Empty availableFrom means "available now", which always satisfies any
// requested move-in date — same rule the PDP uses to compute "Disponible
// ahora" vs "Disponible en X días".
function matchesDisponible(availableFrom: string, target: string) {
  if (!target) return true
  if (!availableFrom) return true
  return availableFrom <= target
}

// Filter + sort state for the /alquiler catalogue. Seeded from the URL so
// results are server-rendered on first load (shareable, crawlable); after that
// the same state drives client-side filtering with no refetch — the grid
// always holds the FULL catalogue and only toggles each card's visibility.
function createStaysFilters(rentals: Ref<IndexedRental[]>) {
  const q = useRoute().query

  const activeType = ref(String(q.tipo ?? 'all'))
  const maxPrice = ref(Number(q.precio_max ?? PRICE_MAX))
  const minGuests = ref(Number(q.personas ?? 1))
  const activeAmenities = ref<string[]>(String(q.amenidades ?? '').split(',').filter(Boolean))
  const activeDuracion = ref(String(q.duracion ?? ''))
  const minHabs = ref(Number(q.habs ?? 0))
  const minBanos = ref(Number(q.banos ?? 0))
  const disponibleDate = ref(String(q.disponible ?? ''))
  const orden = ref(String(q.orden ?? 'relevancia'))

  function matches(p: IndexedRental) {
    return (activeType.value === 'all' || p.type === activeType.value)
      && p.price <= maxPrice.value
      && p.guests >= minGuests.value
      && activeAmenities.value.every(key => p.amen.includes(key))
      && matchesDuracion(p.minMonths, activeDuracion.value)
      && p.beds >= minHabs.value
      && p.baths >= minBanos.value
      && matchesDisponible(p.availableFrom, disponibleDate.value)
  }

  const visibleIds = computed(() => new Set(rentals.value.filter(matches).map(p => p.id)))
  const resultCount = computed(() => visibleIds.value.size)

  const renderRentals = computed(() => {
    const arr = [...rentals.value]
    if (orden.value === 'precio_asc') arr.sort((a, b) => a.price - b.price)
    else if (orden.value === 'precio_desc') arr.sort((a, b) => b.price - a.price)
    else if (orden.value === 'rating') arr.sort((a, b) => b.rating - a.rating)
    else if (orden.value === 'recientes') arr.sort((a, b) => b.__idx - a.__idx)
    else arr.sort((a, b) => a.__idx - b.__idx) // relevancia: original catalog order
    return arr
  })

  function toggleAmenity(key: string) {
    activeAmenities.value = activeAmenities.value.includes(key)
      ? activeAmenities.value.filter(k => k !== key)
      : [...activeAmenities.value, key]
  }

  // Lifestyle shortcuts reset the filters, then activate the matching one and
  // scroll down to the results grid.
  function applyShortcut(key: string, kind: 'amen' | 'type') {
    activeType.value = 'all'
    activeAmenities.value = []
    if (kind === 'type') activeType.value = key
    else activeAmenities.value = [key]
    document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
  }

  const activeChips = computed<Chip[]>(() => {
    const chips: Chip[] = []
    if (activeType.value !== 'all') {
      chips.push({ label: TYPE_LABELS[activeType.value] ?? { es: activeType.value, en: activeType.value }, kind: 'tipo' })
    }
    if (maxPrice.value < PRICE_MAX) chips.push({ label: { es: `Hasta $${maxPrice.value}`, en: `Up to $${maxPrice.value}` }, kind: 'precio' })
    if (minGuests.value > 1) chips.push({ label: { es: `${minGuests.value}+ personas`, en: `${minGuests.value}+ guests` }, kind: 'personas' })
    if (minHabs.value > 0) chips.push({ label: { es: `${minHabs.value}+ habitaciones`, en: `${minHabs.value}+ bedrooms` }, kind: 'habs' })
    if (minBanos.value > 0) chips.push({ label: { es: `${minBanos.value}+ baños`, en: `${minBanos.value}+ bathrooms` }, kind: 'banos' })
    if (activeDuracion.value) chips.push({ label: DURATION_LABELS[activeDuracion.value]!, kind: 'duracion' })
    if (disponibleDate.value) chips.push({ label: { es: `Desde ${disponibleDate.value}`, en: `From ${disponibleDate.value}` }, kind: 'disponible' })
    activeAmenities.value.forEach((key) => {
      chips.push({ label: AMENITY_LABELS[key] ?? { es: key, en: key }, kind: 'amenidad', value: key })
    })
    return chips
  })

  function removeChip(chip: Chip) {
    if (chip.kind === 'tipo') activeType.value = 'all'
    else if (chip.kind === 'precio') maxPrice.value = PRICE_MAX
    else if (chip.kind === 'personas') minGuests.value = 1
    else if (chip.kind === 'habs') minHabs.value = 0
    else if (chip.kind === 'banos') minBanos.value = 0
    else if (chip.kind === 'duracion') activeDuracion.value = ''
    else if (chip.kind === 'disponible') disponibleDate.value = ''
    else if (chip.kind === 'amenidad') activeAmenities.value = activeAmenities.value.filter(k => k !== chip.value)
  }

  function clearAll() {
    activeType.value = 'all'
    maxPrice.value = PRICE_MAX
    minGuests.value = 1
    minHabs.value = 0
    minBanos.value = 0
    activeDuracion.value = ''
    disponibleDate.value = ''
    activeAmenities.value = []
  }

  // Filters live in the URL so a filtered result stays shareable and crawlable.
  // replaceState (not push) keeps the back button pointing at the previous page
  // rather than every intermediate filter state.
  watchEffect(() => {
    if (!import.meta.client) return
    const url = new URL(location.href)
    const sp = url.searchParams
    const set = (k: string, v: string, def: string) => (v === def ? sp.delete(k) : sp.set(k, v))
    set('tipo', activeType.value, 'all')
    set('precio_max', String(maxPrice.value), String(PRICE_MAX))
    set('personas', String(minGuests.value), '1')
    set('amenidades', activeAmenities.value.join(','), '')
    set('duracion', activeDuracion.value, '')
    set('habs', String(minHabs.value), '0')
    set('banos', String(minBanos.value), '0')
    set('disponible', disponibleDate.value, '')
    set('orden', orden.value, 'relevancia')
    history.replaceState(history.state, '', url)
  })

  return {
    rentals,
    activeType,
    maxPrice,
    minGuests,
    activeAmenities,
    activeDuracion,
    minHabs,
    minBanos,
    disponibleDate,
    orden,
    visibleIds,
    resultCount,
    renderRentals,
    activeChips,
    toggleAmenity,
    applyShortcut,
    removeChip,
    clearAll,
  }
}

export type StaysFilters = ReturnType<typeof createStaysFilters>

const KEY: InjectionKey<StaysFilters> = Symbol('stays-filters')

// The page owns the state; the sidebar, the grid and the lifestyle shortcuts
// all read and write the same instance through inject.
export function provideStaysFilters(rentals: Ref<IndexedRental[]>) {
  const filters = createStaysFilters(rentals)
  provide(KEY, filters)
  return filters
}

export function useStaysFilters() {
  const filters = inject(KEY)
  if (!filters) throw new Error('useStaysFilters() must be used inside a page that calls provideStaysFilters()')
  return filters
}
