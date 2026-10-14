import Lenis from 'lenis'

// One Lenis instance for the whole session — Nuxt keeps the document alive
// across route changes, so it is created once and only told to scroll back to
// the top after each navigation.
export default defineNuxtPlugin((nuxtApp) => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    return { provide: { lenis: null as Lenis | null } }
  }

  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  const animate = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)

  nuxtApp.hook('page:finish', () => {
    lenis.scrollTo(0, { immediate: true })
  })

  return { provide: { lenis } }
})
