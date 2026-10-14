<script setup lang="ts">
import { NAV } from '#shared/utils/constants'

const route = useRoute()
const { lang, localePath, altPath, t } = useLocale()
const { $lenis } = useNuxtApp()

// Language toggle: real links to the equivalent path in the other locale, not
// a client-side content swap — the URL is the source of truth for which
// language a page renders. The query string rides along so a filtered
// /propiedades search survives the switch.
const search = computed(() => {
  const qs = new URLSearchParams(route.query as Record<string, string>).toString()
  return qs ? `?${qs}` : ''
})
const esHref = computed(() => altPath('es') + search.value)
const enHref = computed(() => altPath('en') + search.value)

const LANG_OPTIONS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
] as const

// Desktop language dropdown — closes on outside click, Escape and navigation.
const langOpen = ref(false)
const langEl = ref<HTMLElement | null>(null)
const langBtn = ref<HTMLButtonElement | null>(null)

function closeLang(refocus = false) {
  if (!langOpen.value) return
  langOpen.value = false
  if (refocus) langBtn.value?.focus()
}

function onLangOutside(e: PointerEvent) {
  if (langEl.value && !langEl.value.contains(e.target as Node)) closeLang()
}

function isActive(href: string) {
  const full = localePath(href)
  return route.path === full || (href !== '/' && route.path.startsWith(full))
}

// --- Mobile drawer ---------------------------------------------------------
const menuOpen = ref(false)

function closeMobile() {
  menuOpen.value = false
}

// Locks the background from scrolling while the drawer is open. Lenis drives
// scroll itself and ignores the native overflow lock, so it has to be
// paused/resumed explicitly too.
watch(menuOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    $lenis?.stop()
  }
  else {
    document.body.style.removeProperty('overflow')
    $lenis?.start()
  }
})

watch(() => route.fullPath, () => {
  closeMobile()
  closeLang()
})

// --- Header hide-on-scroll -------------------------------------------------
const scrolled = ref(false)
const hidden = ref(false)
let lastY = 0

function onScroll() {
  // Clamp negative values from iOS rubber-band overscroll.
  const y = Math.max(0, window.scrollY)
  scrolled.value = y > 8

  // Never slide the header away while the mobile drawer is open — its own
  // close button lives inside it.
  if (menuOpen.value || y <= 12) {
    hidden.value = false
    lastY = y
    return
  }
  // Small threshold avoids flicker from tiny scroll wobble.
  if (Math.abs(y - lastY) > 8) {
    hidden.value = y > lastY
    lastY = y
  }
}

// --- Desktop nav pill ------------------------------------------------------
// A pill slides behind whichever link is hovered/focused and rests under the
// active route otherwise (magnetic-highlight pattern).
const navEl = ref<HTMLElement | null>(null)
const pillStyle = ref<Record<string, string>>({ opacity: '0' })

function positionNavPill(el: HTMLElement | null) {
  if (!el) {
    pillStyle.value = { ...pillStyle.value, opacity: '0' }
    return
  }
  pillStyle.value = {
    transform: `translateX(${el.offsetLeft}px)`,
    width: `${el.offsetWidth}px`,
    opacity: '1',
  }
}

function activeNavLink(): HTMLElement | null {
  return navEl.value?.querySelector<HTMLElement>('.nav-link[aria-current="page"]') ?? null
}

function onNavPointerOver(e: PointerEvent) {
  const link = (e.target as HTMLElement)?.closest<HTMLElement>('.nav-link')
  if (link) positionNavPill(link)
}
function onNavFocusIn(e: FocusEvent) {
  const link = (e.target as HTMLElement)?.closest<HTMLElement>('.nav-link')
  if (link) positionNavPill(link)
}
function onNavFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (!next || !navEl.value?.contains(next)) positionNavPill(activeNavLink())
}

// Centers #contacto in the visible area, discounting the sticky header.
function scrollToContacto(smooth = true) {
  const target = document.getElementById('contacto')
  if (!target) return
  const HEADER = 94
  const rect = target.getBoundingClientRect()
  const sectionCenterDoc = rect.top + window.scrollY + rect.height / 2
  const visibleCenter = HEADER + (window.innerHeight - HEADER) / 2
  window.scrollTo({ top: Math.max(0, sectionCenterDoc - visibleCenter), behavior: smooth ? 'smooth' : 'auto' })
}

