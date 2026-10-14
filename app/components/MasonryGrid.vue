<script setup lang="ts">
import gsap from 'gsap'

export interface MasonryItem {
  id: string
  img: string
  fullImg?: string
  height: number
  label?: string
}

interface GridItem extends MasonryItem {
  x: number
  y: number
  w: number
  h: number
}

const props = withDefaults(defineProps<{
  items: MasonryItem[]
  ease?: string
  duration?: number
  stagger?: number
  animateFrom?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'random'
  scaleOnHover?: boolean
  hoverScale?: number
  blurToFocus?: boolean
}>(), {
  ease: 'power3.out',
  duration: 0.6,
  stagger: 0.05,
  animateFrom: 'bottom',
  scaleOnHover: true,
  hoverScale: 0.95,
  blurToFocus: true,
})

const emit = defineEmits<{ itemClick: [item: MasonryItem] }>()

const containerRef = ref<HTMLElement | null>(null)
const width = ref(0)
const columns = ref(1)
const isInView = ref(false)
let hasMounted = false

const QUERIES = ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)']
const VALUES = [5, 4, 3, 2]

function readColumns() {
  const idx = QUERIES.findIndex(q => matchMedia(q).matches)
  columns.value = VALUES[idx] ?? 1
}

const grid = computed<GridItem[]>(() => {
  if (!width.value) return []

  const colHeights = Array.from({ length: columns.value }, () => 0)
  const columnWidth = width.value / columns.value

  return props.items.map((child) => {
    const col = colHeights.indexOf(Math.min(...colHeights))
    const x = columnWidth * col
    const height = child.height / 2
    const y = colHeights[col]!
    colHeights[col] = y + height
    return { ...child, x, y, w: columnWidth, h: height }
  })
})

const totalHeight = computed(() => {
  if (!grid.value.length) return 0
  return Math.max(...grid.value.map(item => item.y + item.h))
})

function getInitialPosition(item: GridItem) {
  const containerRect = containerRef.value?.getBoundingClientRect()
  if (!containerRect) return { x: item.x, y: item.y }

  let direction = props.animateFrom
  if (direction === 'random') {
    const directions = ['top', 'bottom', 'left', 'right'] as const
    direction = directions[Math.floor(Math.random() * directions.length)]!
  }

  switch (direction) {
    case 'top': return { x: item.x, y: -200 }
    case 'bottom': return { x: item.x, y: window.innerHeight + 200 }
    case 'left': return { x: -200, y: item.y }
    case 'right': return { x: window.innerWidth + 200, y: item.y }
    case 'center': return {
      x: containerRect.width / 2 - item.w / 2,
      y: containerRect.height / 2 - item.h / 2,
    }
    default: return { x: item.x, y: item.y + 100 }
  }
}

function layout() {
  if (!grid.value.length) return

  grid.value.forEach((item, index) => {
    const selector = `[data-key="${item.id}"]`
    const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h }

    if (!hasMounted) {
      const initialPos = getInitialPosition(item)
      const initialState: gsap.TweenVars = {
        opacity: 0,
        x: initialPos.x,
        y: initialPos.y,
        width: item.w,
        height: item.h,
        ...(props.blurToFocus && { filter: 'blur(10px)' }),
      }

      if (isInView.value) {
        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(props.blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: 'power3.out',
          delay: index * props.stagger,
        })
      }
      else {
        // Not on screen yet — park it in the pre-entrance state instead of
        // animating, so nothing plays until the user scrolls here.
        gsap.set(selector, initialState)
      }
    }
    else {
      gsap.to(selector, { ...animationProps, duration: props.duration, ease: props.ease, overwrite: 'auto' })
    }
  })

  if (isInView.value) hasMounted = true
}

let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

onMounted(() => {
  readColumns()
  QUERIES.forEach(q => matchMedia(q).addEventListener('change', readColumns))

  if (containerRef.value) {
    ro = new ResizeObserver(([entry]) => {
      width.value = entry!.contentRect.width
    })
    ro.observe(containerRef.value)

    // Gating on our own observer guarantees items fly in only once the user
    // actually scrolls to them — grid layout otherwise resolves almost
    // instantly on mount and fires the entrance regardless of scroll position.
    io = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return
      isInView.value = true
      io?.disconnect()
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 })
    io.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  QUERIES.forEach(q => matchMedia(q).removeEventListener('change', readColumns))
  ro?.disconnect()
  io?.disconnect()
})

watch([grid, isInView], () => nextTick(layout), { flush: 'post' })

function onEnter(item: GridItem) {
  if (props.scaleOnHover) {
    gsap.to(`[data-key="${item.id}"]`, { scale: props.hoverScale, duration: 0.3, ease: 'power2.out' })
  }
}

function onLeave(item: GridItem) {
  if (props.scaleOnHover) {
    gsap.to(`[data-key="${item.id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' })
  }
}
</script>

<template>
  <div ref="containerRef" class="masonry-list" :style="{ height: totalHeight ? `${totalHeight}px` : 'auto' }">
    <div
      v-for="item in grid"
      :key="item.id"
      :data-key="item.id"
      class="masonry-item-wrapper"
      role="button"
      tabindex="0"
      :aria-label="item.label"
      @click="emit('itemClick', item)"
      @keydown.enter.prevent="emit('itemClick', item)"
      @keydown.space.prevent="emit('itemClick', item)"
      @mouseenter="onEnter(item)"
      @mouseleave="onLeave(item)"
    >
      <div class="masonry-item-img">
        <img :src="item.img" :alt="item.label ?? ''" loading="lazy">
        <div v-if="item.label" class="masonry-item-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>
