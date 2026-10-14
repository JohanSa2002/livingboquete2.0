<script setup lang="ts">
import type { NuxtError } from '#app'
import { DEFAULT_LOCALE, isLocale } from '#shared/utils/i18n'

const props = defineProps<{ error: NuxtError }>()

const route = useRoute()

// The error page sits outside the [lang] route tree, so there may be no URL
// segment to read the locale from — fall back to the path's first segment when
// it happens to be one, otherwise Spanish.
const segment = computed(() => route.path.split('/')[1])
const lang = computed(() => (isLocale(segment.value) ? segment.value : DEFAULT_LOCALE))

useHead(() => ({
  htmlAttrs: { lang: lang.value, 'data-lang': lang.value },
  title: props.error?.statusCode === 404
    ? (lang.value === 'en' ? 'Page not found · MIKA Homes' : 'Página no encontrada · MIKA Homes')
    : 'MIKA Homes',
}))
</script>

<template>
  <div>
    <a href="#main" class="skip-link">{{ lang === 'en' ? 'Skip to content' : 'Ir al contenido' }}</a>
    <SiteHeader />
    <main id="main" tabindex="-1">
      <section style="min-height:70dvh;display:flex;align-items:center;justify-content:center;padding:96px 26px;background:var(--color-sand)">
        <div style="max-width:520px;text-align:center">
          <div style="font-family:var(--font-display);font-weight:800;font-size:clamp(64px,12vw,120px);line-height:1;letter-spacing:-.03em;color:var(--color-forest);margin-bottom:8px">
            {{ error?.statusCode ?? 404 }}
          </div>
          <h1 style="font-family:var(--font-display);font-weight:700;font-size:clamp(24px,3vw,32px);margin:0 0 14px;color:var(--color-ink);text-wrap:balance">
            {{ lang === 'en' ? 'This page got lost in the mountains.' : 'Esta página se perdió en la montaña.' }}
          </h1>
          <p style="font-size:16px;line-height:1.6;color:var(--color-ink-soft);margin:0 0 32px">
            {{ lang === 'en'
              ? 'We couldn\'t find what you\'re looking for. The link may be broken or the page may have moved.'
              : 'No encontramos lo que buscas. Puede que el enlace esté roto o la página haya cambiado de dirección.' }}
          </p>
          <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
            <NuxtLink :to="`/${lang}`" class="btn btn-primary">
              <Icon name="mountain" :size="18" />
              {{ lang === 'en' ? 'Back to home' : 'Volver al inicio' }}
            </NuxtLink>
            <NuxtLink :to="`/${lang}/propiedades`" class="btn btn-secondary">
              {{ lang === 'en' ? 'See properties' : 'Ver propiedades' }}
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
