import { LOCALES } from '#shared/utils/i18n'

// Static routes that exist regardless of catalog/blog content. `''` is the
// homepage (becomes just `/es`, `/en`).
const STATIC_PATHS = ['', '/propiedades', '/blog', '/publicar-propiedad', '/como-funciona']

function urlEntry(loc: string, alternates: { hreflang: string; href: string }[]) {
  const links = alternates
    .map(a => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
    .join('\n')
  return `  <url>\n    <loc>${loc}</loc>\n${links}\n  </url>`
}

export default defineEventHandler(async (event) => {
  const base = new URL(useRuntimeConfig().public.siteUrl).origin

  const [{ data: rentalRows }, { data: postRows }] = await Promise.all([
    getSupabase().from('listings').select('id'),
    getSupabase().from('posts').select('id'),
  ])

  // Every entry is emitted once per locale, each pointing at its siblings via
  // xhtml:link alternates — the same relationship the <head> hreflang tags
  // declare per page, mirrored here per Google's sitemap i18n guidance.
  const paths = [
    ...STATIC_PATHS,
    ...(rentalRows ?? []).map((r: any) => `/propiedades/${r.id}`),
    ...(postRows ?? []).map((r: any) => `/blog/${r.id}`),
  ]

  const entries = paths.flatMap((path) => {
    const alternates = LOCALES.map(l => ({ hreflang: l as string, href: `${base}/${l}${path}` }))
    alternates.push({ hreflang: 'x-default', href: `${base}/es${path}` })
    return LOCALES.map(l => urlEntry(`${base}/${l}${path}`, alternates))
  })

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`
})
