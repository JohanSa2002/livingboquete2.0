<script setup lang="ts">
import type { Rental } from '#shared/types/content'

// 3-step "solicitar información" flow — collects structured details (move-in
// date, duration, occupants, pets) in step 1, contact info in step 2, then
// posts a single lead (type: 'alquiler') from step 3. See server/api/leads and
// /admin/leads for where it lands.
const props = defineProps<{ stay: Rental }>()

const { lang } = useLocale()

const open = ref(false)
const step = ref<1 | 2 | 3 | 'success'>(1)
let lastFocused: HTMLElement | null = null

const moveIn = ref('')
const duracion = ref('')
const personas = ref(props.stay.guests)
const mascotas = ref<boolean | null>(null)
const nombre = ref('')
const email = ref('')
const celular = ref('')
const mensaje = ref('')

const nombreError = ref(false)
const contactError = ref(false)
const emailInvalid = ref(false)
const guard = useLeadGuard()
const sending = ref(false)
const error = ref(false)

const DURATIONS = [
  { v: '1-3', es: '1–3 meses', en: '1–3 months' },
  { v: '3-6', es: '3–6 meses', en: '3–6 months' },
  { v: '6-12', es: '6–12 meses', en: '6–12 months' },
  { v: '12+', es: '12+ meses', en: '12+ months' },
]

function openModal() {
  lastFocused = document.activeElement as HTMLElement | null
  open.value = true
  step.value = 1
  guard.restart()
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  open.value = false
  document.body.style.overflow = ''
  lastFocused?.focus()
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function validateNombre() {
  nombreError.value = nombre.value.trim().length === 0
  return !nombreError.value
}

function validateContact() {
  const e = email.value.trim()
  const c = celular.value.trim()
  emailInvalid.value = e.length > 0 && !isValidEmail(e)
  contactError.value = !((e.length > 0 && isValidEmail(e)) || c.length > 0)
  return !contactError.value
}

let messageAutoFilled = false
function autoComposeMessage() {
  if (messageAutoFilled || mensaje.value.trim().length > 0) return
  const parts = [`Hola ${props.stay.host.name}, me interesa ${props.stay.name.es}.`]
  if (moveIn.value) parts.push(`Mudanza estimada: ${moveIn.value}.`)
  if (duracion.value) parts.push(`Duración buscada: ${duracion.value} meses.`)
  if (personas.value) parts.push(`Somos ${personas.value}.`)
  if (mascotas.value === true) parts.push('Viajamos con mascota.')
  mensaje.value = parts.join(' ')
  messageAutoFilled = true
}

const summary = computed(() => [
  { label: { es: 'Propiedad', en: 'Property' }, value: props.stay.name.es },
  { label: { es: 'Fecha de entrada', en: 'Move-in' }, value: moveIn.value || 'Flexible' },
  { label: { es: 'Duración', en: 'Duration' }, value: duracion.value ? `${duracion.value} meses` : (lang.value === 'en' ? 'Any' : 'Cualquiera') },
  { label: { es: 'Personas', en: 'Occupants' }, value: String(personas.value) },
  { label: { es: 'Mascotas', en: 'Pets' }, value: mascotas.value === true ? 'Sí' : mascotas.value === false ? 'No' : '—' },
])

function goToStep2() {
  autoComposeMessage()
  step.value = 2
}

function goToStep3() {
  const validName = validateNombre()
  const validContact = validateContact()
  if (!validName || !validContact) return
  step.value = 3
}

async function submit() {
  sending.value = true
  error.value = false
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        ...guard.fields(),
        type: 'alquiler',
        nombre: nombre.value.trim(),
        email: email.value.trim() || null,
        celular: celular.value.trim() || null,
        mensaje: mensaje.value.trim() || null,
        rental_id: props.stay.id,
        rental_name: props.stay.name.es,
        move_in: moveIn.value || null,
        duracion: duracion.value || null,
        personas: Number(personas.value),
        mascotas: mascotas.value,
      },
    })
    step.value = 'success'
  }
  catch {
    error.value = true
  }
  finally {
    sending.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) closeModal()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

defineExpose({ openModal })
</script>

