<script setup lang="ts">
import type { Place } from '#shared/types/content'

// User-driven attractions rail. It's a native horizontal scroller with
// scroll-snap, so swipe, trackpad and keyboard scrolling run on the
// compositor with no JS animation loop. On top of that: prev/next buttons,
// dots, and mouse drag on desktop (a mouse can't swipe a native scroller).
const props = defineProps<{ places: Place[] }>()
const emit = defineEmits<{ openPlace: [el: HTMLElement, place: Place] }>()

const { lang, t } = useLocale()

const viewportEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const atStart = ref(true)
const atEnd = ref(false)
const isDragging = ref(false)

let step = 0
let scrollRaf: number | null = null
let reduceMotion = false
let pointerActive = false
let dragStartClientX = 0
let dragStartScroll = 0
let dragMoved = 0
let justDragged = false

function cardEls(): HTMLElement[] {
  return viewportEl.value ? Array.from(viewportEl.value.querySelectorAll<HTMLElement>('.attractions-card')) : []
}

function measure() {
  const [first, second] = cardEls()
  step = first && second ? second.offsetLeft - first.offsetLeft : (first?.offsetWidth ?? 0)
}

// One read per frame at most: scroll fires far more often than we need.
function syncState() {
  const vp = viewportEl.value
  if (!vp || !step) return
  const max = vp.scrollWidth - vp.clientWidth
  const left = vp.scrollLeft
  atStart.value = left <= 2
  atEnd.value = left >= max - 2
  // The last cards can't snap to the left edge, so reaching the end of the
  // rail is what marks the final dot as active.
  activeIndex.value = atEnd.value
    ? props.places.length - 1
    : Math.min(props.places.length - 1, Math.round(left / step))
}

function onScroll() {
  if (scrollRaf != null) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    syncState()
  })
}

function scrollToIndex(i: number) {
  const vp = viewportEl.value
  if (!vp) return
  const idx = Math.max(0, Math.min(props.places.length - 1, i))
  vp.scrollTo({ left: idx * step, behavior: reduceMotion ? 'auto' : 'smooth' })
}

// Step from the card actually at the left edge, not the active dot: at the
// end of the rail the last dot is active but the leading card is earlier, so
// "previous" from the dot index would land past the scroll limit and not move.
function leadingIndex() {
  return viewportEl.value && step ? Math.round(viewportEl.value.scrollLeft / step) : 0
}
function prev() { scrollToIndex(leadingIndex() - 1) }
function next() { scrollToIndex(leadingIndex() + 1) }

// Mouse drag only: touch and pen already scroll the rail natively.
function onPointerDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || e.button !== 0 || !viewportEl.value) return
  // isDragging (which disables snapping and card pointer-events) only flips
  // once the mouse has really moved — flipping it on press would retarget a
  // plain click away from the card.
  pointerActive = true
  dragMoved = 0
  dragStartClientX = e.clientX
  dragStartScroll = viewportEl.value.scrollLeft
}

function onPointerMove(e: PointerEvent) {
  if (!pointerActive || !viewportEl.value) return
  const delta = e.clientX - dragStartClientX
  dragMoved = Math.max(dragMoved, Math.abs(delta))
  if (dragMoved <= 6) return
  if (!isDragging.value) {
    isDragging.value = true
    viewportEl.value.setPointerCapture(e.pointerId)
  }
  viewportEl.value.scrollLeft = dragStartScroll - delta
}

function endDrag() {
  if (!pointerActive || !viewportEl.value) return
  pointerActive = false
  isDragging.value = false
  if (dragMoved > 6) {
    // The click that ends a drag (if the browser fires one) arrives in this
    // same task; clear the flag right after so a later real click isn't eaten.
    justDragged = true
    setTimeout(() => { justDragged = false }, 0)
    // Snapping was off during the drag; settle on the nearest card.
    scrollToIndex(Math.round(viewportEl.value.scrollLeft / step))
  }
}

// Swallow the click that ends a real drag before the card's own handler.
function onClickCapture(e: MouseEvent) {
  if (!justDragged) return
  justDragged = false
  e.preventDefault()
  e.stopPropagation()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  const current = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('.attractions-card')
  if (!current) return
  e.preventDefault()
  const idx = Number(current.dataset.index)
  const nextIdx = e.key === 'ArrowRight' ? Math.min(idx + 1, props.places.length - 1) : Math.max(idx - 1, 0)
  // preventScroll: the rail scrolls itself so the card lands snapped.
  cardEls()[nextIdx]?.focus({ preventScroll: true })
  scrollToIndex(nextIdx)
}

let ro: ResizeObserver | null = null

