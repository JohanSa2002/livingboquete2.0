<script setup lang="ts">
import type { Zone } from '#shared/utils/constants'

// Multi-marker sibling of PropertyMap: same lazy Leaflet load (only when the
// map scrolls near), but with custom DOM markers styled to the palette instead
// of the default blue pins, and a two-way link with the zone cards — hovering
// a card lifts its marker, clicking a marker selects its card.
const props = defineProps<{ zones: Zone[]; activeId: string | null }>()
const emit = defineEmits<{ select: [id: string] }>()

const mapEl = ref<HTMLElement | null>(null)
let loaded = false
let markers: Record<string, { el: HTMLElement }> = {}

const BOQUETE_CENTER: [number, number] = [8.778, -82.435]

async function loadMap() {
  if (!mapEl.value || loaded) return
  loaded = true
  try {
    const L = await loadLeaflet()
    const map = L.map(mapEl.value, {
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: true,
    }).setView(BOQUETE_CENTER, 12)
    // Bottom-left: the WhatsApp button lives bottom-right on the pages that
    // mount this map.
    L.control.zoom({ position: 'bottomleft' }).addTo(map)
    // Standard OSM tiles (the keyless option), muted via the CSS filter on the
    // tile pane so the sand/forest markers carry the map.
    // Muted by opacity, not a CSS filter on the tile pane (see ListingMap).
    void addBaseLayer(L, map, { opacity: 0.8 })

    for (const z of props.zones) {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'zmark'
      el.setAttribute('aria-label', z.name)
      el.innerHTML = `<span class="zmark-dot"></span><span class="zmark-label">${z.name}</span>`
      const icon = L.divIcon({ html: el, className: 'zmark-wrap', iconSize: [0, 0], iconAnchor: [0, 0] })
      L.marker([z.lat, z.lng], { icon, keyboard: false }).addTo(map)
      el.addEventListener('click', () => emit('select', z.id))
      markers[z.id] = { el }
    }
    applyActive()
  }
  catch (err) {
    console.error('No se pudo cargar el mapa de zonas:', err)
  }
}

function applyActive() {
  for (const [id, m] of Object.entries(markers)) m.el.classList.toggle('is-active', id === props.activeId)
}
watch(() => props.activeId, applyActive)

let observer: IntersectionObserver | null = null
onMounted(() => {
  if (!mapEl.value) return
  observer = new IntersectionObserver((entries) => {
    if (!entries.some(e => e.isIntersecting)) return
    observer?.disconnect()
    void loadMap()
  }, { rootMargin: '300px 0px' })
  observer.observe(mapEl.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  markers = {}
})
</script>

<template>
  <div ref="mapEl" class="zones-map" />
</template>

<style>
/* Unscoped on purpose: Leaflet injects the marker DOM outside Vue's tree. */
.zones-map {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-sand-deep);
  isolation: isolate;
}
.zones-map .leaflet-control-attribution { font-size: 10px; background: rgba(245,240,232,.8); color: var(--color-ink-faint); }
.zones-map .leaflet-bar { border: none; box-shadow: var(--shadow-md); }
.zones-map .leaflet-bar a { background: var(--color-cream); color: var(--color-ink); border-color: var(--color-border-soft); }

.zmark-wrap { background: transparent; border: none; }
.zmark {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-display);
  white-space: nowrap;
}
.zmark-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-forest);
  border: 3px solid var(--color-cream);
  box-shadow: 0 0 0 1px rgba(47,82,51,.35), 0 6px 14px -6px rgba(37,29,20,.6);
  transition: transform .25s var(--ease-out), background-color .2s ease;
}
.zmark-label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-ink);
  background: rgba(247,241,230,.92);
  padding: 4px 9px;
  border-radius: 999px;
  box-shadow: 0 4px 12px -6px rgba(37,29,20,.5);
  transition: background-color .2s ease, color .2s ease, transform .25s var(--ease-out);
}
.zmark:hover .zmark-dot, .zmark.is-active .zmark-dot { transform: scale(1.35); background: var(--color-terracotta); }
.zmark.is-active .zmark-label { background: var(--color-forest); color: var(--color-sand); transform: translateX(2px); }
.zmark:focus-visible { outline: none; }
.zmark:focus-visible .zmark-label { box-shadow: var(--shadow-focus); }
</style>
