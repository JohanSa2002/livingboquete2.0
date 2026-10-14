<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { ListingKind, ListingSummary } from '#shared/types/content'
import type { Bbox } from '~/composables/useListingFilters'
import { BOQUETE_ZONES } from '#shared/utils/constants'
import { LISTING_KINDS, MAP_TILE_ORIGIN, PRICE_STEPS } from '#shared/utils/listings'

usePageSeo({
  title: 'Propiedades en Boquete · MIKA Homes',
  titleEn: 'Properties in Boquete · MIKA Homes',
  description: 'Alquileres mensuales, casas en venta y terrenos en Boquete, Chiriquí, en un mapa. Filtra por zona, precio y tipo.',
  descriptionEn: 'Monthly rentals, homes for sale and land in Boquete, Chiriquí, on one map. Filter by zone, price and type.',
})

// The map's first tiles are this page's LCP. Open the tile connection from
// the HTML and start downloading Leaflet while the page hydrates instead of
// after the map mounts. (Not preloading the cards' placeholder art: it isn't
// the LCP and, at high priority, it competed with the critical CSS.)
useHead({ link: [{ rel: 'preconnect', href: MAP_TILE_ORIGIN }] })
if (import.meta.client) void loadLeaflet()

const { lang } = useLocale()
const { data } = await useContentList('listings')
const listings = computed<ListingSummary[]>(() => data.value ?? [])

const { kind, zone, maxPrice, minBeds, sort, selectedId, bbox, counts, results, hasFilters, reset } = useListingFilters(listings)

const hoveredId = ref<string | null>(null)
const selected = computed(() => results.value.find(l => l.id === selectedId.value) ?? null)

// A selection that the filters have since hidden is dropped, not kept as a
// ghost preview pointing at a pin that's no longer on the map.
watch(results, () => {
  if (selectedId.value && !selected.value) selectedId.value = null
})

// Re-fit the map whenever the result set changes because of a filter — but
// not when it changes because the visitor searched the visible area.
const fitKey = ref(0)
watch([kind, zone, maxPrice, minBeds], () => {
  bbox.value = null
  pendingBbox.value = null
  fitKey.value++
})

// "Search this area": offered after the visitor pans or zooms the map.
const pendingBbox = ref<Bbox | null>(null)
function onMoved(b: Bbox) {
  pendingBbox.value = b
}
function searchArea() {
  bbox.value = pendingBbox.value
  pendingBbox.value = null
}
function clearArea() {
  bbox.value = null
  fitKey.value++
}

// --- List <-> map ------------------------------------------------------------
const cardEls = new Map<string, HTMLElement>()
function setCardEl(id: string, el: Element | ComponentPublicInstance | null) {
  const node = (el as ComponentPublicInstance)?.$el ?? el
  if (node instanceof HTMLElement) cardEls.set(id, node)
  else cardEls.delete(id)
}

function selectFromList(id: string) {
  selectedId.value = selectedId.value === id ? null : id
  if (isMobile.value) sheet.value = 'peek'
}

function selectFromMap(id: string | null) {
  selectedId.value = id
  if (!id) return
  if (isMobile.value) {
    sheet.value = 'peek'
    return
  }
  nextTick(() => cardEls.get(id)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedId.value) selectedId.value = null
}

// --- Mobile bottom sheet -----------------------------------------------------
// Three resting heights. Dragging is limited to the handle/header so it never
// fights with scrolling the list itself.
type SheetState = 'peek' | 'half' | 'full'
const sheet = ref<SheetState>('half')
const isMobile = ref(false)
const bodyEl = ref<HTMLElement | null>(null)
const dragY = ref<number | null>(null)
let dragStart = 0
let dragBase = 0

const PEEK_PX = 132

function restingOffset(state: SheetState) {
  const h = bodyEl.value?.clientHeight ?? 600
  if (state === 'full') return 0
  if (state === 'half') return Math.round(h * 0.48)
  return h - PEEK_PX
}

// How much of the map the sheet covers at rest; 0 on desktop.
const mapInset = computed(() => {
  if (!isMobile.value) return 0
  const h = bodyEl.value?.clientHeight ?? 0
  return Math.max(0, h - restingOffset(sheet.value === 'full' ? 'half' : sheet.value))
})

const sheetStyle = computed(() => {
  if (!isMobile.value) return undefined
  const y = dragY.value ?? restingOffset(sheet.value)
  return { transform: `translate3d(0, ${y}px, 0)`, transition: dragY.value === null ? undefined : 'none' }
})