function onDocumentClick(e: MouseEvent) {
  const link = (e.target as HTMLElement)?.closest('a[href$="/#contacto"], a[href="#contacto"]')
  if (!link) return
  if (!document.getElementById('contacto')) return
  e.preventDefault()
  closeMobile()
  scrollToContacto(true)
}

onMounted(() => {
  lastY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('pointerdown', onLangOutside)
  onScroll()
  nextTick(() => positionNavPill(activeNavLink()))

  if (window.location.hash === '#contacto') {
    setTimeout(() => scrollToContacto(true), 150)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('pointerdown', onLangOutside)
  document.body.style.removeProperty('overflow')
})

// Re-seat the pill after a navigation changes which link is active.
watch(() => route.path, () => nextTick(() => positionNavPill(activeNavLink())))
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': scrolled, 'is-hidden': hidden }">
    <div class="header-inner">
      <!-- Logo -->
      <div class="header-zone-start" style="display:flex;align-items:center;gap:14px">
        <NuxtLink :to="localePath('/')" style="display:flex;align-items:center;cursor:pointer;text-decoration:none;color:var(--color-ink)">
          <span class="logo-frame" style="--s:0.19008264462809917;width:calc(811px * var(--s));height:46px;overflow:hidden;position:relative;display:block;flex:none">
            <img
              src="/logo-mika-dark.webp"
              alt="Mika Homes"
              style="position:absolute;top:calc(-452px * var(--s));left:calc(-134px * var(--s));width:calc(1080px * var(--s));height:calc(1080px * var(--s));max-width:none"
            >
          </span>
        </NuxtLink>
      </div>

      <!-- Desktop nav (centered) -->
      <nav
        ref="navEl"
        class="desktop-nav"
        @pointerover="onNavPointerOver"
        @pointerleave="positionNavPill(activeNavLink())"
        @focusin="onNavFocusIn"
        @focusout="onNavFocusOut"
      >
        <span class="nav-pill" aria-hidden="true" :style="pillStyle" />
        <NuxtLink
          v-for="item in NAV"
          :key="item.key"
          :to="localePath(item.href)"
          class="nav-link"
          :class="{ 'is-active': isActive(item.href) }"
          :aria-current="isActive(item.href) ? 'page' : undefined"
        >
          {{ t(item.label) }}
        </NuxtLink>
      </nav>

      <div class="header-zone-end" style="display:flex;align-items:center;gap:12px">
        <div ref="langEl" class="lang-menu desktop-lang-toggle" @keydown.esc="closeLang(true)">
          <button
            ref="langBtn"
            type="button"
            class="lang-trigger"
            aria-haspopup="true"
            :aria-expanded="langOpen"
            aria-controls="lang-menu-list"
            @click="langOpen = !langOpen"
          >
            <Icon name="globe" :size="19" />
            <span>{{ lang === 'en' ? 'English' : 'Español' }}</span>
            <Icon name="chevron-down" :size="15" class="lang-chevron" />
          </button>
          <ul v-show="langOpen" id="lang-menu-list" class="lang-list">
            <li v-for="opt in LANG_OPTIONS" :key="opt.code">
              <NuxtLink
                :to="opt.code === 'es' ? esHref : enHref"
                :hreflang="opt.code"
                :aria-current="lang === opt.code ? 'true' : undefined"
                class="lang-option"
                :class="{ 'is-active': lang === opt.code }"
                @click="closeLang()"
              >
                {{ opt.label }}
                <Icon v-if="lang === opt.code" name="check" :size="15" />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Mobile burger -->
        <button
          class="mobile-burger"
          :class="{ 'is-open': menuOpen }"
          style="display:none;border-radius:var(--radius-md);width:42px;height:42px;cursor:pointer;align-items:center;justify-content:center;flex-direction:column;gap:4px"
          :aria-label="lang === 'en' ? 'Open menu' : 'Abrir menú'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="burger-line" />
          <span class="burger-line" />
          <span class="burger-line" />
        </button>
      </div>
    </div>
    <div class="site-header-fade" aria-hidden="true" />
  </header>

  <!-- Mobile overlay -->
  <div
    id="mobile-overlay"
    :class="{ hidden: !menuOpen }"
    style="position:fixed;inset:0;z-index:70;background:rgba(20,15,10,.45)"
    @click.self="closeMobile"
  >
    <div
      id="mobile-menu"
      style="position:absolute;top:0;right:0;bottom:0;width:min(82vw,330px);background:var(--color-sand);padding:24px;display:flex;flex-direction:column;gap:6px"
    >
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="--s:0.13223140495867769;width:calc(811px * var(--s));height:32px;overflow:hidden;position:relative;display:block;flex:none">
          <img
            src="/logo-mika-dark.webp"
            alt="Mika Homes"
            style="position:absolute;top:calc(-452px * var(--s));left:calc(-134px * var(--s));width:calc(1080px * var(--s));height:calc(1080px * var(--s));max-width:none"
          >
        </span>
        <button
          style="border:none;background:transparent;cursor:pointer;color:var(--color-ink);line-height:1;display:flex"
          aria-label="Close"
          @click="closeMobile"
        >
          <Icon name="close" :size="22" />
        </button>
      </div>

      <div
        class="mobile-nav-link lang-toggle-group"
        style="--menu-index:0;display:flex;border:1px solid var(--color-border);border-radius:var(--radius-pill);overflow:hidden;font-size:14px;font-weight:700;width:fit-content;padding:0;border-bottom:none;margin-bottom:8px"
      >
        <NuxtLink
          :to="esHref"
          aria-label="Español"
          :aria-current="lang === 'es' ? 'true' : undefined"
          class="lang-toggle-btn"
          :class="{ 'is-active': lang === 'es' }"
          style="text-decoration:none;text-align:center;cursor:pointer;padding:9px 16px;user-select:none;transition:background-color .16s ease,transform .16s var(--ease-out)"
        >ES</NuxtLink>
        <NuxtLink
          :to="enHref"
          aria-label="English"
          :aria-current="lang === 'en' ? 'true' : undefined"
          class="lang-toggle-btn"
          :class="{ 'is-active': lang === 'en' }"
          style="text-decoration:none;text-align:center;cursor:pointer;padding:9px 16px;user-select:none;transition:background-color .16s ease,transform .16s var(--ease-out)"
        >EN</NuxtLink>
      </div>

      <NuxtLink
        v-for="(item, index) in NAV"
        :key="item.key"
        :to="localePath(item.href)"
        class="mobile-nav-link"
        :style="`--menu-index:${index + 1};cursor:pointer;padding:14px 8px;font-family:var(--font-display);font-weight:700;font-size:21px;color:var(--color-ink);text-decoration:none;border-bottom:1px solid var(--color-border-soft)`"
        @click="closeMobile"
      >
        {{ t(item.label) }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 60;
  isolation: isolate;
  visibility: visible;
  will-change: transform;
  transition: transform .34s var(--ease-drawer), visibility 0s linear 0s;
}
/* visibility is delayed until the slide-out transition finishes (and restored
   instantly on the way back in) so the hidden header drops out of the tab
   order instead of leaving off-screen links keyboard-focusable — same
   delayed-visibility trick used for #mobile-overlay below. */
.site-header.is-hidden {
  transform: translateY(-100%);
  pointer-events: none;
  visibility: hidden;
  transition: transform .34s var(--ease-drawer), visibility 0s linear .34s;
}
/* The glass lives on a separate absolutely-positioned layer instead of
   directly on the sticky element. iOS Safari has a long-standing bug where
   `position: sticky` + `backdrop-filter` on the SAME element renders as a
   solid black rectangle mid-scroll; decoupling the two fixes it. */
.site-header::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  /* Real glass: translucent enough that photos scrolling underneath read
     through as colour, with saturate() keeping them from going muddy. It is
     the one backdrop-filter that is always on screen, so the blur stays
     moderate. */
  background: rgba(245, 240, 232, .66);
  -webkit-backdrop-filter: blur(14px) saturate(170%);
  backdrop-filter: blur(14px) saturate(170%);
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, .45);
  transition: background-color .25s ease;
}
.site-header.is-scrolled::before {
  background: rgba(245, 240, 232, .72);
}
@media (prefers-reduced-transparency: reduce) {
  .site-header::before,
  .site-header.is-scrolled::before {
    background: var(--color-sand);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
/* Bottom dissolve: a soft gradient the header's glass tone fades through, so
   it blends into whatever's underneath (a hero image especially) instead of
   leaving a visible seam. */
.site-header-fade {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 52px;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(245, 240, 232, .5), rgba(245, 240, 232, 0));
}
.site-header::after {
  content: '';
  position: absolute;
  right: max(26px, calc((100vw - 1240px) / 2 + 26px));
  bottom: -1px;
  width: min(22vw, 230px);
  height: 1px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, var(--color-leaf), transparent);
  transform: scaleX(.35);
  transition: opacity .35s ease, transform .5s var(--ease-out);
}
.site-header.is-scrolled::after { opacity: .72; transform: scaleX(1); }

