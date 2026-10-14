<script setup lang="ts">
import type { IndexedRental } from '~/composables/useStaysFilters'

usePageSeo({
  title: 'Alquiler · MIKA Homes',
  titleEn: 'Stays · MIKA Homes',
  description: 'Casas, apartamentos y habitaciones en alquiler mensual en Boquete, Chiriquí. Comunidad y montañas.',
  descriptionEn: 'Houses, apartments and rooms for monthly rent in Boquete, Chiriquí. Community and mountains.',
})

const { data: rentalsRaw } = await useContentList('rentals')

// __idx preserves the original created_at-ascending order so re-sorting can
// restore "relevancia" or derive "recientes" without a separate timestamp.
const rentals = computed<IndexedRental[]>(() => (rentalsRaw.value ?? []).map((r, i) => ({ ...r, __idx: i })))

// Filter state is shared by the lifestyle shortcuts, the sidebar and the grid.
provideStaysFilters(rentals)

// ---------------- Fixed background ----------------
// Keeps the fixed background pinned to the viewport while scrolling, fading it
// out before the footer so it never overlaps it (same approach as the PDP).
const FADE_ZONE_PX = 220
const bgWrap = ref<HTMLElement | null>(null)
const bgCanvas = ref<HTMLElement | null>(null)

function updateRentalBgVisibility() {
  if (!bgWrap.value || !bgCanvas.value) return
  const distanceToFooter = bgWrap.value.getBoundingClientRect().bottom - window.innerHeight
  bgCanvas.value.style.opacity = String(Math.max(0, Math.min(1, distanceToFooter / FADE_ZONE_PX)))
}

onMounted(() => {
  window.addEventListener('scroll', updateRentalBgVisibility, { passive: true })
  window.addEventListener('resize', updateRentalBgVisibility)
  updateRentalBgVisibility()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateRentalBgVisibility)
  window.removeEventListener('resize', updateRentalBgVisibility)
})
</script>

<template>
  <div>
    <StaysHero />

    <div ref="bgWrap" class="rental-bg">
      <div ref="bgCanvas" class="rental-bg-canvas" aria-hidden="true" />

      <div class="rental-bg-content">
        <StaysLifestyles />
        <StaysSpotlight :rentals="rentals" />
        <StaysExplore />
        <StaysHowItWorks />
        <HomeGuarantees />

        <section class="stays-community-section">
          <StaysVoices :rentals="rentals" />
          <StaysOwnerCta />
        </section>
      </div>
    </div>
    <WhatsAppFab />
  </div>
</template>

<style scoped>
/* ---------- Fixed background (behind lifestyle cards through footer) ---------- */
.rental-bg { position: relative; }
.rental-bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Flat sand-tinted wash (not a gradient): this whole layer is position:fixed,
     so a top-to-bottom gradient is anchored to the viewport, not the scrolling
     content — whatever text happens to sit on this background drifts through
     the gradient as the page scrolls. A uniform tint keeps legibility constant
     regardless of scroll position. */
  background-image:
    linear-gradient(rgba(245,240,232,.78), rgba(245,240,232,.78)),
    url('/fondoalquiler2.webp');
  background-size: cover;
  background-position: center 75%;
  background-repeat: no-repeat;
}
.rental-bg-content { position: relative; z-index: 1; }

/* ---------- Voices + Owner CTA ---------- */
.stays-community-section {
  position: relative;
  padding: 84px 26px 96px;
  /* Flat wash, not a gradient — background-attachment:fixed anchors it to the
     viewport rather than this section's content. */
  background-image:
    linear-gradient(rgba(245,240,232,.76), rgba(245,240,232,.76)),
    url('/fondopersonas.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}
</style>
