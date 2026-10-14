<script setup lang="ts">
// Branded cover for posts without a photo: the engraving inverted to light
// line-work and screened over a solid palette colour. Fills its (positioned)
// parent, so the parent owns aspect ratio and radius.
const props = defineProps<{ seed: string; label?: string; size?: 'md' | 'lg'; color?: string }>()
// `color` pins the ground colour (listings use their kind's colour, so a
// rental's placeholder never reads as a sale); otherwise it follows the seed.
const style = computed(() => ({ ...blogArtStyle(props.seed), ...(props.color ? { '--art-bg': props.color } : {}) }))
</script>

<template>
  <div class="post-art" :class="size === 'lg' && 'post-art--lg'" :style="style" aria-hidden="true">
    <span v-if="label" class="post-art-cat">{{ label }}</span>
  </div>
</template>

<style scoped>
.post-art {
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: var(--art-bg);
}
.post-art::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/fondoblogs-mobile.webp');
  background-size: 260% auto;
  background-position: var(--art-pos);
  background-repeat: no-repeat;
  filter: grayscale(1) invert(1) contrast(1.35) brightness(1.05);
  mix-blend-mode: screen;
  opacity: .62;
}
.post-art::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(20, 15, 10, .45), rgba(20, 15, 10, 0) 55%);
}
.post-art-cat {
  position: absolute;
  left: 16px;
  bottom: 14px;
  z-index: 1;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -.005em;
  color: var(--color-sand);
}
.post-art--lg::before { background-size: 200% auto; }
.post-art--lg .post-art-cat { font-size: 22px; left: 24px; bottom: 22px; }
</style>
