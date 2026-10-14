import type * as Leaflet from 'leaflet'
import { MAP_TILES } from '#shared/utils/listings'

// Base map for every Leaflet map on the site. OSM by default; when
// NUXT_PUBLIC_GOOGLE_MAPS_KEY is set it switches to Google's official Map Tiles
// API (2D roadmap) so markers, popups and the rest of the Leaflet code stay the
// same. A tile session is created once per page load and shared by all maps.
let session: Promise<string | null> | null = null

function googleSession(key: string) {
  session ??= fetch(`https://tile.googleapis.com/v1/createSession?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mapType: 'roadmap', language: 'es-419', region: 'PA' }),
  })
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`createSession ${r.status}`))))
    .then((d: { session: string }) => d.session)
    .catch((err) => {
      console.error('Google Map Tiles no disponible, usando OSM:', err)
      return null
    })
  return session
}

export async function addBaseLayer(L: typeof Leaflet, map: Leaflet.Map, opts: Leaflet.TileLayerOptions = {}) {
  const key = useRuntimeConfig().public.googleMapsKey as string
  const s = key ? await googleSession(key) : null
  if (s) {
    return L.tileLayer(`https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${s}&key=${key}`, {
      attribution: `Map data ©${new Date().getFullYear()} Google`,
      maxZoom: 22,
      ...opts,
    }).addTo(map)
  }
  return L.tileLayer(MAP_TILES.url, { attribution: MAP_TILES.attribution, maxZoom: MAP_TILES.maxZoom, ...opts }).addTo(map)
}
