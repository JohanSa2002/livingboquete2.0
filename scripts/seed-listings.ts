// Sample catalogue for the map explorer: 6 rentals, 6 houses for sale and 6
// plots of land spread over the six Boquete zones (BOQUETE_ZONES), with
// coordinates near each zone and 2026-plausible prices. Every row is tagged
// `demo: true` so it can be wiped before real listings go live:
//   delete from listings where data->>'demo' = 'true';
// Run: npm run seed:listings   (idempotent — upserts by id)
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import type { LandListing, Listing, RentListing, SaleListing } from '../shared/types/content'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment (.env).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// No photos on purpose: random stock would misrepresent a real property. The
// explorer renders a branded placeholder when `img` is empty.
const NO_IMG = ''

const AGENT = {
  name: 'Equipo MIKA Homes',
  line: { es: 'Asesoría local en Boquete', en: 'Local advisors in Boquete' },
  phone: '+507 6812-4471',
}

const rent = (r: Omit<RentListing, 'kind' | 'img' | 'demo' | 'contact' | 'reviewsList' | 'rating' | 'reviews'>): RentListing => ({
  kind: 'rent', img: NO_IMG, demo: true, contact: AGENT, reviewsList: [], rating: 0, reviews: 0, ...r,
})
const sale = (r: Omit<SaleListing, 'kind' | 'img' | 'demo' | 'contact'>): SaleListing => ({
  kind: 'sale', img: NO_IMG, demo: true, contact: AGENT, ...r,
})
const land = (r: Omit<LandListing, 'kind' | 'img' | 'demo' | 'contact' | 'sqmLot'> & { sqm: number }): LandListing => {
  const { sqm, ...rest } = r
  return { kind: 'land', img: NO_IMG, demo: true, contact: AGENT, sqmLot: sqm, ...rest }
}

