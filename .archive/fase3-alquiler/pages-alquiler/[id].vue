<script setup lang="ts">
import { AMEN_LABELS } from '#shared/utils/constants'
import type { Rental } from '#shared/types/content'
import type { IconName } from '~/components/Icon.vue'

const route = useRoute()
const { lang, localePath, t } = useLocale()

const id = computed(() => String(route.params.id))

const { data: stay } = await useContentItem('rentals', id)
if (!stay.value) {
  await navigateTo(localePath('/alquiler'))
}

// Similar listings: same zone first, then overlapping amenities/type — best
// effort with the catalog we actually have, not a real recommendation engine.
const { data: others } = await useContentList('rentals', { exclude: id })

const SIMILAR = computed(() => {
  const s = stay.value
  if (!s) return []
  const score = (other: Rental) => {
    let n = 0
    if (other.loc?.es === s.loc?.es) n += 3
    if (other.type === s.type) n += 1
    n += (other.amen ?? []).filter(a => s.amen.includes(a)).length
    return n
  }
  return [...(others.value ?? [])]
    .map(r => ({ ...r, __score: score(r) }))
    .sort((a, b) => b.__score - a.__score)
    .slice(0, 4)
})

// Same stroke-icon set used on /alquiler's cards.
const AMEN_ICON: Record<string, IconName> = {
  wifi: 'wifi', kitchen: 'kitchen', view: 'mountain', parking: 'car',
  fireplace: 'flame', pool: 'waves', pets: 'paw', furnished: 'sofa',
}

// "Campo vacío = sección oculta": the breakdown only renders when the admin
// actually filled these in — never a fabricated $0.
const hasCostBreakdown = computed(() => (stay.value?.deposit ?? 0) > 0 || (stay.value?.utilitiesMin ?? 0) > 0)
const firstMonthTotal = computed(() => (stay.value?.price ?? 0) + (stay.value?.deposit ?? 0))

const verifiedDateFmt = computed(() => {
  const d = stay.value?.verifiedDate
  if (!d) return null
  return {
    es: new Date(`${d}T00:00:00`).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' }),
    en: new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
})

// Only render photos that belong to this listing. `images` is optional so
// existing listings that only have `img` continue to work, while future
// listings can supply additional real photos.
const galleryImages = computed(() => {
  const s = stay.value
  if (!s) return []
  return [s.img, ...(Array.isArray((s as any).images) ? (s as any).images : [])]
    .filter((image): image is string => typeof image === 'string' && image.length > 0)
    .filter((image, index, images) => images.indexOf(image) === index)
})

const whatsappUrl = computed(() => {
  const s = stay.value
  if (!s) return '#'
  const phone = s.host.phone.replace(/\D/g, '')
  const message = `Hola, vi tu anuncio de ${s.name.es} en MIKA Homes y quiero obtener más información sobre la propiedad.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
})

// Availability text: no move-in date means available right now.
const availabilityInfo = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const from = stay.value?.availableFrom ? new Date(stay.value.availableFrom) : null
  const isNow = !from || from <= today
  if (isNow) return { isNow, text: { es: 'Disponible ahora', en: 'Available now' } }

  const diffDays = Math.ceil((from.getTime() - today.getTime()) / 86400000)
  if (diffDays < 30) {
    return {
      isNow,
      text: {
        es: `Disponible en ${diffDays} día${diffDays === 1 ? '' : 's'}`,
        en: `Available in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      },
    }
  }
  const diffMonths = Math.round(diffDays / 30)
  return {
    isNow,
    text: {
      es: `Disponible en ${diffMonths} mes${diffMonths === 1 ? '' : 'es'}`,
      en: `Available in ${diffMonths} month${diffMonths === 1 ? '' : 's'}`,
    },
  }
})

usePageSeo(() => ({
  title: `${stay.value?.name.es ?? ''} · MIKA Homes`,
  titleEn: `${stay.value?.name.en ?? ''} · MIKA Homes`,
  description: stay.value?.short?.es ?? stay.value?.desc.es,
  descriptionEn: stay.value?.short?.en ?? stay.value?.desc.en,
  image: stay.value?.img,
}))

