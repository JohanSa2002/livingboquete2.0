<script setup lang="ts">
import { CONTACT_WHATSAPP } from '#shared/utils/constants'
import type { IconName } from '~/components/Icon.vue'

// "What we stand behind" — the pillar section every mid-term rental site has
// (Blueground's "One price, no surprises", Landing's guarantee, Flatio's
// StayProtection). Written to match what MIKA actually is per /como-funciona:
// a meeting point, not a contract or payment service — so nothing here
// promises deposits, insurance or bookings we don't handle.
const { lang, localePath } = useLocale()

const PILLARS: { icon: IconName; h: { es: string; en: string }; p: { es: string; en: string } }[] = [
  {
    icon: 'check',
    h: { es: 'Visitada en persona', en: 'Visited in person' },
    p: {
      es: 'Toda propiedad con el sello "Verificada" la recorrió alguien del equipo. Fotos nuestras, no del anuncio; internet medido con test de velocidad.',
      en: 'Every listing with the "Verified" mark was walked through by someone on the team. Our own photos, not the ad\'s; internet measured with a speed test.',
    },
  },
  {
    icon: 'tag',
    h: { es: 'El precio que ves es el precio', en: 'The price you see is the price' },
    p: {
      es: 'Renta mensual publicada tal cual la cobra el anfitrión. Depósito y servicios estimados se muestran cuando el anfitrión los fija — nunca inventados. Sin comisión para ti.',
      en: 'Monthly rent listed exactly as the host charges it. Deposit and estimated utilities appear when the host has set them — never made up. No fee for you.',
    },
  },
  {
    icon: 'clock',
    h: { es: 'Respuesta en 24 horas', en: 'A reply within 24 hours' },
    p: {
      es: 'Tu solicitud llega directo al anfitrión. Si en un día no te ha contestado, nos escribes y lo perseguimos nosotros.',
      en: 'Your request goes straight to the host. If you haven\'t heard back in a day, message us and we chase it for you.',
    },
  },
  {
    icon: 'compass',
    h: { es: 'Alguien local del otro lado', en: 'Someone local on the other end' },
    p: {
      es: 'SIM, banco, dónde comprar un colchón, qué taxi llamar. Preguntas de llegada por WhatsApp a gente que vive aquí.',
      en: 'SIM card, bank, where to buy a mattress, which taxi to call. Arrival questions over WhatsApp to people who live here.',
    },
  },
]

const waHref = `https://wa.me/${CONTACT_WHATSAPP.number}?text=${encodeURIComponent(lang.value === 'en' ? 'Hi MIKA Homes, I have a question about moving to Boquete.' : 'Hola MIKA Homes, tengo una pregunta sobre mudarme a Boquete.')}`
</script>

<template>
  <section class="guar pad-sec">
    <!-- Photo stage for the glass pillars: a real <img> (resized + lazy via
         @nuxt/image) rather than a CSS background, so it never ships the
         full-size original. -->
    <NuxtImg
      src="/lifestyle/vista-al-volcan.webp"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
      densities="x1"
      :quality="60"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      class="guar-photo"
    />
    <div class="guar-wash" aria-hidden="true" />
    <div class="guar-inner">
      <div class="guar-head">
        <div>
          <div class="eyebrow" data-reveal="slide-right" style="margin-bottom:12px">
            {{ lang === 'en' ? 'What we stand behind' : 'Lo que respaldamos' }}
          </div>
          <h2 class="stays-h2" data-reveal="slide-right">
            <template v-if="lang === 'en'">Four things you can <em>count on.</em></template>
            <template v-else>Cuatro cosas con las que <em>puedes contar.</em></template>
          </h2>
        </div>
        <p class="stays-sec-sub" data-reveal="slide-right">
          {{ lang === 'en'
            ? 'No fine print. What we don\'t do (contracts, payments) is on the how-it-works page.'
            : 'Sin letra pequeña. Lo que no hacemos (contratos, pagos) está en cómo funciona.' }}
          <NuxtLink :to="localePath('/como-funciona')" class="guar-more">{{ lang === 'en' ? 'Read it' : 'Léelo' }} →</NuxtLink>
        </p>
      </div>

      <!-- Deliberately not four equal cards: a 2×2 grid where the first pillar
           is wider and carries the WhatsApp line, so the block has a focal
           point instead of reading as a feature row. -->
      <div class="guar-grid">
        <article
          v-for="(pillar, i) in PILLARS"
          :key="i"
          class="guar-item glass-dark"
          :class="{ 'is-lead': i === 0, 'is-wide': i === PILLARS.length - 1 }"
        >
          <span class="guar-icon"><Icon :name="pillar.icon" :size="20" /></span>
          <h3>{{ lang === 'en' ? pillar.h.en : pillar.h.es }}</h3>
          <p>{{ lang === 'en' ? pillar.p.en : pillar.p.es }}</p>
          <a v-if="i === 3" :href="waHref" target="_blank" rel="noopener" class="guar-wa">
            <Icon name="chat" :size="15" />
            {{ CONTACT_WHATSAPP.display }}
          </a>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Full-bleed photo band: the volcano shot sits behind a forest wash and the
   four pillars are glass panes over it — the one place on the home where the
   page steps off the sand ground, so the guarantees read as a set piece. */