function onDragStart(e: PointerEvent) {
  if (!isMobile.value) return
  dragStart = e.clientY
  dragBase = restingOffset(sheet.value)
  dragY.value = dragBase
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onDragMove(e: PointerEvent) {
  if (dragY.value === null) return
  const h = bodyEl.value?.clientHeight ?? 600
  dragY.value = Math.min(h - PEEK_PX, Math.max(0, dragBase + e.clientY - dragStart))
}
function onDragEnd(e: PointerEvent) {
  if (dragY.value === null) return
  const moved = Math.abs(e.clientY - dragStart)
  const y = dragY.value
  dragY.value = null
  if (moved < 6) {
    // A tap on the handle cycles up, then back down.
    sheet.value = sheet.value === 'peek' ? 'half' : sheet.value === 'half' ? 'full' : 'peek'
    return
  }
  const states: SheetState[] = ['full', 'half', 'peek']
  sheet.value = states.reduce((best, s) => (Math.abs(restingOffset(s) - y) < Math.abs(restingOffset(best) - y) ? s : best), 'half')
}

let mq: MediaQueryList | null = null
const syncMq = () => { isMobile.value = !!mq?.matches }
onMounted(() => {
  mq = window.matchMedia('(max-width: 880px)')
  syncMq()
  mq.addEventListener('change', syncMq)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  mq?.removeEventListener('change', syncMq)
  window.removeEventListener('keydown', onKey)
})

// --- Labels -------------------------------------------------------------------
const kindTabs = computed(() => [
  { value: 'all' as const, label: lang.value === 'en' ? 'All' : 'Todas', color: '' },
  ...LISTING_KINDS.map(k => ({ value: k.value, label: k.value === 'rent' ? (lang.value === 'en' ? 'Rent' : 'Alquiler') : k.value === 'sale' ? (lang.value === 'en' ? 'Homes for sale' : 'Casas en venta') : (lang.value === 'en' ? 'Land' : 'Terrenos'), color: k.color })),
])

const priceOptions = computed(() => (kind.value === 'all' ? [] : PRICE_STEPS[kind.value as ListingKind]))
const fmtMoney = (v: number) => (v >= 1000 && kind.value !== 'rent' ? `$${Math.round(v / 1000)}k` : `$${v.toLocaleString('en-US')}`)
const showBeds = computed(() => kind.value === 'rent' || kind.value === 'sale')

const resultsLabel = computed(() => {
  const n = results.value.length
  if (lang.value === 'en') return `${n} ${n === 1 ? 'property' : 'properties'}`
  return `${n} ${n === 1 ? 'propiedad' : 'propiedades'}`
})
</script>

<template>
  <div class="explorer" data-no-reveal>
    <!-- Toolbar: kind tabs double as the map legend -->
    <div class="ex-toolbar">
      <div class="ex-kinds" role="tablist" :aria-label="lang === 'en' ? 'Property type' : 'Tipo de propiedad'">
        <button
          v-for="k in kindTabs"
          :key="k.value"
          type="button"
          role="tab"
          class="ex-kind"
          :class="{ 'is-active': kind === k.value }"
          :aria-selected="kind === k.value"
          :style="k.color ? `--kc:${k.color}` : ''"
          @click="kind = k.value"
        >
          <span v-if="k.color" class="ex-kind-dot" />
          {{ k.label }}
          <span class="ex-kind-count">{{ counts[k.value] }}</span>
        </button>
      </div>

      <div class="ex-filters">
        <label class="ex-select">
          <span class="sr-only">{{ lang === 'en' ? 'Zone' : 'Zona' }}</span>
          <select v-model="zone">
            <option value="">{{ lang === 'en' ? 'All zones' : 'Todas las zonas' }}</option>
            <option v-for="z in BOQUETE_ZONES" :key="z.id" :value="z.id">{{ z.name }}</option>
          </select>
        </label>
        <label v-if="priceOptions.length" class="ex-select">
          <span class="sr-only">{{ lang === 'en' ? 'Max price' : 'Precio máximo' }}</span>
          <select v-model.number="maxPrice">
            <option :value="0">{{ lang === 'en' ? 'Any price' : 'Cualquier precio' }}</option>
            <option v-for="p in priceOptions" :key="p" :value="p">
              {{ lang === 'en' ? 'Up to' : 'Hasta' }} {{ fmtMoney(p) }}{{ kind === 'rent' ? (lang === 'en' ? '/mo' : '/mes') : '' }}
            </option>
          </select>
        </label>
        <label v-if="showBeds" class="ex-select">
          <span class="sr-only">{{ lang === 'en' ? 'Bedrooms' : 'Recámaras' }}</span>
          <select v-model.number="minBeds">
            <option :value="0">{{ lang === 'en' ? 'Bedrooms' : 'Recámaras' }}</option>
            <option v-for="b in [1, 2, 3, 4]" :key="b" :value="b">{{ b }}+ {{ lang === 'en' ? 'beds' : 'rec.' }}</option>
          </select>
        </label>
        <button v-if="bbox" type="button" class="ex-chip" @click="clearArea">
          {{ lang === 'en' ? 'Map area' : 'Zona del mapa' }}
          <Icon name="close" :size="13" />
        </button>
        <button v-if="hasFilters" type="button" class="ex-clear" @click="reset(); fitKey++">
          {{ lang === 'en' ? 'Clear' : 'Limpiar' }}
        </button>
      </div>
    </div>

    <div ref="bodyEl" class="ex-body">
      <!-- Results: a column on desktop, a draggable sheet on mobile -->
      <section class="ex-list" :class="`is-${sheet}`" :style="sheetStyle" :aria-label="resultsLabel">
        <div
          class="ex-list-head"
          @pointerdown="onDragStart"
          @pointermove="onDragMove"
          @pointerup="onDragEnd"
          @pointercancel="onDragEnd"
        >
          <span class="ex-handle" aria-hidden="true" />
          <h1 class="ex-count">{{ resultsLabel }}</h1>
          <label class="ex-sort" @pointerdown.stop>
            <span class="sr-only">{{ lang === 'en' ? 'Sort by' : 'Ordenar por' }}</span>
            <select v-model="sort">
              <option value="relevancia">{{ lang === 'en' ? 'Recommended' : 'Recomendadas' }}</option>
              <option value="precio-asc">{{ lang === 'en' ? 'Price: low to high' : 'Precio: menor a mayor' }}</option>
              <option value="precio-desc">{{ lang === 'en' ? 'Price: high to low' : 'Precio: mayor a menor' }}</option>
              <option value="recientes">{{ lang === 'en' ? 'Newest' : 'Más recientes' }}</option>
            </select>
          </label>
        </div>

        <div class="ex-scroll" data-lenis-prevent>
          <div v-if="results.length" class="ex-cards">
            <ListingCard
              v-for="l in results"
              :key="l.id"
              :ref="el => setCardEl(l.id, el)"
              :listing="l"
              :active="l.id === selectedId"
              @select="selectFromList(l.id)"
              @hover="on => hoveredId = on ? l.id : (hoveredId === l.id ? null : hoveredId)"
            />
          </div>
          <div v-else class="ex-empty">
            <p class="ex-empty-title">{{ lang === 'en' ? 'Nothing matches these filters' : 'No hay propiedades con estos filtros' }}</p>
            <p>{{ lang === 'en' ? 'Try another zone or a higher price.' : 'Prueba otra zona o un precio más alto.' }}</p>
            <button type="button" class="ex-clear ex-clear--solid" @click="reset(); fitKey++">
              {{ lang === 'en' ? 'Clear filters' : 'Limpiar filtros' }}
            </button>
          </div>
        </div>
      </section>

      <div class="ex-map">
        <ClientOnly>
          <ListingMap
            :listings="results"
            :selected-id="selectedId"
            :hovered-id="hoveredId"
            :fit-key="fitKey"
            :bottom-inset="mapInset"
            @select="selectFromMap"
            @moved="onMoved"
          />
          <template #fallback>
            <div class="ex-map-fallback" />
          </template>
        </ClientOnly>

        <button v-if="pendingBbox" type="button" class="ex-search-area" @click="searchArea">
          <Icon name="search" :size="15" />
          {{ lang === 'en' ? 'Search this area' : 'Buscar en esta zona' }}
        </button>

        <Transition name="ex-preview">
          <div v-if="selected" class="ex-preview">
            <ListingCard :listing="selected" variant="preview" @close="selectedId = null" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

.explorer {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 82px);
  min-height: 560px;
  border-top: 1px solid var(--color-border-soft);
}

