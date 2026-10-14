<script setup lang="ts">
import type { IconName } from '~/components/Icon.vue'

const { lang } = useLocale()
const filters = useStaysFilters()

// Lifestyle shortcuts: count + representative photo pulled from real listings.
const LIFESTYLES = [
  { key: 'view', kind: 'amen', es: 'Vista al volcán', en: 'Volcano views', taglineEs: 'Amanece frente al Barú', taglineEn: 'Wake up facing Barú', icon: 'mountain' as IconName, img: '/lifestyle/vista-al-volcan.webp' },
  { key: 'pets', kind: 'amen', es: 'Con tu mascota', en: 'With your pet', taglineEs: 'Ellos también se mudan', taglineEn: 'They move in too', icon: 'paw' as IconName, img: '/lifestyle/casa-perro.webp' },
  { key: 'furnished', kind: 'amen', es: 'Llega y vive', en: 'Move-in ready', taglineEs: 'Amueblado, sin vueltas', taglineEn: 'Furnished, zero hassle', icon: 'sofa' as IconName, img: '/lifestyle/casa-amueblada.webp' },
  { key: 'casa', kind: 'type', es: 'Casa entera', en: 'Whole house', taglineEs: 'Tu espacio, tus reglas', taglineEn: 'Your space, your rules', icon: 'flame' as IconName, img: '/lifestyle/casa-completa.webp' },
] as const

const lifestyleData = computed(() => LIFESTYLES.map(ls => ({
  ...ls,
  count: ls.kind === 'amen'
    ? filters.rentals.value.filter(r => r.amen.includes(ls.key)).length
    : filters.rentals.value.filter(r => r.type === ls.key).length,
})))
</script>

<template>
  <section class="pad-sec" style="max-width:1240px;margin:0 auto;padding-top:72px">
    <div class="eyebrow rv" style="margin-bottom:12px">
      {{ lang === 'en' ? 'Browse your way' : 'Explora a tu manera' }}
    </div>
    <div class="stays-sec-head rv">
      <h2 class="stays-h2">
        <template v-if="lang === 'en'">How do you want <em>to live</em>?</template>
        <template v-else>¿Cómo quieres <em>vivir</em>?</template>
      </h2>
      <p class="stays-sec-sub">
        {{ lang === 'en' ? 'Start from the lifestyle, not the listing.' : 'Empieza por el estilo de vida, no por el listado.' }}
      </p>
    </div>

    <div class="stays-life-grid">
      <button
        v-for="(ls, i) in lifestyleData"
        :key="ls.key"
        class="stays-life-card rv"
        :disabled="ls.count === 0"
        :aria-disabled="ls.count === 0"
        :style="`animation-delay:${(i * 0.06).toFixed(2)}s`"
        @click="filters.applyShortcut(ls.key, ls.kind)"
      >
        <NuxtImg
          :src="ls.img"
          :alt="ls.es"
          sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 880px) calc(50vw - 30px), 290px"
          :quality="62"
          loading="lazy"
        />
        <div class="stays-life-veil" />
        <div class="stays-life-body">
          <span class="stays-life-icon"><Icon :name="ls.icon" :size="18" /></span>
          <div class="stays-life-name">{{ lang === 'en' ? ls.en : ls.es }}</div>
          <div class="stays-life-tag">{{ lang === 'en' ? ls.taglineEn : ls.taglineEs }}</div>
          <div v-if="ls.count === 0" class="stays-life-count">
            {{ lang === 'en' ? 'Coming soon' : 'Próximamente' }}
          </div>
          <div v-else class="stays-life-count">
            {{ ls.count }}
            {{ lang === 'en' ? (ls.count === 1 ? 'option' : 'options') : (ls.count === 1 ? 'opción' : 'opciones') }}
            <Icon name="chevron-right" :size="13" />
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.stays-life-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}
.stays-life-card {
  position: relative;
  min-width: 0;
  aspect-ratio: 4/3;
  border: none;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  text-align: left;
  background: var(--color-sand-deep);
  transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out);
}
.stays-life-card:hover { transform: translateY(-7px); box-shadow: var(--shadow-lg); }
.stays-life-card :deep(img) {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform .6s var(--ease-out);
}
.stays-life-card:hover :deep(img) { transform: scale(1.08); }
.stays-life-veil {
  position: absolute; inset: 0;
  background: linear-gradient(185deg, rgba(20,24,16,.06) 0%, rgba(18,22,15,.12) 42%, rgba(14,18,11,.86) 100%);
}
.stays-life-body {
  position: absolute;
  left: 16px; right: 16px; bottom: 16px;
  color: var(--color-white);
}
.stays-life-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 10px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.3);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  margin-bottom: 10px;
}
.stays-life-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -.01em;
  margin-bottom: 3px;
}
.stays-life-tag {
  font-family: var(--font-accent);
  font-style: italic;
  font-size: 13.5px;
  color: rgba(245,240,232,.85);
  margin-bottom: 10px;
}
.stays-life-count {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-white);
  background: rgba(255,255,255,.13);
  border: 1px solid rgba(255,255,255,.26);
  border-radius: var(--radius-pill);
  padding: 5px 11px;
  transition: background-color .2s var(--ease-out), gap .2s var(--ease-out);
}
.stays-life-card:hover .stays-life-count { background: var(--color-forest); gap: 8px; }
.stays-life-card[disabled] {
  cursor: not-allowed;
  opacity: .55;
  filter: saturate(.55);
  pointer-events: none;
}
.stays-life-card[disabled]:hover { transform: none; box-shadow: none; }

@media (max-width: 1024px) {
  .stays-life-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .stays-life-grid { grid-template-columns: 1fr; }
}
</style>
