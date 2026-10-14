<script setup lang="ts">
// Lightweight YouTube embed: renders just the thumbnail until clicked, so the
// page never pays YouTube's iframe/script cost unless the visitor actually
// wants to watch. Accepts any common YouTube URL shape or a bare 11-char video
// ID (matches whatever gets pasted into the admin field).
const props = defineProps<{ url?: string | null; title: string }>()

const { lang } = useLocale()

function extractVideoId(raw?: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]!
  }
  return null
}

const videoId = computed(() => extractVideoId(props.url))
const thumbnail = computed(() => (videoId.value ? `https://img.youtube.com/vi/${videoId.value}/hqdefault.jpg` : ''))
const playing = ref(false)
</script>

<template>
  <iframe
    v-if="playing && videoId"
    class="yt-facade-frame"
    :src="`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`"
    allow="autoplay; encrypted-media; picture-in-picture"
    allowfullscreen
    :title="`Reproducir video de ${title}`"
  />
  <button
    v-else-if="videoId"
    type="button"
    class="yt-facade"
    :aria-label="`Reproducir video de ${title}`"
    :style="`background-image:url('${thumbnail}')`"
    @click="playing = true"
  >
    <span class="yt-facade-play" aria-hidden="true">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>
    </span>
  </button>
  <div v-else class="yt-facade yt-facade-empty">
    {{ lang === 'en' ? 'No video available' : 'No hay video disponible' }}
  </div>
</template>

<style scoped>
.yt-facade {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  display: block;
  background-color: var(--color-ink);
  background-size: cover;
  background-position: center;
  cursor: pointer;
}
.yt-facade-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(37, 29, 20, .28);
  transition: background .18s ease;
}
.yt-facade-play svg {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, .4));
}
.yt-facade:hover .yt-facade-play {
  background: rgba(37, 29, 20, .42);
}
.yt-facade-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  background: var(--color-cream);
  border: 1px dashed rgba(37, 29, 20, .25);
  color: var(--color-ink-faint);
  font-size: 14.5px;
  font-weight: 600;
}
.yt-facade-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
