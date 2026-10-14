<script setup lang="ts">
import type { Rental, Review } from '#shared/types/content'

// Spotlight: properties manually marked "featured" in the admin. Falls back to
// the most-reviewed listing when nothing has been marked yet, so the strip is
// never empty while the catalogue has anything in it.
const props = defineProps<{ rentals: Rental[] }>()

const { lang, localePath, t } = useLocale()

const items = computed(() => {
  const list = props.rentals
  const manuallyFeatured = list.filter(r => r.featured)
  const source = manuallyFeatured.length
    ? manuallyFeatured
    : list.length
      ? [list.reduce((a, b) => (b.reviews > a.reviews ? b : a), list[0]!)]
      : []

  return source.map(r => ({
    ...r,
    quote: r.reviewsList?.length
      ? r.reviewsList.reduce((a: Review, b: Review) => (b.rating > a.rating ? b : a), r.reviewsList[0]!)
      : null,
  }))
})

const track = ref<HTMLElement | null>(null)
const activeDot = ref(0)

function currentIndex() {
  if (!track.value) return 0
  return Math.round(track.value.scrollLeft / track.value.clientWidth)
}

function goTo(i: number) {
  const slide = track.value?.children[i] as HTMLElement | undefined
  if (slide && track.value) track.value.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
}

function syncDots() {
  activeDot.value = currentIndex()
}

function onScroll() {
  requestAnimationFrame(syncDots)
}
</script>

<template>
  <section v-if="items.length > 0" class="pad-sec" style="max-width:1240px;margin:0 auto;padding-top:84px">
    <div class="stays-spot-wrap rv">
      <div ref="track" class="stays-spot-track" @scroll.passive="onScroll">
        <div v-for="item in items" :key="item.id" class="stays-spot">
          <NuxtLink :to="localePath(`/alquiler/${item.id}`)" class="stays-spot-media" :aria-label="item.name.es">
            <NuxtImg :src="item.img" :width="640" :height="480" densities="x1 x2" :alt="item.name.es" loading="lazy" />
            <span class="badge badge-wood stays-spot-flag">
              <Icon name="star" :size="12" />
              {{ lang === 'en' ? 'The community\'s pick' : 'La elección de la comunidad' }}
            </span>
          </NuxtLink>
          <div class="stays-spot-body">
            <div class="eyebrow" style="margin-bottom:14px">
              {{ lang === 'en' ? 'Featured this month' : 'Destacado del mes' }}
            </div>
            <h2 class="stays-h2" style="margin-bottom:10px">{{ t(item.name) }}</h2>
            <div class="stays-spot-meta">
              <span style="display:flex;align-items:center;gap:5px">
                <Icon name="star" :size="14" /><b>{{ item.rating.toFixed(1) }}</b> · {{ item.reviews }}
                {{ lang === 'en' ? 'reviews' : 'reseñas' }}
              </span>
              <span style="display:flex;align-items:center;gap:5px">
                <Icon name="location" :size="14" />{{ t(item.loc) }}
              </span>
            </div>
            <blockquote v-if="item.quote" class="stays-quote">
              “{{ t(item.quote.text) }}”
              <footer>— {{ item.quote.name }}</footer>
            </blockquote>
            <div class="stays-spot-foot">
              <div>
                <span class="stays-spot-price">${{ item.price }}</span>
                <span class="stays-spot-per">/ {{ lang === 'en' ? 'month' : 'mes' }}</span>
              </div>
              <NuxtLink :to="localePath(`/alquiler/${item.id}`)" class="btn btn-primary">
                {{ lang === 'en' ? 'See this home' : 'Conocer esta casa' }}
                <Icon name="chevron-right" :size="16" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-if="items.length > 1" class="stays-spot-nav">
        <button type="button" class="stays-spot-arrow" aria-label="Anterior" @click="goTo(Math.max(0, currentIndex() - 1))">
          <Icon name="chevron-right" :size="17" class="stays-spot-arrow-icon" />
        </button>
        <div class="stays-spot-dots">
          <button
            v-for="(_, i) in items"
            :key="i"
            type="button"
            class="stays-spot-dot"
            :class="{ 'is-active': i === activeDot }"
            :aria-label="`Ir al destacado ${i + 1}`"
            @click="goTo(i)"
          />
        </div>
        <button type="button" class="stays-spot-arrow" aria-label="Siguiente" @click="goTo(Math.min(items.length - 1, currentIndex() + 1))">
          <Icon name="chevron-right" :size="17" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stays-spot-wrap { position: relative; }
.stays-spot-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-radius: 26px;
}
.stays-spot-track::-webkit-scrollbar { display: none; }
.stays-spot {
  flex: 0 0 100%;
  scroll-snap-align: start;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  background: var(--color-white);
  border: 1px solid var(--color-border-soft);
  border-radius: 26px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}
.stays-spot-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 22px;
}
.stays-spot-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border-soft);
  background: var(--color-white);
  color: var(--color-ink);
  cursor: pointer;
  transition: background-color .2s var(--ease-out), border-color .2s var(--ease-out);
}
.stays-spot-arrow:hover { background: var(--color-sand-deep); border-color: var(--color-wood); }
.stays-spot-arrow-icon { transform: scaleX(-1); }
.stays-spot-dots { display: flex; align-items: center; gap: 8px; }
.stays-spot-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: var(--color-border-soft);
  cursor: pointer;
  transition: background-color .2s var(--ease-out), transform .2s var(--ease-out);
}
.stays-spot-dot.is-active { background: var(--color-wood); transform: scale(1.3); }
.stays-spot-media { position: relative; min-height: 420px; display: block; overflow: hidden; }
.stays-spot-media :deep(img) {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform .7s var(--ease-out);
}
.stays-spot-media:hover :deep(img) { transform: scale(1.05); }
.stays-spot-flag { position: absolute; top: 18px; left: 18px; }
.stays-spot-body { padding: 44px 46px; display: flex; flex-direction: column; }
.stays-spot-meta {
  display: flex; flex-wrap: wrap; gap: 18px;
  font-size: 14px; color: var(--color-ink-soft);
  margin: 8px 0 4px;
}
.stays-quote {
  font-family: var(--font-accent);
  font-style: italic;
  font-size: 18.5px;
  line-height: 1.6;
  color: var(--color-ink-soft);
  margin: 22px 0 0;
  padding-left: 18px;
  border-left: 3px solid var(--color-wood);
}
.stays-quote footer {
  font-family: var(--font-body);
  font-style: normal;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-ink-faint);
  margin-top: 10px;
}
.stays-spot-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 30px;
}
.stays-spot-price {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 34px;
  color: var(--color-ink);
}
.stays-spot-per { font-size: 15px; color: var(--color-ink-faint); }

@media (max-width: 1024px) {
  .stays-spot { grid-template-columns: 1fr; }
  .stays-spot-media { min-height: 300px; }
}
@media (max-width: 880px) {
  .stays-spot-body { padding: 32px 26px; }
}
</style>
