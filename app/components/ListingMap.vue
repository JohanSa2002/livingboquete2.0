<script setup lang="ts">
import type { ListingSummary as Listing } from '#shared/types/content'
import type { Bbox } from '~/composables/useListingFilters'
import { BOQUETE_CENTER, formatListingPrice, kindMeta } from '#shared/utils/listings'

// Explorer map: one dot per listing, coloured by kind. Leaflet + free OSM
// raster tiles (see MAP_TILES), loaded client-side only. Prices are not drawn
// on the map at rest — a pill per listing piled up into an unreadable wall in
// the denser zones — and only appear as a label over the dot on hover (of the
// dot or its card) or selection. Approximate-location listings also get a
// ~300 m area.
const props = defineProps<{
  listings: Listing[]
  selectedId: string | null
  hoveredId: string | null
  // Bumped by the parent whenever filters change: re-fit the view to results.
  fitKey: number
  // Pixels at the bottom covered by something on top of the map (the mobile
  // results sheet), so fitting and panning keep pins out from under it.
  bottomInset?: number
}>()
const emit = defineEmits<{ select: [id: string | null]; moved: [bbox: Bbox] }>()

const { lang } = useLocale()
const mapEl = ref<HTMLElement | null>(null)
const ready = ref(false)

let L: typeof import('leaflet') | null = null
let map: import('leaflet').Map | null = null
let programmatic = false
let ro: ResizeObserver | null = null
const layers = new Map<string, { marker: import('leaflet').Marker; circle?: import('leaflet').Circle; el: HTMLElement }>()

function pinHtml(l: Listing) {
  const el = document.createElement('div')
  el.className = 'lpin'
  el.style.setProperty('--kc', kindMeta(l.kind).color)
  el.innerHTML = `<span class="lpin-label">${formatListingPrice(l, lang.value, true)}</span><span class="lpin-dot"></span>`
  return el
}

function syncMarkers() {
  if (!L || !map) return
  const want = new Set(props.listings.map(l => l.id))
  for (const [id, layer] of layers) {
    if (want.has(id)) continue
    layer.marker.remove()
    layer.circle?.remove()
    layers.delete(id)
  }
  for (const l of props.listings) {
    if (layers.has(l.id)) continue
    const el = pinHtml(l)
    const marker = L.marker([l.lat, l.lng], {
      icon: L.divIcon({ html: el, className: 'lpin-wrap', iconSize: [0, 0], iconAnchor: [0, 0] }),
      keyboard: true,
      title: formatListingPrice(l, lang.value),
      riseOnHover: true,
    }).addTo(map)
    marker.on('click', (e) => {
      L!.DomEvent.stopPropagation(e)
      emit('select', l.id)
    })
    const circle = l.approxLocation
      ? L.circle([l.lat, l.lng], { radius: 300, color: kindMeta(l.kind).color, weight: 1.5, fillOpacity: 0.1, interactive: false }).addTo(map)
      : undefined
    layers.set(l.id, { marker, circle, el })
  }
  applyStates()
}

function applyStates() {
  for (const [id, { marker, el }] of layers) {
    const active = id === props.selectedId
    const hover = id === props.hoveredId
    el.classList.toggle('is-active', active)
    el.classList.toggle('is-hover', hover && !active)
    marker.setZIndexOffset(active ? 1000 : hover ? 500 : 0)
  }
}

function fitToResults() {
  if (!L || !map) return
  programmatic = true
  if (!props.listings.length) {
    map.setView(BOQUETE_CENTER, 13)
    return
  }
  const bounds = L.latLngBounds(props.listings.map(l => [l.lat, l.lng] as [number, number]))
  const inset = props.bottomInset ?? 0
  map.fitBounds(bounds, { paddingTopLeft: [56, 56], paddingBottomRight: [56, 56 + inset], maxZoom: 15 })
}

function revealSelected() {
  if (!map || !props.selectedId) return
  const l = props.listings.find(x => x.id === props.selectedId)
  if (!l) return
  programmatic = true
  // Keep clear of the preview card along the bottom edge.
  map.panInside([l.lat, l.lng], { paddingTopLeft: [40, 80], paddingBottomRight: [40, 220 + (props.bottomInset ?? 0)] })
  // panInside doesn't fire moveend when no pan was needed.
  setTimeout(() => { programmatic = false }, 400)
}

