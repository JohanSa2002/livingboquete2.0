<script setup lang="ts">
import type { Rental } from '#shared/types/content'

// Voices: every real review across every listing, highest-rated first. Feeds a
// slow auto-scrolling marquee rather than a fixed grid, so the count is free to
// grow as more reviews get added.
const props = defineProps<{ rentals: Rental[] }>()

const { lang, t } = useLocale()

const voices = computed(() =>
  props.rentals
    .flatMap(r => (r.reviewsList ?? []).map(rv => ({ ...rv, stay: r.name })))
    .sort((a, b) => b.rating - a.rating),
)

// Content is rendered twice back-to-back and the track animates from 0 to -50%,
// so the loop point is invisible — the second copy is aria-hidden so screen
// readers only hear each review once.
const doubled = computed(() => [...voices.value, ...voices.value])

const track = ref<HTMLElement | null>(null)

// Sets --voices-duration so the loop always moves at the same visual speed
// (px/s) no matter how many reviews get added later — a fixed
// animation-duration would make the loop speed up as the track (which is
// exactly double the review count) gets wider.
function initVoicesMarquee() {
  if (!track.value) return
  const PX_PER_SECOND = 36
  // Track content is duplicated for the seamless loop, so the distance actually
  // travelled (0 → -50%) is half the full scrollWidth.
  const halfWidth = track.value.scrollWidth / 2
  if (halfWidth > 0) {
    track.value.style.setProperty('--voices-duration', `${halfWidth / PX_PER_SECOND}s`)
  }
}

onMounted(() => nextTick(initVoicesMarquee))
watch(voices, () => nextTick(initVoicesMarquee))
</script>

<template>
  <div v-if="voices.length > 0" class="pad-sec" style="max-width:1240px;margin:0 auto">
    <div class="eyebrow rv" style="margin-bottom:12px">
      {{ lang === 'en' ? 'Already living here' : 'Ya viven aquí' }}
    </div>
    <h2 class="stays-h2 rv" style="margin-bottom:40px">
      <template v-if="lang === 'en'">Voices from the <em>community</em></template>
      <template v-else>Voces de la <em>comunidad</em></template>
    </h2>
    <div class="stays-voices-viewport">
      <div ref="track" class="stays-voices-track">
        <figure
          v-for="(v, i) in doubled"
          :key="i"
          class="stays-voice"
          :aria-hidden="i >= voices.length ? 'true' : undefined"
        >
          <div class="stays-voice-stars">{{ '★'.repeat(Math.round(v.rating)) }}</div>
          <blockquote>“{{ t(v.text) }}”</blockquote>
          <figcaption>
            <span class="stays-voice-avatar">{{ v.name[0] }}</span>
            <div>
              <div class="stays-voice-name">{{ v.name }}</div>
              <div class="stays-voice-stay">{{ t(v.stay) }}</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Auto-scrolling marquee: content is duplicated in the markup and the track
   animates 0 → -50%, looping seamlessly. Speed (not duration) is kept constant
   via --voices-duration, computed from the track's actual width in the script
   above, so adding more reviews doesn't speed the loop up. */
.stays-voices-viewport {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}
.stays-voices-track {
  display: flex;
  gap: 22px;
  width: max-content;
  animation: stays-voices-scroll var(--voices-duration, 48s) linear infinite;
}
.stays-voices-viewport:hover .stays-voices-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .stays-voices-track { animation: none; }
}
@keyframes stays-voices-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.stays-voice {
  flex: 0 0 360px;
  margin: 0;
  background: var(--color-white);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: transform .28s var(--ease-out), box-shadow .28s var(--ease-out);
}
.stays-voice:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }
.stays-voice-stars { color: var(--color-gold); font-size: 15px; letter-spacing: 2px; margin-bottom: 14px; }
.stays-voice blockquote {
  font-family: var(--font-accent);
  font-style: italic;
  font-size: 16.5px;
  line-height: 1.62;
  color: var(--color-ink-soft);
  margin: 0 0 22px;
}
.stays-voice figcaption { display: flex; align-items: center; gap: 12px; margin-top: auto; }
.stays-voice-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--color-sand-deep);
  color: var(--color-coffee);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 17px;
  flex: none;
}
.stays-voice-name { font-weight: 700; font-size: 14.5px; color: var(--color-ink); }
.stays-voice-stay { font-size: 12.5px; color: var(--color-ink-faint); }

@media (max-width: 1024px) {
  .stays-voice { flex-basis: 300px; }
}
</style>
