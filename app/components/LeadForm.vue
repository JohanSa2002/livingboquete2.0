<script setup lang="ts">
// Free-guide lead capture (#contacto on the homepage). Posts to /api/leads
// with type 'guide'; the owner-lead form on /publicar-propiedad is separate.
const { lang, t } = useLocale()

const form = reactive({
  nombre: '',
  email: '',
  celular: '',
  pais: '',
  retiro: '',
  timeline: '',
  interes: '',
})
const guard = useLeadGuard()
const sending = ref(false)
const sent = ref(false)
const error = ref(false)

const RETIRO_OPTS = [
  { value: 'si', es: 'Sí', en: 'Yes' },
  { value: 'talvez', es: 'Tal vez', en: 'Maybe' },
  { value: 'investigando', es: 'Estoy investigando', en: 'I\'m researching' },
]
const TIMELINE_OPTS = [
  { value: '0-6', es: '0–6 meses', en: '0–6 months' },
  { value: '6-12', es: '6–12 meses', en: '6–12 months' },
  { value: '1ano', es: '1 año', en: '1 year' },
  { value: '2anos', es: '2+ años', en: '2+ years' },
]
const INTERES_OPTS = [
  { value: 'retiro', es: 'Retiro', en: 'Retirement' },
  { value: 'estilo', es: 'Estilo de vida', en: 'Lifestyle' },
  { value: 'casa', es: 'Comprar casa', en: 'Buy a home' },
  { value: 'inversiones', es: 'Inversiones', en: 'Investments' },
  { value: 'info', es: 'Información local', en: 'Local info' },
]

const GUIDE_TOPICS = [
  { es: 'Por qué eligen Panamá', en: 'Why people choose Panama' },
  { es: 'Qué hace único a Boquete', en: 'What makes Boquete different' },
  { es: 'Costo de vida', en: 'Cost of living considerations' },
  { es: 'Comprar como extranjero', en: 'Buying as a foreigner' },
  { es: 'Residencia y trámites', en: 'Residency basics' },
  { es: 'Salud y servicios', en: 'Healthcare nearby' },
  { es: 'Preguntas clave antes de comprar', en: 'Questions before buying' },
  { es: 'Checklist para tu visita', en: 'Visit planning checklist' },
]

async function submitLead() {
  sending.value = true
  error.value = false
  try {
    await $fetch('/api/leads', { method: 'POST', body: { ...form, ...guard.fields(), type: 'guide' } })
    sent.value = true
  }
  catch {
    sending.value = false
    error.value = true
  }
}
</script>

