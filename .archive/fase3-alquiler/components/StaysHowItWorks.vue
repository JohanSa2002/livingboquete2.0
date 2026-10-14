<script setup lang="ts">
const { lang } = useLocale()
</script>

<template>
  <section class="stays-how">
    <svg class="stays-contours" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,220 C180,160 320,260 520,200 C720,140 860,240 1060,180 C1120,162 1170,170 1200,178" />
      <path d="M0,250 C200,190 340,290 540,230 C740,170 880,270 1080,210 C1130,195 1175,200 1200,206" />
      <path d="M0,190 C160,130 300,230 500,170 C700,110 840,210 1040,150 C1110,130 1165,140 1200,150" />
    </svg>
    <div class="pad-sec" style="max-width:1240px;margin:0 auto;position:relative;text-align:center">
      <div class="eyebrow rv" style="margin-bottom:12px;color:var(--color-gold-light)">
        {{ lang === 'en' ? 'Zero friction' : 'Sin fricción' }}
      </div>
      <h2 class="stays-h2 rv" style="color:var(--color-sand);margin-bottom:48px">
        <template v-if="lang === 'en'">Moving is <em>this simple</em></template>
        <template v-else>Mudarse es <em>así de simple</em></template>
      </h2>
      <div class="stays-steps">
        <div class="stays-step rv">
          <h3>{{ lang === 'en' ? 'Browse and pick' : 'Explora y elige' }}</h3>
          <p>
            {{ lang === 'en'
              ? 'Real photos, clear prices and reviews from people who already lived there. No account needed.'
              : 'Fotos reales, precios claros y reseñas de gente que ya vivió ahí. Sin crear cuenta.' }}
          </p>
        </div>
        <div class="stays-step rv" style="animation-delay:.08s">
          <h3>{{ lang === 'en' ? 'Talk to the host' : 'Habla con el anfitrión' }}</h3>
          <p>
            {{ lang === 'en'
              ? 'Send your request with a move-in date and hear back within 24 hours.'
              : 'Envía tu solicitud con fecha de mudanza y te responden en menos de 24 horas.' }}
          </p>
        </div>
        <div class="stays-step rv" style="animation-delay:.16s">
          <h3>{{ lang === 'en' ? 'Move in and live Boquete' : 'Múdate y vive Boquete' }}</h3>
          <p>
            {{ lang === 'en'
              ? 'Highland coffee, trails, community. Your new routine starts in the mountains.'
              : 'Café de altura, senderos, comunidad. Tu nueva rutina empieza entre montañas.' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stays-how {
  position: relative;
  background: linear-gradient(180deg, rgba(20,26,18,.86) 0%, rgba(20,26,18,.92) 100%), url('/fondoalquiler2.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin-top: 92px;
  padding: 76px 0 84px;
  overflow: hidden;
}
.stays-contours {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
}
.stays-contours path {
  fill: none;
  stroke: rgba(245,240,232,.09);
  stroke-width: 1.6;
}
.stays-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 34px;
}
.stays-step { padding-top: 22px; }
.stays-step h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--color-sand);
  margin: 0 0 10px;
}
.stays-step p {
  font-size: 15px;
  line-height: 1.62;
  color: rgba(245,240,232,.7);
  margin: 0;
}

@media (max-width: 1024px) {
  .stays-steps { grid-template-columns: 1fr; gap: 26px; }
}
</style>
