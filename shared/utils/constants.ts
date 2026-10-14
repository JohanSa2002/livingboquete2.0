import type { Bilingual } from '#shared/types/content'

export const GALLERY_CATS = [
  { id: 'all', label: { es: 'Todas', en: 'All' } },
  { id: 'naturaleza', label: { es: 'Naturaleza', en: 'Nature' } },
  { id: 'cafe', label: { es: 'Café', en: 'Coffee' } },
  { id: 'cultura', label: { es: 'Cultura', en: 'Culture' } },
  { id: 'aventura', label: { es: 'Aventura', en: 'Adventure' } },
]

export const AMEN_LABELS: Record<string, { icon: string; es: string; en: string }> = {
  wifi: { icon: '📶', es: 'WiFi', en: 'WiFi' },
  kitchen: { icon: '🍳', es: 'Cocina equipada', en: 'Full kitchen' },
  view: { icon: '🏔️', es: 'Vista panorámica', en: 'Panoramic view' },
  parking: { icon: '🚗', es: 'Parqueo', en: 'Parking' },
  fireplace: { icon: '🔥', es: 'Chimenea', en: 'Fireplace' },
  pool: { icon: '🏊', es: 'Piscina', en: 'Pool' },
  pets: { icon: '🐾', es: 'Acepta mascotas', en: 'Pet friendly' },
  furnished: { icon: '🛋️', es: 'Amueblado', en: 'Furnished' },
  // Sale and land listings
  garden: { icon: '🌿', es: 'Jardín', en: 'Garden' },
  river: { icon: '🏞️', es: 'Río o quebrada', en: 'River or stream' },
  spring: { icon: '💧', es: 'Naciente de agua propia', en: 'Own water spring' },
  coffee: { icon: '☕', es: 'Cafetal en producción', en: 'Producing coffee' },
  security: { icon: '🔒', es: 'Seguridad 24 h', en: '24 h security' },
}

export const TYPE_LABELS: Record<string, Bilingual> = {
  casa: { es: 'Casa', en: 'House' },
  habitacion: { es: 'Habitación', en: 'Room' },
  apto: { es: 'Apartamento', en: 'Apartment' },
}

export const NAV = [
  { key: 'home', href: '/', label: { es: 'Inicio', en: 'Home' } },
  { key: 'stays', href: '/propiedades', label: { es: 'Propiedades', en: 'Properties' } },
  { key: 'blog', href: '/blog', label: { es: 'Blog', en: 'Blog' } },
]

// Site-wide WhatsApp line for the floating button and the guarantees block.
// Digits only for wa.me; the display string is what people read.
export const CONTACT_WHATSAPP = { number: '50768124471', display: '+507 6812-4471' }