.header-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 26px;
  height: 82px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 32px;
  transition: height .25s ease;
}
.site-header.is-scrolled .header-inner { height: 66px; }
/* Explicit grid-column, not just source order: .desktop-nav (the middle
   column) is display:none on mobile, and a display:none item is removed from
   the grid entirely — auto-placement then slides header-zone-end into the
   now-empty middle track instead of the third one, landing the mobile burger
   right next to the logo instead of the far edge. */
.header-zone-start { grid-column: 1; justify-self: start; min-width: 0; }
.header-zone-end { grid-column: 3; justify-self: end; min-width: 0; }

.logo-frame {
  transform-origin: left center;
  transition: transform .25s ease;
}
.site-header.is-scrolled .logo-frame { transform: scale(.82); }
.header-zone-start > a:hover .logo-frame { transform: translateY(-1px) scale(1.025); }

.desktop-nav {
  position: relative;
  display: flex;
  gap: 2px;
  align-items: center;
  justify-self: center;
  width: max-content;
  margin-inline: auto;
  padding: 3px;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  transition: background-color .3s ease, border-color .3s ease;
}
.site-header.is-scrolled .desktop-nav { background: rgba(255,255,255,.34); border-color: rgba(47,82,51,.08); }
.nav-pill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  opacity: 0;
  border-radius: var(--radius-pill);
  overflow: hidden;
  background: linear-gradient(110deg, rgba(93,138,90,.18), rgba(47,82,51,.08), rgba(93,138,90,.14));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.48), 0 7px 17px -13px rgba(47,82,51,.58);
  transform: translateX(0);
  transition: transform .38s var(--ease-out), width .38s var(--ease-out), opacity .2s ease;
  pointer-events: none;
  z-index: 0;
}
.nav-pill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 28%, rgba(255,255,255,.46) 50%, transparent 72%);
  transform: translateX(-115%);
}
.desktop-nav:hover .nav-pill::after { animation: nav-pill-sheen .72s var(--ease-out); }
@keyframes nav-pill-sheen { to { transform: translateX(115%); } }
.nav-link {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  cursor: pointer;
  min-height: 44px;
  padding: 11px 21px;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -.005em;
  text-decoration: none;
  border-radius: var(--radius-pill);
  color: var(--color-ink-soft);
  transition: color .2s ease, transform .2s var(--ease-out);
}
.nav-link:hover, .nav-link:focus-visible, .nav-link.is-active { color: var(--color-forest); }
.nav-link:hover { transform: translateY(-1px); }

