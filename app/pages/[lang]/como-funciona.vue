<script setup lang="ts">
const { lang, localePath, t } = useLocale()

usePageSeo({
  title: 'Cómo funciona · MIKA Homes',
  titleEn: 'How it works · MIKA Homes',
  description: 'Cómo funciona el alquiler mensual en MIKA Homes: qué pasa después de contactar a un anfitrión, quién gestiona el contrato y el depósito, y qué cubre la verificación de propiedades.',
  descriptionEn: 'How monthly rentals work on MIKA Homes: what happens after contacting a host, who handles the contract and deposit, and what property verification actually covers.',
})

const FAQ = [
  {
    q: { es: '¿Qué pasa después de que contacto a un anfitrión?', en: 'What happens after I contact a host?' },
    a: {
      es: 'Tu mensaje llega directo al anfitrión por WhatsApp, teléfono o correo — no hay intermediarios ni cola de aprobación. La mayoría responde en menos de 24 horas. Desde ahí, ustedes dos coordinan directamente: fecha de visita o videollamada, condiciones, y siguientes pasos.',
      en: 'Your message goes straight to the host over WhatsApp, phone or email — no middleman, no approval queue. Most hosts reply within 24 hours. From there, the two of you coordinate directly: a visit or video call, terms, and next steps.',
    },
  },
  {
    q: { es: '¿Quién redacta el contrato de alquiler?', en: 'Who drafts the rental contract?' },
    a: {
      es: 'MIKA Homes no gestiona contratos ni pagos — eso se acuerda directamente entre tú y el anfitrión, como con cualquier alquiler directo en Panamá. Te recomendamos dejar por escrito precio, depósito, duración mínima y qué incluye el alquiler antes de mudarte.',
      en: 'MIKA Homes doesn\'t manage contracts or payments — that\'s arranged directly between you and the host, as with any direct rental in Panama. We recommend putting price, deposit, minimum stay and what\'s included in writing before you move in.',
    },
  },
  {
    q: { es: '¿Cómo se paga el depósito?', en: 'How is the deposit paid?' },
    a: {
      es: 'Directamente al anfitrión, de la forma que acuerden entre ustedes. No procesamos pagos ni depósitos en la plataforma — por eso es clave conversar el método y las condiciones de reembolso antes de comprometerte.',
      en: 'Directly to the host, in whatever way you both agree on. We don\'t process payments or deposits on the platform — which is exactly why it matters to talk through the method and refund terms before you commit.',
    },
  },
  {
    q: { es: '¿Qué pasa si la propiedad no es como en las fotos?', en: 'What if the property isn\'t like the photos?' },
    a: {
      es: 'Las propiedades marcadas "Verificada" fueron visitadas en persona por nuestro equipo, lo que reduce bastante el riesgo — pero no eliminamos la necesidad de que confirmes los detalles tú mismo. Antes de comprometerte, pide una videollamada o visita en persona si puedes. Como el contrato y el pago son directos con el anfitrión, no ofrecemos un reembolso gestionado por MIKA Homes.',
      en: 'Properties marked "Verified" were visited in person by our team, which meaningfully lowers the risk — but it doesn\'t replace confirming the details yourself. Ask for a video call or an in-person visit before committing, if you can. Since the contract and payment are direct with the host, we don\'t offer a MIKA Homes-managed refund.',
    },
  },
  {
    q: { es: '¿MIKA Homes cobra comisión?', en: 'Does MIKA Homes charge a commission?' },
    a: {
      es: 'No. Buscar y contactar anfitriones en MIKA Homes es gratis, sin cuentas y sin comisión para quien busca alquilar.',
      en: 'No. Searching and contacting hosts on MIKA Homes is free, with no account and no commission for renters.',
    },
  },
]

const STEPS = [
  {
    h: { es: 'Explora y elige', en: 'Browse and pick' },
    p: {
      es: 'Fotos reales, precio mensual claro, y el badge "Verificada" cuando nuestro equipo visitó la propiedad en persona. Sin crear cuenta.',
      en: 'Real photos, a clear monthly price, and the "Verified" badge when our team visited the property in person. No account needed.',
    },
  },
  {
    h: { es: 'Contacta al anfitrión directamente', en: 'Contact the host directly' },
    p: {
      es: 'Por WhatsApp, teléfono o correo — el mensaje te lo mandamos a ti mismo hacia el anfitrión, no pasa por nosotros. Coordinan fecha de mudanza, visita o videollamada, y condiciones.',
      en: 'Over WhatsApp, phone or email — the message goes straight from you to the host, not through us. You coordinate move-in date, a visit or video call, and terms.',
    },
  },
  {
    h: { es: 'Acuerdan el contrato y el depósito entre ustedes', en: 'You agree on the contract and deposit together' },
    p: {
      es: 'MIKA Homes no redacta contratos ni procesa pagos. Recomendamos dejar todo por escrito — precio, depósito, duración mínima, qué incluye — antes de mudarte.',
      en: 'MIKA Homes doesn\'t draft contracts or process payments. We recommend getting everything in writing — price, deposit, minimum stay, what\'s included — before you move in.',
    },
  },
]
</script>