useHead(() => {
  const s = stay.value
  if (!s) return {}
  return {
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Accommodation',
        'name': s.name.es,
        'description': s.desc.es,
        'image': galleryImages.value,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': s.loc.es,
          'addressRegion': 'Chiriquí',
          'addressCountry': 'PA',
        },
        'geo': { '@type': 'GeoCoordinates', 'latitude': s.lat, 'longitude': s.lng },
        'numberOfRooms': s.beds,
        'numberOfBathroomsTotal': s.baths,
        'occupancy': { '@type': 'QuantitativeValue', 'maxValue': s.guests },
        'aggregateRating': s.reviews > 0
          ? { '@type': 'AggregateRating', 'ratingValue': s.rating, 'reviewCount': s.reviews }
          : undefined,
        'offers': { '@type': 'Offer', 'price': s.price, 'priceCurrency': 'USD', 'availability': 'https://schema.org/InStock' },
      }),
    }],
  }
})

// --- Photo lightbox --------------------------------------------------------
const lightboxSrc = ref<string | null>(null)

function openLightbox(src: string) {
  lightboxSrc.value = src
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') lightboxSrc.value = null
}

// --- Request modal ---------------------------------------------------------
const requestModal = ref<{ openModal: () => void } | null>(null)

// --- Fixed background ------------------------------------------------------
// Keeps the house background pinned to the viewport while scrolling, fading it
// out before the footer so it never overlaps it.
const FADE_ZONE_PX = 220
const bgWrap = ref<HTMLElement | null>(null)
const bgCanvas = ref<HTMLElement | null>(null)

function updateRentalBgVisibility() {
  if (!bgWrap.value || !bgCanvas.value) return
  const distanceToFooter = bgWrap.value.getBoundingClientRect().bottom - window.innerHeight
  bgCanvas.value.style.opacity = String(Math.max(0, Math.min(1, distanceToFooter / FADE_ZONE_PX)))
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', updateRentalBgVisibility, { passive: true })
  window.addEventListener('resize', updateRentalBgVisibility)
  updateRentalBgVisibility()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', updateRentalBgVisibility)
  window.removeEventListener('resize', updateRentalBgVisibility)
})
</script>