.lang-toggle-group {
  box-shadow: var(--shadow-sm);
  transition: box-shadow .18s ease;
}
.lang-toggle-btn {
  font-family: inherit;
  line-height: 1;
  position: relative;
  display: inline-block;
  background: transparent;
  color: var(--color-ink-soft);
}
.lang-toggle-btn.is-active { background: var(--color-forest); color: var(--color-sand); }
.lang-toggle-btn:active { transform: scale(.94); }
.lang-toggle-btn:hover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .06);
}

.lang-menu { position: relative; }
.lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px 7px 10px;
  border: 1.5px solid var(--color-ink);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background-color .16s ease, border-color .16s ease, color .16s ease, transform .16s var(--ease-out);
}
.lang-trigger:hover { background: rgba(47, 82, 51, .06); border-color: var(--color-forest); color: var(--color-forest); }
.lang-trigger:active { transform: scale(.96); }
.lang-trigger:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.lang-chevron { transition: transform .22s var(--ease-out); }
.lang-trigger[aria-expanded="true"] .lang-chevron { transform: rotate(180deg); }
.lang-list {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 100%;
  margin: 0;
  padding: 5px;
  list-style: none;
  background: var(--color-cream);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
  animation: lang-in .18s var(--ease-out);
}
@keyframes lang-in { from { opacity: 0; transform: translateY(-4px); } }
.lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 9px 11px;
  border-radius: calc(var(--radius-md) - 4px);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink-soft);
  text-decoration: none;
  white-space: nowrap;
}
.lang-option:hover, .lang-option:focus-visible { background: rgba(47, 82, 51, .08); color: var(--color-forest); outline: none; }
.lang-option.is-active { color: var(--color-forest); font-weight: 700; }

