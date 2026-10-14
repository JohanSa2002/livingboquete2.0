<script setup lang="ts">
// "Who's behind this" — the trust move relocation sites lean on hardest
// (Retire in Panama's founders' story). No stock photos: initials on a
// squircle in the palette until real portraits exist, which reads honest
// rather than uncanny.
const { lang } = useLocale()

const TEAM = [
  {
    name: 'Isabel Montenegro',
    initials: 'IM',
    role: { es: 'Fundadora · anfitriones y verificación', en: 'Founder · hosts and verification' },
    bio: {
      es: 'Nació en Bajo Boquete y lleva doce años alquilando casas de familia a gente que llega. Es quien visita cada propiedad antes de que lleve el sello.',
      en: 'Born in Bajo Boquete, she has spent twelve years renting family homes to newcomers. She is the one who visits every property before it gets the mark.',
    },
    since: { es: 'En Boquete desde siempre', en: 'In Boquete since always' },
  },
  {
    name: 'Daniel Kwok',
    initials: 'DK',
    role: { es: 'Llegadas · trabajo remoto', en: 'Arrivals · remote work' },
    bio: {
      es: 'Llegó de Vancouver en 2019 para "tres meses" con un portátil. Mide el wifi de cada casa con su propio test y responde las preguntas de SIM, banco y visa.',
      en: 'Came from Vancouver in 2019 for "three months" with a laptop. He runs the speed test in every house himself and answers the SIM, bank and visa questions.',
    },
    since: { es: 'En Boquete desde 2019', en: 'In Boquete since 2019' },
  },
  {
    name: 'Rosa Pittí',
    initials: 'RP',
    role: { es: 'Inquilinos · WhatsApp', en: 'Renters · WhatsApp' },
    bio: {
      es: 'De Palmira. Es la voz del WhatsApp: coordina visitas, persigue anfitriones lentos y sabe qué taxi llamar a las once de la noche.',
      en: 'From Palmira. She is the voice on WhatsApp: coordinates visits, chases slow hosts and knows which taxi to call at eleven at night.',
    },
    since: { es: 'En el equipo desde 2023', en: 'On the team since 2023' },
  },
]
</script>

<template>
  <section class="team pad-sec">
    <div class="team-inner">
      <div class="team-copy">
        <div class="eyebrow" style="margin-bottom:12px">
          {{ lang === 'en' ? 'Who is behind this' : 'Quién está detrás' }}
        </div>
        <h2 class="stays-h2">
          <template v-if="lang === 'en'">Three people who <em>actually live here.</em></template>
          <template v-else>Tres personas que <em>viven aquí de verdad.</em></template>
        </h2>
        <p>
          {{ lang === 'en'
            ? 'MIKA Homes is small on purpose. Every listing, every reply and every arrival question passes through one of us.'
            : 'MIKA Homes es pequeño a propósito. Cada propiedad, cada respuesta y cada pregunta de llegada pasa por uno de nosotros.' }}
        </p>
      </div>

      <div class="team-grid">
        <article v-for="m in TEAM" :key="m.name" class="team-card">
          <div class="team-avatar" aria-hidden="true">{{ m.initials }}</div>
          <h3>{{ m.name }}</h3>
          <div class="team-role">{{ lang === 'en' ? m.role.en : m.role.es }}</div>
          <p>{{ lang === 'en' ? m.bio.en : m.bio.es }}</p>
          <div class="team-since">{{ lang === 'en' ? m.since.en : m.since.es }}</div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.team { padding-top: 72px; padding-bottom: 80px; }
.team-inner {
  max-width: 1240px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, .8fr) minmax(0, 1.6fr);
  gap: 40px 64px;
  align-items: start;
}
.team-copy p { font-size: 15.5px; line-height: 1.6; color: var(--color-ink-soft); margin: 16px 0 0; max-width: 38ch; }

.team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
/* Offset the middle card so the row doesn't read as three identical towers. */
.team-card:nth-child(2) { margin-top: 28px; }
.team-card {
  padding: 24px 22px 22px;
  border-radius: var(--radius-lg);
  background: var(--color-white);
  border: 1px solid var(--color-border-soft);
  box-shadow: var(--shadow-sm);
  transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out);
}
.team-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.team-avatar {
  width: 58px;
  height: 58px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 19px;
  letter-spacing: .02em;
  color: var(--color-cream);
  background: linear-gradient(135deg, var(--color-forest), var(--color-leaf));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
  margin-bottom: 16px;
}
.team-card:nth-child(2) .team-avatar { background: linear-gradient(135deg, var(--color-coffee), var(--color-gold)); }
.team-card:nth-child(3) .team-avatar { background: linear-gradient(135deg, var(--color-moss), var(--color-forest)); }
.team-card h3 { font-family: var(--font-display); font-weight: 800; font-size: 18px; margin: 0 0 3px; color: var(--color-ink); }
.team-role { font-size: 12.5px; font-weight: 700; color: var(--color-terracotta); margin-bottom: 12px; }
.team-card p { font-size: 14px; line-height: 1.6; color: var(--color-ink-soft); margin: 0 0 14px; }
.team-since { font-size: 12.5px; color: var(--color-ink-faint); border-top: 1px solid var(--color-border-soft); padding-top: 12px; }

@media (max-width: 960px) {
  .team-inner { grid-template-columns: 1fr; gap: 28px; }
  .team-grid { grid-template-columns: 1fr 1fr; }
  .team-card:nth-child(2) { margin-top: 0; }
}
@media (max-width: 560px) {
  .team { padding-top: 56px; padding-bottom: 56px; }
  .team-grid { grid-template-columns: 1fr; }
}
</style>
