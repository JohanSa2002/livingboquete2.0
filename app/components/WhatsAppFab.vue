<script setup lang="ts">
import { CONTACT_WHATSAPP } from '#shared/utils/constants'

// Floating WhatsApp — the contact channel that actually converts in Panama
// (Casa Solution puts it everywhere). Stays out of the way until the visitor
// has scrolled past the hero, then slides in bottom-right; the label
// collapses to the icon on phones so it doesn't cover content.
const props = withDefaults(defineProps<{ message?: string }>(), { message: '' })
const { lang } = useLocale()

const visible = ref(false)
function onScroll() {
  visible.value = window.scrollY > 480
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const href = computed(() => {
  const text = props.message || (lang.value === 'en'
    ? 'Hi MIKA Homes, I\'m looking at monthly rentals in Boquete and have a question.'
    : 'Hola MIKA Homes, estoy viendo alquileres mensuales en Boquete y tengo una pregunta.')
  return `https://wa.me/${CONTACT_WHATSAPP.number}?text=${encodeURIComponent(text)}`
})
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener"
    class="wa-fab"
    :class="{ 'is-visible': visible }"
    :aria-label="lang === 'en' ? 'Chat on WhatsApp' : 'Escribir por WhatsApp'"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 1.7a8.1 8.1 0 1 1-4.2 15l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 0 1 12 3.9Zm-3.2 4.3c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5 0 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.2-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.5-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.5-.4-.5-.6-.5h-.5Z" />
    </svg>
    <span class="wa-fab-label">{{ lang === 'en' ? 'Ask us on WhatsApp' : 'Escríbenos por WhatsApp' }}</span>
  </a>
</template>

<style scoped>
.wa-fab {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 55;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 18px 12px 14px;
  border-radius: 999px;
  background: #25D366;
  color: #0B2A14;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 16px 34px -12px rgba(11,42,20,.55), inset 0 1px 0 rgba(255,255,255,.35);
  opacity: 0;
  transform: translateY(18px) scale(.96);
  pointer-events: none;
  transition: opacity .3s ease, transform .35s var(--ease-out), box-shadow .2s ease;
}
.wa-fab.is-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.wa-fab:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 22px 40px -14px rgba(11,42,20,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.wa-fab:active { transform: translateY(1px) scale(.98); }

@media (max-width: 640px) {
  .wa-fab { padding: 14px; right: 14px; bottom: 14px; }
  .wa-fab-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
}
@media (prefers-reduced-motion: reduce) {
  .wa-fab { transition: opacity .2s ease; transform: none; }
}
</style>
