<script setup lang="ts">
import type { MasonryItem } from './MasonryGrid.vue'
import type { Bilingual, GalleryItem } from '#shared/types/content'

interface CategoryDef {
  id: string
  label: Bilingual
}

const props = defineProps<{
  items: (GalleryItem & { fullImg?: string })[]
  categories: CategoryDef[]
}>()

const { t } = useLocale()

const HEIGHTS = [400, 300, 500, 350, 450, 280, 520, 380, 420, 320, 480, 360]

const activeCat = ref('all')
const lightboxSrc = ref<string | null>(null)
const lightboxAlt = ref('')

const filtered = computed(() =>
  activeCat.value === 'all' ? props.items : props.items.filter(i => i.cat === activeCat.value),
)

const masonryItems = computed<MasonryItem[]>(() =>
  filtered.value.map((item, i) => ({
    id: item.id,
    img: item.img,
    fullImg: item.fullImg,
    height: HEIGHTS[i % HEIGHTS.length]!,
    label: t(item.label),
  })),
)

function openLightbox(item: MasonryItem) {
  lightboxSrc.value = item.fullImg ?? item.img
  lightboxAlt.value = item.label ?? ''
}

function closeLightbox() {
  lightboxSrc.value = null
}
</script>

<template>
  <!-- Category filters -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px">
    <button
      v-for="c in categories"
      :key="c.id"
      :style="{
        cursor: 'pointer',
        padding: '9px 18px',
        borderRadius: '999px',
        fontSize: '14px',
        fontWeight: 700,
        border: `1px solid ${c.id === activeCat ? 'var(--color-terracotta)' : 'rgba(37,29,20,.16)'}`,
        background: c.id === activeCat ? 'var(--color-terracotta)' : 'transparent',
        color: c.id === activeCat ? 'var(--color-cream)' : 'var(--color-ink)',
        transition: 'all .2s',
      }"
      @click="activeCat = c.id"
    >
      {{ t(c.label) }}
    </button>
  </div>

  <!-- Masonry grid -->
  <MasonryGrid
    :items="masonryItems"
    ease="power3.out"
    :duration="0.6"
    :stagger="0.05"
    animate-from="bottom"
    :scale-on-hover="true"
    :hover-scale="0.95"
    :blur-to-focus="true"
    @item-click="openLightbox"
  />

  <!-- Lightbox -->
  <div
    v-if="lightboxSrc"
    style="position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center"
    @click.self="closeLightbox"
  >
    <button
      style="position:absolute;top:20px;right:24px;background:transparent;border:none;color:#fff;font-size:32px;cursor:pointer;line-height:1"
      @click="closeLightbox"
    >
      &times;
    </button>
    <img
      :src="lightboxSrc"
      :alt="lightboxAlt"
      style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:12px"
    >
  </div>
</template>
