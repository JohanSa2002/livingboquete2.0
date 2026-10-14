<script setup lang="ts">
// Filters + results. Both children share the page's filter state through
// useStaysFilters(); the only state owned here is the mobile drawer.
const { lang } = useLocale()
const drawerOpen = ref(false)
</script>

<template>
  <section id="explorar" class="pad-sec" style="max-width:1240px;margin:0 auto;padding-top:84px;scroll-margin-top:88px">
    <div class="stays-sec-head rv" style="margin-bottom:28px">
      <h2 class="stays-h2">
        <template v-if="lang === 'en'">Every <em>rental</em></template>
        <template v-else>Todos los <em>alquileres</em></template>
      </h2>
      <p class="stays-sec-sub">
        {{ lang === 'en' ? 'Filter by type, price and amenities. No accounts, no fees.' : 'Filtra por tipo, precio y comodidades. Sin cuentas, sin comisiones.' }}
      </p>
    </div>

    <!-- Mobile filters trigger -->
    <div class="filters-mobile-bar" style="padding:0 0 20px;display:none">
      <button class="btn btn-secondary" style="width:100%;justify-content:center" @click="drawerOpen = true">
        <Icon name="sliders" :size="18" />
        {{ lang === 'en' ? 'Filters' : 'Filtros' }}
      </button>
    </div>

    <div class="split-2" style="display:grid;grid-template-columns:296px 1fr;gap:36px;align-items:start;padding-bottom:8px">
      <StaysFilters v-model:open="drawerOpen" />

      <!-- Mobile backdrop -->
      <div class="filters-backdrop" :class="{ 'is-open': drawerOpen, hidden: !drawerOpen }" style="position:fixed;inset:0;z-index:80;background:rgba(20,15,10,.45)" @click="drawerOpen = false" />

      <StaysGrid />
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 880px) {
  .filters-backdrop.is-open { display: block !important; }
}
</style>