/* --- Toolbar --- */
.ex-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px 20px;
  flex-wrap: wrap;
  padding: 12px 20px;
  background: var(--color-sand);
  border-bottom: 1px solid var(--color-border);
  position: relative;
  z-index: 3;
}
.ex-kinds, .ex-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ex-kind {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  color: var(--color-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease;
}
.ex-kind:hover { border-color: var(--kc, var(--color-ink)); }
.ex-kind.is-active { background: var(--kc, var(--color-ink)); border-color: var(--kc, var(--color-ink)); color: var(--color-white); }
.ex-kind.is-active .ex-kind-dot { background: var(--color-white); }
.ex-kind:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.ex-kind-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--kc); flex: none; }
.ex-kind-count { font-size: 12px; font-weight: 700; opacity: .7; }

.ex-select select, .ex-sort select {
  appearance: none;
  padding: 8px 32px 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23251D14' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  cursor: pointer;
}
.ex-select select:focus-visible, .ex-sort select:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.ex-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-ink);
  background: var(--color-ink);
  color: var(--color-sand);
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}
.ex-clear {
  padding: 8px 10px;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-terracotta);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.ex-clear--solid {
  margin-top: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--color-forest);
  color: var(--color-sand);
  text-decoration: none;
}

/* --- Body: list | map --- */
.ex-body {
  position: relative;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(380px, 460px) 1fr;
}
.ex-list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-sand);
  border-right: 1px solid var(--color-border);
}
.ex-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px 10px;
}
.ex-handle { display: none; }
.ex-count {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -.01em;
  color: var(--color-ink);
}
.ex-sort select { font-size: 13px; padding: 7px 30px 7px 12px; }
.ex-scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 4px 20px 24px; }
.ex-cards { display: flex; flex-direction: column; gap: 10px; }
.ex-empty { padding: 32px 4px; text-align: center; color: var(--color-ink-soft); font-size: 14.5px; }
.ex-empty p { margin: 0 0 6px; }
.ex-empty-title { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--color-ink); }

