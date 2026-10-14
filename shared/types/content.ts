export type Bilingual = { es: string; en: string }
export type BilingualList = { es: string[]; en: string[] }

export interface Place {
  id: string
  cat: Bilingual
  name: Bilingual
  short: Bilingual
  long: Bilingual
  hours: Bilingual
  cost: Bilingual
  tips: BilingualList
  img: string
}

export interface EventItem {
  id: string
  d: string
  m: Bilingual
  range: Bilingual
  name: Bilingual
  cat: Bilingual
  time: Bilingual
  place: Bilingual
  desc: Bilingual
  img: string
}

export interface Post {
  id: string
  author: string
  date: Bilingual
  cat: Bilingual
  title: Bilingual
  excerpt: Bilingual
  body: BilingualList
  img: string
}

// What /api/public/posts returns for listings — the body only travels when an
// article is fetched by id.
export type PostSummary = Omit<Post, 'body'>

export interface Review {
  name: string
  rating: number
  date: Bilingual
  text: Bilingual
}

export interface Rental {
  id: string
  type: 'casa' | 'habitacion' | 'apto'
  price: number
  guests: number
  beds: number
  baths: number
  parking: number
  sqmBuilt: number
  sqmLot: number
  minMonths: number
  verified: boolean
  // Optional: only rendered on the PDP's verification tooltip when actually
  // set — a generic "verified" claim shows instead of a fabricated date.
  verifiedDate?: string
  availableFrom: string
  // Optional: the PDP only renders a cost breakdown when these are actually
  // filled in from the admin — never shows a fabricated deposit/utilities
  // figure for a listing that hasn't specified one.
  deposit?: number
  utilitiesMin?: number
  utilitiesMax?: number
  rating: number
  reviews: number
  // Optional, remote-work fit (Flatio's "Nomad Inspector" pattern): measured
  // download speed and whether there's a real desk. Only rendered when set —
  // never a guessed speed.
  wifiMbps?: number
  workspace?: boolean
  name: Bilingual
  loc: Bilingual
  short: Bilingual
  desc: Bilingual
  host: { name: string; line: Bilingual; phone: string; email: string }
  amen: string[]
  reviewsList: Review[]
  img: string
  video?: string
  featured?: boolean
  lat: number
  lng: number
}

// --- Listings: one catalogue for rentals, houses for sale and land ---------
// A discriminated union on `kind`, so each kind only carries the fields that
// make sense for it (land has no bedrooms, a sale has no minimum stay).
export type ListingKind = 'rent' | 'sale' | 'land'

// How the property is held. In Panama this is the first question a foreign
// buyer asks: a registered "título de propiedad" (titled, can be mortgaged)
// versus "derechos posesorios" (possession rights, cheaper but riskier).
export type PropertyTitle = 'titulo' | 'derechos'

interface ListingBase {
  id: string
  kind: ListingKind
  name: Bilingual
  short: Bilingual
  desc: Bilingual
  // A BOQUETE_ZONES id, so listings can be filtered and grouped by zone.
  zone: string
  loc: Bilingual
  lat: number
  lng: number
  // Owner prefers not to publish the exact spot: the map draws a ~300 m area
  // around lat/lng instead of a precise pin.
  approxLocation?: boolean
  // Rent: USD per month. Sale and land: total asking price in USD.
  price: number
  // Lot size; 0 when it doesn't apply (an apartment, a room).
  sqmLot: number
  img: string
  images?: string[]
  video?: string
  featured?: boolean
  verified: boolean
  verifiedDate?: string
  amen: string[]
  contact: { name: string; line: Bilingual; phone: string; email?: string }
  // Seeded sample data, so it can be wiped in one query before going live.
  demo?: boolean
}

export interface RentListing extends ListingBase {
  kind: 'rent'
  type: 'casa' | 'habitacion' | 'apto'
  guests: number
  beds: number
  baths: number
  parking: number
  sqmBuilt: number
  minMonths: number
  availableFrom: string
  deposit?: number
  utilitiesMin?: number
  utilitiesMax?: number
  wifiMbps?: number
  workspace?: boolean
  rating: number
  reviews: number
  reviewsList: Review[]
}

export interface SaleListing extends ListingBase {
  kind: 'sale'
  type: 'casa' | 'apto'
  beds: number
  baths: number
  parking: number
  sqmBuilt: number
  yearBuilt?: number
  title: PropertyTitle
  // Monthly HOA / maintenance fee (gated communities, apartments).
  hoaFee?: number
  furnished?: boolean
}

export interface LandListing extends ListingBase {
  kind: 'land'
  title: PropertyTitle
  topography: 'plano' | 'inclinado' | 'mixto'
  water: boolean
  power: boolean
  road: 'asfalto' | 'tierra' | 'ninguno'
}

export type Listing = RentListing | SaleListing | LandListing

// What /api/public/listings returns for lists (explorer, "similar" strips):
// the long description, reviews and extra photos only travel with a single
// listing, so the explorer's SSR payload doesn't grow with every review.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
export type ListingSummary = DistributiveOmit<Listing, 'desc' | 'reviewsList' | 'images'>

export interface GalleryItem {
  id: string
  cat: string
  label: Bilingual
  img: string
}

// 'visita': a request to visit a home for sale or a plot of land, sent from
// its listing page (reuses rental_id/rental_name for the listing, move_in for
// the preferred visit date).
export type LeadType = 'guide' | 'propietario' | 'alquiler' | 'visita'

export interface Lead {
  id: number
  nombre: string
  email: string | null
  celular: string | null
  pais: string | null
  retiro: string | null
  timeline: string | null
  interes: string | null
  type: LeadType
  tipo_propiedad: string | null
  ubicacion: string | null
  mensaje: string | null
  rental_id: string | null
  rental_name: string | null
  move_in: string | null
  duracion: string | null
  personas: number | null
  mascotas: boolean | null
  created_at: string
}

export type ContentTable = 'places' | 'events' | 'posts' | 'rentals' | 'gallery' | 'listings'
