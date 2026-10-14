<script setup lang="ts">
import type { Post } from '#shared/types/content'

const route = useRoute()
const { lang, localePath, t, tList } = useLocale()

const id = computed(() => String(route.params.id))

const { data: post } = await useContentItem('posts', id)
if (!post.value) {
  await navigateTo(localePath('/blog'))
}

// Related cards only need the three newest other posts. Fetching every post
// here made an individual article grow linearly with the entire blog.
const { data: related } = await useContentList('posts', { exclude: id, limit: 3 })

usePageSeo(() => ({
  title: `${post.value?.title.es ?? ''} · MIKA Homes`,
  titleEn: `${post.value?.title.en ?? ''} · MIKA Homes`,
  image: post.value?.img,
}))

const body = computed(() => tList(post.value?.body))
const minutes = computed(() => readingMinutes(body.value))
const initials = computed(() =>
  (post.value?.author ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join(''),
)

// --- Share -----------------------------------------------------------------
const pageUrl = useRequestURL()
const shareUrl = computed(() => `${pageUrl.origin}${route.path}`)
const waHref = computed(() =>
  `https://wa.me/?text=${encodeURIComponent(`${post.value ? t(post.value.title) : ''} ${shareUrl.value}`)}`,
)
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined
async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => { copied.value = false }, 2200)
  }
  catch { /* clipboard blocked (insecure context): the address bar still works */ }
}

