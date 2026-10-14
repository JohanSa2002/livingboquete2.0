import type { Locale } from '#shared/utils/i18n'
import { DEFAULT_LOCALE, isLocale, swapLocale, t as pick, tList as pickList } from '#shared/utils/i18n'

// The URL segment is the single source of truth for which language a page
// renders — there is no client-side content toggle.
export function useLocale() {
  const route = useRoute()

  const lang = computed<Locale>(() => {
    const raw = route.params.lang
    const value = Array.isArray(raw) ? raw[0] : raw
    return isLocale(value) ? value : DEFAULT_LOCALE
  })

  // Prefixes an app-relative path with the active locale. '/' becomes '/es'.
  const localePath = (href: string) => (href === '/' ? `/${lang.value}` : `/${lang.value}${href}`)

  const altPath = (target: Locale) => swapLocale(route.path, target)

  const t = (field: { es: string; en: string } | undefined) => pick(field, lang.value)
  const tList = (field: { es: string[]; en: string[] } | undefined) => pickList(field, lang.value)

  return { lang, localePath, altPath, t, tList }
}
