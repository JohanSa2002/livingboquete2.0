import type { Bilingual, ListingKind, ListingSummary } from '#shared/types/content'

// Display metadata per listing kind, shared by the admin and the public
// explorer so a kind reads (and is coloured) the same everywhere.
export const LISTING_KINDS: { value: ListingKind; label: Bilingual; color: string }[] = [
  { value: 'rent', label: { es: 'Alquiler', en: 'Rent' }, color: '#2F5233' },
  { value: 'sale', label: { es: 'Casa en venta', en: 'Home for sale' }, color: '#8E4A2A' },
  { value: 'land', label: { es: 'Terreno', en: 'Land' }, color: '#9A6B1E' },
]

export function kindMeta(kind: ListingKind) {
  return LISTING_KINDS.find(k => k.value === kind)!
}

// Boquete district, generously: anything outside is almost certainly a typo
// (a swapped sign, lat/lng reversed) rather than a real listing.
export const BOQUETE_BOUNDS = { latMin: 8.65, latMax: 8.92, lngMin: -82.56, lngMax: -82.30 }
export const BOQUETE_CENTER: [number, number] = [8.778, -82.435]

export function inBoquete(lat: number, lng: number) {
  const b = BOQUETE_BOUNDS
  return lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax
}

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
// $385,000 → $385k; $1,250,000 → $1.25M. Compact for map pins and tight cards.
const usdShort = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
    : n >= 1000 ? `$${Math.round(n / 1000)}k`
      : usd(n)

export function pricePerSqm(l: Pick<ListingSummary, 'price' | 'sqmLot'>) {
  return l.sqmLot > 0 ? l.price / l.sqmLot : 0
}

// Price as each kind is quoted: rent per month, sales as a total, land as a
// total with its size (what buyers compare first).
export function formatListingPrice(l: Pick<ListingSummary, 'kind' | 'price' | 'sqmLot'>, lang: 'es' | 'en', compact = false) {
  const money = compact ? usdShort(l.price) : usd(l.price)
  if (l.kind === 'rent') return `${usd(l.price)}${lang === 'en' ? '/mo' : '/mes'}`
  if (l.kind === 'land' && l.sqmLot > 0) {
    // es-ES skips the separator on 4-digit numbers ("1600"); the site writes
    // "1.600 m²" in Spanish, so swap en-US commas for dots instead.
    const grouped = l.sqmLot.toLocaleString('en-US')
    const sqm = lang === 'en' ? grouped : grouped.replace(/,/g, '.')
    return `${money} · ${sqm} m²`
  }
  return money
}

// URL slugs for the explorer's ?tipo= param (Spanish, like the rest of the
// public routes) and back.
export const KIND_SLUGS: Record<ListingKind, string> = { rent: 'alquiler', sale: 'venta', land: 'terreno' }
export function kindFromSlug(slug: unknown): ListingKind | null {
  const hit = (Object.entries(KIND_SLUGS) as [ListingKind, string][]).find(([, s]) => s === slug)
  return hit ? hit[0] : null
}

// "Up to" price steps per kind; the explorer's price filter only appears once a
// single kind is chosen, since a monthly rent and a sale price can't share one.
export const PRICE_STEPS: Record<ListingKind, number[]> = {
  rent: [500, 750, 1000, 1500, 2000],
  sale: [150000, 200000, 300000, 400000, 600000],
  land: [50000, 75000, 100000, 150000, 250000],
}

// Free, keyless raster tiles. One constant so the provider can be swapped
// (e.g. to OpenFreeMap or a paid plan) without touching any map component.
// A single host, not the old a./b./c. subdomains: over HTTP/2 one connection
// multiplexes every tile, while three hosts meant three DNS+TLS handshakes
// before the first tile (the explorer's LCP) could arrive.
export const MAP_TILE_ORIGIN = 'https://tile.openstreetmap.org'
export const MAP_TILES = {
  url: `${MAP_TILE_ORIGIN}/{z}/{x}/{y}.png`,
  attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  maxZoom: 19,
}

const n = (v: number, lang: 'es' | 'en') => {
  const g = Math.round(v).toLocaleString('en-US')
  return lang === 'en' ? g : g.replace(/,/g, '.')
}

// The 3–4 numbers people scan a card for, phrased per kind.
export function listingFacts(l: ListingSummary, lang: 'es' | 'en'): string[] {
  const en = lang === 'en'
  if (l.kind === 'land') {
    const ppm = pricePerSqm(l)
    const topo = { plano: en ? 'Flat' : 'Plano', inclinado: en ? 'Sloped' : 'Inclinado', mixto: en ? 'Mixed' : 'Mixto' }[l.topography]
    return [
      `${n(l.sqmLot, lang)} m²`,
      ...(ppm ? [`$${n(ppm, lang)}/m²`] : []),
      topo,
      ...(l.water && l.power ? [en ? 'Water + power' : 'Agua y luz'] : l.water ? [en ? 'Water' : 'Agua'] : []),
    ]
  }
  const facts = [
    `${l.beds} ${en ? (l.beds === 1 ? 'bed' : 'beds') : (l.beds === 1 ? 'rec.' : 'rec.')}`,
    `${l.baths} ${en ? (l.baths === 1 ? 'bath' : 'baths') : (l.baths === 1 ? 'baño' : 'baños')}`,
  ]
  if (l.sqmBuilt) facts.push(`${n(l.sqmBuilt, lang)} m²`)
  if (l.kind === 'sale' && l.sqmLot) facts.push(`${en ? 'Lot' : 'Lote'} ${n(l.sqmLot, lang)} m²`)
  if (l.kind === 'rent' && l.minMonths > 1) facts.push(en ? `min. ${l.minMonths} mo` : `mín. ${l.minMonths} meses`)
  return facts
}

// What a "Type" line says: subtype for rent/sale, nothing extra for land.
export function listingTypeLabel(l: ListingSummary, lang: 'es' | 'en') {
  const en = lang === 'en'
  if (l.kind === 'land') return en ? 'Land' : 'Terreno'
  const sub = { casa: en ? 'House' : 'Casa', apto: en ? 'Apartment' : 'Apartamento', habitacion: en ? 'Room' : 'Habitación' }[l.type]
  return l.kind === 'rent' ? `${sub} ${en ? 'for rent' : 'en alquiler'}` : `${sub} ${en ? 'for sale' : 'en venta'}`
}
