<script setup lang="ts">
import type { EventItem, Place } from '#shared/types/content'

const { lang, localePath, t } = useLocale()

const [{ data: places }, { data: events }, { data: posts }] = await Promise.all([
  useContentList('places'),
  useContentList('events'),
  useContentList('posts'),
])

const homePosts = computed(() => (posts.value ?? []).slice(0, 3))

usePageSeo({ title: 'MIKA Homes', titleEn: 'MIKA Homes' })

const modal = ref<{ open: (el: HTMLElement, item: Place | EventItem, kind: 'place' | 'event') => void } | null>(null)

function openPlace(el: HTMLElement, place: Place) {
  modal.value?.open(el, place, 'place')
}
function openEvent(e: MouseEvent, ev: EventItem) {
  modal.value?.open(e.currentTarget as HTMLElement, ev, 'event')
}
</script>

<template>
  <div>
    <HomeHero />
    <HomeGuarantees />

    <!-- TOP ATTRACTIONS -->
    <section id="atractivos" class="rv" style="padding:96px 0 40px">
      <div class="pad-sec" style="max-width:1240px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:42px;flex-wrap:wrap">
        <div style="max-width:560px">
          <div class="eyebrow" data-reveal="slide-right" style="margin-bottom:14px">
            {{ lang === 'en' ? 'Top attractions' : 'Principales atractivos' }}
          </div>
          <h2 class="attractions-h2" data-reveal="slide-right" style="font-family:var(--font-display);font-weight:700;font-size:clamp(34px,4.4vw,52px);line-height:1.02;letter-spacing:-.02em;margin:0;color:var(--color-ink)">
            {{ lang === 'en'
              ? 'Six reasons to get lost — and find yourself — in the mountains of Boquete.'
              : 'Seis razones para perderse —y reencontrarse— en las montañas de Boquete.' }}
          </h2>
        </div>
      </div>

      <AttractionsCarousel :places="places ?? []" @open-place="openPlace" />
    </section>

    <BoqueteZones />

    <!-- UPCOMING EVENTS -->
    <section class="pad-sec rv" style="max-width:1240px;margin:0 auto;padding:74px 26px 30px">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:34px;flex-wrap:wrap">
        <div>
          <div class="eyebrow" data-reveal="slide-left" style="margin-bottom:12px">
            {{ lang === 'en' ? 'Upcoming events' : 'Próximos eventos' }}
          </div>
          <h2 data-reveal="slide-left" style="font-family:var(--font-display);font-weight:700;font-size:clamp(30px,3.6vw,42px);margin:0;color:var(--color-ink);letter-spacing:-.02em">
            {{ lang === 'en' ? 'Fairs, music and tradition throughout the year.' : 'Ferias, música y tradición durante todo el año.' }}
          </h2>
        </div>
      </div>
      <div class="cols-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px">
        <div
          v-for="e in events"
          :key="e.id"
          class="event-card"
          role="button"
          tabindex="0"
          style="position:relative;border-radius:18px;overflow:hidden;min-height:300px;display:flex;flex-direction:column;justify-content:flex-end"
          @click="openEvent($event, e)"
          @keydown.enter.prevent="($event.currentTarget as HTMLElement).click()"
          @keydown.space.prevent="($event.currentTarget as HTMLElement).click()"
        >
          <NuxtImg
            :src="e.img"
            :width="420"
            :height="300"
            densities="x1 x2"
            :alt="e.name.es"
            class="event-card-img"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
            loading="lazy"
          />
          <div class="event-card-shade" />
          <div class="event-date glass-light">
            <div class="event-date-d">{{ e.d }}</div>
            <div class="event-date-m">{{ t(e.m) }}</div>
          </div>
          <div class="event-pane glass-dark">
            <span class="event-cat">{{ t(e.cat) }}</span>
            <h3 class="event-name">{{ t(e.name) }}</h3>
            <p class="event-meta">{{ t(e.place) }} · {{ t(e.time) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- BLOG -->
    <section style="background:var(--color-sand-deep);margin-top:74px">
      <div class="pad-sec rv" style="max-width:1240px;margin:0 auto;padding:74px 26px">
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:34px;flex-wrap:wrap">
          <div>
            <div class="eyebrow" data-reveal="slide-right" style="margin-bottom:12px">
              {{ lang === 'en' ? 'From the blog' : 'Del blog' }}
            </div>
            <h2 data-reveal="slide-right" style="font-family:var(--font-display);font-weight:700;font-size:clamp(30px,3.6vw,42px);margin:0;color:var(--color-ink);letter-spacing:-.02em">
              {{ lang === 'en' ? 'Stories, guides and tips for your trip.' : 'Historias, guías y consejos para tu viaje.' }}
            </h2>
          </div>
          <NuxtLink :to="localePath('/blog')" class="link-underline">
            {{ lang === 'en' ? 'See all' : 'Ver todos' }} →
          </NuxtLink>
        </div>
        <div class="cols-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:26px">
          <NuxtLink
            v-for="b in homePosts"
            :key="b.id"
            :to="localePath(`/blog/${b.id}`)"
            class="post-card"
            style="cursor:pointer;text-decoration:none;color:inherit;display:block"
          >
            <div class="post-card-media" style="position:relative;aspect-ratio:3/2.1;border-radius:16px;overflow:hidden;margin-bottom:16px">
              <NuxtImg
                :src="b.img"
                :width="420"
                :height="294"
                densities="x1 x2"
                :alt="b.title.es"
                class="post-card-img"
                style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
                loading="lazy"
              />
            </div>
            <div style="display:flex;gap:10px;align-items:center;font-size:12.5px;color:var(--color-ink-faint);margin-bottom:9px">
              <span style="color:var(--color-terracotta);font-weight:700">{{ t(b.cat) }}</span>
              <span>·</span>
              <span>{{ t(b.date) }}</span>
            </div>
            <h3 class="post-card-title" style="font-family:var(--font-display);font-weight:700;font-size:21px;line-height:1.18;margin:0 0 9px;color:var(--color-ink)">{{ t(b.title) }}</h3>
            <p style="font-size:14.5px;line-height:1.55;color:var(--color-ink-soft);margin:0">{{ t(b.excerpt) }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>


    <LeadForm />

    <!-- Slogan (also gives #contacto room to scroll to center of viewport) -->
    <section class="grain" style="min-height:50dvh;background:var(--color-forest-dark);display:flex;align-items:center;justify-content:center;padding:60px 26px">
      <p style="font-family:var(--font-accent);font-style:italic;font-weight:500;font-size:clamp(24px,3.4vw,38px);line-height:1.45;color:var(--color-cream);text-align:center;max-width:760px;margin:0">
        {{ lang === 'en' ? 'The perfect refuge where the soul finds peace.' : 'El refugio perfecto donde el alma encuentra la paz.' }}
      </p>
    </section>

    <PlaceEventModal ref="modal" />
    <WhatsAppFab />
  </div>
</template>

<style scoped>
.event-card { cursor: pointer; transition: transform .3s var(--ease-out-strong), box-shadow .3s var(--ease-out-strong); }
.event-card:active { transform: scale(.985); transition-duration: .12s; }
.event-card:focus-visible { outline: 3px solid var(--color-terracotta); outline-offset: 3px; }
.event-card-img { transition: transform .6s var(--ease-out-strong); }
/* Only a light bottom shade now: the glass pane carries text contrast, so
   most of the photo stays visible instead of sinking into a dark gradient. */
.event-card-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20,28,18,0) 45%, rgba(18,20,12,.42));
}
.event-date {
  position: absolute;
  top: 14px;
  left: 14px;
  border-radius: 13px;
  text-align: center;
  padding: 9px 13px;
  line-height: 1;
}
.event-date-d { font-family: var(--font-display); font-weight: 800; font-size: 25px; color: var(--color-terracotta); }
.event-date-m { font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--color-ink-soft); margin-top: 2px; }
.event-pane {
  position: relative;
  z-index: 2;
  margin: 12px;
  padding: 16px 18px 17px;
  border-radius: var(--radius-md);
}
.event-cat { font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--color-gold-light); }
.event-name { font-family: var(--font-display); font-weight: 700; font-size: 21px; margin: 6px 0 5px; line-height: 1.1; color: var(--color-cream); }
.event-meta { font-size: 13.5px; color: rgba(245,240,232,.84); margin: 0; }
@media (hover: hover) and (pointer: fine) {
  .event-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
  .event-card:hover .event-card-img { transform: scale(1.06); }
}
@media (prefers-reduced-motion: reduce) {
  .event-card, .event-card-img { transition: none; }
  .event-card:hover, .event-card:active { transform: none; }
  .event-card:hover .event-card-img { transform: none; }
}

/* Blog previews: no card chrome, so the hover lives in the image and the title
   colour instead of a lift — matches how the cards on /blog behave without
   giving these borderless ones a shadow they never had. */
.post-card-media { box-shadow: 0 0 0 0 rgba(37,29,20,0); transition: box-shadow .3s var(--ease-out); }
.post-card-img { transition: transform .6s var(--ease-out-strong); }
.post-card-title { transition: color .2s ease; }
@media (hover: hover) and (pointer: fine) {
  .post-card:hover .post-card-media { box-shadow: var(--shadow-md); }
  .post-card:hover .post-card-img { transform: scale(1.05); }
  .post-card:hover .post-card-title { color: var(--color-forest); }
}

@media (max-width: 560px) {
  /* This heading's copy is much longer than its sibling section titles
     ("Ferias, música...", "Historias, guías..."), so the shared 34px floor
     that works fine for those wraps this one to 4 cramped lines with orphaned
     em-dashes at the line breaks. */
  .attractions-h2 { font-size: 26px; }
}
</style>
