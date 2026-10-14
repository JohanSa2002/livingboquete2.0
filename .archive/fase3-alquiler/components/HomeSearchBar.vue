<script setup lang="ts">
import { TYPE_LABELS } from '#shared/utils/constants'
import { PRICE_MAX } from '~/composables/useStaysFilters'

// Hero search (the pattern every mid-term rental site opens with). Nothing is
// filtered here: the four fields map 1:1 onto the query params /alquiler
// already reads (tipo, precio_max, disponible, personas), so the listing page
// arrives server-rendered and pre-filtered — shareable URL included.
const { lang, localePath, t } = useLocale()

const tipo = ref('all')
const precioMax = ref(String(PRICE_MAX))
const disponible = ref('')
const personas = ref('1')

const BUDGETS = [600, 900, 1200, PRICE_MAX]

// Today's date in the visitor's own timezone for the date input's floor.
const today = new Date().toLocaleDateString('en-CA')

const target = computed(() => {
  const q = new URLSearchParams()
  if (tipo.value !== 'all') q.set('tipo', tipo.value)
  if (Number(precioMax.value) < PRICE_MAX) q.set('precio_max', precioMax.value)
  if (disponible.value) q.set('disponible', disponible.value)
  if (Number(personas.value) > 1) q.set('personas', personas.value)
  const qs = q.toString()
  return localePath('/alquiler') + (qs ? `?${qs}` : '')
})

function submit() {
  navigateTo(target.value)
}
</script>

<template>
  <form class="hsearch" role="search" :aria-label="lang === 'en' ? 'Search rentals' : 'Buscar alquileres'" @submit.prevent="submit">
    <label class="hsearch-field">
      <span class="hsearch-label"><Icon name="home" :size="14" />{{ lang === 'en' ? 'Type' : 'Tipo' }}</span>
      <select v-model="tipo" class="hsearch-input">
        <option value="all">{{ lang === 'en' ? 'Any' : 'Cualquiera' }}</option>
        <option v-for="(label, key) in TYPE_LABELS" :key="key" :value="key">{{ t(label) }}</option>
      </select>
    </label>

    <label class="hsearch-field">
      <span class="hsearch-label"><Icon name="tag" :size="14" />{{ lang === 'en' ? 'Budget' : 'Presupuesto' }}</span>
      <select v-model="precioMax" class="hsearch-input">
        <option v-for="b in BUDGETS" :key="b" :value="String(b)">
          {{ b >= PRICE_MAX ? (lang === 'en' ? 'No limit' : 'Sin límite') : `${lang === 'en' ? 'Up to' : 'Hasta'} $${b} / ${lang === 'en' ? 'mo' : 'mes'}` }}
        </option>
      </select>
    </label>

    <label class="hsearch-field">
      <span class="hsearch-label"><Icon name="calendar" :size="14" />{{ lang === 'en' ? 'Move-in' : 'Entrada' }}</span>
      <input v-model="disponible" type="date" :min="today" class="hsearch-input">
    </label>

    <label class="hsearch-field">
      <span class="hsearch-label"><Icon name="users" :size="14" />{{ lang === 'en' ? 'People' : 'Personas' }}</span>
      <select v-model="personas" class="hsearch-input">
        <option v-for="n in 6" :key="n" :value="String(n)">{{ n }}{{ n === 6 ? '+' : '' }}</option>
      </select>
    </label>

    <button type="submit" class="hsearch-btn">
      <Icon name="search" :size="18" />
      <span>{{ lang === 'en' ? 'Search' : 'Buscar' }}</span>
    </button>
  </form>
</template>

<style scoped>
.hsearch {
  display: grid;
  grid-template-columns: 1.1fr 1.2fr 1.1fr .8fr auto;
  gap: 6px;
  padding: 8px;
  max-width: 900px;
  border-radius: 22px;
  /* Glass over the hero photo: 1px inner highlight + tinted shadow so the edge
     reads as a real surface instead of a flat white rectangle. */
  background: rgba(247, 241, 230, .9);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 30px 60px -24px rgba(15,17,12,.55);
}
.hsearch-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px 8px;
  border-radius: 15px;
  min-width: 0;
  cursor: pointer;
  transition: background-color .18s ease;
}
.hsearch-field:hover, .hsearch-field:focus-within { background: rgba(255,255,255,.75); }
.hsearch-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.hsearch-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15.5px;
  color: var(--color-ink);
  outline: none;
  cursor: pointer;
  min-width: 0;
}
.hsearch-input:focus-visible { box-shadow: none; }
input.hsearch-input[type="date"] { font-family: var(--font-body); font-weight: 600; font-size: 14.5px; }
input.hsearch-input::-webkit-calendar-picker-indicator { opacity: .55; cursor: pointer; }

.hsearch-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: stretch;
  padding: 0 26px;
  border: none;
  border-radius: 15px;
  background: var(--color-forest);
  color: var(--color-sand);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15.5px;
  cursor: pointer;
  box-shadow: 0 14px 30px -12px rgba(47,82,51,.6);
  transition: background-color .18s ease, transform .18s var(--ease-out), box-shadow .18s ease;
}
.hsearch-btn:hover { background: var(--color-forest-dark); transform: translateY(-1px); }
.hsearch-btn:active { transform: translateY(1px) scale(.98); }

@media (max-width: 880px) {
  .hsearch { grid-template-columns: 1fr 1fr; border-radius: 20px; }
  .hsearch-btn { grid-column: 1 / -1; padding: 15px; }
}
@media (max-width: 360px) {
  .hsearch { grid-template-columns: 1fr; }
}
</style>
