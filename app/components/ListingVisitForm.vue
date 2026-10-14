<script setup lang="ts">
import type { Listing } from '#shared/types/content'

// "Schedule a visit" for homes for sale and land: a short inline form that
// lands in the admin as a `visita` lead. Email OR WhatsApp is enough — most
// buyers here answer WhatsApp faster than email.
const props = defineProps<{ listing: Listing }>()
const { lang, t } = useLocale()

const nombre = ref('')
const celular = ref('')
const email = ref('')
const fecha = ref('')
const mensaje = ref('')
const guard = useLeadGuard()
const status = ref<'idle' | 'sending' | 'done' | 'error'>('idle')
const error = ref('')

const today = new Date().toLocaleDateString('en-CA')

async function submit() {
  error.value = ''
  if (!nombre.value.trim()) {
    error.value = lang.value === 'en' ? 'Please tell us your name.' : 'Escribe tu nombre.'
    return
  }
  if (!celular.value.trim() && !email.value.trim()) {
    error.value = lang.value === 'en' ? 'Add a WhatsApp number or an email so we can reply.' : 'Agrega un WhatsApp o un correo para poder responderte.'
    return
  }
  status.value = 'sending'
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        ...guard.fields(),
        type: 'visita',
        nombre: nombre.value.trim(),
        celular: celular.value.trim(),
        email: email.value.trim(),
        move_in: fecha.value,
        mensaje: mensaje.value.trim(),
        rental_id: props.listing.id,
        rental_name: t(props.listing.name),
      },
    })
    status.value = 'done'
  }
  catch {
    status.value = 'error'
    error.value = lang.value === 'en'
      ? 'We couldn\'t send it. Please try again or write to us on WhatsApp.'
      : 'No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.'
  }
}
</script>

<template>
  <div v-if="status === 'done'" class="vf-done" role="status">
    <span class="vf-done-icon"><Icon name="check" :size="20" /></span>
    <p class="vf-done-title">{{ lang === 'en' ? 'Request sent' : 'Solicitud enviada' }}</p>
    <p class="vf-done-text">
      {{ lang === 'en'
        ? 'We\'ll contact you within one business day to confirm the visit.'
        : 'Te contactamos en menos de un día hábil para confirmar la visita.' }}
    </p>
  </div>

  <form v-else class="vf" novalidate @submit.prevent="submit">
    <LeadTrap v-model="guard.trap.value" />
    <label class="vf-field">
      <span>{{ lang === 'en' ? 'Name' : 'Nombre' }}</span>
      <input v-model="nombre" type="text" autocomplete="name" required>
    </label>
    <div class="vf-row">
      <label class="vf-field">
        <span>WhatsApp</span>
        <input v-model="celular" type="tel" autocomplete="tel" placeholder="+507 …">
      </label>
      <label class="vf-field">
        <span>{{ lang === 'en' ? 'Email' : 'Correo' }}</span>
        <input v-model="email" type="email" autocomplete="email">
      </label>
    </div>
    <label class="vf-field">
      <span>{{ lang === 'en' ? 'Preferred date (optional)' : 'Fecha preferida (opcional)' }}</span>
      <input v-model="fecha" type="date" :min="today">
    </label>
    <label class="vf-field">
      <span>{{ lang === 'en' ? 'Questions (optional)' : 'Preguntas (opcional)' }}</span>
      <textarea v-model="mensaje" rows="2" />
    </label>
    <p v-if="error" class="vf-error" role="alert">{{ error }}</p>
    <button type="submit" class="vf-submit" :disabled="status === 'sending'">
      {{ status === 'sending'
        ? (lang === 'en' ? 'Sending…' : 'Enviando…')
        : (lang === 'en' ? 'Schedule a visit' : 'Agendar visita') }}
    </button>
    <p class="vf-note">{{ lang === 'en' ? 'No commitment. No commission for buyers.' : 'Sin compromiso. Sin comisión para el comprador.' }}</p>
  </form>
</template>

<style scoped>
.vf { display: flex; flex-direction: column; gap: 10px; }
.vf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.vf-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.vf-field span { font-size: 12.5px; font-weight: 700; color: var(--color-ink-mid); }
.vf-field input, .vf-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-white);
  font: inherit;
  font-size: 14.5px;
  color: var(--color-ink);
  resize: vertical;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.vf-field input:focus, .vf-field textarea:focus { outline: none; border-color: var(--color-leaf); box-shadow: var(--shadow-focus); }
.vf-error { margin: 0; font-size: 13px; font-weight: 600; color: #b42318; }
.vf-submit {
  margin-top: 4px;
  padding: 13px 18px;
  border: none;
  border-radius: 999px;
  background: var(--kc, var(--color-forest));
  color: var(--color-white);
  font: inherit;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: filter .2s ease, transform .15s var(--ease-out);
}
.vf-submit:hover { filter: brightness(1.12); }
.vf-submit:active { transform: scale(.98); }
.vf-submit:disabled { opacity: .65; cursor: progress; }
.vf-submit:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.vf-note { margin: 0; text-align: center; font-size: 12px; color: var(--color-ink-soft); }

.vf-done { text-align: center; padding: 8px 0; }
.vf-done-icon {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-forest);
  color: var(--color-sand);
  margin-bottom: 10px;
}
.vf-done-title { margin: 0 0 4px; font-family: var(--font-display); font-weight: 800; font-size: 18px; color: var(--color-ink); }
.vf-done-text { margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-ink-soft); }

@media (max-width: 420px) {
  .vf-row { grid-template-columns: 1fr; }
}
</style>