// --- Reading progress ------------------------------------------------------
// Measured against the article body only, so the bar fills as the text is
// read rather than as the related posts and footer scroll past.
const bodyEl = ref<HTMLElement | null>(null)
const progressEl = ref<HTMLElement | null>(null)
function updateProgress() {
  if (!bodyEl.value || !progressEl.value) return
  const r = bodyEl.value.getBoundingClientRect()
  const total = r.height - window.innerHeight * 0.5
  const p = total > 0 ? (window.innerHeight * 0.5 - r.top) / total : 1
  progressEl.value.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`
}

// --- Background illustration reveal ---------------------------------------
const CLUSTERS = [
  { id: 'cafe', start: 0.00 },
  { id: 'branch', start: 0.10 },
  { id: 'table', start: 0.06 },
  { id: 'door', start: 0.16 },
]
const DURATION_MS = 6000
const DELAY_MS = 500
const SOFTNESS = 0.18

// 0.5 - 0.5*cos(pi*t): smooth ease in/out
function ease(t: number) {
  return 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, t)))
}

const wrapEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLElement | null>(null)
let rafId = 0

function setClusterOffsets(canvas: Element, g: number) {
  for (const c of CLUSTERS) {
    const span = 1 - c.start
    const t = ease((g - c.start) / span)
    const edge = t * (1 + SOFTNESS)
    const o1 = Math.max(0, Math.min(1, edge - SOFTNESS))
    const o2 = Math.max(o1 + 0.0001, Math.min(1, edge))
    canvas.querySelector(`.stop-a[data-cluster="${c.id}"]`)?.setAttribute('offset', o1.toFixed(4))
    canvas.querySelector(`.stop-b[data-cluster="${c.id}"]`)?.setAttribute('offset', o2.toFixed(4))
  }
}

function startBlogBgReveal() {
  const canvas = canvasEl.value
  if (!canvas) return
  cancelAnimationFrame(rafId)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setClusterOffsets(canvas, 1)
    return
  }

  let start: number | null = null
  const tick = (ts: number) => {
    if (start == null) start = ts
    const elapsed = ts - start - DELAY_MS
    const g = elapsed <= 0 ? 0 : Math.min(1, elapsed / DURATION_MS)
    setClusterOffsets(canvas, g)
    if (g < 1) rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

// Keeps the fixed illustration pinned to the viewport while the blog content
// scrolls, but fades it out once the content ends so it never bleeds over the
// related-posts section or the footer below it. Tied directly to scroll
// position (no timed transition) so it is fully transparent by the time the
// footer's edge reaches the bottom of the viewport.
const FADE_ZONE_PX = 220

function updateBlogBgVisibility() {
  updateProgress()
  if (!wrapEl.value || !canvasEl.value) return
  const distanceToFooter = wrapEl.value.getBoundingClientRect().bottom - window.innerHeight
  canvasEl.value.style.opacity = String(Math.max(0, Math.min(1, distanceToFooter / FADE_ZONE_PX)))
}

onMounted(() => {
  window.addEventListener('scroll', updateBlogBgVisibility, { passive: true })
  window.addEventListener('resize', updateBlogBgVisibility)
  startBlogBgReveal()
  updateBlogBgVisibility()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(copiedTimer)
  window.removeEventListener('scroll', updateBlogBgVisibility)
  window.removeEventListener('resize', updateBlogBgVisibility)
})
</script>

<template>
  <div v-if="post" ref="wrapEl" class="blog-bg">
    <div ref="canvasEl" class="blog-bg-canvas" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="grad-cafe" gradientUnits="userSpaceOnUse" x1="108" y1="240" x2="108" y2="500">
            <stop offset="0" stop-color="#fff" />
            <stop class="stop-a" data-cluster="cafe" offset="0" stop-color="#fff" />
            <stop class="stop-b" data-cluster="cafe" offset="0" stop-color="#000" />
            <stop offset="1" stop-color="#000" />
          </linearGradient>
          <linearGradient id="grad-branch" gradientUnits="userSpaceOnUse" x1="1600" y1="20" x2="1360" y2="400">
            <stop offset="0" stop-color="#fff" />
            <stop class="stop-a" data-cluster="branch" offset="0" stop-color="#fff" />
            <stop class="stop-b" data-cluster="branch" offset="0" stop-color="#000" />
            <stop offset="1" stop-color="#000" />
          </linearGradient>
          <linearGradient id="grad-table" gradientUnits="userSpaceOnUse" x1="150" y1="790" x2="150" y2="490">
            <stop offset="0" stop-color="#fff" />
            <stop class="stop-a" data-cluster="table" offset="0" stop-color="#fff" />
            <stop class="stop-b" data-cluster="table" offset="0" stop-color="#000" />
            <stop offset="1" stop-color="#000" />
          </linearGradient>
          <linearGradient id="grad-door" gradientUnits="userSpaceOnUse" x1="1600" y1="795" x2="1345" y2="510">
            <stop offset="0" stop-color="#fff" />
            <stop class="stop-a" data-cluster="door" offset="0" stop-color="#fff" />
            <stop class="stop-b" data-cluster="door" offset="0" stop-color="#000" />
            <stop offset="1" stop-color="#000" />
          </linearGradient>
          <mask id="blog-reveal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
            <rect x="8" y="240" width="200" height="260" fill="url(#grad-cafe)" />
            <rect x="1360" y="20" width="240" height="380" fill="url(#grad-branch)" />
            <rect x="0" y="490" width="315" height="300" fill="url(#grad-table)" />
            <rect x="1345" y="510" width="255" height="285" fill="url(#grad-door)" />
          </mask>
        </defs>
        <image href="/blog-bg.jpeg" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice" mask="url(#blog-reveal-mask)" />
      </svg>
    </div>

    <div ref="progressEl" class="read-progress" aria-hidden="true" />

    <div class="blog-bg-content">
      <!-- ARTICLE HEADER (a <div>, not <header>: the scroll-reveal plugin
           skips headers, which would leave the title stuck invisible) -->
      <div class="pad-sec art-head">
        <NuxtLink :to="localePath('/blog')" class="art-back">
          <Icon name="arrow-left" :size="16" />
          {{ lang === 'en' ? 'All stories' : 'Todas las historias' }}
        </NuxtLink>
        <span class="art-cat">{{ t(post.cat) }}</span>
        <h1 class="art-title">{{ t(post.title) }}</h1>
        <p class="art-dek">{{ t(post.excerpt) }}</p>
        <div class="art-byline">
          <span class="art-avatar" aria-hidden="true">{{ initials }}</span>
          <div>
            <div class="art-author">{{ post.author }}</div>
            <div class="art-when">
              {{ t(post.date) }} · {{ minutes }} {{ lang === 'en' ? 'min read' : 'min de lectura' }}
            </div>
          </div>
        </div>
      </div>

      <!-- HERO IMAGE -->
      <div class="pad-sec art-hero-wrap">
        <div class="art-hero">
          <NuxtImg
            v-if="hasPhoto(post.img)"
            :src="post.img"
            :width="1080"
            :height="540"
            densities="x1 x2"
            :alt="t(post.title)"
            class="art-hero-img"
          />
          <BlogPostArt v-else :seed="post.id" size="lg" />
        </div>
      </div>

      <!-- BODY -->
      <article ref="bodyEl" class="pad-sec art-body">
        <p v-for="(para, i) in body" :key="i" :class="{ 'art-lead': i === 0 }">{{ para }}</p>

        <div class="art-end">
          <span class="art-end-label">{{ lang === 'en' ? 'Share this story' : 'Comparte esta historia' }}</span>
          <div class="art-share">
            <a :href="waHref" target="_blank" rel="noopener" class="share-btn">
              <Icon name="chat" :size="16" />
              WhatsApp
            </a>
            <button type="button" class="share-btn" @click="copyLink">
              <Icon :name="copied ? 'check' : 'link'" :size="16" />
              <span aria-live="polite">{{ copied
                ? (lang === 'en' ? 'Link copied' : 'Enlace copiado')
                : (lang === 'en' ? 'Copy link' : 'Copiar enlace') }}</span>
            </button>
          </div>
        </div>
      </article>

      <!-- CTA GUIDE. Plain divs with role="heading": a real h2/h3 + <p> pair is
           auto-tagged by the scroll-reveal plugin, and on this dark card it
           was staying hidden. -->
      <section class="pad-sec art-cta-wrap">
        <div class="art-cta">
          <div class="art-cta-copy">
            <div class="art-cta-title" role="heading" aria-level="2">
              {{ lang === 'en' ? 'Thinking about moving to Boquete?' : '¿Pensando en mudarte a Boquete?' }}
            </div>
            <div class="art-cta-text">
              {{ lang === 'en'
                ? 'Get the free guide: relocation questions, residency basics, cost of living and a visit-planning checklist.'
                : 'Recibe la guía gratuita: preguntas de reubicación, residencia, costo de vida y checklist para planear tu visita.' }}
            </div>
          </div>
          <a :href="`${localePath('/')}/#contacto`" class="art-cta-btn">
            {{ lang === 'en' ? 'Get the free guide' : 'Recibe la guía gratis' }}
            <Icon name="arrow-right" :size="16" />
          </a>
        </div>
      </section>

      <!-- RELATED -->
      <section v-if="related?.length" class="pad-sec art-related" aria-labelledby="related-title">
        <div class="related-head">
          <h2 id="related-title" class="related-title">{{ lang === 'en' ? 'Keep reading' : 'Sigue leyendo' }}</h2>
          <NuxtLink :to="localePath('/blog')" class="link-underline">
            {{ lang === 'en' ? 'All stories' : 'Ver todas' }} →
          </NuxtLink>
        </div>
        <div class="related-grid">
          <NuxtLink
            v-for="r in related"
            :key="r.id"
            :to="localePath(`/blog/${r.id}`)"
            class="post-card"
          >
            <div class="post-card-media">
              <NuxtImg
                v-if="hasPhoto(r.img)"
                :src="r.img"
                :width="420"
                :height="294"
                densities="x1 x2"
                :alt="t(r.title)"
                class="post-card-img"
                loading="lazy"
              />
              <BlogPostArt v-else :seed="r.id" :label="t(r.cat)" class="post-card-img" />
            </div>
            <div class="post-meta">
              <span class="post-cat">{{ t(r.cat) }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ t(r.date) }}</span>
            </div>
            <h3 class="post-card-title">{{ t(r.title) }}</h3>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.blog-bg {
  position: relative;
  background-color: #f7e8d5;
}
.blog-bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.blog-bg-canvas svg {
  display: block;
  width: 100%;
  height: 100%;
}
.blog-bg-content {
  position: relative;
  z-index: 1;
}

