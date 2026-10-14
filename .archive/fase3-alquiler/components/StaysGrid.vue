<script setup lang="ts">
import { AMEN_LABELS, TYPE_LABELS } from '#shared/utils/constants'
import type { Bilingual, Rental } from '#shared/types/content'

const { lang, localePath, t } = useLocale()
const filters = useStaysFilters()
const { rentals, renderRentals, visibleIds, resultCount, activeChips, orden } = filters

// Presentational only — derives trust badges from existing data fields.
const maxReviews = computed(() => (rentals.value.length ? Math.max(...rentals.value.map(r => r.reviews)) : 0))

function getBadges(p: Rental): Bilingual[] {
  const badges: Bilingual[] = []
  // Remote-work fit leads when the host has actually set it up — it's the
  // one badge nomads scan for first.
  if (p.workspace && (p.wifiMbps ?? 0) >= 50) badges.push({ es: 'Lista para trabajo remoto', en: 'Remote-work ready' })
  if (p.reviews === maxReviews.value) badges.push({ es: 'Más reservado', en: 'Most booked' })
  if (p.amen.includes('view')) badges.push({ es: 'Vista al volcán', en: 'Volcano view' })
  if (p.amen.includes('pets')) badges.push({ es: 'Pet Friendly', en: 'Pet Friendly' })
  if (p.amen.includes('furnished')) badges.push({ es: 'Amueblado', en: 'Furnished' })
  return badges.slice(0, 2)
}
</script>

