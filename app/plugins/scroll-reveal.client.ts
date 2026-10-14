// Staged entrance for headings, eyebrow labels and their following paragraph.
// Runs the same sequence regardless of prefers-reduced-motion — the site owner
// wants the fade/slide to always play (see the note in global.css).
function setupScrollReveals() {
  const initial = Array.from(
    document.querySelectorAll<HTMLElement>('h1,h2,h3,.eyebrow,[data-reveal]'),
  ).filter(el =>
    !el.closest('header')
    && !el.closest('#mobile-overlay')
    && !el.closest('.admin-sidebar')
    // Lead form: content should be immediately visible, not staged in.
    && !el.closest('#contacto')
    // Hero glass pane runs its own entrance in CSS; a second reveal on the
    // heading would hide text that is already on screen after hydration.
    && !el.closest('.hero-pane')
    // Opt-out for tool-like UI (listing pages, the map explorer): headings
    // there are content to scan, not an entrance to stage — and a reveal that
    // never fires would leave them invisible.
    && !el.closest('[data-no-reveal]'),
  )

  // Auto-tag the immediate <p> sibling of a heading as a subtitle reveal.
  initial.forEach((h) => {
    if (!/^H[123]$/.test(h.tagName)) return
    const next = h.nextElementSibling as HTMLElement | null
    if (next && next.tagName === 'P' && !next.hasAttribute('data-reveal')) {
      next.setAttribute('data-reveal', 'sub')
      initial.push(next)
    }
  })

  const seen = new Set<HTMLElement>()
  const elements = initial.filter((el) => {
    if (seen.has(el)) return false
    seen.add(el)
    return true
  })

  // Tag untagged elements and compute sibling stagger delays.
  elements.forEach((el) => {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'title')

    if (!el.hasAttribute('data-reveal-delay')) {
      const parent = el.parentElement
      if (parent) {
        const revealSiblings = Array.from(parent.children).filter(
          c => (c as HTMLElement).hasAttribute('data-reveal'),
        ) as HTMLElement[]
        const idx = revealSiblings.indexOf(el)
        if (idx > 0) {
          el.setAttribute('data-reveal-delay', String(Math.min(idx * 120, 360)))
        }
      }
    }
  })

  function reveal(el: HTMLElement) {
    const delay = Number.parseInt(el.getAttribute('data-reveal-delay') || '0', 10)
    if (delay > 0) setTimeout(() => el.classList.add('is-revealed'), delay)
    else el.classList.add('is-revealed')
  }

  // rootMargin pulls the trigger line up from the bottom edge so a section
  // starts revealing a little before it is fully scrolled into view.
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      reveal(entry.target as HTMLElement)
      obs.unobserve(entry.target)
    })
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' })

  // Read every rect BEFORE writing any class below — interleaving reads and
  // writes per element forces a layout flush on every iteration.
  const toEvaluate = elements.filter(el => !el.classList.contains('is-revealed'))
  const rects = toEvaluate.map(el => el.getBoundingClientRect())

  toEvaluate.forEach((el, i) => {
    const rect = rects[i]!
    if (rect.top < window.innerHeight && rect.bottom > 0) reveal(el)
    else observer.observe(el)
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  // app:mounted fires before the page inside <NuxtPage>'s Suspense has
  // hydrated — adding `is-revealed` at that point makes every heading a
  // hydration mismatch. app:suspense:resolve is the first moment the server
  // HTML is fully owned by Vue; page:finish covers client-side navigations
  // after that.
  let ready = false

  nuxtApp.hook('app:suspense:resolve', () => {
    if (ready) return
    ready = true
    requestAnimationFrame(() => setupScrollReveals())
  })
  nuxtApp.hook('page:finish', () => {
    if (!ready) return
    // Wait for the incoming page to be painted before measuring it.
    requestAnimationFrame(() => setupScrollReveals())
  })
})