watch(() => props.listings, syncMarkers)
watch(() => [props.selectedId, props.hoveredId], applyStates)
watch(() => props.selectedId, revealSelected)
watch(() => props.fitKey, fitToResults)

onMounted(async () => {
  if (!mapEl.value) return
  try {
    L = await loadLeaflet()
    map = L.map(mapEl.value, { zoomControl: false, scrollWheelZoom: true, attributionControl: true })
      .setView(BOQUETE_CENTER, 13)
    L.control.zoom({ position: 'topright' }).addTo(map)
    // Muted by opacity over the sand map background, not a CSS filter: a
    // filter on the tile pane made the GPU re-filter the whole pane on every
    // frame of a drag (~70% more draw time, felt as stutter while panning).
    void addBaseLayer(L, map, { opacity: 0.82 })

    map.on('click', () => emit('select', null))
    map.on('moveend', () => {
      if (programmatic) {
        programmatic = false
        return
      }
      const b = map!.getBounds()
      emit('moved', { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() })
    })

    syncMarkers()
    fitToResults()
    if (props.selectedId) revealSelected()

    // The map lives in a flex/grid cell (and a resizable sheet on mobile):
    // keep Leaflet's cached size in step with it.
    ro = new ResizeObserver(() => map?.invalidateSize())
    ro.observe(mapEl.value)
    ready.value = true
  }
  catch (err) {
    console.error('No se pudo cargar el mapa:', err)
  }
})

onBeforeUnmount(() => {
  ro?.disconnect()
  map?.remove()
  map = null
  layers.clear()
})
</script>

<template>
  <div class="lmap-wrap">
    <div ref="mapEl" class="lmap" data-lenis-prevent :aria-label="lang === 'en' ? 'Map of listings' : 'Mapa de propiedades'" role="region" />
    <div v-if="!ready" class="lmap-loading" aria-hidden="true">
      {{ lang === 'en' ? 'Loading map…' : 'Cargando mapa…' }}
    </div>
  </div>
</template>

<style>
/* Unscoped: Leaflet builds the marker DOM outside Vue's tree. */
.lmap-wrap { position: relative; width: 100%; height: 100%; }
.lmap {
  width: 100%;
  height: 100%;
  background: var(--color-sand-deep);
  isolation: isolate;
}
.lmap-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink-soft);
  background: var(--color-sand-deep);
}
.lmap .leaflet-control-attribution { font-size: 10px; background: rgba(245,240,232,.85); }
.lmap .leaflet-bar { border: none; box-shadow: 0 2px 8px rgba(37,29,20,.2); }
.lmap .leaflet-bar a { background: var(--color-white); color: var(--color-ink); border-color: var(--color-border-soft); }

.lpin-wrap { background: transparent; border: none; }
.lpin {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
/* Invisible hit area a little bigger than the 16 px dot, for fingers — kept
   modest so neighbouring dots don't steal each other's taps. */
.lpin::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 26px;
  height: 26px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
.lpin-dot {
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--kc);
  border: 2.5px solid #fff;
  box-shadow: 0 1px 4px rgba(37,29,20,.45);
  transition: transform .18s var(--ease-out), box-shadow .18s ease;
}
.lpin.is-hover .lpin-dot { transform: scale(1.35); }
.lpin.is-active .lpin-dot {
  transform: scale(1.5);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--kc) 30%, transparent), 0 2px 6px rgba(37,29,20,.45);
}

/* Price label: hidden at rest, floats above the dot on hover/selection. */
.lpin-label {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--kc);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 12.5px;
  line-height: 1;
  white-space: nowrap;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(37,29,20,.35);
  opacity: 0;
  transform: translate(-50%, 4px);
  pointer-events: none;
  transition: opacity .15s ease, transform .18s var(--ease-out);
}
/* Little pointer under the pill, aimed at the dot. */
.lpin-label::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 8px;
  height: 8px;
  background: inherit;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: translateX(-50%) rotate(45deg);
}
.lpin:hover .lpin-label,
.lpin.is-hover .lpin-label,
.lpin.is-active .lpin-label { opacity: 1; transform: translate(-50%, 0); }
.lpin.is-active .lpin-label { background: var(--color-ink); }

@media (prefers-reduced-motion: reduce) {
  .lpin-label, .lpin-dot { transition: none; }
}
</style>