<template>
  <div>
    <section class="how-hero">
      <div class="pad-sec how-hero-inner">
        <div class="eyebrow rv" style="color:var(--color-gold-light);margin-bottom:14px">
          {{ lang === 'en' ? 'Transparency' : 'Transparencia' }}
        </div>
        <h1 class="how-h1 rv">
          <template v-if="lang === 'en'">How MIKA Homes <em>works.</em></template>
          <template v-else>Cómo funciona <em>MIKA Homes.</em></template>
        </h1>
        <p class="how-sub rv" style="animation-delay:.1s">
          {{ lang === 'en'
            ? 'We\'re a meeting point between renters and hosts in Boquete — not a contract or payment service. Here\'s exactly how each step works, no fine print.'
            : 'Somos un punto de encuentro entre inquilinos y anfitriones en Boquete — no un servicio de contratos ni de pagos. Así es como funciona cada paso, sin letra pequeña.' }}
        </p>
      </div>
    </section>

    <section class="pad-sec" style="max-width:820px;margin:0 auto;padding:64px 26px">
      <div class="how-steps">
        <div
          v-for="(step, i) in STEPS"
          :key="i"
          class="how-step rv"
          :style="i > 0 ? `animation-delay:${(i * 0.08).toFixed(2)}s` : undefined"
        >
          <div class="how-step-n">{{ i + 1 }}</div>
          <div>
            <h3>{{ t(step.h) }}</h3>
            <p>{{ t(step.p) }}</p>
          </div>
        </div>
      </div>
    </section>

    <TeamSection />

    <section class="how-faq-section">
      <div class="pad-sec" style="max-width:820px;margin:0 auto;padding:64px 26px 88px">
        <h2 class="how-h2 rv" style="margin-bottom:32px">
          {{ lang === 'en' ? 'Frequently asked' : 'Preguntas frecuentes' }}
        </h2>
        <div class="how-faq-list">
          <details
            v-for="(item, i) in FAQ"
            :key="i"
            class="how-faq-item rv"
            :style="`animation-delay:${(i * 0.05).toFixed(2)}s`"
          >
            <summary>
              {{ t(item.q) }}
              <Icon name="chevron-right" :size="16" class="how-faq-chevron" />
            </summary>
            <p>{{ t(item.a) }}</p>
          </details>
        </div>

        <div class="how-cta rv">
          <NuxtLink :to="`${localePath('/propiedades')}?tipo=alquiler`" class="btn btn-primary">
            <Icon name="search" :size="17" />
            {{ lang === 'en' ? 'Browse rentals' : 'Explorar alquileres' }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.how-hero {
  background: radial-gradient(120% 160% at 88% -10%, rgba(162,106,66,.28) 0%, transparent 55%), var(--color-forest);
}
.how-hero-inner {
  max-width: 720px;
  margin: 0 auto;
  padding-top: 140px;
  padding-bottom: 64px;
}
.how-h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(34px, 4.6vw, 52px);
  line-height: 1.06;
  letter-spacing: -.02em;
  color: var(--color-sand);
  margin: 0 0 16px;
  text-wrap: balance;
}
.how-h1 em {
  font-family: var(--font-accent);
  font-weight: 500;
  font-style: italic;
  color: var(--color-gold-pale);
}
.how-sub {
  font-size: 16.5px;
  line-height: 1.65;
  color: rgba(245,240,232,.82);
  max-width: 560px;
  margin: 0;
}

.how-h2 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 28px;
  letter-spacing: -.015em;
  color: var(--color-ink);
  margin: 0;
}

.how-steps { display: flex; flex-direction: column; gap: 32px; }
.how-step { display: grid; grid-template-columns: 44px 1fr; gap: 18px; align-items: start; }
.how-step-n {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: var(--color-sand-deep);
  color: var(--color-forest);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}
.how-step h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  color: var(--color-ink);
  margin: 6px 0 8px;
}
.how-step p {
  font-size: 15px;
  line-height: 1.65;
  color: var(--color-ink-soft);
  margin: 0;
}

.how-faq-section { background: var(--color-sand-deep); }
.how-faq-list { display: flex; flex-direction: column; gap: 10px; }
.how-faq-item {
  background: #fff;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  padding: 4px 20px;
}
.how-faq-item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 0;
  cursor: pointer;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15.5px;
  color: var(--color-ink);
  list-style: none;
}
.how-faq-item summary::-webkit-details-marker { display: none; }
.how-faq-chevron { flex: none; color: var(--color-ink-faint); transition: transform .2s var(--ease-out); }
.how-faq-item[open] .how-faq-chevron { transform: rotate(90deg); }
.how-faq-item p {
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--color-ink-soft);
  margin: 0 0 18px;
}
.how-faq-item summary:focus-visible {
  outline: 2px solid var(--color-forest);
  outline-offset: 2px;
  border-radius: 6px;
}

.how-cta { text-align: center; margin-top: 44px; }
</style>
