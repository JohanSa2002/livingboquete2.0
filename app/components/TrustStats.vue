<script setup lang="ts">
import type { Rental } from '#shared/types/content'

// Trust stats must never diverge from the real catalog — pulled from the same
// `rentals` table /alquiler reads from, not hardcoded marketing copy.
const props = defineProps<{ rentals: Rental[] }>()

const { lang } = useLocale()

const rentalCount = computed(() => props.rentals.length)
const avgRating = computed(() => {
  const list = props.rentals
  return list.length ? list.reduce((sum, r) => sum + (r.rating ?? 0), 0) / list.length : 0
})
const totalReviews = computed(() => props.rentals.reduce((sum, r) => sum + (r.reviews ?? 0), 0))
</script>

<template>
  <section class="pad-sec" style="max-width:1240px;margin:-34px auto 0;padding:0 26px;position:relative;z-index:5">
    <div
      v-if="rentalCount > 0"
      class="hero-stats"
      style="background:var(--color-white);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);display:flex;align-items:center;justify-content:space-around;padding:28px 20px;gap:20px"
    >
      <div class="hero-stat" data-reveal="title" style="text-align:center">
        <div class="hero-stat-num num" style="font-family:var(--font-display);font-weight:800;font-size:clamp(24px,3vw,32px);color:var(--color-forest)">{{ rentalCount }}+</div>
        <div class="hero-stat-label" style="font-size:var(--text-meta);color:var(--color-ink-soft);font-weight:600">
          {{ lang === 'en' ? 'properties' : 'propiedades' }}
        </div>
      </div>
      <div class="hero-stat-divider" style="width:1px;height:38px;background:var(--color-border)" />
      <div class="hero-stat" data-reveal="title" style="text-align:center">
        <div class="hero-stat-num num" style="display:flex;align-items:center;justify-content:center;gap:6px;font-family:var(--font-display);font-weight:800;font-size:clamp(24px,3vw,32px);color:var(--color-forest)">
          {{ avgRating.toFixed(1) }} <span style="color:var(--color-wood)"><Icon name="star" :size="20" /></span>
        </div>
        <div class="hero-stat-label" style="font-size:var(--text-meta);color:var(--color-ink-soft);font-weight:600">
          {{ lang === 'en' ? 'average rating' : 'calificación promedio' }}
        </div>
      </div>
      <div class="hero-stat-divider" style="width:1px;height:38px;background:var(--color-border)" />
      <div class="hero-stat" data-reveal="title" style="text-align:center">
        <div class="hero-stat-num num" style="font-family:var(--font-display);font-weight:800;font-size:clamp(24px,3vw,32px);color:var(--color-forest)">{{ totalReviews }}+</div>
        <div class="hero-stat-label" style="font-size:var(--text-meta);color:var(--color-ink-soft);font-weight:600">
          {{ lang === 'en' ? 'reviews' : 'reseñas' }}
        </div>
      </div>
    </div>
    <div
      v-else
      class="hero-stats"
      data-reveal="title"
      style="background:var(--color-white);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);display:flex;align-items:center;justify-content:center;gap:12px;padding:22px 24px;text-align:center"
    >
      <Icon name="mountain" :size="20" />
      <span style="font-family:var(--font-display);font-weight:700;font-size:15.5px;color:var(--color-ink)">
        {{ lang === 'en' ? 'Boquete — our one and only zone, for real.' : 'Boquete — nuestra única zona, de verdad.' }}
      </span>
    </div>
  </section>
</template>
