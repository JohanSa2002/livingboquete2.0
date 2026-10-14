// Single entry point for Leaflet. The library and its stylesheet are imported
// together, so Vite emits the CSS with the async chunk: it is fetched only when
// a map actually loads instead of sitting render-blocking in every page's CSS
// (it used to be @import-ed into each map component's styles). Memoised, so an
// early warm-up call and the map's own call share one download.
let pending: Promise<typeof import('leaflet')> | null = null

export function loadLeaflet() {
  pending ??= Promise.all([
    import('leaflet'),
    import('leaflet/dist/leaflet.css'),
  ]).then(([mod]) => mod.default)
  return pending
}
