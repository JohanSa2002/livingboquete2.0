<script setup lang="ts">
import type { EventItem, Place } from '#shared/types/content'

// GSAP is only needed once a card is clicked, so it stays out of the page's
// initial load. It's warmed on the visitor's first pointerdown/keydown (which
// lands ~100ms before the click that opens the modal) — never during page
// load, where it would compete with the hero for bandwidth.
let gsapMod: Promise<typeof import('gsap')['gsap']> | null = null
const loadGsap = () => (gsapMod ??= import('gsap').then(m => m.gsap))
const warmGsap = () => { void loadGsap() }

// Card -> detail modal: expands the clicked place/event card in place.
type Item = Place | EventItem
type Kind = 'place' | 'event'

const { lang, t, tList } = useLocale()
const { $lenis } = useNuxtApp()

const backdrop = ref<HTMLElement | null>(null)
const modal = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLElement | null>(null)
const bodyContent = ref<HTMLElement | null>(null)

const visible = ref(false)
const isOpen = ref(false)
const item = ref<Item | null>(null)
const kind = ref<Kind>('place')
let originEl: HTMLElement | null = null

const asPlace = computed(() => (kind.value === 'place' ? item.value as Place : null))
const asEvent = computed(() => (kind.value === 'event' ? item.value as EventItem : null))

const description = computed(() => {
  if (!item.value) return ''
  return kind.value === 'place' ? t((item.value as Place).long) : t((item.value as EventItem).desc)
})

const metaRows = computed(() => {
  if (!item.value) return []
  if (kind.value === 'place') {
    const p = item.value as Place
    return [
      { label: lang.value === 'en' ? 'Hours' : 'Horario', value: t(p.hours) },
      { label: lang.value === 'en' ? 'Cost' : 'Costo', value: t(p.cost) },
    ]
  }
  const e = item.value as EventItem
  return [
    { label: lang.value === 'en' ? 'Category' : 'Categoría', value: t(e.cat) },
    { label: lang.value === 'en' ? 'Date' : 'Fecha', value: t(e.range) },
    { label: lang.value === 'en' ? 'Time' : 'Horario', value: t(e.time) },
    { label: lang.value === 'en' ? 'Place' : 'Lugar', value: t(e.place) },
  ]
})

const tips = computed(() => (asPlace.value ? tList(asPlace.value.tips) : []))

async function open(source: HTMLElement, next: Item, type: Kind) {
  if (isOpen.value) return

  // Measured before the modal's content renders — reading layout right after a
  // DOM mutation forces a synchronous reflow, so the read goes first.
  const rect = source.getBoundingClientRect()

  isOpen.value = true
  const gsapP = loadGsap()
  originEl = source
  item.value = next
  kind.value = type
  visible.value = true

  document.body.style.overflow = 'hidden'
  // Lenis drives scroll itself and ignores the native overflow lock above, so
  // the background page keeps scrolling under the modal unless paused.
  $lenis?.stop()

  const [gsap] = await Promise.all([gsapP, nextTick()])
  if (!modal.value || !backdrop.value || !bodyContent.value) return

  gsap.set(modal.value, {
    position: 'fixed', top: rect.top, left: rect.left,
    width: rect.width, height: rect.height, borderRadius: 14, opacity: 1,
  })
  gsap.set(backdrop.value, { opacity: 0 })
  gsap.set(bodyContent.value, { opacity: 0, y: 12 })

  const vw = window.innerWidth
  const vh = window.innerHeight
  const targetW = Math.min(vw * 0.92, 760)
  const targetH = Math.min(vh * 0.86, 640)

  gsap.timeline()
    .to(backdrop.value, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0)
    .to(modal.value, {
      top: (vh - targetH) / 2,
      left: (vw - targetW) / 2,
      width: targetW,
      height: targetH,
      borderRadius: 22,
      duration: 0.55,
      ease: 'power3.inOut',
    }, 0)
    .to(bodyContent.value, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.28)

  closeBtn.value?.focus()
}

async function close() {
  if (!isOpen.value || !modal.value || !backdrop.value || !bodyContent.value) return
  const gsap = await loadGsap()

  const rect = originEl ? originEl.getBoundingClientRect() : null

  const tl = gsap.timeline({
    onComplete: () => {
      visible.value = false
      document.body.style.overflow = ''
      $lenis?.start()
      isOpen.value = false
      originEl?.focus()
      originEl = null
    },
  })
  tl.to(bodyContent.value, { opacity: 0, y: 8, duration: 0.15 }, 0)
  if (rect) {
    tl.to(modal.value, {
      top: rect.top, left: rect.left, width: rect.width, height: rect.height,
      borderRadius: 14, duration: 0.45, ease: 'power3.inOut',
    }, 0.05)
  }
  else {
    tl.to(modal.value, { opacity: 0, scale: 0.92, duration: 0.3 }, 0.05)
  }
  tl.to(backdrop.value, { opacity: 0, duration: 0.3 }, 0.2)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', warmGsap, { once: true, passive: true })
  document.addEventListener('keydown', warmGsap, { once: true, passive: true })
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', warmGsap)
  document.removeEventListener('keydown', warmGsap)
  document.body.style.overflow = ''
})