const listings: Listing[] = [
  // ---------------------------------------------------------------- RENT
  rent({
    id: 'alquiler-cabana-cafetal',
    type: 'casa',
    zone: 'los-naranjos',
    name: { es: 'Cabaña entre cafetales', en: 'Cabin among the coffee' },
    loc: { es: 'Los Naranjos, Boquete', en: 'Los Naranjos, Boquete' },
    short: { es: 'Cabaña de madera amueblada con chimenea, rodeada de café y bosque nuboso.', en: 'Furnished wooden cabin with a fireplace, surrounded by coffee and cloud forest.' },
    desc: { es: 'A diez minutos del centro, en una finca de café en producción. Ideal para estadías de varios meses.', en: 'Ten minutes from town on a working coffee farm. Ideal for multi-month stays.' },
    lat: 8.8085, lng: -82.4430,
    price: 850, guests: 4, beds: 2, baths: 2, parking: 2, sqmBuilt: 110, sqmLot: 900,
    minMonths: 3, availableFrom: '', deposit: 850, utilitiesMin: 60, utilitiesMax: 90,
    wifiMbps: 85, workspace: true, verified: true,
    amen: ['wifi', 'kitchen', 'view', 'parking', 'fireplace', 'furnished', 'pets'],
  }),
  rent({
    id: 'alquiler-apto-rio-caldera',
    type: 'apto',
    zone: 'bajo-boquete',
    name: { es: 'Apartamento junto al río Caldera', en: 'Apartment by the Caldera river' },
    loc: { es: 'Centro de Boquete', en: 'Downtown Boquete' },
    short: { es: 'Luminoso, a pie del mercado y los cafés. Sin carro.', en: 'Bright, walking distance to the market and cafés. No car needed.' },
    desc: { es: 'Dos recámaras a orillas del río, en el corazón del pueblo.', en: 'Two bedrooms on the riverbank, in the heart of town.' },
    lat: 8.7772, lng: -82.4318,
    price: 600, guests: 3, beds: 2, baths: 1, parking: 1, sqmBuilt: 82, sqmLot: 0,
    minMonths: 6, availableFrom: '2026-11-01', verified: true,
    amen: ['wifi', 'kitchen', 'parking'],
  }),
  rent({
    id: 'alquiler-habitacion-orquideas',
    type: 'habitacion',
    zone: 'alto-boquete',
    name: { es: 'Habitación en jardín de orquídeas', en: 'Room in an orchid garden' },
    loc: { es: 'Alto Boquete', en: 'Alto Boquete' },
    short: { es: 'Habitación privada amueblada en casa familiar, la zona más soleada.', en: 'Furnished private room in a family home, the sunniest zone.' },
    desc: { es: 'Baño propio, cocina compartida y un jardín enorme.', en: 'Private bathroom, shared kitchen and a huge garden.' },
    lat: 8.7555, lng: -82.4342,
    price: 380, guests: 1, beds: 1, baths: 1, parking: 1, sqmBuilt: 28, sqmLot: 0,
    minMonths: 1, availableFrom: '', wifiMbps: 140, verified: true,
    amen: ['wifi', 'kitchen', 'furnished'],
  }),
  rent({
    id: 'alquiler-casa-vista-baru',
    type: 'casa',
    zone: 'volcancito',
    name: { es: 'Casa con vista al Barú', en: 'House facing Barú' },
    loc: { es: 'Volcancito, Boquete', en: 'Volcancito, Boquete' },
    short: { es: 'Casa familiar amplia, amueblada, con vista frontal al volcán.', en: 'Spacious furnished family house with a front view of the volcano.' },
    desc: { es: 'Cuatro recámaras pensadas para familias que se mudan a Boquete.', en: 'Four bedrooms designed for families relocating to Boquete.' },
    lat: 8.7932, lng: -82.4571,
    price: 1300, guests: 8, beds: 4, baths: 3, parking: 3, sqmBuilt: 220, sqmLot: 1200,
    minMonths: 6, availableFrom: '', deposit: 1300, wifiMbps: 210, workspace: true, verified: true,
    amen: ['wifi', 'kitchen', 'view', 'parking', 'fireplace', 'furnished', 'pets'],
  }),
  rent({
    id: 'alquiler-casita-jaramillo',
    type: 'casa',
    zone: 'jaramillo',
    name: { es: 'Casita en el bosque nuboso', en: 'Cloud-forest cottage' },
    loc: { es: 'Jaramillo Arriba', en: 'Jaramillo Arriba' },
    short: { es: 'Fresca y silenciosa, con chimenea y senderos desde la puerta.', en: 'Cool and quiet, with a fireplace and trails from the door.' },
    desc: { es: 'Para quien busca clima fresco y naturaleza a diario.', en: 'For those after cool weather and daily nature.' },
    lat: 8.8031, lng: -82.4128,
    price: 950, guests: 3, beds: 2, baths: 2, parking: 1, sqmBuilt: 95, sqmLot: 700,
    minMonths: 3, availableFrom: '2026-12-01', verified: false,
    amen: ['wifi', 'kitchen', 'view', 'fireplace', 'furnished'],
  }),
  rent({
    id: 'alquiler-apto-palmira',
    type: 'apto',
    zone: 'palmira',
    name: { es: 'Apartamento soleado en Palmira', en: 'Sunny apartment in Palmira' },
    loc: { es: 'Palmira, Boquete', en: 'Palmira, Boquete' },
    short: { es: 'La zona más cálida del valle, con terraza y piscina compartida.', en: 'The warmest zone of the valley, with a terrace and shared pool.' },
    desc: { es: 'Dos recámaras en residencial pequeño y tranquilo.', en: 'Two bedrooms in a small, quiet complex.' },
    lat: 8.7468, lng: -82.4221,
    price: 720, guests: 4, beds: 2, baths: 2, parking: 1, sqmBuilt: 96, sqmLot: 0,
    minMonths: 3, availableFrom: '', verified: true,
    amen: ['wifi', 'kitchen', 'pool', 'parking', 'furnished'],
  }),

  // ---------------------------------------------------------------- SALE
  sale({
    id: 'venta-casa-mirador-jaramillo',
    type: 'casa',
    zone: 'jaramillo',
    name: { es: 'Casa Mirador de Jaramillo', en: 'Jaramillo Lookout House' },
    loc: { es: 'Jaramillo Centro', en: 'Jaramillo Centro' },
    short: { es: 'Tres recámaras con vista al valle y al Pacífico en días claros.', en: 'Three bedrooms with views of the valley and, on clear days, the Pacific.' },
    desc: { es: 'Construcción de 2015, jardín maduro y taller independiente.', en: 'Built in 2015, mature garden and a separate workshop.' },
    lat: 8.7988, lng: -82.4172,
    price: 385000, beds: 3, baths: 3, parking: 2, sqmBuilt: 210, sqmLot: 1500,
    yearBuilt: 2015, title: 'titulo', verified: true,
    amen: ['view', 'fireplace', 'parking', 'garden'],
  }),
  sale({
    id: 'venta-casa-centro',
    type: 'casa',
    zone: 'bajo-boquete',
    name: { es: 'Casa en el centro del pueblo', en: 'House in the town centre' },
    loc: { es: 'Bajo Boquete', en: 'Bajo Boquete' },
    short: { es: 'Dos recámaras a cinco minutos a pie de todo.', en: 'Two bedrooms, a five-minute walk from everything.' },
    desc: { es: 'Ideal para vivir sin carro o como inversión de alquiler.', en: 'Ideal for car-free living or as a rental investment.' },
    lat: 8.7815, lng: -82.4340,
    price: 245000, beds: 2, baths: 2, parking: 1, sqmBuilt: 140, sqmLot: 450,
    yearBuilt: 2008, title: 'titulo', verified: true,
    amen: ['parking', 'garden'],
  }),
  sale({
    id: 'venta-casa-volcancito',
    type: 'casa',
    zone: 'volcancito',
    name: { es: 'Residencia de montaña en Volcancito', en: 'Volcancito mountain residence' },
    loc: { es: 'Volcancito, Boquete', en: 'Volcancito, Boquete' },
    short: { es: 'Cuatro recámaras en casi 3.000 m² con río y vista al Barú.', en: 'Four bedrooms on nearly 3,000 m² with a river and Barú views.' },
    desc: { es: 'Casa principal más casa de huéspedes, amueblada.', en: 'Main house plus guest house, furnished.' },
    lat: 8.7878, lng: -82.4530,
    price: 520000, beds: 4, baths: 4, parking: 3, sqmBuilt: 320, sqmLot: 2800,
    yearBuilt: 2019, title: 'titulo', furnished: true, verified: true,
    amen: ['view', 'fireplace', 'parking', 'garden', 'river', 'furnished'],
  }),
  sale({
    id: 'venta-apto-valle-escondido',
    type: 'apto',
    zone: 'bajo-boquete',
    name: { es: 'Apartamento en comunidad cerrada', en: 'Apartment in a gated community' },
    loc: { es: 'Bajo Boquete', en: 'Bajo Boquete' },
    short: { es: 'Dos recámaras con seguridad 24 h, gimnasio y club house.', en: 'Two bedrooms with 24 h security, gym and clubhouse.' },
    desc: { es: 'Bajo mantenimiento, listo para mudarse.', en: 'Low maintenance, move-in ready.' },
    lat: 8.7745, lng: -82.4385,
    price: 189000, beds: 2, baths: 2, parking: 1, sqmBuilt: 115, sqmLot: 0,
    yearBuilt: 2012, title: 'titulo', hoaFee: 280, furnished: true, verified: true,
    amen: ['security', 'pool', 'parking', 'furnished'],
  }),
  sale({
    id: 'venta-finca-palmira',
    type: 'casa',
    zone: 'palmira',
    name: { es: 'Casa con finca en Palmira', en: 'Farmhouse in Palmira' },
    loc: { es: 'Palmira, Boquete', en: 'Palmira, Boquete' },
    short: { es: 'Tres recámaras en media hectárea con frutales.', en: 'Three bedrooms on half a hectare of fruit trees.' },
    desc: { es: 'Derechos posesorios: precio atractivo, requiere asesoría legal.', en: 'Possession rights: attractive price, legal advice required.' },
    lat: 8.7432, lng: -82.4185,
    price: 310000, beds: 3, baths: 2, parking: 2, sqmBuilt: 180, sqmLot: 5000,
    yearBuilt: 2004, title: 'derechos', verified: false, approxLocation: true,
    amen: ['garden', 'parking', 'view'],
  }),
  sale({
    id: 'venta-casa-los-naranjos',
    type: 'casa',
    zone: 'los-naranjos',
    name: { es: 'Casa cafetalera en Los Naranjos', en: 'Coffee-country house in Los Naranjos' },
    loc: { es: 'Los Naranjos, Boquete', en: 'Los Naranjos, Boquete' },
    short: { es: 'Tres recámaras rodeadas de café, a diez minutos del centro.', en: 'Three bedrooms among coffee, ten minutes from town.' },
    desc: { es: 'Terreno con quebrada y espacio para ampliar.', en: 'Lot with a stream and room to expand.' },
    lat: 8.8042, lng: -82.4385,
    price: 275000, beds: 3, baths: 2, parking: 2, sqmBuilt: 160, sqmLot: 1200,
    yearBuilt: 2011, title: 'titulo', verified: true,
    amen: ['view', 'garden', 'parking', 'river'],
  }),

  // ---------------------------------------------------------------- LAND
  land({
    id: 'terreno-volcancito-vista',
    zone: 'volcancito',
    name: { es: 'Lote con vista al Barú', en: 'Lot with Barú views' },
    loc: { es: 'Volcancito, Boquete', en: 'Volcancito, Boquete' },
    short: { es: '1.600 m² con vista despejada al volcán y servicios en la calle.', en: '1,600 m² with an open volcano view and utilities at the road.' },
    desc: { es: 'Ligera pendiente, ideal para casa en dos niveles.', en: 'Gentle slope, ideal for a two-level house.' },
    lat: 8.7921, lng: -82.4598,
    price: 96000, sqm: 1600, title: 'titulo', topography: 'inclinado',
    water: true, power: true, road: 'asfalto', verified: true,
    amen: ['view'],
  }),
  land({
    id: 'terreno-jaramillo-arriba',
    zone: 'jaramillo',
    name: { es: 'Lote en Jaramillo Arriba', en: 'Lot in Jaramillo Arriba' },
    loc: { es: 'Jaramillo Arriba', en: 'Jaramillo Arriba' },
    short: { es: '1.000 m² en zona fresca, con agua y luz.', en: '1,000 m² in a cool zone, with water and power.' },
    desc: { es: 'Acceso por camino de tierra en buen estado.', en: 'Access via a well-kept dirt road.' },
    lat: 8.8068, lng: -82.4105,
    price: 58000, sqm: 1000, title: 'titulo', topography: 'mixto',
    water: true, power: true, road: 'tierra', verified: true,
    amen: ['view'],
  }),
  land({
    id: 'terreno-finca-palmira',
    zone: 'palmira',
    name: { es: 'Finca de 1,2 hectáreas en Palmira', en: '1.2-hectare farm in Palmira' },
    loc: { es: 'Palmira, Boquete', en: 'Palmira, Boquete' },
    short: { es: 'Terreno amplio y soleado, con naciente de agua propia.', en: 'Large, sunny parcel with its own spring.' },
    desc: { es: 'Derechos posesorios. Sin luz en el terreno (poste a 200 m).', en: 'Possession rights. No power on site (pole 200 m away).' },
    lat: 8.7395, lng: -82.4152,
    price: 165000, sqm: 12000, title: 'derechos', topography: 'mixto',
    water: true, power: false, road: 'tierra', verified: false, approxLocation: true,
    amen: ['spring'],
  }),
  land({
    id: 'terreno-alto-boquete-plano',
    zone: 'alto-boquete',
    name: { es: 'Lote plano en Alto Boquete', en: 'Flat lot in Alto Boquete' },
    loc: { es: 'Alto Boquete', en: 'Alto Boquete' },
    short: { es: '1.200 m² planos sobre calle asfaltada, listo para construir.', en: '1,200 m² of flat land on a paved road, ready to build.' },
    desc: { es: 'Cerca de supermercados y la vía principal.', en: 'Close to supermarkets and the main road.' },
    lat: 8.7512, lng: -82.4381,
    price: 72000, sqm: 1200, title: 'titulo', topography: 'plano',
    water: true, power: true, road: 'asfalto', verified: true,
    amen: [],
  }),
  land({
    id: 'terreno-los-naranjos-rio',
    zone: 'los-naranjos',
    name: { es: 'Lote junto al río en Los Naranjos', en: 'Riverside lot in Los Naranjos' },
    loc: { es: 'Los Naranjos, Boquete', en: 'Los Naranjos, Boquete' },
    short: { es: '800 m² con frente a quebrada y árboles maduros.', en: '800 m² fronting a stream, with mature trees.' },
    desc: { es: 'Terreno plano, ideal para casa pequeña o cabaña.', en: 'Flat parcel, ideal for a small house or cabin.' },
    lat: 8.8090, lng: -82.4462,
    price: 48000, sqm: 800, title: 'titulo', topography: 'plano',
    water: true, power: true, road: 'tierra', verified: true,
    amen: ['river'],
  }),
  land({
    id: 'terreno-finca-cafetalera',
    zone: 'jaramillo',
    name: { es: 'Finca cafetalera de 2 hectáreas', en: '2-hectare coffee farm' },
    loc: { es: 'Jaramillo, Boquete', en: 'Jaramillo, Boquete' },
    short: { es: 'Café en producción, vista al valle y casa de bodega.', en: 'Producing coffee, valley views and a storage barn.' },
    desc: { es: 'Oportunidad agrícola o desarrollo residencial de baja densidad.', en: 'An agricultural opportunity or low-density residential development.' },
    lat: 8.8105, lng: -82.4192,
    price: 240000, sqm: 20000, title: 'titulo', topography: 'inclinado',
    water: true, power: true, road: 'tierra', verified: true, approxLocation: true,
    amen: ['view', 'coffee'],
  }),
]

async function main() {
  const { error } = await supabase
    .from('listings')
    .upsert(listings.map(l => ({ id: l.id, data: l })))
  if (error) throw new Error(`listings: ${error.message}`)

  const count = (k: string) => listings.filter(l => l.kind === k).length
  console.log(`✓ Listings seeded: ${listings.length} (rent ${count('rent')}, sale ${count('sale')}, land ${count('land')})`)
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
