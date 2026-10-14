import { DEFAULT_LOCALE, isLocale } from '#shared/utils/i18n'

// Every public page lives under a /:lang segment. A URL with an unknown
// segment (/fr/alquiler, /xx) is rewritten to the default locale instead of
// 404ing — same guard every v1 page did in its frontmatter.
export default defineNuxtRouteMiddleware((to) => {
  const raw = to.params.lang
  if (raw === undefined) return

  const value = Array.isArray(raw) ? raw[0] : raw
  if (isLocale(value)) return

  return navigateTo(
    { path: to.path.replace(/^\/[^/]+/, `/${DEFAULT_LOCALE}`), query: to.query, hash: to.hash },
    { redirectCode: 301, replace: true },
  )
})