defineExpose({ open })
</script>

<template>
  <div v-show="visible" ref="backdrop" class="detail-backdrop" @click.self="close">
    <div ref="modal" class="detail-modal" role="dialog" aria-modal="true">
      <button ref="closeBtn" class="detail-close" type="button" aria-label="Cerrar" @click="close">&times;</button>
      <div class="detail-media">
        <img :src="item?.img" :alt="item?.name.es">
        <span v-if="asPlace" class="detail-badge">{{ t(asPlace.cat) }}</span>
        <div v-if="asEvent" class="detail-date-badge">
          <span class="detail-date-d">{{ asEvent.d }}</span>
          <span class="detail-date-m">{{ t(asEvent.m) }}</span>
        </div>
      </div>
      <!-- data-lenis-prevent: Lenis's own wheel handler still preventDefaults
           everything while stopped (see open() above), so without this
           attribute the modal's internal scroll would be frozen along with the
           background. Lenis special-cases it to fall back to native scrolling
           for the element, stopped or not. -->
      <div ref="bodyContent" class="detail-body-content" data-lenis-prevent>
        <h3 class="detail-title">{{ item ? t(item.name) : '' }}</h3>
        <p class="detail-desc">{{ description }}</p>
        <div class="detail-meta">
          <div v-for="row in metaRows" :key="row.label" class="detail-meta-row">
            <span class="detail-meta-label">{{ row.label }}</span>
            <span class="detail-meta-value">{{ row.value }}</span>
          </div>
        </div>
        <div v-if="tips.length" class="detail-tips">
          <div class="detail-tips-label">{{ lang === 'en' ? 'Tips' : 'Consejos' }}</div>
          <ul class="detail-tips-list">
            <li v-for="(tip, i) in tips" :key="i">{{ tip }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(20,28,18,.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.detail-modal {
  background: var(--color-cream);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 40px 80px -20px rgba(0,0,0,.45);
}

.detail-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(20,28,18,.55);
  backdrop-filter: blur(4px);
  color: var(--color-cream);
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s;
}
.detail-close:hover { background: rgba(20,28,18,.75); }

.detail-media {
  position: relative;
  flex: 0 0 42%;
  min-height: 160px;
  overflow: hidden;
}
.detail-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(20,28,18,.62);
  backdrop-filter: blur(4px);
  color: var(--color-cream);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .04em;
  padding: 6px 12px;
  border-radius: 999px;
}
.detail-date-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background: var(--color-cream);
  border-radius: 13px;
  text-align: center;
  padding: 9px 13px;
  line-height: 1;
}
.detail-date-d { display: block; font-family: var(--font-display); font-weight: 800; font-size: 24px; color: var(--color-terracotta); }
.detail-date-m { display: block; font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--color-ink-soft); margin-top: 2px; }

.detail-body-content {
  padding: 26px 28px 30px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.detail-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(22px, 3vw, 28px);
  color: var(--color-ink);
  margin: 0 0 12px;
}
.detail-desc { font-size: 15px; line-height: 1.65; color: var(--color-ink-soft); margin: 0 0 20px; }

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  padding: 16px 18px;
  background: rgba(184,150,74,.08);
  border-radius: 12px;
}
.detail-meta-row + .detail-meta-row { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(37,29,20,.08); }
.detail-meta-label { display: block; font-weight: 700; color: var(--color-terracotta); text-transform: uppercase; letter-spacing: .05em; font-size: 11px; margin-bottom: 3px; }
.detail-meta-value { display: block; color: var(--color-ink); font-size: 14px; line-height: 1.4; }

.detail-tips-label { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--color-ink-soft); margin-bottom: 10px; }
.detail-tips-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.detail-tips-list li { position: relative; padding-left: 18px; font-size: 14px; line-height: 1.5; color: var(--color-ink-soft); }
.detail-tips-list li::before { content: '+'; position: absolute; left: 0; color: var(--color-gold); font-weight: 700; }

@media (max-width: 640px) {
  .detail-media { flex-basis: 34%; }
  .detail-body-content { padding: 20px 20px 26px; }
}
</style>