<template>
  <div>
    <div v-if="rentals.length === 0" class="catalog-empty-state" role="status" aria-live="polite">
      <Icon name="search" :size="30" />
      <h3>
        {{ lang === 'en' ? 'We\'re adding the first Boquete listings.' : 'Estamos incorporando las primeras propiedades de Boquete.' }}
      </h3>
      <p>
        {{ lang === 'en'
          ? 'Leave your email and we\'ll notify you as soon as the first one is live.'
          : 'Déjanos tu correo y te avisamos apenas publiquemos la primera.' }}
      </p>
      <div class="catalog-empty-ctas">
        <a :href="`${localePath('/')}/#contacto`" class="btn btn-primary">
          {{ lang === 'en' ? 'Notify me' : 'Avísame cuando haya' }}
        </a>
        <NuxtLink :to="localePath('/publicar-propiedad')" class="btn btn-ghost">
          {{ lang === 'en' ? 'List your property' : 'Publica tu propiedad' }}
        </NuxtLink>
      </div>
    </div>

    <div
      v-show="activeChips.length"
      role="region"
      aria-label="Filtros activos"
      style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:16px"
    >
      <button
        v-for="(chip, i) in activeChips"
        :key="i"
        type="button"
        class="active-filter-chip"
        @click="filters.removeChip(chip)"
      >
        {{ t(chip.label) }}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>

    <div
      v-show="rentals.length > 0 && resultCount > 0"
      style="margin-bottom:22px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap"
    >
      <div style="font-size:15px;color:var(--color-ink-soft);display:flex;align-items:center;flex-wrap:wrap">
        <b style="color:var(--color-ink);font-weight:800;font-family:var(--font-display)">{{ resultCount }}</b>&nbsp;
        {{ lang === 'en' ? 'rentals available' : 'alquileres disponibles' }}
        <button
          v-show="activeChips.length > 1"
          type="button"
          style="margin-left:14px;border:none;background:transparent;color:var(--color-ink-soft);text-decoration:underline;font-size:13.5px;cursor:pointer"
          @click="filters.clearAll()"
        >
          {{ lang === 'en' ? 'Clear all' : 'Limpiar todo' }}
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:9px">
        <span style="font-size:13px;font-weight:600;color:var(--color-ink-soft)">
          {{ lang === 'en' ? 'Sort' : 'Ordenar' }}
        </span>
        <select
          v-model="orden"
          class="orden-select"
          :aria-label="lang === 'en' ? 'Sort by' : 'Ordenar por'"
          style="appearance:none;background:var(--color-sand);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:9px 12px;font-size:13.5px;font-weight:600;color:var(--color-ink);outline:none;cursor:pointer"
        >
          <option value="relevancia">{{ lang === 'en' ? 'Relevance' : 'Relevancia' }}</option>
          <option value="precio_asc">{{ lang === 'en' ? 'Price: low to high' : 'Precio: menor a mayor' }}</option>
          <option value="precio_desc">{{ lang === 'en' ? 'Price: high to low' : 'Precio: mayor a menor' }}</option>
          <option value="recientes">{{ lang === 'en' ? 'Newest' : 'Más recientes' }}</option>
          <option value="rating">{{ lang === 'en' ? 'Top rated' : 'Mejor calificados' }}</option>
        </select>
      </div>
    </div>

    <!-- The grid always renders the FULL catalogue (never just the
         filtered subset) so widening the filters back out never needs
         a reload — non-matching cards ship as display:none in the same
         response instead of being absent. -->
    <div class="cols-2" style="display:grid;grid-template-columns:1fr 1fr;gap:26px">
      <NuxtLink
        v-for="(p, i) in renderRentals"
        :key="p.id"
        :to="localePath(`/alquiler/${p.id}`)"
        class="rental-card rv card"
        :aria-label="`${p.name.es}, ${TYPE_LABELS[p.type]!.es} en ${p.loc.es}, $${p.price} por mes`"
        :style="`text-decoration:none;color:inherit;overflow:hidden;display:${visibleIds.has(p.id) ? 'block' : 'none'}`"
      >
        <div class="rental-card-media" style="position:relative;aspect-ratio:16/10;overflow:hidden">
          <NuxtImg
            :src="p.img"
            :width="560"
            :height="350"
            densities="x1 x2"
            alt=""
            class="rental-card-img"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
            :loading="i < 4 ? 'eager' : 'lazy'"
            :fetchpriority="i < 4 ? 'high' : undefined"
          />
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,20,15,.02) 0%,rgba(20,20,15,0) 30%,rgba(15,15,10,.55) 100%)" />

          <div style="position:absolute;top:13px;left:13px;right:13px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span class="badge badge-dark">{{ t(TYPE_LABELS[p.type]) }}</span>
              <span v-if="p.verified" class="badge badge-forest" title="Propiedad verificada">
                <Icon name="check" :size="12" />
                {{ lang === 'en' ? 'Verified' : 'Verificada' }}
              </span>
            </div>
            <span class="badge badge-light">
              <Icon name="star" :size="12" />{{ p.rating.toFixed(1) }}
            </span>
          </div>

          <div style="position:absolute;bottom:13px;left:13px;right:13px;display:flex;flex-wrap:wrap;gap:6px">
            <span v-for="(b, bi) in getBadges(p)" :key="bi" class="badge badge-forest">{{ t(b) }}</span>
          </div>
        </div>
        <div style="padding:19px 20px 21px">
          <div style="display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--color-ink-faint);margin-bottom:6px">
            <Icon name="location" :size="13" />
            {{ t(p.loc) }}
          </div>
          <h3 style="font-family:var(--font-display);font-weight:700;font-size:19px;margin:0 0 10px;color:var(--color-ink);line-height:1.2">
            {{ t(p.name) }}
          </h3>
          <div style="display:flex;align-items:center;gap:14px;font-size:13px;color:var(--color-ink-soft);margin-bottom:14px">
            <span style="display:flex;align-items:center;gap:5px"><Icon name="users" :size="15" />{{ p.guests }}</span>
            <span style="display:flex;align-items:center;gap:5px"><Icon name="bed" :size="15" />{{ p.beds }}</span>
            <span style="display:flex;align-items:center;gap:5px"><Icon name="bath" :size="15" />{{ p.baths }}</span>
            <span v-if="p.parking > 0" style="display:flex;align-items:center;gap:5px"><Icon name="car" :size="15" />{{ p.parking }}</span>
          </div>
          <div style="display:flex;align-items:center;gap:14px;font-size:13px;color:var(--color-ink-soft);margin-bottom:16px">
            <span
              v-for="key in p.amen.filter(k => k !== 'parking').slice(0, 4)"
              :key="key"
              :title="AMEN_LABELS[key]?.es"
              style="display:flex;align-items:center;gap:5px"
            >
              <Icon :name="AMEN_ICON[key]!" :size="15" />
            </span>
          </div>
          <div v-if="p.wifiMbps || p.workspace" class="rental-remote">
            <span v-if="p.wifiMbps"><Icon name="wifi" :size="14" />{{ p.wifiMbps }} Mbps</span>
            <span v-if="p.workspace"><Icon name="laptop" :size="14" />{{ lang === 'en' ? 'Desk' : 'Escritorio' }}</span>
          </div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--color-border-soft);padding-top:14px">
            <div>
              <span class="num" style="font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--color-ink)">${{ p.price }}</span>
              <span style="font-size:13.5px;color:var(--color-ink-faint)"> / {{ lang === 'en' ? 'month' : 'mes' }}</span>
            </div>
            <span style="color:var(--color-forest);font-weight:700;font-size:13.5px;display:flex;align-items:center;gap:3px">
              {{ lang === 'en' ? 'See more' : 'Ver más' }} <Icon name="chevron-right" :size="14" />
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div
      v-show="rentals.length > 0 && resultCount === 0"
      class="card"
      style="border-style:dashed;padding:54px 30px;text-align:center;color:var(--color-ink-faint);font-size:15.5px"
    >
      {{ lang === 'en' ? 'No results for these filters.' : 'Sin resultados para estos filtros.' }}
    </div>
  </div>
</template>

<style scoped>
.catalog-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 72px 32px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(255,255,255,.5);
  color: var(--color-ink-soft);
}
.catalog-empty-state h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--color-ink);
  margin: 0;
}
.catalog-empty-state p {
  max-width: 380px;
  font-size: 15px;
  line-height: 1.55;
  margin: 0;
}
.catalog-empty-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: var(--radius-pill);
  background: rgba(47,82,51,.1);
  color: var(--color-forest);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  cursor: pointer;
  transition: background-color .16s var(--ease-out);
}
.active-filter-chip:hover { background: rgba(47,82,51,.16); }

.rental-remote {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: -6px 0 14px;
}
.rental-remote > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-forest);
  background: rgba(47,82,51,.08);
  padding: 4px 9px;
  border-radius: 999px;
}

.rental-card { transition: transform .28s var(--ease-out), box-shadow .28s var(--ease-out); }
.rental-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
.rental-card-img { transition: transform .5s var(--ease-out); }
.rental-card:hover .rental-card-img { transform: scale(1.07); }
</style>
