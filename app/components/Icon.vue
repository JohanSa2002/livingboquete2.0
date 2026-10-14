<script setup lang="ts">
import type { SVGAttributes } from 'vue'

// Minimal stroke-icon set for the rental platform. One shared style
// (1.75px stroke, rounded caps) so the interface never mixes icon
// languages the way emoji did across platforms.
export type IconName =
  | 'location' | 'bed' | 'bath' | 'users' | 'wifi' | 'car' | 'paw'
  | 'flame' | 'mountain' | 'waves' | 'sofa' | 'star' | 'close'
  | 'sliders' | 'check' | 'chevron-right' | 'search' | 'coffee' | 'kitchen'
  | 'phone' | 'mail' | 'ruler' | 'alert' | 'home'
  | 'laptop' | 'clock' | 'document' | 'tag' | 'chat' | 'calendar' | 'arrow-right' | 'compass'
  | 'globe' | 'chevron-down' | 'arrow-left' | 'link'

const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 18 })

// `star` is a solid glyph and `check` needs a heavier stroke to read at small
// sizes — everything else shares the same stroke treatment.
const OVERRIDES: Partial<Record<IconName, SVGAttributes>> = {
  star: { fill: 'currentColor', stroke: 'none' },
  check: { 'stroke-width': '2' },
}

const PATHS: Record<IconName, string> = {
  'location': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.75"/>',
  'bed': '<path d="M2 18v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6"/><path d="M2 18v2"/><path d="M22 18v2"/><path d="M4 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/><path d="M12 10V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/>',
  'bath': '<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z"/><path d="M4 12V6a2 2 0 0 1 2-2c1 0 1.7.6 2 1.3"/><path d="M8 20v2"/><path d="M16 20v2"/>',
  'users': '<path d="M17 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 5 18.5V20"/><circle cx="9.5" cy="8" r="3.25"/><path d="M18.5 20v-1.5a3.5 3.5 0 0 0-2.3-3.29"/><path d="M14.7 4.9a3.25 3.25 0 0 1 0 6.2"/>',
  'wifi': '<path d="M3.5 8.5a15 15 0 0 1 17 0"/><path d="M6.5 12.3a10.5 10.5 0 0 1 11 0"/><path d="M9.7 16a5.8 5.8 0 0 1 4.6 0"/><circle cx="12" cy="19.2" r="1" fill="currentColor" stroke="none"/>',
  'car': '<path d="M3 16V11l2.2-5A2 2 0 0 1 7.1 5h9.8a2 2 0 0 1 1.9 1.4L21 11v5"/><path d="M3 16h18"/><path d="M3 16v2.5A1.5 1.5 0 0 0 4.5 20H6a1.5 1.5 0 0 0 1.5-1.5V16"/><path d="M16.5 16v2.5A1.5 1.5 0 0 0 18 20h1.5a1.5 1.5 0 0 0 1.5-1.5V16"/><circle cx="7.5" cy="12.5" r="1"/><circle cx="16.5" cy="12.5" r="1"/>',
  'paw': '<circle cx="7" cy="9" r="1.6"/><circle cx="12" cy="6.5" r="1.6"/><circle cx="17" cy="9" r="1.6"/><path d="M12 12.5c-3 0-5.5 2-5.5 4.3 0 1.6 1.3 2.7 2.9 2.4l1-.2c1-.2 2.2-.2 3.2 0l1 .2c1.6.3 2.9-.8 2.9-2.4 0-2.3-2.5-4.3-5.5-4.3Z"/>',
  'flame': '<path d="M12 3c1 3-3 4-3 8a3 3 0 0 0 6 0c1 0 2 1.2 2 3a5 5 0 0 1-10 0c0-4 2-4.5 3-7.5.4 1 .8 1.6 1.5 2 .3-2 0-4-.5-5.5Z"/>',
  'mountain': '<path d="m3 19 6-10 3.5 5.5"/><path d="m10.5 19 6.5-11 4 11"/><path d="M14.2 15.5h6.6"/>',
  'waves': '<path d="M2 8.5c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0"/><path d="M2 14c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0"/><path d="M2 19.5c1.5-1.3 3-1.3 4.5 0s3 1.3 4.5 0 3-1.3 4.5 0 3 1.3 4.5 0"/>',
  'sofa': '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 11h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4Z"/><path d="M4 17v2.5"/><path d="M20 17v2.5"/>',
  'star': '<path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8L12 2.5Z"/>',
  'close': '<path d="M6 6l12 12M18 6 6 18"/>',
  'sliders': '<path d="M4 6h9"/><path d="M17 6h3"/><path d="M4 12h3"/><path d="M11 12h9"/><path d="M4 18h12"/><path d="M20 18h0"/><circle cx="13" cy="6" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
  'check': '<path d="M5 13l4 4L19 7"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  'search': '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  'kitchen': '<path d="M4 3v6a2 2 0 0 0 2 2v10"/><path d="M4 3v6"/><path d="M7 3v6"/><path d="M14 3s-2 2-2 5 2 3 2 3v9"/>',
  'coffee': '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"/><path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 5.5c0-1 .8-1 .8-2S8 2 8 2"/><path d="M12 5.5c0-1 .8-1 .8-2S12 2 12 2"/>',
  'phone': '<path d="M21 16.4v3a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 3.3 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L7.4 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  'mail': '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6 9 6.5L21 6"/>',
  'ruler': '<rect x="2.5" y="7" width="19" height="10" rx="2"/><path d="M7 7v3"/><path d="M11 7v3"/><path d="M15 7v3"/><path d="M19 7v3"/>',
  'alert': '<circle cx="12" cy="12" r="9"/><path d="M12 8v4.5"/><circle cx="12" cy="16" r=".6" fill="currentColor" stroke="none"/>',
  'home': '<path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V19a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1V9.5"/>',
  'laptop': '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>',
  'document': '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  'tag': '<path d="M3.5 12.5 12.5 3.5H20v7.5l-9 9a1.4 1.4 0 0 1-2 0l-5.5-5.5a1.4 1.4 0 0 1 0-2Z"/><circle cx="16" cy="8" r="1" fill="currentColor" stroke="none"/>',
  'chat': '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V16A2.5 2.5 0 0 1 4 13.5v-7Z"/>',
  'calendar': '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  'compass': '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5.2-4.8 1.8 2.2-5.2z"/>',
  'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M4.5 7.5h15"/><path d="M4.5 16.5h15"/><path d="M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  'link': '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
}

const attrs = computed<SVGAttributes>(() => ({
  'width': props.size,
  'height': props.size,
  'viewBox': '0 0 24 24',
  'fill': 'none',
  'stroke': 'currentColor',
  'stroke-width': '1.75',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  ...(OVERRIDES[props.name] ?? {}),
}))
</script>

<template>
  <svg v-bind="attrs" v-html="PATHS[name]" />
</template>
