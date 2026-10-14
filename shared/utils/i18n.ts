export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

// Only looks at the browser's top-priority language tag — good enough to pick
// between the two locales this site actually has without pulling in a full
// Accept-Language parser for a binary choice.
export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  const first = (acceptLanguage ?? '').split(',')[0]?.trim().toLowerCase() ?? ''
  return first.startsWith('en') ? 'en' : DEFAULT_LOCALE
}

// Swaps the locale segment of a pathname, preserving everything after it —
// used by the language toggle so switching languages keeps you on the same
// listing, blog post, or filtered /propiedades search.
export function swapLocale(pathname: string, target: Locale): string {
  return pathname.replace(/^\/(es|en)(?=\/|$)/, `/${target}`)
}

// Picks the active side of a bilingual field. Falls back to Spanish when the
// English side was never filled in from the admin panel.
export function t(field: { es: string; en: string } | undefined, lang: Locale): string {
  if (!field) return ''
  return (lang === 'en' ? field.en : field.es) || field.es || field.en || ''
}

export function tList(field: { es: string[]; en: string[] } | undefined, lang: Locale): string[] {
  if (!field) return []
  const value = lang === 'en' ? field.en : field.es
  return value?.length ? value : (field.es ?? field.en ?? [])
}
