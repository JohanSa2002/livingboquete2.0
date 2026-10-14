<script setup lang="ts">
import { AMEN_LABELS, TYPE_LABELS } from '#shared/utils/constants'

// Filters sidebar on desktop; a slide-in drawer under 880px, opened from the
// mobile bar in StaysExplore.
const open = defineModel<boolean>('open', { default: false })

const { lang, t } = useLocale()
const filters = useStaysFilters()
const {
  activeType, maxPrice, minGuests, minHabs, minBanos,
  activeDuracion, disponibleDate, activeAmenities, resultCount,
} = filters

const priceFill = computed(() => `${((maxPrice.value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`)
</script>

<template>
  <aside class="filters-sidebar card" :class="{ 'is-open': open }" style="position:sticky;top:92px;padding:26px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:9px;font-family:var(--font-display);font-weight:700;font-size:17px;color:var(--color-ink)">
        <Icon name="sliders" :size="18" />
        {{ lang === 'en' ? 'Filters' : 'Filtros' }}
      </div>
      <button class="filters-close" aria-label="Close" style="border:none;background:transparent;cursor:pointer;color:var(--color-ink-soft)" @click="open = false">
        <Icon name="close" :size="20" />
      </button>
    </div>

    <!-- Type filter -->
    <div style="margin-bottom:24px">
      <div class="filter-label">
        {{ lang === 'en' ? 'Type' : 'Tipo' }}
      </div>
      <div role="group" aria-label="Tipo de propiedad" style="display:flex;flex-wrap:wrap;gap:8px">
        <button
          v-for="type in (['all', 'casa', 'habitacion', 'apto'] as const)"
          :key="type"
          class="chip"
          :class="{ 'is-active': type === activeType }"
          @click="activeType = type"
        >
          {{ type === 'all' ? (lang === 'en' ? 'All' : 'Todos') : t(TYPE_LABELS[type]) }}
        </button>
      </div>
    </div>

    <!-- Price range -->
    <div style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
        <label for="price-range" class="filter-label" style="margin-bottom:0">
          {{ lang === 'en' ? 'Max price' : 'Precio máximo' }}
        </label>
        <span style="font-family:var(--font-display);font-size:15px;font-weight:800;color:var(--color-forest)">${{ maxPrice }}</span>
      </div>
      <input
        id="price-range"
        v-model.number="maxPrice"
        type="range"
        class="range-input"
        :min="PRICE_MIN"
        :max="PRICE_MAX"
        step="50"
        :style="{ '--fill': priceFill }"
        aria-label="Precio máximo mensual en dólares"
        :aria-valuetext="`$${maxPrice} por mes`"
      >
      <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--color-ink-faint);margin-top:6px">
        <span>${{ PRICE_MIN }}</span><span>${{ PRICE_MAX }}</span>
      </div>
    </div>

    <!-- Guests -->
    <div style="margin-bottom:24px">
      <label for="guests-select" class="filter-label">
        {{ lang === 'en' ? 'Occupants' : 'Personas' }}
      </label>
      <div style="position:relative">
        <select id="guests-select" v-model.number="minGuests" class="filter-select" style="padding-right:40px">
          <option v-for="n in 8" :key="n" :value="n">{{ n }}+</option>
        </select>
        <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%) rotate(90deg);pointer-events:none;color:var(--color-ink-soft)">
          <Icon name="chevron-right" :size="16" />
        </span>
      </div>
    </div>

    <!-- Bedrooms / bathrooms -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px">
      <div>
        <label for="habs-select" class="filter-label">
          {{ lang === 'en' ? 'Bedrooms' : 'Habitaciones' }}
        </label>
        <select id="habs-select" v-model.number="minHabs" class="filter-select">
          <option :value="0">—</option>
          <option v-for="n in 4" :key="n" :value="n">{{ n }}+</option>
        </select>
      </div>
      <div>
        <label for="banos-select" class="filter-label">
          {{ lang === 'en' ? 'Baths' : 'Baños' }}
        </label>
        <select id="banos-select" v-model.number="minBanos" class="filter-select">
          <option :value="0">—</option>
          <option v-for="n in 4" :key="n" :value="n">{{ n }}+</option>
        </select>
      </div>
    </div>

    <!-- Minimum stay -->
    <div style="margin-bottom:24px">
      <div class="filter-label">
        {{ lang === 'en' ? 'Minimum stay' : 'Duración mínima' }}
      </div>
      <div role="group" aria-label="Duración mínima" style="display:flex;flex-wrap:wrap;gap:8px">
        <button
          v-for="b in DURATION_BUCKETS"
          :key="b.value"
          class="chip"
          :class="{ 'is-active': b.value === activeDuracion }"
          @click="activeDuracion = b.value"
        >
          {{ lang === 'en' ? b.en : b.es }}
        </button>
      </div>
    </div>

    <!-- Move-in date -->
    <div style="margin-bottom:24px">
      <label for="available-date" class="filter-label">
        {{ lang === 'en' ? 'Move-in date' : 'Disponible desde' }}
      </label>
      <input
        id="available-date"
        v-model="disponibleDate"
        type="date"
        class="filter-select"
        style="padding:11px 14px"
      >
    </div>

    <!-- Amenity filters -->
    <div>
      <div class="filter-label">
        {{ lang === 'en' ? 'Amenities' : 'Comodidades' }}
      </div>
      <div role="group" aria-label="Comodidades" style="display:flex;flex-wrap:wrap;gap:8px">
        <button
          v-for="key in (['view', 'pets', 'furnished'] as const)"
          :key="key"
          class="chip"
          :class="{ 'is-active': activeAmenities.includes(key) }"
          @click="filters.toggleAmenity(key)"
        >
          <Icon :name="AMEN_ICON[key]!" :size="15" />
          {{ lang === 'en' ? AMEN_LABELS[key]!.en : AMEN_LABELS[key]!.es }}
        </button>
      </div>
    </div>

    <!-- Mobile-only: live count + apply, sticky at the bottom of the drawer.
         Filters already apply live as they're tapped, so this just closes
         the sheet and drops the user back on the updated results. -->
    <button type="button" class="btn btn-primary filters-apply" @click="open = false">
      {{ lang === 'en' ? `See ${resultCount} results` : `Ver ${resultCount} resultados` }}
    </button>
  </aside>
</template>

<style scoped>
.filter-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-ink-soft);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.filter-select {
  width: 100%;
  appearance: none;
  background: var(--color-sand);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  outline: none;
  cursor: pointer;
}

.range-input {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--color-forest) 0%, var(--color-forest) var(--fill, 100%), var(--color-border) var(--fill, 100%), var(--color-border) 100%);
  cursor: pointer;
}
.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid var(--color-forest);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}
.range-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid var(--color-forest);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.filters-close { display: none; }
.filters-apply { display: none; }

@media (max-width: 880px) {
  .filters-sidebar {
    position: fixed !important;
    top: 0; right: 0; bottom: 0;
    width: min(86vw, 360px);
    z-index: 90;
    border-radius: 0 !important;
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform .3s var(--ease-out);
    padding-bottom: 88px !important;
  }
  .filters-sidebar.is-open { display: block !important; transform: translateX(0); }
  .filters-close { display: inline-flex !important; }
  .filters-apply {
    display: flex !important;
    justify-content: center;
    position: sticky;
    bottom: -26px;
    margin: 16px -26px -26px;
    width: calc(100% + 52px);
    border-radius: 0;
    padding: 16px;
  }
}
</style>
