<script setup lang="ts">
import { BOQUETE_CENTER, inBoquete } from '#shared/utils/listings'

// Admin map picker: click the map or drag the pin to set the point, or paste
// "lat, lng" straight from Google Maps (right-click → copy coordinates). Typing
// raw decimals was the main source of misplaced pins (swapped signs, lat/lng
// reversed), so the map is the primary input and the numbers are secondary.
const lat = defineModel<number | ''>('lat', { default: '' })
const lng = defineModel<number | ''>('lng', { default: '' })
const props = defineProps<{ approx?: boolean }>()

const mapEl = ref<HTMLElement | null>(null)
const paste = ref('')
const pasteError = ref('')

let L: typeof import('leaflet') | null = null
let map: import('leaflet').Map | null = null
let marker: import('leaflet').Marker | null = null
let circle: import('leaflet').Circle | null = null

const hasPoint = computed(() => typeof lat.value === 'number' && typeof lng.value === 'number' && (lat.value !== 0 || lng.value !== 0))
const outside = computed(() => hasPoint.value && !inBoquete(lat.value as number, lng.value as number))

function round(n: number) {
  return Math.round(n * 1e6) / 1e6
}

function setPoint(a: number, b: number, pan = false) {
  lat.value = round(a)
  lng.value = round(b)
  syncMarker(pan)
}

function syncMarker(pan = false) {
  if (!L || !map) return
  if (!hasPoint.value) {
    marker?.remove(); marker = null
    circle?.remove(); circle = null
    return
  }
  const pos: [number, number] = [lat.value as number, lng.value as number]
  if (!marker) {
    marker = L.marker(pos, {
      draggable: true,
      icon: L.divIcon({ className: 'alp-pin-wrap', html: '<span class="alp-pin"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
    }).addTo(map)
    marker.on('dragend', () => {
      const p = marker!.getLatLng()
      setPoint(p.lat, p.lng)
    })
  }
  else {
    marker.setLatLng(pos)
  }
  if (props.approx) {
    if (!circle) circle = L.circle(pos, { radius: 300, color: '#8E4A2A', weight: 1.5, fillOpacity: 0.12 }).addTo(map)
    else circle.setLatLng(pos)
  }
  else {
    circle?.remove(); circle = null
  }
  if (pan) map.setView(pos, Math.max(map.getZoom(), 15))
}

watch([lat, lng, () => props.approx], () => syncMarker())

// Accepts "8.7801, -82.4327", "8.7801 -82.4327" or a Google Maps URL
// containing "@8.7801,-82.4327" / "?q=8.7801,-82.4327".
function applyPaste() {
  pasteError.value = ''
  const m = paste.value.match(/(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{1,3}\.\d+)/)
  if (!m) {
    pasteError.value = 'No encontré coordenadas. Formato esperado: 8.7801, -82.4327'
    return
  }
  setPoint(Number(m[1]), Number(m[2]), true)
  paste.value = ''
}

function onNumber(which: 'lat' | 'lng', e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const v = raw === '' ? '' : Number(raw)
  if (which === 'lat') lat.value = v
  else lng.value = v
}

onMounted(async () => {
  if (!mapEl.value) return
  try {
    L = await loadLeaflet()
    const start: [number, number] = hasPoint.value ? [lat.value as number, lng.value as number] : BOQUETE_CENTER
    map = L.map(mapEl.value, { scrollWheelZoom: true }).setView(start, hasPoint.value ? 15 : 13)
    void addBaseLayer(L, map)
    map.on('click', e => setPoint(e.latlng.lat, e.latlng.lng))
    syncMarker()
    // The modal animates in; measure again once it has its final size.
    setTimeout(() => map?.invalidateSize(), 250)
  }
  catch (err) {
    console.error('No se pudo cargar el mapa:', err)
  }
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
  marker = null
  circle = null
})
</script>

<template>
  <div class="alp">
    <div ref="mapEl" class="alp-map" />
    <div class="alp-row">
      <label class="alp-num">
        <span>Latitud</span>
        <input class="f-input" type="number" step="any" :value="lat" placeholder="8.7801" @change="onNumber('lat', $event)">
      </label>
      <label class="alp-num">
        <span>Longitud</span>
        <input class="f-input" type="number" step="any" :value="lng" placeholder="-82.4327" @change="onNumber('lng', $event)">
      </label>
    </div>
    <div class="alp-paste">
      <input
        v-model="paste"
        class="f-input"
        placeholder="Pegar coordenadas o link de Google Maps"
        @keydown.enter.prevent="applyPaste"
      >
      <button type="button" class="btn btn-secondary btn-sm" :disabled="!paste.trim()" @click="applyPaste">Usar</button>
    </div>
    <p v-if="pasteError" class="alp-msg alp-msg--err">{{ pasteError }}</p>
    <p v-else-if="outside" class="alp-msg alp-msg--err">
      Este punto está fuera de Boquete. Revisa que la longitud sea negativa y que no estén invertidas.
    </p>
    <p v-else-if="!hasPoint" class="alp-msg">Aún no hay punto: haz clic en el mapa.</p>
  </div>
</template>

<style>
.alp { display: flex; flex-direction: column; gap: 10px; }
.alp-map {
  height: 260px;
  border-radius: 12px;
  border: 1px solid #dddcdb;
  overflow: hidden;
  isolation: isolate;
  cursor: crosshair;
}
.alp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.alp-num { display: flex; flex-direction: column; gap: 4px; }
.alp-num span { font-size: 11px; font-weight: 600; color: #a8a8a3; }
.alp-paste { display: flex; gap: 8px; align-items: center; }
.alp-paste .f-input { flex: 1; }
/* Mirrors the admin form's .f-input (scoped to the section page, so it
   doesn't reach into this component). */
.alp .f-input {
  width: 100%; padding: 10px 14px; border: 1px solid #dddcdb; border-radius: 10px;
  font-size: 14px; font-family: inherit; color: #1a1918; background: #fafaf9; outline: none; transition: all .15s;
}
.alp .f-input:focus { border-color: #C8964A; background: #fff; box-shadow: 0 0 0 3px rgba(200,150,74,.1); }
.alp-msg { margin: 0; font-size: 12px; color: #8c8c87; }
.alp-msg--err { color: #b42318; font-weight: 600; }

.alp-pin-wrap { background: transparent; border: none; }
.alp-pin {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #8E4A2A;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,.25), 0 4px 10px rgba(0,0,0,.3);
  cursor: grab;
}
</style>
