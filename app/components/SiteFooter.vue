<script setup lang="ts">
import { NAV } from '#shared/utils/constants'

const { lang, localePath, t } = useLocale()
</script>

<template>
  <footer class="grain" style="background:var(--color-forest-dark);color:#C9CDBE;margin-top:0">
    <div
      class="footer-grid"
      style="max-width:1240px;margin:0 auto;padding:64px 26px 30px;display:grid;grid-template-columns:1.6fr 1fr 1.4fr;gap:40px"
    >
      <!-- Brand -->
      <div>
        <div style="display:flex;align-items:center;margin-bottom:16px">
          <span style="--s:0.21487603305785125;width:calc(811px * var(--s));height:52px;overflow:hidden;position:relative;display:block;flex:none">
            <img
              src="/logo-mika-light.webp"
              alt="MIKA Homes"
              style="position:absolute;top:calc(-452px * var(--s));left:calc(-134px * var(--s));width:calc(1080px * var(--s));height:calc(1080px * var(--s));max-width:none"
            >
          </span>
        </div>
        <p style="font-size:14.5px;line-height:1.65;color:#A9AD9C;max-width:300px;margin:0">
          {{ lang === 'en'
            ? 'Community guide for Boquete: a mountain town in the highlands of Chiriquí, Panama.'
            : 'Guía de la comunidad de Boquete: un pueblo de montaña en las tierras altas de Chiriquí, Panamá.' }}
        </p>
      </div>

      <!-- Explore links -->
      <div>
        <h4 style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#A7AC9D;margin:0 0 14px">
          {{ lang === 'en' ? 'Explore' : 'Explorar' }}
        </h4>
        <div style="display:flex;flex-direction:column;gap:10px">
          <NuxtLink
            v-for="item in NAV"
            :key="item.key"
            :to="localePath(item.href)"
            class="footer-link"
          >
            {{ t(item.label) }}
          </NuxtLink>
          <NuxtLink :to="localePath('/como-funciona')" class="footer-link">
            {{ lang === 'en' ? 'How it works' : 'Cómo funciona' }}
          </NuxtLink>
          <NuxtLink :to="localePath('/publicar-propiedad')" class="footer-link">
            {{ lang === 'en' ? 'List your property' : 'Publica tu propiedad' }}
          </NuxtLink>
        </div>
      </div>

      <!-- Newsletter -->
      <div>
        <h4 style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#A7AC9D;margin:0 0 14px">
          {{ lang === 'en' ? 'Newsletter' : 'Boletín' }}
        </h4>
        <p style="font-size:14px;color:#A9AD9C;margin:0 0 14px">
          {{ lang === 'en' ? 'The free guide, plus an alert when a new property goes live.' : 'La guía gratuita, más un aviso cuando se publique una propiedad nueva.' }}
        </p>
        <a
          :href="`${localePath('/')}/#contacto`"
          class="footer-cta"
        >
          {{ lang === 'en' ? 'Subscribe' : 'Suscribirme' }}
          →
        </a>
      </div>
    </div>

    <div style="border-top:1px solid rgba(255,255,255,.08)">
      <div style="max-width:1240px;margin:0 auto;padding:20px 26px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-size:13px;color:#A7AC9D">
        <span>
          © 2026
          {{ lang === 'en' ? 'Boquete Community · All rights reserved' : 'Comunidad de Boquete · Todos los derechos reservados' }}
        </span>
        <span>
          {{ lang === 'en' ? 'Panama · Chiriquí Highlands' : 'Panamá · Tierras altas de Chiriquí' }}
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  color: #C9CDBE;
  text-decoration: none;
  font-size: 14.5px;
  width: fit-content;
  transition: color .18s ease, transform .2s var(--ease-out);
}
.footer-link:hover { color: var(--color-cream); transform: translateX(3px); }
.footer-link:focus-visible { color: var(--color-cream); }

.footer-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-wood);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 11px 16px;
  border-radius: 10px;
  text-decoration: none;
  box-shadow: 0 12px 24px -14px rgba(0,0,0,.6);
  transition: background-color .18s ease, transform .18s var(--ease-out), box-shadow .18s ease;
}
.footer-cta:hover { background: var(--color-coffee); transform: translateY(-1px); box-shadow: 0 16px 28px -14px rgba(0,0,0,.7); }
.footer-cta:active { transform: translateY(1px) scale(.98); }
</style>