<template>
  <section id="contacto" class="grain lead-section">
    <!-- Photo behind a deep forest wash: enough colour for the glass form to
         refract, while the copy on the left keeps a dark, even ground. -->
    <NuxtImg
      src="/lifestyle/casa-completa.webp"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
      densities="x1"
      :quality="55"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      class="lead-photo"
    />
    <div class="lead-wash" aria-hidden="true" />
    <div class="lead-wrap" style="position:relative;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;min-height:600px">
      <!-- Left: Copy -->
      <div style="padding:clamp(40px,5vw,80px) clamp(26px,4vw,64px);display:flex;flex-direction:column;justify-content:center">
        <div class="eyebrow" style="color:var(--color-gold-light);margin-bottom:18px">
          {{ lang === 'en' ? 'Complimentary guide' : 'Guía gratuita' }}
        </div>
        <h2 style="font-family:var(--font-accent);font-weight:700;font-size:clamp(32px,4.2vw,52px);line-height:1.08;letter-spacing:-.01em;margin:0 0 20px;color:var(--color-cream)">
          {{ lang === 'en' ? 'Before you plan the move, get the full picture.' : 'Antes de planear la mudanza, ten el panorama completo.' }}
        </h2>
        <p style="font-size:16px;line-height:1.65;color:rgba(245,240,232,.72);margin:0 0 32px;max-width:440px">
          {{ lang === 'en'
            ? 'Our practical introduction to retiring in Boquete brings the important questions into one calm, readable place.'
            : 'Nuestra guía práctica para retirarse en Boquete reúne las preguntas importantes en un solo lugar, claro y accesible.' }}
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 32px">
          <div
            v-for="(topic, i) in GUIDE_TOPICS"
            :key="i"
            style="display:flex;align-items:baseline;gap:8px;font-size:14.5px;color:var(--color-sand-muted);line-height:1.6"
          >
            <span style="color:var(--color-gold-light);font-size:13px;flex:none">+</span>
            <span>{{ t(topic) }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Form card -->
      <div style="padding:clamp(32px,4vw,60px) clamp(26px,4vw,56px);display:flex;align-items:center">
        <div class="lead-card glass-light">
          <template v-if="!sent">
            <h3 style="font-family:var(--font-display);font-weight:800;font-size:clamp(22px,2.6vw,30px);color:var(--color-ink);margin:0 0 6px">
              {{ lang === 'en' ? 'Send me the free guide' : 'Recibe la guía gratis' }}
            </h3>
            <p style="font-size:14.5px;color:var(--color-ink-soft);margin:0 0 24px;line-height:1.5">
              {{ lang === 'en' ? 'A useful starting point, delivered to your inbox.' : 'Un punto de partida útil, directo a tu correo.' }}
            </p>

            <form style="display:flex;flex-direction:column;gap:16px" @submit.prevent="submitLead">
              <LeadTrap v-model="guard.trap.value" />
              <div>
                <label class="lead-label" for="lead-nombre">{{ lang === 'en' ? 'Full name' : 'Nombre completo' }}</label>
                <input id="lead-nombre" v-model="form.nombre" name="nombre" required class="lead-input">
              </div>

              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <label class="lead-label" for="lead-email">{{ lang === 'en' ? 'Email' : 'Correo' }}</label>
                  <input id="lead-email" v-model="form.email" name="email" type="email" required class="lead-input">
                </div>
                <div>
                  <label class="lead-label" for="lead-celular">{{ lang === 'en' ? 'Phone / WhatsApp' : 'Celular / WhatsApp' }}</label>
                  <input id="lead-celular" v-model="form.celular" name="celular" type="tel" class="lead-input">
                </div>
              </div>

              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <label class="lead-label" for="lead-pais">{{ lang === 'en' ? 'Country' : 'País' }}</label>
                  <input id="lead-pais" v-model="form.pais" name="pais" class="lead-input">
                </div>
                <div>
                  <label class="lead-label" for="lead-retiro">{{ lang === 'en' ? 'Planning to retire?' : '¿Planeas retirarte?' }}</label>
                  <select id="lead-retiro" v-model="form.retiro" name="retiro" required class="lead-select">
                    <option value="" disabled>{{ lang === 'en' ? 'Choose one' : 'Elige una' }}</option>
                    <option v-for="o in RETIRO_OPTS" :key="o.value" :value="o.value">{{ t(o) }}</option>
                  </select>
                </div>
              </div>

              <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <label class="lead-label" for="lead-timeline">{{ lang === 'en' ? 'Timeline' : 'Horizonte de tiempo' }}</label>
                  <select id="lead-timeline" v-model="form.timeline" name="timeline" required class="lead-select">
                    <option value="" disabled>{{ lang === 'en' ? 'Choose one' : 'Elige una' }}</option>
                    <option v-for="o in TIMELINE_OPTS" :key="o.value" :value="o.value">{{ t(o) }}</option>
                  </select>
                </div>
                <div>
                  <label class="lead-label" for="lead-interes">{{ lang === 'en' ? 'Main interest' : 'Interés principal' }}</label>
                  <select id="lead-interes" v-model="form.interes" name="interes" required class="lead-select">
                    <option value="" disabled>{{ lang === 'en' ? 'Choose one' : 'Elige una' }}</option>
                    <option v-for="o in INTERES_OPTS" :key="o.value" :value="o.value">{{ t(o) }}</option>
                  </select>
                </div>
              </div>

              <div v-if="error" class="form-error" role="alert">
                <Icon name="alert" :size="16" />
                <span>{{ lang === 'en' ? 'We couldn’t send your request. Check your connection and try again.' : 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.' }}</span>
              </div>

              <button type="submit" class="btn btn-primary lead-btn" :disabled="sending" :aria-busy="sending">
                {{ sending
                  ? (lang === 'en' ? 'Sending…' : 'Enviando…')
                  : (lang === 'en' ? 'Send me the guide →' : 'Envíame la guía →') }}
              </button>
            </form>

            <p style="text-align:center;font-size:13px;color:var(--color-ink-faint);margin:14px 0 0">
              {{ lang === 'en' ? 'No pressure, no crowded inbox.' : 'Sin presión, sin spam.' }}
            </p>
          </template>

          <!-- Success message -->
          <div v-else style="text-align:center;padding:32px 10px">
            <div style="width:52px;height:52px;border-radius:50%;background:var(--color-moss);color:var(--color-gold-light);display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;margin-bottom:16px">✓</div>
            <h3 style="font-family:var(--font-display);font-weight:800;font-size:24px;color:var(--color-ink);margin:0 0 8px">
              {{ lang === 'en' ? 'Thank you.' : 'Gracias.' }}
            </h3>
            <p style="font-size:15px;color:var(--color-ink-soft);margin:0">
              {{ lang === 'en' ? 'Check your inbox — the guide is on its way.' : 'Revisa tu correo — la guía va en camino.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lead-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--color-forest-dark);
}
.lead-photo {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lead-wash {
  position: absolute;
  inset: 0;
  z-index: -1;
  /* Heavier on the left where the copy sits, lighter behind the form. */
  background: linear-gradient(100deg, rgba(26, 44, 29, .94) 0%, rgba(26, 44, 29, .86) 45%, rgba(26, 44, 29, .52) 100%);
}
.lead-card {
  width: 100%;
  border-radius: var(--radius-lg);
  padding: clamp(28px, 3.4vw, 44px);
  background: rgba(247, 241, 230, .78);
}
@media (max-width: 840px) {
  .lead-wash { background: rgba(26, 44, 29, .86); }
}
.lead-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  margin-bottom: 6px;
}
.lead-input, .lead-select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(37, 29, 20, .16);
  background: rgba(255, 255, 255, .82);
  color: var(--color-ink);
  font-size: 15px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
}
.lead-input:focus, .lead-select:focus { border-color: var(--color-forest); background: var(--color-white); box-shadow: 0 0 0 3px rgba(93,138,90,.22); }
.lead-input::placeholder { color: var(--color-ink-faint); }
.lead-select { appearance: auto; cursor: pointer; }

.lead-btn {
  width: 100%;
  margin-top: 4px;
  font-weight: 800;
  font-size: 16px;
}
.lead-btn:disabled { opacity: .6; cursor: default; transform: none; }

@media (max-width: 840px) {
  .lead-wrap { grid-template-columns: 1fr !important; }
}
@media (max-width: 540px) {
  .form-row { grid-template-columns: 1fr !important; }
}
</style>