.ex-map { position: relative; min-width: 0; min-height: 0; }
.ex-map-fallback { width: 100%; height: 100%; background: var(--color-sand-deep); }
.ex-search-area {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: var(--color-ink);
  color: var(--color-sand);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(37,29,20,.3);
  cursor: pointer;
}
.ex-search-area:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.ex-preview {
  position: absolute;
  left: 16px;
  bottom: 24px;
  z-index: 500;
  width: min(440px, calc(100% - 32px));
}
.ex-preview-enter-active, .ex-preview-leave-active { transition: opacity .2s ease, transform .25s var(--ease-out); }
.ex-preview-enter-from, .ex-preview-leave-to { opacity: 0; transform: translateY(10px); }

/* --- Mobile: map fills the screen, results become a bottom sheet --- */
@media (max-width: 880px) {
  .ex-toolbar {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 10px 16px;
    scrollbar-width: none;
  }
  .ex-toolbar::-webkit-scrollbar { display: none; }
  .ex-kinds, .ex-filters { flex-wrap: nowrap; }
  .ex-kind, .ex-select select { font-size: 13.5px; }

  .ex-body { display: block; overflow: hidden; }
  .ex-map { position: absolute; inset: 0; }
  .ex-list {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 100%;
    z-index: 600;
    border-right: none;
    border-radius: 18px 18px 0 0;
    box-shadow: 0 -6px 20px -6px rgba(37,29,20,.3);
    transition: transform .32s var(--ease-out);
    will-change: transform;
  }
  /* Pre-hydration resting position (the inline transform takes over once
     mounted), so the sheet never covers the whole map on first paint. */
  .ex-list.is-half { transform: translate3d(0, 48%, 0); }
  .ex-list-head {
    position: relative;
    padding: 22px 16px 10px;
    touch-action: none;
    cursor: grab;
  }
  .ex-handle {
    display: block;
    position: absolute;
    top: 8px;
    left: 50%;
    width: 40px;
    height: 5px;
    margin-left: -20px;
    border-radius: 999px;
    background: var(--color-sand-muted);
  }
  .ex-scroll { padding: 4px 16px 32px; }
  /* Sitting just above the peeking sheet. */
  .ex-preview { left: 12px; right: 12px; width: auto; bottom: calc(132px + 12px); }
}
@media (prefers-reduced-motion: reduce) {
  .ex-list, .ex-preview-enter-active, .ex-preview-leave-active { transition: none; }
}
</style>
