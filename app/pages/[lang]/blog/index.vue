<script setup lang="ts">
const { lang, localePath, t } = useLocale()

usePageSeo({ title: 'Blog · MIKA Homes', titleEn: 'Blog · MIKA Homes' })

const { data: posts } = await useContentList('posts')

// Editorial layout: the API returns posts newest-first, so the first one leads
// as the featured story and the rest fall into the grid below it.
const featured = computed(() => posts.value?.[0] ?? null)
const rest = computed(() => posts.value?.slice(1) ?? [])
</script>

<template>
  <div class="blog-page">
    <!-- Masthead: copy on the left, the engraved illustration framed like a
         printed plate on the right. A <section>, not a <header>: the
         scroll-reveal plugin skips anything inside a header, which left these
         headings stuck at opacity 0. -->
    <section class="pad-sec blog-masthead" aria-labelledby="blog-title">
      <div class="blog-masthead-copy">
        <div class="eyebrow" style="margin-bottom:14px">
          {{ lang === 'en' ? 'Blog & news' : 'Blog & noticias' }}
        </div>
        <h1 id="blog-title" class="blog-title">
          <template v-if="lang === 'en'">Stories from the <em>highlands</em></template>
          <template v-else>Historias de las <em>tierras altas</em></template>
        </h1>
        <p class="blog-sub">
          {{ lang === 'en'
            ? 'Guides, culture and community news from the people who live in Boquete.'
            : 'Guías, cultura y novedades de la comunidad, contadas por quienes viven en Boquete.' }}
        </p>
      </div>
      <figure class="blog-plate" aria-hidden="true">
        <picture>
          <source media="(max-width: 880px)" srcset="/fondoblogs-mobile.webp">
          <img src="/fondoblogs.webp" alt="" width="1672" height="941" fetchpriority="high">
        </picture>
      </figure>
    </section>

    <!-- Featured story -->
    <section v-if="featured" class="pad-sec blog-section">
      <NuxtLink :to="localePath(`/blog/${featured.id}`)" class="feature">
        <div class="feature-media">
          <NuxtImg
            v-if="hasPhoto(featured.img)"
            :src="featured.img"
            :width="760"
            :height="540"
            densities="x1 x2"
            :alt="t(featured.title)"
            class="feature-img"
          />
          <BlogPostArt v-else :seed="featured.id" :label="t(featured.cat)" size="lg" class="feature-img" />
          <span class="feature-badge">{{ lang === 'en' ? 'Latest' : 'Lo más reciente' }}</span>
        </div>
        <div class="feature-body">
          <div class="post-meta">
            <span class="post-cat">{{ t(featured.cat) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ t(featured.date) }}</span>
          </div>
          <h2 class="feature-title">{{ t(featured.title) }}</h2>
          <p class="feature-excerpt">{{ t(featured.excerpt) }}</p>
          <div class="feature-foot">
            <span v-if="featured.author" class="feature-author">
              {{ lang === 'en' ? 'By' : 'Por' }} <b>{{ featured.author }}</b>
            </span>
            <span class="feature-cta">
              {{ lang === 'en' ? 'Read article' : 'Leer artículo' }}
              <Icon name="arrow-right" :size="16" />
            </span>
          </div>
        </div>
      </NuxtLink>
    </section>

    <!-- The rest of the archive -->
    <section v-if="rest.length" class="pad-sec blog-section blog-archive" aria-labelledby="archive-title">
      <div class="archive-head">
        <h2 id="archive-title" class="archive-title">{{ lang === 'en' ? 'More stories' : 'Más historias' }}</h2>
        <span class="archive-count num">
          {{ rest.length }} {{ lang === 'en' ? 'articles' : 'artículos' }}
        </span>
      </div>
      <div class="archive-grid">
        <NuxtLink
          v-for="b in rest"
          :key="b.id"
          :to="localePath(`/blog/${b.id}`)"
          class="post-card"
        >
          <div class="post-card-media">
            <NuxtImg
              v-if="hasPhoto(b.img)"
              :src="b.img"
              :width="420"
              :height="294"
              densities="x1 x2"
              :alt="t(b.title)"
              class="post-card-img"
              loading="lazy"
            />
            <BlogPostArt v-else :seed="b.id" :label="t(b.cat)" class="post-card-img" />
          </div>
          <div class="post-meta">
            <span class="post-cat">{{ t(b.cat) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ t(b.date) }}</span>
          </div>
          <h3 class="post-card-title">{{ t(b.title) }}</h3>
          <p class="post-card-excerpt">{{ t(b.excerpt) }}</p>
        </NuxtLink>
      </div>
    </section>

    <section v-if="!featured" class="pad-sec blog-section blog-empty">
      <p>{{ lang === 'en' ? 'New stories are on their way.' : 'Pronto publicaremos nuevas historias.' }}</p>
    </section>
  </div>
</template>

<style scoped>
.blog-page { padding-bottom: 104px; }

