<script setup lang="ts">
import type { ListingSummary as Listing } from '#shared/types/content'
import { formatListingPrice, kindMeta, listingFacts, listingTypeLabel } from '#shared/utils/listings'

// One listing, in two shapes: a row in the results list (`list`) and the
// floating preview over the map (`preview`, adds the call to action). In the
// explorer list the whole card is a button that selects the listing on the
// map; given an `href` (e.g. "similar" strips) it's a link to the page instead.
const props = withDefaults(defineProps<{ listing: Listing; active?: boolean; variant?: 'list' | 'preview'; href?: string }>(), { variant: 'list' })
const emit = defineEmits<{ select: []; hover: [on: boolean]; close: [] }>()

const { lang, localePath, t } = useLocale()
const l = computed(() => props.listing)
const meta = computed(() => kindMeta(l.value.kind))
const facts = computed(() => listingFacts(l.value, lang.value))

const waHref = computed(() => {
  const digits = (l.value.contact?.phone ?? '').replace(/\D/g, '')
  const msg = lang.value === 'en'
    ? `Hi! I'm interested in "${t(l.value.name)}" (${l.value.id}). Could we schedule a visit?`
    : `¡Hola! Me interesa "${t(l.value.name)}" (${l.value.id}). ¿Podemos agendar una visita?`
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(msg)}` : ''
})
</script>

<template>
  <article
    data-no-reveal
    class="lcard"
    :class="[`lcard--${variant}`, { 'is-active': active }]"
    :style="`--kc:${meta.color}`"
    @mouseenter="emit('hover', true)"
    @mouseleave="emit('hover', false)"
  >
    <div class="lcard-media">
      <NuxtImg
        v-if="hasPhoto(l.img)"
        :src="l.img"
        :width="variant === 'preview' ? 320 : 280"
        :height="variant === 'preview' ? 220 : 200"
        densities="x1 x2"
        :alt="t(l.name)"
        class="lcard-img"
        loading="lazy"
      />
      <BlogPostArt v-else :seed="l.id" :color="meta.color" class="lcard-img" />
      <span class="lcard-kind"><span class="lcard-dot" />{{ t(meta.label) }}</span>
    </div>

    <div class="lcard-body">
      <div class="lcard-top">
        <span class="lcard-type">{{ listingTypeLabel(l, lang) }}</span>
        <span v-if="l.verified" class="lcard-verified" :title="lang === 'en' ? 'Verified in person' : 'Verificada en persona'">
          <Icon name="check" :size="13" />{{ lang === 'en' ? 'Verified' : 'Verificada' }}
        </span>
      </div>
      <h3 class="lcard-name">{{ t(l.name) }}</h3>
      <p class="lcard-loc"><Icon name="location" :size="13" />{{ t(l.loc) }}</p>
      <p class="lcard-facts">{{ facts.join(' · ') }}</p>
      <p v-if="l.kind !== 'rent' && l.title === 'derechos'" class="lcard-warn">
        <Icon name="alert" :size="13" />{{ lang === 'en' ? 'Possession rights (not titled)' : 'Derechos posesorios (sin título)' }}
      </p>
      <div class="lcard-price num">{{ formatListingPrice(l, lang) }}</div>

      <div v-if="variant === 'preview'" class="lcard-actions">
        <NuxtLink :to="localePath(`/propiedades/${l.id}`)" class="lcard-cta">
          {{ lang === 'en' ? 'View details' : 'Ver detalles' }}
          <Icon name="arrow-right" :size="15" />
        </NuxtLink>
        <a v-if="waHref" :href="waHref" target="_blank" rel="noopener" class="lcard-cta lcard-cta--ghost" :aria-label="`WhatsApp — ${t(l.name)}`">
          <Icon name="chat" :size="15" />
          WhatsApp
        </a>
      </div>
    </div>

    <!-- List rows: the whole card selects the listing on the map (or links). -->
    <NuxtLink
      v-if="variant === 'list' && href"
      :to="href"
      class="lcard-hit"
      :aria-label="`${t(l.name)} — ${formatListingPrice(l, lang)}`"
    />
    <button
      v-else-if="variant === 'list'"
      type="button"
      class="lcard-hit"
      :aria-pressed="active"
      :aria-label="`${t(l.name)} — ${formatListingPrice(l, lang)}`"
      @click="emit('select')"
      @focus="emit('hover', true)"
      @blur="emit('hover', false)"
    />
    <button
      v-else
      type="button"
      class="lcard-close"
      :aria-label="lang === 'en' ? 'Close' : 'Cerrar'"
      @click="emit('close')"
    >
      <Icon name="close" :size="16" />
    </button>
  </article>
</template>

<style scoped>
.lcard {
  position: relative;
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  gap: 14px;
  padding: 10px;
  border-radius: 14px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.lcard:hover, .lcard.is-active { border-color: var(--kc); }
.lcard.is-active { box-shadow: 0 0 0 1px var(--kc); }

.lcard-media {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-sand-deep);
}
.lcard-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lcard-kind {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--color-white);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-ink);
}
.lcard-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--kc); }

.lcard-body { display: flex; flex-direction: column; min-width: 0; padding: 2px 4px 2px 0; }
.lcard-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px; }
.lcard-type { font-size: 12px; font-weight: 700; color: var(--kc); }
.lcard-verified {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-forest);
  white-space: nowrap;
}
.lcard-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  line-height: 1.22;
  margin: 0 0 4px;
  color: var(--color-ink);
  text-wrap: balance;
}
.lcard-loc {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--color-ink-soft);
}
.lcard-facts { margin: 0 0 6px; font-size: 13px; color: var(--color-ink-mid); }
.lcard-warn {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-terracotta);
}
.lcard-price {
  margin-top: auto;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 17px;
  color: var(--color-ink);
}

.lcard-hit {
  position: absolute;
  inset: 0;
  border: none;
  background: transparent;
  border-radius: inherit;
  cursor: pointer;
}
.lcard-hit:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

/* --- Preview over the map --- */
.lcard--preview {
  grid-template-columns: 132px minmax(0, 1fr);
  box-shadow: 0 8px 24px -8px rgba(37, 29, 20, .35);
  border-color: transparent;
}
.lcard--preview .lcard-media { aspect-ratio: auto; min-height: 100%; }
.lcard--preview .lcard-body { padding-right: 28px; }
.lcard-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.lcard-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 999px;
  background: var(--kc);
  color: var(--color-white);
  font-weight: 700;
  font-size: 13.5px;
  text-decoration: none;
  transition: filter .2s ease, transform .15s var(--ease-out);
}
.lcard-cta:hover { filter: brightness(1.12); }
.lcard-cta--ghost { background: transparent; color: var(--kc); box-shadow: inset 0 0 0 1.5px var(--kc); }
.lcard-cta--ghost:hover { filter: none; background: color-mix(in srgb, var(--kc) 10%, transparent); }
.lcard-cta:active { transform: scale(.97); }
.lcard-cta:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.lcard-close {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--color-sand);
  color: var(--color-ink);
  cursor: pointer;
}
.lcard-close:hover { background: var(--color-sand-deep); }

@media (max-width: 420px) {
  .lcard { grid-template-columns: 112px minmax(0, 1fr); gap: 12px; }
  .lcard--preview { grid-template-columns: 104px minmax(0, 1fr); }
}
</style>
