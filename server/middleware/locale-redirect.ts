import { DEFAULT_LOCALE, LOCALES, detectLocale } from '#shared/utils/i18n'

// Public pages live under /es/... and /en/.... Anything that hits the
// un-prefixed twin (an old link, someone typing the domain) is 301'd to the
// locale the browser asks for — same behaviour as the redirect stub pages in
// the v1 Astro app.
const PUBLIC_PREFIXES = ['/propiedades', '/blog', '/publicar-propiedad', '/como-funciona']

export default defineEventHandler((event) => {
  const { pathname, search } = getRequestURL(event)

  if (pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname.startsWith('/_')) return
  if (LOCALES.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return

  const needsRedirect = pathname === '/' || PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`))
  if (!needsRedirect) return

  const locale = detectLocale(getRequestHeader(event, 'accept-language')) || DEFAULT_LOCALE
  const target = pathname === '/' ? `/${locale}${search}` : `/${locale}${pathname}${search}`
  return sendRedirect(event, target, 301)
})