/* --- Masthead --- */
.blog-masthead {
  max-width: 1240px;
  margin: 0 auto;
  padding-top: 56px;
  padding-bottom: 64px;
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  align-items: center;
  gap: 56px;
}
.blog-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(40px, 5.4vw, 68px);
  line-height: 1;
  letter-spacing: -.025em;
  margin: 0 0 20px;
  color: var(--color-ink);
  text-wrap: balance;
}
.blog-title em { font-style: normal; color: var(--color-forest); }
.blog-sub {
  font-size: 18px;
  line-height: 1.55;
  color: var(--color-ink-mid);
  max-width: 42ch;
  margin: 0;
  text-wrap: pretty;
}
/* One defined edge, no soft drop shadow: the engraving is pale line-work on
   cream, so the frame (not a glow) is what separates it from the sand page. */
.blog-plate {
  margin: 0;
  padding: 10px;
  border-radius: 16px;
  background: var(--color-sand-deep);
  border: 1px solid var(--color-sand-muted);
}
.blog-plate img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 10px;
  filter: contrast(1.08);
}

/* --- Shared --- */
.blog-section { max-width: 1240px; margin: 0 auto; }
.post-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: var(--color-ink-soft);
  margin-bottom: 10px;
}
.post-cat { color: var(--color-terracotta); font-weight: 700; }

/* --- Featured --- */
.feature {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: 48px;
  align-items: center;
  padding-top: 44px;
  border-top: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
}
.feature-media {
  position: relative;
  aspect-ratio: 7 / 5;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-sand-deep);
  transition: box-shadow .3s var(--ease-out);
}
.feature-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .7s var(--ease-out-strong);
}
.feature-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-ink);
  background: var(--color-sand);
  padding: 6px 12px;
  border-radius: 999px;
}
.feature-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1.08;
  letter-spacing: -.02em;
  margin: 0 0 14px;
  color: var(--color-ink);
  text-wrap: balance;
  transition: color .2s ease;
}
.feature-excerpt {
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-ink-mid);
  max-width: 48ch;
  margin: 0 0 28px;
  text-wrap: pretty;
}
.feature-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}
.feature-author { font-size: 14px; color: var(--color-ink-soft); }
.feature-author b { color: var(--color-ink); font-weight: 700; }
.feature-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--color-forest);
  color: var(--color-sand);
  font-weight: 700;
  font-size: 14px;
  transition: background-color .2s ease, gap .2s var(--ease-out);
}

/* --- Archive grid --- */
.blog-archive { margin-top: 96px; }
.archive-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--color-border);
}
.archive-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(24px, 2.6vw, 32px);
  letter-spacing: -.015em;
  margin: 0;
  color: var(--color-ink);
}
.archive-count { font-size: 14px; font-weight: 600; color: var(--color-ink-soft); }
.archive-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px 28px;
}
.post-card { display: block; text-decoration: none; color: inherit; }
.post-card-media {
  position: relative;
  aspect-ratio: 3 / 2.1;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 16px;
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
.post-card-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  line-height: 1.22;
  margin: 0 0 8px;
  color: var(--color-ink);
  text-wrap: balance;
  transition: color .2s ease;
}
.post-card-excerpt {
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--color-ink-soft);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-empty p { font-size: 17px; color: var(--color-ink-soft); padding: 40px 0; }

/* Hover only where there's a real pointer, so touch taps don't leave the
   image stuck zoomed. */
@media (hover: hover) and (pointer: fine) {
  .feature:hover .feature-media,
  .post-card:hover .post-card-media { box-shadow: 0 6px 8px -4px rgba(37,29,20,.25); }
  .feature:hover .feature-img { transform: scale(1.03); }
  .post-card:hover .post-card-img { transform: scale(1.05); }
  .feature:hover .feature-title,
  .post-card:hover .post-card-title { color: var(--color-forest); }
  .feature:hover .feature-cta { background: var(--color-forest-dark); gap: 10px; }
}
.feature:active .feature-cta { transform: scale(.97); }
.feature:focus-visible, .post-card:focus-visible { outline: none; }
.feature:focus-visible .feature-media,
.post-card:focus-visible .post-card-media { box-shadow: var(--shadow-focus); }

@media (max-width: 960px) {
  .archive-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 880px) {
  .blog-masthead { grid-template-columns: 1fr; gap: 32px; padding-top: 40px; padding-bottom: 48px; }
  .feature { grid-template-columns: 1fr; gap: 24px; padding-top: 32px; }
  .blog-archive { margin-top: 72px; }
}
@media (max-width: 560px) {
  .archive-grid { grid-template-columns: 1fr; gap: 40px; }
  .feature-media { aspect-ratio: 4 / 3; }
  .blog-page { padding-bottom: 72px; }
  .blog-plate { padding: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .feature-img, .post-card-img, .feature-cta { transition: none; }
  .feature:hover .feature-img, .post-card:hover .post-card-img { transform: none; }
}
</style>
