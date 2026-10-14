<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { lang, localePath } = useLocale()

// Hero parallax: the background photo settles in with a soft zoom on load and
// then scrubs slower than the page as you scroll, adding depth.
function initHeroParallax() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const el = document.querySelector<HTMLElement>('.stays-hero-img')
  if (!el) return

  ScrollTrigger.getById('stays-hero-parallax')?.kill()
  gsap.killTweensOf(el)
  gsap.set(el, { clearProps: 'transform' })

  gsap.from(el, { scale: 1.14, duration: 1.9, ease: 'power2.out' })
  gsap.to(el, {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: { id: 'stays-hero-parallax', trigger: '.stays-hero', start: 'top top', end: 'bottom top', scrub: true },
  })
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  nextTick(initHeroParallax)
})

onBeforeUnmount(() => {
  ScrollTrigger.getById('stays-hero-parallax')?.kill()
})
</script>

<template>
  <section class="stays-hero">
    <NuxtImg
      src="/hero-poster.webp"
      alt="Tierras altas de Boquete"
      class="stays-hero-img"
      sizes="100vw"
      :quality="65"
      loading="eager"
      fetchpriority="high"
    />
    <div class="stays-hero-veil" />

    <div class="stays-hero-inner pad-sec">
      <div class="stays-hero-copy">
        <h1 class="stays-hero-h1 rv-once">
          <template v-if="lang === 'en'">Wake up<br><em>in the mountains.</em></template>
          <template v-else>Despierta<br><em>entre montañas.</em></template>
        </h1>
        <p class="stays-hero-sub rv-once" style="animation-delay:.16s">
          {{ lang === 'en'
            ? 'Monthly rentals in Boquete for people who are actually staying: houses, apartments and rooms ready for your move. No nightly stays.'
            : 'Alquiler mensual en Boquete para quedarse de verdad: casas, apartamentos y habitaciones listos para tu mudanza. Nada de estadías por noche.' }}
        </p>
        <div class="stays-hero-ctas rv-once" style="animation-delay:.24s">
          <a href="#explorar" class="btn btn-primary">
            <Icon name="search" :size="17" />
            {{ lang === 'en' ? 'Browse rentals' : 'Explorar alquileres' }}
          </a>
          <NuxtLink :to="localePath('/publicar-propiedad')" class="btn btn-ghost">
            {{ lang === 'en' ? 'List your property' : 'Publica tu propiedad' }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stays-hero {
  position: relative;
  z-index: 1;
  min-height: 88vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.stays-hero-img {
  position: absolute;
  top: -9%;
  left: 0;
  width: 100%;
  /* Overscan so the parallax scrub never reveals an edge. The load-zoom and
     scroll movement are driven by GSAP (see initHeroParallax). */
  height: 118%;
  object-fit: cover;
  will-change: transform;
}
.stays-hero-veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(20,28,18,.42) 0%, rgba(34,61,38,.06) 34%, rgba(18,22,15,.58) 74%, rgba(15,17,12,.92) 100%),
    radial-gradient(90% 60% at 18% 88%, rgba(15,20,12,.55) 0%, transparent 70%);
}
.stays-hero-inner {
  position: relative;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding-top: 140px;
  padding-bottom: 44px;
}
.stays-hero-h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(44px, 6.4vw, 84px);
  line-height: .98;
  letter-spacing: -.028em;
  color: var(--color-white);
  margin: 0 0 18px;
  text-wrap: balance;
}
.stays-hero-h1 em {
  font-family: var(--font-accent);
  font-weight: 500;
  font-style: italic;
  letter-spacing: -.01em;
  color: var(--color-gold-pale);
}
.stays-hero-sub {
  font-size: 17.5px;
  line-height: 1.6;
  color: rgba(245,240,232,.88);
  max-width: 540px;
  margin: 0 0 30px;
}
.stays-hero-ctas { display: flex; flex-wrap: wrap; gap: 14px; }

@media (max-width: 880px) {
  .stays-hero { min-height: 78vh; }
  .stays-hero-inner { padding-top: 120px; }
}
</style>