<template>
  <div v-if="open" class="request-backdrop" @click.self="closeModal">
    <div class="request-modal" role="dialog" aria-modal="true" aria-labelledby="request-title">
      <button type="button" class="request-close" aria-label="Cerrar" @click="closeModal">
        <Icon name="close" :size="18" />
      </button>

      <div class="request-dots" aria-hidden="true">
        <span class="request-dot" :class="{ 'is-active': step === 1 }" />
        <span class="request-dot" :class="{ 'is-active': step === 2 }" />
        <span class="request-dot" :class="{ 'is-active': step === 3 }" />
      </div>

      <!-- Step 1: move -->
      <div v-if="step === 1" class="request-step">
        <h3 id="request-title">{{ lang === 'en' ? 'Your move' : 'Tu mudanza' }}</h3>
        <div class="f-group">
          <label for="req-move-in">{{ lang === 'en' ? 'Move-in date' : 'Fecha de entrada' }}</label>
          <input id="req-move-in" v-model="moveIn" type="date" class="f-input">
        </div>
        <div class="f-group">
          <span class="f-label-text">{{ lang === 'en' ? 'Minimum stay' : 'Duración mínima' }}</span>
          <div role="group" aria-label="Duración mínima" class="f-chip-row">
            <button
              v-for="d in DURATIONS"
              :key="d.v"
              type="button"
              class="chip"
              :class="{ 'is-active': duracion === d.v }"
              @click="duracion = d.v"
            >
              {{ lang === 'en' ? d.en : d.es }}
            </button>
          </div>
        </div>
        <div class="f-group">
          <label for="req-personas">{{ lang === 'en' ? 'Occupants' : 'Personas' }}</label>
          <select id="req-personas" v-model.number="personas" class="f-input">
            <option v-for="n in 8" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div class="f-group">
          <span class="f-label-text">{{ lang === 'en' ? 'Traveling with a pet?' : '¿Viajas con mascota?' }}</span>
          <div role="group" aria-label="Mascotas" class="f-chip-row">
            <button type="button" class="chip" :class="{ 'is-active': mascotas === true }" @click="mascotas = true">
              {{ lang === 'en' ? 'Yes' : 'Sí' }}
            </button>
            <button type="button" class="chip" :class="{ 'is-active': mascotas === false }" @click="mascotas = false">
              No
            </button>
          </div>
        </div>
        <button type="button" class="btn btn-primary" style="width:100%;justify-content:center" @click="goToStep2">
          {{ lang === 'en' ? 'Next' : 'Siguiente' }}
          <Icon name="chevron-right" :size="16" />
        </button>
      </div>

      <!-- Step 2: about you -->
      <div v-else-if="step === 2" class="request-step">
        <h3>{{ lang === 'en' ? 'About you' : 'Sobre ti' }}</h3>
        <LeadTrap v-model="guard.trap.value" />
        <div class="f-group">
          <label for="req-nombre">{{ lang === 'en' ? 'Full name' : 'Nombre completo' }}</label>
          <input
            id="req-nombre"
            v-model="nombre"
            class="f-input"
            :aria-invalid="nombreError"
            aria-describedby="req-nombre-error"
            @blur="validateNombre"
          >
          <span v-show="nombreError" id="req-nombre-error" class="f-error" role="alert">
            {{ lang === 'en' ? 'Enter your name' : 'Ingresa tu nombre' }}
          </span>
        </div>
        <div class="f-group">
          <label for="req-email">{{ lang === 'en' ? 'Email' : 'Correo' }}</label>
          <input
            id="req-email"
            v-model="email"
            type="email"
            class="f-input"
            :aria-invalid="emailInvalid"
            aria-describedby="req-contact-error"
            @blur="validateContact"
          >
        </div>
        <div class="f-group">
          <label for="req-celular">{{ lang === 'en' ? 'Or WhatsApp' : 'O WhatsApp' }}</label>
          <input
            id="req-celular"
            v-model="celular"
            type="tel"
            class="f-input"
            :aria-invalid="contactError"
            aria-describedby="req-contact-error"
            @blur="validateContact"
          >
          <span v-show="contactError" id="req-contact-error" class="f-error" role="alert">
            {{ lang === 'en'
              ? 'Enter a valid email or a WhatsApp number — either one works'
              : 'Ingresa un correo válido o un WhatsApp — con uno basta' }}
          </span>
        </div>
        <div class="f-group">
          <label for="req-mensaje">{{ lang === 'en' ? 'Message (optional)' : 'Mensaje (opcional)' }}</label>
          <textarea id="req-mensaje" v-model="mensaje" rows="3" class="f-input f-textarea" />
        </div>
        <div style="display:flex;gap:10px">
          <button type="button" class="btn btn-ghost" @click="step = 1">{{ lang === 'en' ? 'Back' : 'Atrás' }}</button>
          <button type="button" class="btn btn-primary" style="flex:1;justify-content:center" @click="goToStep3">
            {{ lang === 'en' ? 'Review' : 'Revisar' }}
            <Icon name="chevron-right" :size="16" />
          </button>
        </div>
      </div>

      <!-- Step 3: confirm -->
      <div v-else-if="step === 3" class="request-step">
        <h3>{{ lang === 'en' ? 'Confirm request' : 'Confirmar solicitud' }}</h3>
        <div class="req-summary">
          <div v-for="(row, i) in summary" :key="i" class="req-summary-row">
            <span>{{ lang === 'en' ? row.label.en : row.label.es }}</span>
            <b>{{ row.value }}</b>
          </div>
        </div>
        <p style="font-size:12.5px;color:var(--color-ink-faint);margin:14px 0 16px">
          {{ lang === 'en'
            ? `${stay.host.name} usually replies within 24 hours.`
            : `${stay.host.name} suele responder en menos de 24 horas.` }}
        </p>
        <div v-if="error" class="form-error" role="alert" style="margin-bottom:14px;text-align:left">
          <Icon name="alert" :size="16" />
          <span>{{ lang === 'en' ? 'We couldn’t send your request. Check your connection and try again.' : 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.' }}</span>
        </div>
        <div style="display:flex;gap:10px">
          <button type="button" class="btn btn-ghost" @click="step = 2">{{ lang === 'en' ? 'Back' : 'Atrás' }}</button>
          <button
            type="button"
            class="btn btn-primary"
            style="flex:1;justify-content:center"
            :disabled="sending"
            :aria-busy="sending"
            @click="submit"
          >
            {{ sending
              ? (lang === 'en' ? 'Sending…' : 'Enviando…')
              : (lang === 'en' ? 'Send request' : 'Enviar solicitud') }}
          </button>
        </div>
      </div>

      <!-- Success -->
      <div v-else class="request-step">
        <div class="req-success-icon"><Icon name="check" :size="22" /></div>
        <h3>{{ lang === 'en' ? 'Request sent.' : 'Solicitud enviada.' }}</h3>
        <p>
          {{ lang === 'en'
            ? `We let ${stay.host.name} know. They should reply by the email or WhatsApp you left within 24 hours.`
            : `Le avisamos a ${stay.host.name}. Debería responderte por el correo o WhatsApp que dejaste en menos de 24 horas.` }}
        </p>
        <button type="button" class="btn btn-primary" style="width:100%;justify-content:center" @click="closeModal">
          {{ lang === 'en' ? 'Close' : 'Cerrar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-backdrop {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(20,15,10,.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.request-modal {
  position: relative;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px;
  padding: 30px 26px 26px;
  box-shadow: 0 30px 70px -20px rgba(0,0,0,.4);
}
.request-close {
  position: absolute;
  top: 16px; right: 16px;
  border: none;
  background: transparent;
  color: var(--color-ink-faint);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.request-close:hover { background: rgba(37,29,20,.06); }
.request-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 22px; }
.request-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  transition: background-color .2s ease, transform .2s ease;
}
.request-dot.is-active { background: var(--color-forest); transform: scale(1.25); }
.request-step h3 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 21px;
  color: var(--color-ink);
  margin: 0 0 18px;
  text-align: center;
}
.req-success-icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--color-moss);
  color: var(--color-gold-light);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px;
}
.request-step p {
  text-align: center;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--color-ink-soft);
  margin: 0 0 20px;
}

.f-group { margin-bottom: 16px; }
.f-group label, .f-label-text {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  margin-bottom: 7px;
}
.f-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 13px;
  border-radius: 9px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-ink);
  font-size: 14.5px;
  font-family: inherit;
  outline: none;
  transition: border-color .16s ease;
}
.f-input:focus { border-color: var(--color-wood); }
.f-input[aria-invalid="true"] { border-color: #C0392B; }
.f-textarea { resize: vertical; }
.f-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.f-error {
  display: block;
  font-size: 12.5px;
  color: #C0392B;
  margin-top: 6px;
}
.req-summary { display: flex; flex-direction: column; gap: 9px; font-size: 14px; color: var(--color-ink-mid); }
.req-summary-row { display: flex; justify-content: space-between; gap: 12px; }
.req-summary-row b { color: var(--color-ink); text-align: right; }

@media (prefers-reduced-motion: reduce) {
  .request-dot { transition: none; }
}
</style>
