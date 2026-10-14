<script setup lang="ts">
const { lang, localePath } = useLocale()
</script>

<template>
  <div class="pad-sec" style="max-width:1240px;margin:0 auto;padding-top:84px">
    <div class="stays-owner rv">
      <div class="stays-owner-copy">
        <div class="eyebrow" style="color:var(--color-gold-light);margin-bottom:12px">
          {{ lang === 'en' ? 'For owners' : 'Para propietarios' }}
        </div>
        <h2 class="stays-h2" style="color:var(--color-sand);margin-bottom:14px">
          <template v-if="lang === 'en'">Own a property<br>in Boquete?</template>
          <template v-else>¿Tienes una propiedad<br>en Boquete?</template>
        </h2>
        <p>
          {{ lang === 'en'
            ? 'List it with us and reach people looking to stay for months, not nights. Stable tenants, less turnover.'
            : 'Publícala con nosotros y llega a personas que buscan quedarse meses, no noches. Inquilinos estables, menos rotación.' }}
        </p>
        <NuxtLink :to="localePath('/publicar-propiedad')" class="btn stays-owner-btn">
          {{ lang === 'en' ? 'List my property' : 'Quiero publicar' }}
          <Icon name="chevron-right" :size="16" />
        </NuxtLink>
      </div>
      <div class="stays-owner-art" aria-hidden="true">
        <div class="stays-owner-card c1"><Icon name="mountain" :size="38" /></div>
        <div class="stays-owner-card c2"><Icon name="coffee" :size="38" /></div>
        <div class="stays-owner-card c3"><Icon name="home" :size="38" /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stays-owner {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 30px;
  align-items: center;
  background:
    radial-gradient(120% 160% at 88% 12%, rgba(162,106,66,.35) 0%, transparent 55%),
    var(--color-forest);
  border-radius: 26px;
  padding: 58px 54px;
  overflow: hidden;
  position: relative;
}
.stays-owner-copy p {
  font-size: 16px;
  line-height: 1.65;
  color: rgba(245,240,232,.82);
  max-width: 460px;
  margin: 0 0 28px;
}
.stays-owner-btn {
  background: var(--color-sand);
  color: var(--color-forest);
  box-shadow: 0 16px 34px -14px rgba(0,0,0,.5);
}
.stays-owner-btn:hover { background: var(--color-white); transform: translateY(-1px); }
.stays-owner-art { position: relative; height: 230px; }
.stays-owner-card {
  position: absolute;
  width: 92px; height: 92px;
  border-radius: 24px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.24);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  /* Same stroke set as the rest of the UI — the tiles used to hold emoji,
     which render differently on every platform. */
  color: var(--color-gold-pale);
  animation: floaty 5.5s ease-in-out infinite;
}
.stays-owner-card.c1 { top: 6px; left: 12%; animation-delay: 0s; }
.stays-owner-card.c2 { top: 84px; left: 46%; animation-delay: 1.2s; }
.stays-owner-card.c3 { top: 20px; left: 74%; animation-delay: 2.3s; }
@keyframes floaty {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-14px) rotate(2deg); }
}

@media (max-width: 1024px) {
  .stays-owner { grid-template-columns: 1fr; padding: 44px 34px; }
  .stays-owner-art { display: none; }
}
</style>