// Boquete's zones — the "which part of town" question every relocator asks
// first. Elevation drives climate here: every 100 m up is roughly 0.6 °C
// cooler, so Alto Boquete and Palmira are the sunny, warmer edges and
// Jaramillo/Volcancito the cool, cloud-forest ones. Price bands are
// orientative 2026 monthly rents for furnished places.
export interface Zone {
  id: string
  name: string
  elevation: string
  climate: Bilingual
  blurb: Bilingual
  bestFor: Bilingual
  priceFrom: number
  priceTo: number
  lat: number
  lng: number
  img: string
}
export const BOQUETE_ZONES: Zone[] = [
  {
    id: 'bajo-boquete',
    name: 'Bajo Boquete',
    elevation: '1.200 m',
    climate: { es: 'Templado · 16–24 °C', en: 'Mild · 16–24 °C' },
    blurb: {
      es: 'El centro del pueblo: cafés, el mercado, la feria y el río Caldera a pie. Aquí no hace falta carro.',
      en: 'The town centre: cafés, the market, the fairgrounds and the Caldera river on foot. No car needed here.',
    },
    bestFor: { es: 'Sin carro · vida social · primera vez en Boquete', en: 'Car-free · social life · first time in Boquete' },
    priceFrom: 550,
    priceTo: 1200,
    lat: 8.7801,
    lng: -82.4327,
    img: 'https://picsum.photos/seed/bajo-boquete/900/640',
  },
  {
    id: 'alto-boquete',
    name: 'Alto Boquete',
    elevation: '1.050 m',
    climate: { es: 'Más cálido y soleado · 18–27 °C', en: 'Warmer and sunnier · 18–27 °C' },
    blurb: {
      es: 'La entrada al valle, más sol y más servicios: supermercados, clínicas y la vía a David a 30 minutos.',
      en: 'The valley entrance — more sun and more services: supermarkets, clinics and the road to David 30 minutes away.',
    },
    bestFor: { es: 'Familias · trámites y servicios · quien prefiere calor', en: 'Families · errands and services · sun lovers' },
    priceFrom: 500,
    priceTo: 1100,
    lat: 8.7530,
    lng: -82.4360,
    img: 'https://picsum.photos/seed/alto-boquete/900/640',
  },
  {
    id: 'volcancito',
    name: 'Volcancito',
    elevation: '1.350 m',
    climate: { es: 'Fresco con brisa · 14–22 °C', en: 'Cool and breezy · 14–22 °C' },
    blurb: {
      es: 'Laderas con vista al valle y al Barú, casas con jardín y la comunidad extranjera más asentada.',
      en: 'Hillsides overlooking the valley and Barú, houses with gardens and the most established expat community.',
    },
    bestFor: { es: 'Vistas · retirados · casas grandes', en: 'Views · retirees · larger homes' },
    priceFrom: 800,
    priceTo: 1800,
    lat: 8.7905,
    lng: -82.4552,
    img: 'https://picsum.photos/seed/volcancito/900/640',
  },
  {
    id: 'jaramillo',
    name: 'Jaramillo',
    elevation: '1.500 m',
    climate: { es: 'Frío de montaña · 12–20 °C', en: 'Mountain cold · 12–20 °C' },
    blurb: {
      es: 'Entre fincas de café y bosque nublado. Silencio, chimenea y la mejor vista al volcán del valle.',
      en: 'Among coffee farms and cloud forest. Silence, a fireplace and the valley’s best view of the volcano.',
    },
    bestFor: { es: 'Naturaleza · trabajo remoto en calma · quien no teme al frío', en: 'Nature · quiet remote work · the cold-tolerant' },
    priceFrom: 700,
    priceTo: 1600,
    lat: 8.8010,
    lng: -82.4150,
    img: 'https://picsum.photos/seed/jaramillo/900/640',
  },
  {
    id: 'palmira',
    name: 'Palmira',
    elevation: '1.100 m',
    climate: { es: 'Soleado · 17–26 °C', en: 'Sunny · 17–26 °C' },
    blurb: {
      es: 'Al sur del pueblo, terreno abierto y tardes de sol. Barrios residenciales tranquilos a 10 minutos del centro.',
      en: 'South of town, open land and sunny afternoons. Quiet residential streets 10 minutes from the centre.',
    },
    bestFor: { es: 'Presupuesto ajustado · familias con carro · huertos', en: 'Tighter budgets · families with a car · gardens' },
    priceFrom: 450,
    priceTo: 950,
    lat: 8.7450,
    lng: -82.4200,
    img: 'https://picsum.photos/seed/palmira-boquete/900/640',
  },
  {
    id: 'los-naranjos',
    name: 'Los Naranjos',
    elevation: '1.300 m',
    climate: { es: 'Fresco · 15–23 °C', en: 'Cool · 15–23 °C' },
    blurb: {
      es: 'Al norte, camino a los senderos del Barú. Pocas casas, mucho verde y cascadas a media hora caminando.',
      en: 'To the north, on the way to the Barú trails. Few houses, lots of green and waterfalls half an hour on foot.',
    },
    bestFor: { es: 'Senderismo · privacidad · estancias largas', en: 'Hiking · privacy · long stays' },
    priceFrom: 600,
    priceTo: 1300,
    lat: 8.8060,
    lng: -82.4405,
    img: 'https://picsum.photos/seed/los-naranjos/900/640',
  },
]

// Orientative monthly budget for one or two people, 2026. Editorial fallback
// for the rent rows — when the catalogue has listings of a type, the real
// min/max from the data replaces the band (see HomeCostOfLiving).
export const COST_RENT_BANDS: { type: 'habitacion' | 'apto' | 'casa'; from: number; to: number }[] = [
  { type: 'habitacion', from: 350, to: 600 },
  { type: 'apto', from: 600, to: 1100 },
  { type: 'casa', from: 900, to: 1800 },
]
export const COST_BASICS: { label: Bilingual; from: number; to: number; note: Bilingual }[] = [
  { label: { es: 'Electricidad', en: 'Electricity' }, from: 35, to: 90, note: { es: 'Sin aire acondicionado: el clima lo hace innecesario', en: 'No A/C — the climate makes it unnecessary' } },
  { label: { es: 'Internet (fibra)', en: 'Internet (fibre)' }, from: 30, to: 55, note: { es: '100–300 Mbps en el pueblo; menos en fincas', en: '100–300 Mbps in town; less on farms' } },
  { label: { es: 'Agua', en: 'Water' }, from: 5, to: 15, note: { es: 'Muchas casas usan acueducto comunitario', en: 'Many homes are on a community aqueduct' } },
  { label: { es: 'Supermercado (2 personas)', en: 'Groceries (2 people)' }, from: 380, to: 620, note: { es: 'Menos si compras en el mercado de los martes', en: 'Less if you shop at the Tuesday market' } },
  { label: { es: 'Comer fuera', en: 'Eating out' }, from: 7, to: 18, note: { es: 'Por plato: fonda a restaurante', en: 'Per dish: fonda to restaurant' } },
  { label: { es: 'Taxi en el pueblo', en: 'Taxi in town' }, from: 2, to: 5, note: { es: 'Por trayecto; a David ~$35', en: 'Per ride; to David ~$35' } },
]
