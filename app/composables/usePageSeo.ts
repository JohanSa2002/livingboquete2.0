import type { Locale } from '#shared/utils/i18n'
import { swapLocale } from '#shared/utils/i18n'

interface PageSeo {
  title: string
  titleEn: string
  description?: string
  descriptionEn?: string
  image?: string
}

const DEFAULT_DESCRIPTION = 'Descubre Boquete: volcán Barú, café Geisha, quetzales, aventura y cultura en las tierras altas de Chiriquí, Panamá.'
const DEFAULT_DESCRIPTION_EN = 'Discover Boquete: Barú Volcano, Geisha coffee, quetzals, adventure and culture in the Chiriquí highlands, Panama.'

// Mirrors the <head> block of v1's Layout.astro: canonical always points at the
// clean path (no query string / hash) so filtered or hash-anchored URLs don't
// get indexed as separate pages, and both locales are declared as alternates.
export function usePageSeo(seo: MaybeRefOrGetter<PageSeo>) {
  const route = useRoute()
  const { lang } = useLocale()
  const site = useRuntimeConfig().public.siteUrl

  useHead(() => {
    const value = toValue(seo)
    const isEn = lang.value === 'en'
    const title = isEn ? value.titleEn : value.title
    const description = (isEn ? value.descriptionEn : value.description)
      ?? (isEn ? DEFAULT_DESCRIPTION_EN : DEFAULT_DESCRIPTION)

    const canonical = new URL(route.path, site).href
    const esUrl = new URL(swapLocale(route.path, 'es' as Locale), site).href
    const enUrl = new URL(swapLocale(route.path, 'en' as Locale), site).href
    const ogImage = new URL(value.image ?? '/logo-mika-dark.webp', site).href

    return {
      htmlAttrs: { lang: lang.value, 'data-lang': lang.value },
      title,
      link: [
        { rel: 'canonical', href: canonical },
        { rel: 'alternate', hreflang: 'es', href: esUrl },
        { rel: 'alternate', hreflang: 'en', href: enUrl },
        { rel: 'alternate', hreflang: 'x-default', href: esUrl },
      ],
      meta: [
        { name: 'description', content: description },
        { property: 'og:site_name', content: 'MIKA Homes' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: isEn ? 'en_US' : 'es_PA' },
        { property: 'og:url', content: canonical },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
    }
  })
}
