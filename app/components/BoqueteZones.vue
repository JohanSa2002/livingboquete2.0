<script setup lang="ts">
import { BOQUETE_ZONES } from '#shared/utils/constants'

// Zone guide — Blueground's city cards and Casa Solution's neighbourhood
// index, but for one valley: the first thing a relocator asks is "which part
// of Boquete", and the answer is mostly elevation (climate) and distance to
// the centre.
const { lang, localePath, t } = useLocale()

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`
</script>

<template>
  <section class="zones pad-sec" aria-labelledby="zones-title">
    <div class="zones-inner">
      <div class="zones-head">
        <div>
          <div class="eyebrow" data-reveal="slide-right" style="margin-bottom:12px">
            {{ lang === 'en' ? 'Where in Boquete' : 'En qué parte de Boquete' }}
          </div>
          <h2 id="zones-title" class="stays-h2" data-reveal="slide-right">
            <template v-if="lang === 'en'">Six zones, six climates, <em>one valley.</em></template>
            <template v-else>Seis zonas, seis climas, <em>un solo valle.</em></template>
          </h2>
        </div>
        <p class="stays-sec-sub" data-reveal="slide-right">
          {{ lang === 'en'
            ? 'Every 100 m of elevation is about 0.6 °C cooler. Pick your weather first; the house comes after.'
            : 'Cada 100 m de altitud son unos 0,6 °C menos. Elige primero tu clima; la casa viene después.' }}
        </p>
      </div>

      <div class="zones-list">
        <article
          v-for="z in BOQUETE_ZONES"
          :key="z.id"
          class="zone-card"
        >
          <div class="zone-media">
            <NuxtImg :src="z.img" :width="340" :height="240" densities="x1 x2" :alt="z.name" loading="lazy" />
            <span class="zone-elev">{{ z.elevation }}</span>
          </div>
          <div class="zone-body">
            <div class="zone-top">
              <h3>{{ z.name }}</h3>
              <span class="zone-climate">{{ t(z.climate) }}</span>
            </div>
            <p class="zone-blurb">{{ t(z.blurb) }}</p>
            <p class="zone-for"><b>{{ lang === 'en' ? 'Best for' : 'Ideal para' }}</b> {{ t(z.bestFor) }}</p>
            <div class="zone-foot">
              <span class="zone-price num">{{ fmt(z.priceFrom) }}–{{ fmt(z.priceTo) }} <small>/ {{ lang === 'en' ? 'mo' : 'mes' }}</small></span>
              <NuxtLink :to="`${localePath('/propiedades')}?zona=${z.id}`" class="zone-link">
                {{ lang === 'en' ? 'See properties' : 'Ver propiedades' }}
                <Icon name="arrow-right" :size="14" />
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.zones { padding-top: 88px; padding-bottom: 40px; }
.zones-inner { max-width: 1240px; margin: 0 auto; }
.zones-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px 48px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}
.zones-head > div { max-width: 560px; }

.zones-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.zone-card {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: rgba(255,255,255,.6);
  border: 1px solid var(--color-border-soft);
  transition: background-color .25s ease, transform .3s var(--ease-out), box-shadow .3s var(--ease-out), border-color .25s ease;
}
.zone-card:hover {
  background: var(--color-white);
  border-color: rgba(47,82,51,.28);
  box-shadow: var(--shadow-md);
}
.zone-media { position: relative; min-height: 100%; }
.zone-media img { width: 100%; height: 100%; object-fit: cover; }
.zone-elev {
  position: absolute;
  left: 10px;
  bottom: 10px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 12px;
  color: var(--color-cream);
  background: rgba(37,29,20,.55);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  padding: 4px 8px;
  border-radius: 999px;
}
.zone-body { padding: 16px 18px 16px; min-width: 0; }
.zone-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.zone-card h3 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -.01em;
  margin: 0;
  color: var(--color-ink);
}
.zone-climate { font-size: 12.5px; font-weight: 600; color: var(--color-terracotta); }
.zone-blurb { font-size: 14px; line-height: 1.55; color: var(--color-ink-soft); margin: 6px 0 8px; }
.zone-for { font-size: 12.5px; color: var(--color-ink-faint); margin: 0 0 12px; }
.zone-for b { color: var(--color-ink-soft); font-weight: 700; }
.zone-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.zone-price { font-family: var(--font-display); font-weight: 800; font-size: 15px; color: var(--color-ink); }
.zone-price small { font-family: var(--font-body); font-weight: 500; font-size: 12.5px; color: var(--color-ink-faint); }
.zone-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  font-size: 13.5px;
  color: var(--color-forest);
  text-decoration: none;
  transition: gap .2s var(--ease-out);
}
.zone-link:hover { gap: 8px; }

@media (max-width: 960px) {
  .zones-list { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .zones { padding-top: 64px; }
  .zone-card { grid-template-columns: 1fr; }
  .zone-media { aspect-ratio: 16 / 9; }
}
</style>
