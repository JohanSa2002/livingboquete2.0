<script setup lang="ts">
import { TYPE_LABELS } from '#shared/utils/constants'

const { lang, t } = useLocale()

usePageSeo({
  title: 'Publica tu propiedad · MIKA Homes',
  titleEn: 'List your property · MIKA Homes',
  description: 'Publica tu casa, apartamento o habitación en alquiler en Boquete. Cuéntanos sobre tu propiedad y te contactamos.',
  descriptionEn: 'List your house, apartment or room for rent in Boquete. Tell us about your property and we\'ll reach out.',
})

const form = reactive({
  nombre: '',
  email: '',
  celular: '',
  tipo_propiedad: '',
  ubicacion: '',
  mensaje: '',
})

const guard = useLeadGuard()
const sending = ref(false)
const sent = ref(false)
const error = ref(false)

async function submit() {
  sending.value = true
  error.value = false
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: { ...form, ...guard.fields(), type: 'propietario' },
    })
    sent.value = true
  }
  catch {
    sending.value = false
    error.value = true
  }
}
</script>

<template>
  <section class="owner-hero">
    <div class="pad-sec owner-hero-inner">
      <div class="eyebrow rv" style="color:var(--color-gold-light);margin-bottom:14px">
        {{ lang === 'en' ? 'For owners' : 'Para propietarios' }}
      </div>
      <h1 class="owner-h1 rv">
        <template v-if="lang === 'en'">List your property <em>in Boquete.</em></template>
        <template v-else>Publica tu propiedad <em>en Boquete.</em></template>
      </h1>
      <p class="owner-sub rv" style="animation-delay:.1s">
        {{ lang === 'en'
          ? 'Tell us about your house, apartment or room. A member of our team reviews every request and reaches out to talk through the details.'
          : 'Cuéntanos sobre tu casa, apartamento o habitación. Un miembro de nuestro equipo revisa cada solicitud y te contacta para conversar los detalles.' }}
      </p>

      <div class="owner-card rv" style="animation-delay:.18s">
        <div v-if="!sent">
          <form id="owner-form" @submit.prevent="submit">
            <LeadTrap v-model="guard.trap.value" />
            <div>
              <label class="lead-label" for="owner-nombre">
                {{ lang === 'en' ? 'Full name' : 'Nombre completo' }}
              </label>
              <input id="owner-nombre" v-model="form.nombre" name="nombre" required class="lead-input">
            </div>

            <div class="form-row">
              <div>
                <label class="lead-label" for="owner-email">
                  {{ lang === 'en' ? 'Email' : 'Correo' }}
                </label>
                <input id="owner-email" v-model="form.email" name="email" type="email" required class="lead-input">
              </div>
              <div>
                <label class="lead-label" for="owner-celular">
                  {{ lang === 'en' ? 'Phone / WhatsApp' : 'Celular / WhatsApp' }}
                </label>
                <input id="owner-celular" v-model="form.celular" name="celular" type="tel" class="lead-input">
              </div>
            </div>

            <div class="form-row">
              <div>
                <label class="lead-label" for="owner-tipo">
                  {{ lang === 'en' ? 'Property type' : 'Tipo de propiedad' }}
                </label>
                <select id="owner-tipo" v-model="form.tipo_propiedad" name="tipo_propiedad" required class="lead-select">
                  <option value="" disabled>{{ lang === 'en' ? 'Choose one' : 'Elige una' }}</option>
                  <option v-for="(label, key) in TYPE_LABELS" :key="key" :value="key">
                    {{ t(label) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="lead-label" for="owner-ubicacion">
                  {{ lang === 'en' ? 'Location' : 'Ubicación' }}
                </label>
                <input id="owner-ubicacion" v-model="form.ubicacion" name="ubicacion" class="lead-input" placeholder="Ej. Alto Boquete">
              </div>
            </div>

            <div>
              <label class="lead-label" for="owner-mensaje">
                {{ lang === 'en' ? 'Tell us about your property' : 'Cuéntanos sobre tu propiedad' }}
              </label>
              <textarea
                id="owner-mensaje"
                v-model="form.mensaje"
                name="mensaje"
                rows="4"
                class="lead-input lead-textarea"
                placeholder="Habitaciones, baños, precio esperado, disponibilidad..."
              />
            </div>

            <div v-if="error" class="form-error" role="alert">
              <Icon name="alert" :size="16" />
              <span>{{ lang === 'en' ? 'We couldn’t send your request. Check your connection and try again.' : 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.' }}</span>
            </div>
            <button type="submit" class="lead-btn" :disabled="sending" :aria-busy="sending">
              {{ sending
                ? (lang === 'en' ? 'Sending…' : 'Enviando…')
                : (lang === 'en' ? 'Send request' : 'Enviar solicitud') }}
              <Icon v-if="!sending" name="chevron-right" :size="16" />
            </button>
          </form>

          <p class="owner-disclaimer">
            {{ lang === 'en' ? 'No commitment. We\'ll reach out to learn more.' : 'Sin compromiso. Te contactamos para conocer más detalles.' }}
          </p>
        </div>

        <div v-else class="owner-success">
          <div class="owner-success-icon">
            <Icon name="check" :size="24" />
          </div>
          <h3>{{ lang === 'en' ? 'Thank you.' : 'Gracias.' }}</h3>
          <p>
            {{ lang === 'en'
              ? 'We received your request. Our team will reach out soon to talk through your property\'s details.'
              : 'Recibimos tu solicitud. Nuestro equipo te contactará pronto para conversar los detalles de tu propiedad.' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.owner-hero {
  background: var(--color-forest);
  background: radial-gradient(120% 160% at 88% -10%, rgba(162,106,66,.28) 0%, transparent 55%), var(--color-forest);
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.owner-hero-inner {
  max-width: 720px;
  margin: 0 auto;
  padding-top: 140px;
  padding-bottom: 80px;
  width: 100%;
}
.owner-h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(34px, 4.6vw, 52px);
  line-height: 1.06;
  letter-spacing: -.02em;
  color: var(--color-sand);
  margin: 0 0 16px;
  text-wrap: balance;
}
.owner-h1 em {
  font-family: var(--font-accent);
  font-weight: 500;
  font-style: italic;
  color: var(--color-gold-pale);
}
.owner-sub {
  font-size: 16.5px;
  line-height: 1.65;
  color: rgba(245,240,232,.82);
  max-width: 520px;
  margin: 0 0 40px;
}

.owner-card {
  background: var(--color-sand);
  border-radius: 22px;
  padding: clamp(28px,3.4vw,44px);
  box-shadow: 0 30px 60px -20px rgba(0,0,0,.35);
}

#owner-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

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
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-ink);
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.lead-textarea { resize: vertical; font-family: inherit; }
.lead-input:focus, .lead-select:focus, .lead-textarea:focus { border-color: var(--color-forest); box-shadow: 0 0 0 3px rgba(93,138,90,.22); }
.lead-input::placeholder { color: var(--color-ink-faint); }
.lead-select { appearance: auto; cursor: pointer; }

.lead-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
  padding: 15px 24px;
  background: var(--color-forest);
  color: var(--color-sand);
  font-weight: 800;
  font-size: 16px;
  font-family: inherit;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color .2s, transform .2s;
}
.lead-btn:hover { background: var(--color-forest-dark); transform: translateY(-1px); }
.lead-btn:disabled { opacity: .6; cursor: default; transform: none; }

.owner-disclaimer {
  text-align: center;
  font-size: 13px;
  color: var(--color-ink-faint);
  margin: 14px 0 0;
}

.owner-success { text-align: center; padding: 20px 10px; }
.owner-success-icon {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: var(--color-forest);
  color: var(--color-gold-pale);
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.owner-success h3 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 24px;
  color: var(--color-ink);
  margin: 0 0 8px;
}
.owner-success p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-ink-soft);
  margin: 0;
}

@media (max-width: 560px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
