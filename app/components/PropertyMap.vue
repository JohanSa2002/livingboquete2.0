<script setup lang="ts">

// Leaflet is loaded lazily, and only once the map scrolls near the viewport —
// the library plus its tiles are the heaviest thing on the PDP and most
// visitors never scroll that far.
// `approx`: the owner asked not to publish the exact spot — draw a ~300 m area
// and no pin (and keep the zoom out a little so the circle reads as an area).
const props = defineProps<{ lat: number; lng: number; name: string; approx?: boolean }>()

const mapEl = ref<HTMLElement | null>(null)
let loaded = false

async function loadMap() {
  if (!mapEl.value || !Number.isFinite(props.lat) || !Number.isFinite(props.lng) || loaded) return
  loaded = true

  try {
    const [L, markerIcon2x, markerIcon, markerShadow] = await Promise.all([
      loadLeaflet(),
      import('leaflet/dist/images/marker-icon-2x.png'),
      import('leaflet/dist/images/marker-icon.png'),
      import('leaflet/dist/images/marker-shadow.png'),
    ])
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.default as unknown as string,
      iconUrl: markerIcon.default as unknown as string,
      shadowUrl: markerShadow.default as unknown as string,
    })
    const map = L.map(mapEl.value, { scrollWheelZoom: false }).setView([props.lat, props.lng], props.approx ? 14 : 15)
    void addBaseLayer(L, map)
    if (props.approx) {
      L.circle([props.lat, props.lng], { radius: 300, color: '#8E4A2A', weight: 1.5, fillOpacity: 0.15 }).addTo(map)
    }
    else {
      L.marker([props.lat, props.lng]).addTo(map).bindPopup(`<strong>${props.name}</strong>`).openPopup()
    }
  }
  catch (err) {
    console.error('No se pudo cargar el mapa:', err)
    if (!mapEl.value) return
    mapEl.value.style.display = 'flex'
    mapEl.value.style.alignItems = 'center'
    mapEl.value.style.justifyContent = 'center'
    mapEl.value.innerHTML = `<a href="https://www.google.com/maps?q=${props.lat},${props.lng}" target="_blank" rel="noopener" style="color:var(--color-terracotta);font-weight:700;font-size:14px;text-decoration:none">Ver ubicación en Google Maps →</a>`
  }
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!mapEl.value || !Number.isFinite(props.lat) || !Number.isFinite(props.lng)) return
  observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return
    observer?.disconnect()
    void loadMap()
  }, { rootMargin: '300px 0px' })
  observer.observe(mapEl.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="mapEl" style="width:100%;height:300px;border-radius:16px;overflow:hidden;border:1px solid rgba(37,29,20,.1)" />
</template>