.guar {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin-top: 72px;
  padding-top: 96px;
  padding-bottom: 96px;
  color: var(--color-cream);
}
.guar-photo {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}
.guar-wash {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(18, 26, 17, .72) 0%, rgba(18, 26, 17, .38) 42%, rgba(14, 20, 13, .66) 100%);
}
.guar-inner { position: relative; max-width: 1240px; margin: 0 auto; }
.guar-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px 48px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}
.guar-head > div { max-width: 560px; }
.guar-head .eyebrow { color: var(--color-gold-light); }
.guar-head .stays-h2 { color: var(--color-cream); }
.guar-head .stays-h2 em { color: var(--color-gold-pale); }
.guar-head .stays-sec-sub { color: rgba(245, 240, 232, .82); }
.guar-more { color: var(--color-gold-light); font-weight: 700; text-decoration: none; white-space: nowrap; }
.guar-more:hover { text-decoration: underline; }

.guar-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  grid-auto-rows: 1fr;
  gap: 14px;
}
.guar-item {
  position: relative;
  padding: 26px 26px 28px;
  border-radius: var(--radius-lg);
  transition: background-color .2s ease, transform .3s var(--ease-out-strong);
}
@media (hover: hover) and (pointer: fine) {
  .guar-item:hover { background: rgba(18, 24, 16, .24); transform: translateY(-3px); }
}
/* Lead pillar: same glass, tinted forest, so it stays the focal point
   without going back to a solid slab. */
.guar-item.is-lead {
  grid-row: span 2;
  background: rgba(47, 82, 51, .52);
  border-color: rgba(232, 217, 184, .26);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30px;
  overflow: hidden;
}
.guar-item.is-lead::before {
  /* Faint contour rings, same language as the rentals page. */
  content: '';
  position: absolute;
  inset: -40% -30% auto auto;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  border: 1px solid rgba(232,217,184,.22);
  box-shadow: 0 0 0 40px rgba(232,217,184,.06), 0 0 0 90px rgba(232,217,184,.04);
  pointer-events: none;
}
@media (hover: hover) and (pointer: fine) {
  .guar-item.is-lead:hover { background: rgba(47, 82, 51, .62); }
}
/* Last pillar spans the two remaining columns and goes horizontal: icon and
   title on the left, copy + WhatsApp line on the right — fills the row and
   gives the grid a second shape. */
.guar-item.is-wide {
  grid-column: 2 / -1;
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.4fr);
  gap: 4px 32px;
  align-items: start;
  align-content: center;
}
.guar-item.is-wide .guar-icon { margin-bottom: 12px; }
.guar-item.is-wide h3 { margin: 0; }
.guar-item.is-wide > p { grid-column: 2; grid-row: 1 / span 3; align-self: center; }
.guar-item.is-wide .guar-wa { grid-column: 1; margin-top: 4px; }

.guar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: rgba(255, 255, 255, .14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22);
  color: var(--color-gold-pale);
  margin-bottom: 18px;
}
.guar-item h3 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 19px;
  letter-spacing: -.01em;
  line-height: 1.15;
  margin: 0 0 8px;
  color: var(--color-cream);
}
.guar-item.is-lead h3 { font-size: 26px; }
.guar-item p { font-size: 14.5px; line-height: 1.6; color: rgba(245, 240, 232, .84); margin: 0; }
.guar-item.is-lead p { font-size: 15px; max-width: 34ch; }
.guar-wa {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  color: var(--color-gold-light);
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
}
.guar-wa:hover { text-decoration: underline; }

@media (max-width: 880px) {
  .guar { margin-top: 56px; padding-top: 64px; padding-bottom: 64px; }
  .guar-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: auto; }
  .guar-item.is-lead { grid-column: 1 / -1; grid-row: auto; min-height: 220px; }
  .guar-item.is-wide { grid-column: 1 / -1; grid-template-columns: 1fr; gap: 8px; }
  .guar-item.is-wide > p { grid-column: auto; grid-row: auto; }
}
@media (max-width: 560px) {
  .guar-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .guar-item { transition: background-color .2s ease; }
  .guar-item:hover { transform: none; }
}
</style>