onMounted(() => {
  reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  measure()
  syncState()
  ro = new ResizeObserver(() => { measure(); syncState() })
  if (viewportEl.value) ro.observe(viewportEl.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  if (scrollRaf != null) cancelAnimationFrame(scrollRaf)
})
</script>

<template>
  <div class="attractions-carousel" @keydown="onKeydown" @click.capture="onClickCapture">
    <div
      ref="viewportEl"
      class="attractions-viewport"
      :class="{ 'is-dragging': isDragging }"
      role="region"
      :aria-label="lang === 'en' ? 'Attractions' : 'Atractivos'"
      @scroll.passive="onScroll"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @lostpointercapture="endDrag"
    >
      <div
        v-for="(place, i) in places"
        :key="place.id"
        class="attractions-card"
        :data-index="i"
        role="button"
        tabindex="0"
        @click="emit('openPlace', $event.currentTarget as HTMLElement, place)"
        @keydown.enter.prevent="($event.currentTarget as HTMLElement).click()"
        @keydown.space.prevent="($event.currentTarget as HTMLElement).click()"
      >
        <div class="attractions-media">
          <NuxtImg
            :src="place.img"
            :width="340"
            :height="255"
            densities="x1 x2"
            :quality="68"
            :alt="place.name.es"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
          <span class="attractions-badge">{{ t(place.cat) }}</span>
        </div>
        <div class="attractions-body">
          <h3 class="attractions-title">{{ t(place.name) }}</h3>
          <p class="attractions-desc">{{ t(place.short) }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-if="places.length > 1" class="pad-sec attractions-controls">
    <button
      type="button"
      class="attractions-arrow is-prev"
      :disabled="atStart"
      :aria-label="lang === 'en' ? 'Previous' : 'Anterior'"
      @click="prev"
    >
      <Icon name="chevron-right" :size="18" />
    </button>
    <div class="attractions-dots" role="group" :aria-label="lang === 'en' ? 'Attractions' : 'Atractivos'">
      <button
        v-for="(_, i) in places"
        :key="i"
        type="button"
        class="attractions-dot"
        :class="{ 'is-active': i === activeIndex }"
        :aria-label="`${i + 1} / ${places.length}`"
        :aria-current="i === activeIndex ? 'true' : undefined"
        @click="scrollToIndex(i)"
      />
    </div>
    <button
      type="button"
      class="attractions-arrow"
      :disabled="atEnd"
      :aria-label="lang === 'en' ? 'Next' : 'Siguiente'"
      @click="next"
    >
      <Icon name="chevron-right" :size="18" />
    </button>
  </div>
</template>

<style scoped>
/* Full-bleed rail (breaks out of the 1240px container) whose first card stays
   aligned with the rest of the section's content via the same
   max(26px, ...) inset used elsewhere (see SiteHeader's ::after). */
.attractions-carousel {
  --rail-inset: max(26px, calc((100vw - 1240px) / 2 + 26px));
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
.attractions-viewport {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--rail-inset);
  padding: 8px var(--rail-inset) 14px;
  scrollbar-width: none;
  cursor: grab;
}
.attractions-viewport::-webkit-scrollbar { display: none; }
/* Snapping would fight a mouse drag frame by frame; endDrag() settles it. */
.attractions-viewport.is-dragging {
  scroll-snap-type: none;
  cursor: grabbing;
  -webkit-user-select: none;
  user-select: none;
}
.attractions-viewport.is-dragging .attractions-card { pointer-events: none; }

.attractions-card {
  flex: 0 0 auto;
  width: 340px;
  height: 440px;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(37,29,20,.09);
  cursor: pointer;
  transition: transform .35s var(--ease-out), border-color .25s ease;
}
@media (hover: hover) and (pointer: fine) {
  .attractions-card:hover { transform: translateY(-4px); border-color: rgba(47,82,51,.28); }
  }
.attractions-card:focus-visible { outline: 3px solid var(--color-terracotta); outline-offset: 3px; }

.attractions-media { position: relative; aspect-ratio: 4/3; overflow: hidden; flex: none; background: var(--color-sand-deep); }
.attractions-media img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transition: transform .6s var(--ease-out);
}
.attractions-badge {
  position: absolute; top: 10px; left: 10px;
  background: rgba(20,28,18,.78);
  color: var(--color-cream); font-size: 10.5px; font-weight: 700; letter-spacing: .04em;
  padding: 5px 10px; border-radius: 999px;
}
.attractions-body { padding: 16px 18px 20px; display: flex; flex-direction: column; flex: 1; min-height: 0; }
.attractions-title { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin: 0 0 8px; color: var(--color-ink); }
.attractions-desc { font-size: 13.5px; line-height: 1.55; color: var(--color-ink-soft); margin: 0; flex: 1; overflow: hidden; }

.attractions-controls {
  max-width: 1240px;
  margin: 18px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--color-ink-soft);
}
.attractions-arrow {
  width: 44px; height: 44px; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  color: var(--color-ink);
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease, border-color .2s ease, opacity .2s ease, transform .16s var(--ease-out-strong);
}
.attractions-arrow:active:not(:disabled) { transform: scale(.94); transition-duration: .1s; }
.attractions-arrow.is-prev :deep(svg) { transform: scaleX(-1); }
.attractions-arrow:hover:not(:disabled) { background: var(--color-forest); border-color: var(--color-forest); color: var(--color-sand); }
.attractions-arrow:disabled { opacity: .35; cursor: default; }
.attractions-arrow:focus-visible { outline: 2px solid var(--color-terracotta); outline-offset: 2px; }

.attractions-dots { display: flex; }
/* Visible dot stays 8px, but the button's hit area is 24px (WCAG 2.5.8
   minimum target size) via a centered ::after. */
.attractions-dot {
  width: 24px; height: 24px; border-radius: 50%; flex: none;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; padding: 0; cursor: pointer;
}
.attractions-dot::after {
  content: '';
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(37,29,20,.18);
  transition: background .25s, transform .25s;
}
.attractions-dot.is-active::after { background: var(--color-terracotta); transform: scale(1.35); }
.attractions-dot:focus-visible { outline: 2px solid var(--color-terracotta); outline-offset: 2px; }

@media (min-width: 768px) and (max-width: 1279px) {
  .attractions-card { width: 42vw; max-width: 320px; min-width: 260px; height: 420px; }
}
@media (max-width: 767px) {
  .attractions-card { width: 82vw; max-width: 340px; min-width: 240px; height: 400px; }
  .attractions-viewport { gap: 16px; }
}
@media (max-width: 880px) {
  .attractions-carousel { --rail-inset: 20px; }
}
@media (hover: none) {
  .attractions-viewport { cursor: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .attractions-card, .attractions-media img { transition: none; }
  .attractions-card:hover { transform: none; }
  .attractions-card:hover .attractions-media img { transform: none; }
}
</style>