/* Reading progress: a hairline across the very top, above the header. */
.read-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 61;
  background: var(--color-forest);
  transform: scaleX(0);
  transform-origin: left center;
  pointer-events: none;
}

/* --- Header --- */
.art-head { max-width: 760px; margin: 0 auto; padding-top: 52px; padding-bottom: 36px; }
.art-back {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 7px;
  margin-bottom: 30px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  color: var(--color-ink-soft);
  text-decoration: none;
  transition: color .2s ease, gap .2s var(--ease-out);
}
.art-back:hover { color: var(--color-forest); gap: 10px; }
.art-cat {
  display: inline-block;
  margin-bottom: 16px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(142, 74, 42, .1);
  color: var(--color-terracotta);
  font-size: 13px;
  font-weight: 700;
}
.art-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(34px, 5vw, 54px);
  line-height: 1.05;
  letter-spacing: -.022em;
  margin: 0 0 20px;
  color: var(--color-ink);
  text-wrap: balance;
}
.art-dek {
  font-family: var(--font-accent);
  font-style: italic;
  font-size: clamp(19px, 2.2vw, 22px);
  line-height: 1.5;
  color: var(--color-ink-mid);
  margin: 0 0 30px;
  text-wrap: pretty;
}
.art-byline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 22px;
  border-top: 1px solid var(--color-border);
}
.art-avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-forest);
  color: var(--color-sand);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
}
.art-author { font-weight: 700; font-size: 15px; color: var(--color-ink); }
.art-when { font-size: 13.5px; color: var(--color-ink-soft); margin-top: 2px; }

