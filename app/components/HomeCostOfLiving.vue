<script setup lang="ts">
import { COST_BASICS, COST_RENT_BANDS, TYPE_LABELS } from '#shared/utils/constants'
import type { Rental } from '#shared/types/content'

// "How much does Boquete cost" — the question relocation sites (Retire in
// Panama, International Living) answer with concrete bands, and the one that
// turns a browser into a guide lead. Rent rows prefer the live catalogue: if
// there are listings of a type, the band is that type's real min–max and says
// so; otherwise the editorial 2026 estimate stands in.
const props = defineProps<{ rentals: Rental[] }>()
const { lang, localePath, t } = useLocale()

const rentRows = computed(() => COST_RENT_BANDS.map((band) => {
  const prices = props.rentals.filter(r => r.type === band.type).map(r => r.price)
  const live = prices.length >= 2
  return {
    type: band.type,
    label: TYPE_LABELS[band.type]!,
    from: live ? Math.min(...prices) : band.from,
    to: live ? Math.max(...prices) : band.to,
    live,
    count: prices.length,
  }
}))

// A quiet comparison line: one-person budget = mid-band apartment + basics.
const monthlyEstimate = computed(() => {
  const apto = rentRows.value.find(r => r.type === 'apto')!
  const rentMid = Math.round((apto.from + apto.to) / 2 / 50) * 50
  const basics = COST_BASICS
    .filter(b => !['Comer fuera', 'Taxi en el pueblo'].includes(b.label.es))
    .reduce((sum, b) => sum + (b.from + b.to) / 2, 0)
  // Groceries band is for two — halve it for the single-person figure.
  const groceries = COST_BASICS.find(b => b.label.es.startsWith('Supermercado'))!
  const single = basics - (groceries.from + groceries.to) / 4
  return Math.round((rentMid + single) / 50) * 50
})

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`
</script>

<template>
  <section class="cost pad-sec">
    <div class="cost-inner">
      <div class="cost-copy">
        <div class="eyebrow" data-reveal="slide-left" style="margin-bottom:12px">
          {{ lang === 'en' ? 'Cost of living' : 'Costo de vida' }}
        </div>
        <h2 class="stays-h2" data-reveal="slide-left">
          <template v-if="lang === 'en'">What a month in Boquete <em>actually costs.</em></template>
          <template v-else>Lo que cuesta un mes en Boquete, <em>en serio.</em></template>
        </h2>
        <p class="cost-sub" data-reveal="slide-left">
          {{ lang === 'en'
            ? 'Orientative 2026 figures for a furnished place and one or two people. Rent bands come from our own catalogue when there are enough listings.'
            : 'Cifras orientativas 2026 para un lugar amueblado y una o dos personas. Los rangos de renta salen de nuestro propio catálogo cuando hay suficientes propiedades.' }}
        </p>

        <div class="cost-total">
          <div class="cost-total-num num">≈ {{ fmt(monthlyEstimate) }}</div>
          <div class="cost-total-label">
            {{ lang === 'en' ? 'per month, one person, apartment + basics' : 'al mes, una persona, apartamento + servicios' }}
          </div>
        </div>

        <a :href="`${localePath('/')}/#contacto`" class="btn btn-primary cost-cta">
          {{ lang === 'en' ? 'Get the full breakdown in the guide' : 'Recibe el desglose completo en la guía' }}
          <Icon name="arrow-right" :size="16" />
        </a>
      </div>

      <div class="cost-table" role="table" :aria-label="lang === 'en' ? 'Monthly costs' : 'Costos mensuales'">
        <div class="cost-group-title">{{ lang === 'en' ? 'Rent' : 'Renta' }}</div>
        <NuxtLink
          v-for="row in rentRows"
          :key="row.type"
          :to="`${localePath('/propiedades')}?tipo=alquiler`"
          class="cost-row cost-row-link"
          role="row"
        >
          <span class="cost-row-label" role="cell">
            {{ t(row.label) }}
            <small v-if="row.live">{{ lang === 'en' ? `${row.count} listed now` : `${row.count} publicadas ahora` }}</small>
            <small v-else>{{ lang === 'en' ? 'estimate' : 'estimado' }}</small>
          </span>
          <span class="cost-row-bar" aria-hidden="true">
            <span :style="{ left: `${(row.from / 2000) * 100}%`, right: `${100 - (row.to / 2000) * 100}%` }" />
          </span>
          <span class="cost-row-range num" role="cell">{{ fmt(row.from) }}–{{ fmt(row.to) }}</span>
        </NuxtLink>

        <div class="cost-group-title" style="margin-top:18px">{{ lang === 'en' ? 'Basics' : 'Servicios y día a día' }}</div>
        <div v-for="(b, i) in COST_BASICS" :key="i" class="cost-row" role="row">
          <span class="cost-row-label" role="cell">
            {{ t(b.label) }}
            <small>{{ t(b.note) }}</small>
          </span>
          <span class="cost-row-range num" role="cell">{{ fmt(b.from) }}–{{ fmt(b.to) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cost { padding-top: 80px; padding-bottom: 80px; background: var(--color-sand-deep); }
.cost-inner {
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 48px 72px;
  align-items: start;
}
.cost-copy { position: sticky; top: 110px; }
.cost-sub { font-size: 15.5px; line-height: 1.6; color: var(--color-ink-soft); margin: 16px 0 28px; max-width: 44ch; }
.cost-total {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
  padding: 18px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 26px;
}
.cost-total-num {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(34px, 3.6vw, 44px);
  letter-spacing: -.03em;
  color: var(--color-forest);
  line-height: 1;
}
.cost-total-label { font-size: 13.5px; color: var(--color-ink-soft); max-width: 22ch; line-height: 1.4; }
.cost-cta { font-size: 15px; }

.cost-table {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: 22px 26px 26px;
  box-shadow: var(--shadow-md);
}
.cost-group-title {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--color-terracotta);
  padding-bottom: 10px;
}
.cost-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px 20px;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--color-border-soft);
  color: inherit;
  text-decoration: none;
}
.cost-row-link { grid-template-columns: 1fr 1fr auto; border-radius: 10px; margin: 0 -10px; padding: 12px 10px; transition: background-color .18s ease; }
.cost-row-link:hover { background: var(--color-sand); }
.cost-row-label { font-weight: 600; font-size: 15px; color: var(--color-ink); display: flex; flex-direction: column; gap: 2px; }
.cost-row-label small { font-weight: 500; font-size: 12.5px; color: var(--color-ink-faint); line-height: 1.35; }
.cost-row-bar { position: relative; height: 6px; border-radius: 3px; background: var(--color-sand-deep); overflow: hidden; }
.cost-row-bar > span { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: linear-gradient(90deg, var(--color-leaf), var(--color-forest)); }
.cost-row-range { font-family: var(--font-display); font-weight: 800; font-size: 15.5px; color: var(--color-ink); white-space: nowrap; }

@media (max-width: 960px) {
  .cost-inner { grid-template-columns: 1fr; gap: 36px; }
  .cost-copy { position: static; }
}
@media (max-width: 560px) {
  .cost { padding-top: 56px; padding-bottom: 56px; }
  .cost-table { padding: 16px 16px 18px; }
  .cost-row-link { grid-template-columns: 1fr auto; }
  .cost-row-bar { display: none; }
}
</style>