.mobile-burger {
  border: 1px solid var(--color-border);
  background: transparent;
  transition: background-color .16s ease, border-color .16s ease, transform .16s var(--ease-out);
}
.mobile-burger:hover {
  background: rgba(47, 82, 51, .06);
  border-color: var(--color-leaf);
}
.mobile-burger:active { transform: scale(.94); }
.burger-line {
  width: 18px;
  height: 2px;
  background: var(--color-ink);
  border-radius: 2px;
  transform-origin: center;
  transition: transform .28s var(--ease-drawer), opacity .18s ease;
}
.mobile-burger.is-open .burger-line:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.mobile-burger.is-open .burger-line:nth-child(2) { opacity: 0; transform: scaleX(.3); }
.mobile-burger.is-open .burger-line:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

@media (max-width: 880px) {
  .lang-toggle-btn { padding: 11px 14px !important; }
}

@media (prefers-reduced-motion: reduce) {
  /* The hide-on-scroll slide is exempt on purpose — the site owner wants it to
     always run, reduced-motion or not. Everything else backs off. */
  .nav-pill { transition: opacity .15s linear; }
  .header-inner, .logo-frame { transition: none; }
  .site-header::after, .desktop-nav, .nav-link, .burger-line, .mobile-nav-link { transition: none !important; animation: none !important; }
}

/* Backdrop + drawer animate via opacity/transform (interruptible transitions,
   not keyframes) so rapid open/close toggles never restart mid-flight.
   Specificity (#id.class) is needed to beat global .hidden{display:none!important}. */
#mobile-overlay {
  display: block;
  opacity: 1;
  visibility: visible;
  transition: opacity .25s ease, visibility 0s linear 0s;
}
#mobile-overlay.hidden {
  display: block !important;
  opacity: 0 !important;
  visibility: hidden !important;
  transition: opacity .25s ease, visibility 0s linear .25s;
}
#mobile-menu {
  display: flex;
  transform: translateX(0);
  transition: transform .32s var(--ease-drawer);
}
#mobile-overlay.hidden #mobile-menu {
  transform: translateX(100%);
}
.mobile-nav-link:not(.btn) {
  opacity: 0;
  transform: translateX(22px);
  transition: opacity .3s ease, transform .38s var(--ease-out), color .18s ease, padding-left .24s var(--ease-out);
}
#mobile-overlay:not(.hidden) .mobile-nav-link:not(.btn) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(70ms + var(--menu-index) * 55ms);
}
.mobile-nav-link:not(.btn):not(.lang-toggle-group):hover { color: var(--color-forest) !important; padding-left: 15px !important; }
#mobile-overlay .mobile-nav-link.btn { opacity: 0; transform: translateY(10px); transition: opacity .28s ease .3s, transform .32s var(--ease-out) .3s; }
#mobile-overlay:not(.hidden) .mobile-nav-link.btn { opacity: 1; transform: translateY(0); }
</style>
