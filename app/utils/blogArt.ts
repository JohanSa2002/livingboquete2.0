// Posts without a real photo point at the generic "imagen no disponible"
// placeholder, a pale grey box that disappears on the sand ground. Those get a
// branded stand-in instead (see BlogPostArt): a crop of the blog's engraving
// reversed out of a palette colour.
const PLACEHOLDER = 'imagen-no-disponible'

export function hasPhoto(src?: string | null) {
  return !!src && !src.includes(PLACEHOLDER)
}

// Vignettes of /fondoblogs-mobile.webp, as background-position crops.
const ART = [
  { pos: '2% 4%', bg: 'var(--color-forest)' }, // café
  { pos: '52% 8%', bg: 'var(--color-wood)' }, // volcán
  { pos: '98% 2%', bg: 'var(--color-moss)' }, // rama de café
  { pos: '30% 98%', bg: 'var(--color-forest)' }, // iglesia
  { pos: '62% 96%', bg: 'var(--color-wood)' }, // puente
  { pos: '2% 92%', bg: 'var(--color-moss)' }, // orquídea
  { pos: '86% 98%', bg: 'var(--color-forest)' }, // taza
  { pos: '99% 62%', bg: 'var(--color-wood)' }, // letrero
] as const

// Keyed on the post id, not its position in a list, so a post wears the same
// cover on the listing, on its own page and in "related" strips.
export function blogArtStyle(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const a = ART[h % ART.length]!
  return { '--art-pos': a.pos, '--art-bg': a.bg }
}

// ~200 words per minute, the usual figure for Spanish/English web reading.
export function readingMinutes(paragraphs: string[]) {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
