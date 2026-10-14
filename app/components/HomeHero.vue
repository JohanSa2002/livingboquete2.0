<script setup lang="ts">
const { lang } = useLocale()

// Hero widths/quality must match scripts/generate-hero-images.mjs, which
// pre-renders these into /public/hero at build time — see that file for why.
const HERO_WIDTHS = [480, 768, 1080, 1440, 1920]
const heroSrcset = HERO_WIDTHS.map(w => `/hero/hero-${w}.webp ${w}w`).join(', ')

useHead({
  link: [{
    rel: 'preload',
    as: 'image',
    href: '/hero/hero-1920.webp',
    imagesrcset: heroSrcset,
    imagesizes: '100vw',
    fetchpriority: 'high',
  }],
})
</script>

<template>
  <section style="position:relative;min-height:92dvh;display:flex;align-items:flex-end;overflow:hidden">
    <img
      src="/hero/hero-1920.webp"
      :srcset="heroSrcset"
      sizes="100vw"
      width="1920"
      height="1080"
      alt="Vista de Boquete"
      loading="eager"
      fetchpriority="high"
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1"
    >
    <!-- Lighter wash than before: the glass pane now carries text contrast,
         so the photo can stay brighter around it. -->
    <div style="position:absolute;inset:0;z-index:3;background:linear-gradient(180deg,rgba(20,28,18,.32) 0%,rgba(34,61,38,.04) 34%,rgba(18,22,15,.38) 78%,rgba(15,17,12,.62) 100%)" />

    <div class="pad-sec hero-shell">
      <div class="hero-pane glass-dark">
        <h1 class="hero-title">
          {{ lang === 'en' ? 'Find your next home among the mountains.' : 'Encuentra tu próximo hogar entre montañas.' }}
        </h1>
        <p class="hero-sub">
          {{ lang === 'en'
            ? 'Monthly rentals in Boquete for digital nomads, professionals and families looking for nature, cool weather and a quieter pace of life.'
            : 'Alquileres mensuales en Boquete para nómadas digitales, profesionales y familias que buscan naturaleza, clima fresco y una vida más tranquila.' }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-shell {
  position: relative;
  z-index: 4;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 26px 64px;
}
.hero-pane {
  max-width: 820px;
  margin: 0 auto;
  padding: clamp(26px, 4vw, 48px) clamp(22px, 4.5vw, 56px);
  border-radius: var(--radius-lg);
  text-align: center;
  /* The pane fades up with the page instead of popping in with the image. */
  animation: hero-pane-in .6s var(--ease-out-strong) both;
}
.hero-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-hero);
  line-height: 1.05;
  letter-spacing: -.025em;
  margin: 0 0 18px;
  color: var(--color-sand);
  text-wrap: balance;
}
.hero-sub {
  font-family: var(--font-body);
  font-size: clamp(16px, 1.6vw, 19px);
  line-height: 1.55;
  max-width: 560px;
  margin: 0 auto;
  color: rgba(245, 240, 232, .88);
  text-wrap: pretty;
}
@keyframes hero-pane-in {
  from { opacity: 0; transform: translateY(12px) scale(.98); }
  to { opacity: 1; transform: none; }
}
@media (max-width: 560px) {
  .hero-shell { padding: 0 16px 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-pane { animation: hero-pane-fade .3s ease both; }
  @keyframes hero-pane-fade { from { opacity: 0; } to { opacity: 1; } }
}
</style>