<template>
  <div v-if="stay" ref="bgWrap" class="rental-bg">
    <div ref="bgCanvas" class="rental-bg-canvas" aria-hidden="true" />

    <div class="rental-bg-content">
      <!-- GALLERY HERO -->
      <section class="pad-sec" style="max-width:1100px;margin:0 auto;padding:54px 26px 0">
        <NuxtLink :to="localePath('/alquiler')" style="display:inline-flex;align-items:center;gap:7px;color:var(--color-terracotta);font-weight:700;font-size:14px;text-decoration:none;margin-bottom:18px">
          ← {{ lang === 'en' ? 'Back to stays' : 'Volver a alojamientos' }}
        </NuxtLink>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">
          <h1 style="font-family:var(--font-display);font-weight:800;font-size:clamp(32px,4.6vw,52px);line-height:1.02;letter-spacing:-.02em;margin:0;color:var(--color-ink)">
            {{ t(stay.name) }}
          </h1>
          <span
            v-if="stay.verified"
            class="verified-badge"
            tabindex="0"
            style="position:relative;display:inline-flex;align-items:center;gap:5px;background:var(--color-moss);color:var(--color-gold-light);font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;flex:none;cursor:default"
          >
            <Icon name="check" :size="13" />
            {{ lang === 'en' ? 'Verified' : 'Verificada' }}
            <!-- Without a verification date loaded, the tooltip says "verified"
                 plainly instead of inventing one. -->
            <span class="verified-tooltip" role="tooltip">
              <template v-if="verifiedDateFmt">
                {{ lang === 'en'
                  ? `MIKA Homes team visited and confirmed this property on ${verifiedDateFmt.en}.`
                  : `Equipo MIKA Homes visitó y confirmó esta propiedad el ${verifiedDateFmt.es}.` }}
              </template>
              <template v-else>
                {{ lang === 'en'
                  ? 'MIKA Homes team visited and confirmed this property in person.'
                  : 'Equipo MIKA Homes visitó y confirmó esta propiedad en persona.' }}
              </template>
            </span>
          </span>
        </div>
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 16px;margin-bottom:14px;font-size:15px;color:var(--color-ink-soft)">
          <span style="display:flex;align-items:center;gap:5px;font-weight:700;color:var(--color-ink)"><span style="color:var(--color-gold)">★</span>{{ stay.rating.toFixed(1) }}</span>
          <span>·</span>
          <span>{{ stay.reviews }} {{ lang === 'en' ? 'reviews' : 'reseñas' }}</span>
          <span>·</span>
          <span>{{ t(stay.loc) }}</span>
        </div>
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:10px 18px;margin-bottom:24px;font-size:15px;color:var(--color-ink-soft)">
          <span style="display:flex;align-items:center;gap:6px"><Icon name="users" :size="16" />{{ stay.guests }} {{ lang === 'en' ? 'guests' : 'huéspedes' }}</span>
          <span style="display:flex;align-items:center;gap:6px"><Icon name="bed" :size="16" />{{ stay.beds }} {{ lang === 'en' ? 'bedrooms' : 'habitaciones' }}</span>
          <span style="display:flex;align-items:center;gap:6px"><Icon name="bath" :size="16" />{{ stay.baths }} {{ lang === 'en' ? 'bathrooms' : 'baños' }}</span>
          <span v-if="stay.parking > 0" style="display:flex;align-items:center;gap:6px"><Icon name="car" :size="16" />{{ stay.parking }} {{ lang === 'en' ? 'parking' : 'parqueos' }}</span>
          <!-- Measured on the verification visit — shown only when the host/team recorded it. -->
          <span v-if="stay.wifiMbps" style="display:flex;align-items:center;gap:6px;color:var(--color-forest);font-weight:700"><Icon name="wifi" :size="16" />{{ stay.wifiMbps }} Mbps {{ lang === 'en' ? 'measured' : 'medidos' }}</span>
          <span v-if="stay.workspace" style="display:flex;align-items:center;gap:6px;color:var(--color-forest);font-weight:700"><Icon name="laptop" :size="16" />{{ lang === 'en' ? 'Real workspace' : 'Espacio de trabajo real' }}</span>
        </div>

        <!-- Video + photo grid -->
        <div class="media-split" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:40px">
          <div class="video-box" style="border-radius:20px;overflow:hidden;aspect-ratio:16/9">
            <YouTubeFacade :url="stay.video" :title="stay.name.es" />
          </div>
          <div
            class="gallery-grid"
            :style="`display:grid;grid-template-columns:${galleryImages.length > 1 ? '1.6fr 1fr 1fr' : '1fr'};grid-template-rows:1fr 1fr;gap:12px;aspect-ratio:16/9;border-radius:20px;overflow:hidden`"
          >
            <button type="button" class="gallery-cell" style="grid-row:1/3;position:relative" @click="openLightbox(stay.img)">
              <NuxtImg :src="stay.img" :width="900" :height="620" densities="x1 x2" :alt="stay.name.es" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
            </button>
            <button
              v-for="image in galleryImages.slice(1, 5)"
              :key="image"
              type="button"
              class="gallery-cell"
              style="position:relative"
              @click="openLightbox(image)"
            >
              <NuxtImg :src="image" :width="600" :height="400" densities="x1 x2" :alt="stay.name.es" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" loading="lazy" />
            </button>
          </div>
        </div>
      </section>

      <!-- Photo lightbox -->
      <div
        v-if="lightboxSrc"
        style="position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center"
        @click.self="lightboxSrc = null"
      >
        <button aria-label="Cerrar" style="position:absolute;top:20px;right:24px;background:transparent;border:none;color:#fff;font-size:32px;cursor:pointer;line-height:1" @click="lightboxSrc = null">&times;</button>
        <img :src="lightboxSrc" :alt="stay.name.es" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:12px">
      </div>

      <!-- CONTENT -->
      <section class="pad-sec" style="max-width:1100px;margin:0 auto;padding:0 26px 40px">
        <div class="split-2" style="display:grid;grid-template-columns:1.5fr 1fr;gap:48px;align-items:start">
          <!-- Left: description + amenities + reviews -->
          <div style="background:var(--color-cream);border:1px solid rgba(37,29,20,.09);border-radius:20px;padding:32px;box-shadow:0 12px 30px -22px rgba(37,29,20,.35)">
            <p style="font-size:17px;line-height:1.72;color:var(--color-ink-mid);margin:0 0 30px">{{ t(stay.desc) }}</p>

            <!-- Amenities -->
            <div style="border-top:1px solid rgba(37,29,20,.12);padding-top:24px;margin-bottom:30px">
              <h3 style="font-family:var(--font-display);font-weight:700;font-size:21px;margin:0 0 16px;color:var(--color-ink)">
                {{ lang === 'en' ? 'What\'s included' : 'Lo que incluye' }}
              </h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div v-for="key in stay.amen" :key="key" style="display:flex;align-items:center;gap:10px;font-size:15px;color:var(--color-ink-mid)">
                  <span style="display:flex;align-items:center;justify-content:center;color:var(--color-moss)">
                    <Icon :name="AMEN_ICON[key] ?? 'sofa'" :size="19" />
                  </span>
                  <span>{{ lang === 'en' ? AMEN_LABELS[key]?.en : AMEN_LABELS[key]?.es }}</span>
                </div>
              </div>
            </div>

            <!-- House rules: only what we actually have real data for — no
                 fabricated smoking/visitor policy the property hasn't set. -->
            <div style="border-top:1px solid rgba(37,29,20,.12);padding-top:24px;margin-bottom:30px">
              <h3 style="font-family:var(--font-display);font-weight:700;font-size:21px;margin:0 0 16px;color:var(--color-ink)">
                {{ lang === 'en' ? 'House rules' : 'Reglas de la casa' }}
              </h3>
              <div style="display:flex;flex-direction:column;gap:10px;font-size:15px;color:var(--color-ink-mid)">
                <div style="display:flex;align-items:center;gap:10px">
                  <Icon name="paw" :size="17" />
                  <span v-if="stay.amen.includes('pets')">{{ lang === 'en' ? 'Pets allowed' : 'Acepta mascotas' }}</span>
                  <span v-else>{{ lang === 'en' ? 'No pets' : 'No acepta mascotas' }}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                  <Icon name="bed" :size="17" />
                  <span>
                    {{ lang === 'en'
                      ? `Minimum stay: ${stay.minMonths} ${stay.minMonths === 1 ? 'month' : 'months'}`
                      : `Estadía mínima: ${stay.minMonths} ${stay.minMonths === 1 ? 'mes' : 'meses'}` }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Host -->
            <div style="border-top:1px solid rgba(37,29,20,.12);padding-top:24px;margin-bottom:30px;display:flex;align-items:center;gap:16px">
              <div style="width:54px;height:54px;border-radius:50%;background:var(--color-moss);color:var(--color-gold-light);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:22px;flex:none">{{ stay.host.name[0] }}</div>
              <div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--color-ink)">{{ stay.host.name }}</span>
                  <span v-if="stay.verified" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:#2F7A3D" title="Identidad y propiedad verificadas">
                    <Icon name="check" :size="13" />
                    {{ lang === 'en' ? 'Verified host' : 'Anfitrión verificado' }}
                  </span>
                </div>
                <div style="font-size:14px;color:var(--color-ink-faint)">{{ t(stay.host.line) }}</div>
              </div>
            </div>

            <!-- Map -->
            <div style="border-top:1px solid rgba(37,29,20,.12);padding-top:24px;margin-bottom:30px">
              <h3 style="font-family:var(--font-display);font-weight:700;font-size:21px;margin:0 0 16px;color:var(--color-ink)">
                {{ lang === 'en' ? 'Location' : 'Ubicación' }}
              </h3>
              <ClientOnly>
                <PropertyMap :lat="stay.lat" :lng="stay.lng" :name="stay.name.es" />
              </ClientOnly>
            </div>

            <!-- Reviews -->
            <div style="border-top:1px solid rgba(37,29,20,.12);padding-top:24px">
              <h3 style="font-family:var(--font-display);font-weight:700;font-size:21px;margin:0 0 18px;color:var(--color-ink)">
                {{ lang === 'en' ? 'Reviews' : 'Reseñas' }}
              </h3>
              <div style="display:flex;flex-direction:column;gap:18px">
                <div v-for="(rv, i) in (stay.reviewsList ?? [])" :key="i" style="background:#fff;border:1px solid rgba(37,29,20,.09);border-radius:16px;padding:20px">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="width:38px;height:38px;border-radius:50%;background:var(--color-sand-deep);color:var(--color-terracotta);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px">{{ rv.name[0] }}</div>
                      <div>
                        <div style="font-weight:700;font-size:15px;color:var(--color-ink)">{{ rv.name }}</div>
                        <div style="font-size:12.5px;color:var(--color-ink-faint)">{{ t(rv.date) }}</div>
                      </div>
                    </div>
                    <span style="font-weight:700;color:var(--color-gold)">★ {{ rv.rating.toFixed(1) }}</span>
                  </div>
                  <p style="font-size:15px;line-height:1.6;color:var(--color-ink-mid);margin:0">{{ t(rv.text) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: booking card -->
          <div class="booking-col" style="position:sticky;top:92px">
            <div style="background:#fff;border:1px solid rgba(37,29,20,.1);border-radius:20px;padding:28px;box-shadow:0 12px 30px -22px rgba(37,29,20,.5)">
              <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px">
                <span class="num" style="font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--color-ink)">${{ stay.price }}</span>
                <span style="font-size:15px;color:var(--color-ink-faint)">/ {{ lang === 'en' ? 'month' : 'mes' }}</span>
              </div>

              <div :style="`display:flex;align-items:center;gap:7px;margin-bottom:8px;font-size:14px;font-weight:700;color:${availabilityInfo.isNow ? '#2F7A3D' : '#B9822E'}`">
                <span style="width:8px;height:8px;border-radius:50%;background:currentColor;flex:none" />
                {{ t(availabilityInfo.text) }}
              </div>

              <NuxtLink :to="localePath('/como-funciona')" style="display:inline-block;margin-bottom:20px;font-size:13px;font-weight:600;color:var(--color-ink-faint);text-decoration:underline;text-underline-offset:2px">
                {{ lang === 'en' ? 'How do the contract and deposit work?' : '¿Cómo funciona el contrato y el depósito?' }}
              </NuxtLink>

              <div v-if="hasCostBreakdown" style="border-top:1px solid rgba(37,29,20,.12);padding-top:18px;margin-bottom:6px">
                <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--color-ink-faint);margin-bottom:12px">
                  {{ lang === 'en' ? 'Move-in costs' : 'Costos al mudarte' }}
                </div>
                <div style="display:flex;flex-direction:column;gap:9px;font-size:14px;color:var(--color-ink-soft)">
                  <div style="display:flex;justify-content:space-between">
                    <span>{{ lang === 'en' ? 'Monthly rent' : 'Renta mensual' }}</span>
                    <span style="font-weight:700;color:var(--color-ink)">${{ stay.price }}</span>
                  </div>
                  <div v-if="(stay.deposit ?? 0) > 0" style="display:flex;justify-content:space-between">
                    <span>{{ lang === 'en' ? 'Deposit (refundable)' : 'Depósito (reembolsable)' }}</span>
                    <span style="font-weight:700;color:var(--color-ink)">${{ stay.deposit }}</span>
                  </div>
                  <div v-if="(stay.utilitiesMin ?? 0) > 0" style="display:flex;justify-content:space-between">
                    <span>{{ lang === 'en' ? 'Estimated utilities' : 'Servicios estimados' }}</span>
                    <span style="font-weight:700;color:var(--color-ink)">
                      ${{ stay.utilitiesMin }}{{ (stay.utilitiesMax ?? 0) > (stay.utilitiesMin ?? 0) ? `–$${stay.utilitiesMax}` : '' }}
                    </span>
                  </div>
                </div>
                <div v-if="(stay.deposit ?? 0) > 0" style="display:flex;justify-content:space-between;border-top:1px dashed rgba(37,29,20,.18);margin-top:12px;padding-top:12px;font-size:14.5px">
                  <span style="font-weight:700;color:var(--color-ink)">{{ lang === 'en' ? 'First payment' : 'Primer pago' }}</span>
                  <span style="font-weight:800;color:var(--color-ink)">${{ firstMonthTotal }}</span>
                </div>
                <p v-if="(stay.utilitiesMin ?? 0) > 0" style="font-size:12px;color:var(--color-ink-faint);margin:10px 0 0;line-height:1.5">
                  {{ lang === 'en'
                    ? 'Water and electricity estimate — may vary with usage.'
                    : 'Estimado de agua y luz — puede variar según consumo.' }}
                </p>
              </div>

              <div style="border-top:1px solid rgba(37,29,20,.12);padding-top:18px;display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
                <div v-if="stay.verified" style="display:flex;align-items:center;justify-content:space-between;font-size:14px;color:var(--color-ink-soft)">
                  <span style="display:flex;align-items:center;gap:7px"><Icon name="check" :size="15" />{{ lang === 'en' ? 'Verified property' : 'Propiedad verificada' }}</span>
                </div>
                <div v-if="stay.minMonths > 1" style="display:flex;align-items:center;justify-content:space-between;font-size:14px;color:var(--color-ink-soft)">
                  <span>{{ lang === 'en' ? 'Minimum stay' : 'Estadía mínima' }}</span>
                  <span style="font-weight:700;color:var(--color-ink)">{{ stay.minMonths }} {{ lang === 'en' ? 'months' : 'meses' }}</span>
                </div>
                <div v-if="stay.sqmBuilt > 0" style="display:flex;align-items:center;justify-content:space-between;font-size:14px;color:var(--color-ink-soft)">
                  <span style="display:flex;align-items:center;gap:7px"><Icon name="ruler" :size="15" />{{ lang === 'en' ? 'Built area' : 'Construcción' }}</span>
                  <span style="font-weight:700;color:var(--color-ink)">{{ stay.sqmBuilt }} m²</span>
                </div>
                <div v-if="stay.sqmLot > 0" style="display:flex;align-items:center;justify-content:space-between;font-size:14px;color:var(--color-ink-soft)">
                  <span>{{ lang === 'en' ? 'Lot size' : 'Terreno' }}</span>
                  <span style="font-weight:700;color:var(--color-ink)">{{ stay.sqmLot }} m²</span>
                </div>
              </div>

              <div style="border-top:1px solid rgba(37,29,20,.12);padding-top:18px">
                <button type="button" class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:8px" @click="requestModal?.openModal()">
                  {{ lang === 'en' ? 'Request information' : 'Solicitar información' }}
                </button>
                <p style="text-align:center;font-size:12px;color:var(--color-ink-faint);margin:0 0 18px">
                  {{ lang === 'en' ? 'Nothing charged now. No commission.' : 'No se cobra nada ahora. Sin comisión.' }}
                </p>

                <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--color-ink-faint);margin-bottom:10px">
                  {{ lang === 'en' ? 'Or reach out directly' : 'O contacta directo' }}
                </div>
                <div style="font-weight:700;font-size:15px;color:var(--color-ink);margin-bottom:10px">{{ stay.host.name }}</div>
                <a
                  :href="whatsappUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="whatsapp-contact"
                  :aria-label="`Escribir por WhatsApp a ${stay.host.name} sobre ${stay.name.es}`"
                >
                  <Icon name="phone" :size="18" />
                  {{ lang === 'en' ? 'Ask on WhatsApp' : 'Consultar por WhatsApp' }}
                </a>
                <div style="display:flex;flex-direction:column;gap:8px">
                  <a :href="`tel:${stay.host.phone.replace(/[^+\d]/g, '')}`" style="display:flex;align-items:center;gap:9px;padding:8px 0;color:var(--color-ink-mid);text-decoration:none;font-size:14.5px;font-weight:600">
                    <Icon name="phone" :size="16" />{{ stay.host.phone }}
                  </a>
                  <a :href="`mailto:${stay.host.email}`" style="display:flex;align-items:center;gap:9px;padding:8px 0;color:var(--color-ink-mid);text-decoration:none;font-size:14.5px;font-weight:600">
                    <Icon name="mail" :size="16" />{{ stay.host.email }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RequestModal ref="requestModal" :stay="stay" />

      <!-- SIMILAR LISTINGS -->
      <section v-if="SIMILAR.length > 0" class="pad-sec" style="max-width:1100px;margin:0 auto;padding:0 26px 64px">
        <h2 style="font-family:var(--font-display);font-weight:800;font-size:26px;margin:0 0 20px;color:var(--color-ink)">
          {{ lang === 'en' ? 'Similar properties' : 'Propiedades similares' }}
        </h2>
        <div class="similar-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px">
          <NuxtLink
            v-for="p in SIMILAR"
            :key="p.id"
            :to="localePath(`/alquiler/${p.id}`)"
            style="text-decoration:none;color:inherit;display:block;background:#fff;border:1px solid rgba(37,29,20,.09);border-radius:16px;overflow:hidden;box-shadow:0 8px 20px -16px rgba(37,29,20,.4)"
          >
            <div style="position:relative;aspect-ratio:4/3;overflow:hidden">
              <NuxtImg :src="p.img" :width="320" :height="240" densities="x1 x2" :alt="p.name.es" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" loading="lazy" />
            </div>
            <div style="padding:14px 16px 16px">
              <div style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--color-ink-faint);margin-bottom:5px">
                <Icon name="location" :size="12" />
                {{ t(p.loc) }}
              </div>
              <div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--color-ink);margin-bottom:8px;line-height:1.25">
                {{ t(p.name) }}
              </div>
              <div style="display:flex;align-items:baseline;justify-content:space-between">
                <span style="font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--color-ink)">
                  ${{ p.price }}<span style="font-size:12px;font-weight:600;color:var(--color-ink-faint)"> / {{ lang === 'en' ? 'mo' : 'mes' }}</span>
                </span>
                <span style="display:flex;align-items:center;gap:3px;font-size:12.5px;font-weight:700;color:var(--color-gold)">★ {{ p.rating.toFixed(1) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.rental-bg { position: relative; }
.rental-bg-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Flat wash, not a gradient: this layer is position:fixed, so it's anchored
     to the viewport rather than the scrolling title block — a gradient would
     drift in and out of strength as the page scrolls. */
  background-image:
    linear-gradient(rgba(245,240,232,.68), rgba(245,240,232,.68)),
    url('/fondoalquiler.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.rental-bg-content { position: relative; z-index: 1; }

/* Gallery cells are <button>s so photos are keyboard- and click-accessible;
   reset default button chrome and add a hover cue that they open a lightbox. */
.gallery-cell {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}
.gallery-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(20, 15, 10, 0);
  transition: background-color .18s ease;
}
.gallery-cell:hover::after,
.gallery-cell:focus-visible::after {
  background: rgba(20, 15, 10, .15);
}

.whatsapp-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 10px;
  padding: 13px 16px;
  border-radius: 11px;
  background: #25D366;
  color: #12341f;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
  transition: transform .18s ease, background-color .18s ease, box-shadow .18s ease;
}
.whatsapp-contact:hover {
  background: #20c65c;
  box-shadow: 0 8px 16px -10px rgba(20, 120, 55, .8);
  transform: translateY(-1px);
}
.whatsapp-contact:focus-visible {
  outline: 3px solid rgba(37, 211, 102, .42);
  outline-offset: 3px;
}

.verified-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 20;
  width: 240px;
  background: var(--color-ink);
  color: var(--color-cream);
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.5;
  padding: 10px 13px;
  border-radius: 10px;
  box-shadow: 0 12px 24px -10px rgba(0,0,0,.45);
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity .15s ease, transform .15s ease;
}
.verified-badge:hover .verified-tooltip,
.verified-badge:focus-visible .verified-tooltip,
.verified-badge:focus-within .verified-tooltip {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .verified-tooltip { transition: none; }
}

@media (max-width: 700px) {
  .media-split { grid-template-columns: 1fr !important; }
  .video-box { aspect-ratio: 16/9 !important; }
  .gallery-grid {
    display: flex !important;
    aspect-ratio: auto !important;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .gallery-grid::-webkit-scrollbar { display: none; }
  .gallery-cell {
    flex: 0 0 84%;
    aspect-ratio: 4/3;
    scroll-snap-align: start;
    border-radius: 16px;
  }
}

@media (max-width: 880px) {
  .booking-col { position: static !important; top: auto !important; }
  .similar-grid { grid-template-columns: repeat(2, 1fr) !important; }
}
@media (max-width: 480px) {
  .similar-grid { grid-template-columns: 1fr !important; }
}
</style>