/* --- Hero --- */
.art-hero-wrap { max-width: 1080px; margin: 0 auto; }
.art-hero {
  position: relative;
  aspect-ratio: 2 / 1;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-sand-deep);
}
.art-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* --- Body --- */
.art-body { max-width: 720px; margin: 0 auto; padding-top: 52px; }
.art-body p {
  font-size: 18.5px;
  line-height: 1.8;
  color: var(--color-ink-mid);
  margin: 0 0 1.15em;
  text-wrap: pretty;
}
.art-body .art-lead {
  font-size: clamp(20px, 2.1vw, 22px);
  line-height: 1.65;
  color: var(--color-ink);
  font-weight: 500;
}
.art-end {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px 20px;
  flex-wrap: wrap;
  margin-top: 44px;
  padding: 22px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}
.art-end-label { font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--color-ink); }
.art-share { display: flex; gap: 10px; flex-wrap: wrap; }
.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, .55);
  color: var(--color-ink);
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease, transform .15s var(--ease-out);
}
.share-btn:hover { background: var(--color-white); border-color: var(--color-leaf); color: var(--color-forest); }
.share-btn:active { transform: scale(.96); }
.share-btn:focus-visible, .art-cta-btn:focus-visible, .art-back:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

/* --- CTA --- */
.art-cta-wrap { max-width: 1080px; margin: 0 auto; padding-top: 72px; }
.art-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px 40px;
  flex-wrap: wrap;
  padding: clamp(30px, 4vw, 48px) clamp(26px, 4vw, 52px);
  border-radius: 16px;
  background: var(--color-forest);
}
.art-cta-copy { flex: 1 1 380px; max-width: 560px; }
.art-cta-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(24px, 2.8vw, 32px);
  line-height: 1.12;
  letter-spacing: -.015em;
  color: var(--color-sand);
  margin-bottom: 10px;
  text-wrap: balance;
}
.art-cta-text { font-size: 16px; line-height: 1.6; color: rgba(245, 240, 232, .86); }
.art-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: none;
  padding: 14px 24px;
  border-radius: 999px;
  background: var(--color-sand);
  color: var(--color-forest);
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  transition: background-color .2s ease, gap .2s var(--ease-out), transform .15s var(--ease-out);
}
.art-cta-btn:hover { background: var(--color-white); gap: 12px; }
.art-cta-btn:active { transform: scale(.97); }

/* --- Related --- */
.art-related { max-width: 1080px; margin: 0 auto; padding-top: 88px; padding-bottom: 104px; }
.related-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--color-border);
}
.related-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(24px, 2.6vw, 30px);
  letter-spacing: -.015em;
  margin: 0;
  color: var(--color-ink);
}
.related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px 28px; }
.post-card { display: block; text-decoration: none; color: inherit; }
.post-card-media {
  position: relative;
  aspect-ratio: 3 / 2.1;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 14px;
  background: var(--color-sand-deep);
  transition: box-shadow .3s var(--ease-out);
}
.post-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .6s var(--ease-out-strong);
}
.post-meta { display: flex; gap: 10px; align-items: center; font-size: 13px; color: var(--color-ink-soft); margin-bottom: 8px; }
.post-cat { color: var(--color-terracotta); font-weight: 700; }
.post-card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  line-height: 1.22;
  margin: 0;
  color: var(--color-ink);
  text-wrap: balance;
  transition: color .2s ease;
}
@media (hover: hover) and (pointer: fine) {
  .post-card:hover .post-card-media { box-shadow: 0 6px 8px -4px rgba(37,29,20,.25); }
  .post-card:hover .post-card-img { transform: scale(1.05); }
  .post-card:hover .post-card-title { color: var(--color-forest); }
}
.post-card:focus-visible { outline: none; }
.post-card:focus-visible .post-card-media { box-shadow: var(--shadow-focus); }

@media (max-width: 960px) {
  .related-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 880px) {
  .art-head { padding-top: 36px; }
  .art-hero { aspect-ratio: 3 / 2; }
  .art-body { padding-top: 40px; }
  .art-body p { font-size: 17.5px; }
}
@media (max-width: 560px) {
  .related-grid { grid-template-columns: 1fr; }
  .art-related { padding-bottom: 72px; }
  .art-cta-btn { width: 100%; justify-content: center; }
  .art-body .art-lead { font-size: 19px; }
}
@media (prefers-reduced-motion: reduce) {
  .post-card-img, .art-back, .art-cta-btn { transition: none; }
  .post-card:hover .post-card-img { transform: none; }
}
</style>
