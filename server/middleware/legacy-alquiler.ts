// /alquiler became /propiedades when sales and land joined the catalogue.
// Old links keep working with a permanent redirect: the listing page lands on
// the explorer pre-filtered to rentals, and a rental's own page keeps its id.
// Unprefixed paths (/alquiler) go to /propiedades and the locale redirect adds
// the language on the next hop.
export default defineEventHandler((event) => {
  const { pathname, search } = getRequestURL(event)
  const m = pathname.match(/^(\/(?:es|en))?\/alquiler(?:\/([^/]+))?\/?$/)
  if (!m) return

  const prefix = m[1] ?? ''
  const id = m[2]
  if (id) return sendRedirect(event, `${prefix}/propiedades/${id}`, 301)

  const params = new URLSearchParams(search)
  params.set('tipo', 'alquiler')
  return sendRedirect(event, `${prefix}/propiedades?${params.toString()}`, 301)
})
