<script setup lang="ts">
const { lang } = useLocale()
</script>

<template>
  <a href="#main" class="skip-link">{{ lang === 'en' ? 'Skip to content' : 'Ir al contenido' }}</a>
  <SiteHeader />
  <main id="main" tabindex="-1">
    <slot />
  </main>
  <SiteFooter />
</template>
