import type { IconName } from '~/components/Icon.vue'

// Presentational only — maps an amenity key from the catalogue to its icon.
export const AMEN_ICON: Record<string, IconName> = {
  wifi: 'wifi', kitchen: 'kitchen', view: 'mountain', parking: 'car',
  fireplace: 'flame', pool: 'waves', pets: 'paw', furnished: 'sofa',
}
