<script setup lang="ts">
import type { LandListing, ListingSummary, SaleListing } from '#shared/types/content'
import type { IconName } from '~/components/Icon.vue'
import { AMEN_LABELS, BOQUETE_ZONES } from '#shared/utils/constants'
import { KIND_SLUGS, formatListingPrice, kindMeta, listingTypeLabel, pricePerSqm } from '#shared/utils/listings'

// Listing page for homes for sale and land (rentals keep their own layout).
// Built around what a buyer decides on: price and size up front, the legal
// status of the title spelled out, the zone's climate, and a visit request.
const props = defineProps<{ listing: SaleListing | LandListing; similar: ListingSummary[] }>()
const { lang, localePath, t } = useLocale()

const l = computed(() => props.listing)
const en = computed(() => lang.value === 'en')
const meta = computed(() => kindMeta(l.value.kind))
const zone = computed(() => BOQUETE_ZONES.find(z => z.id === l.value.zone))
const backHref = computed(() => `${localePath('/propiedades')}?tipo=${KIND_SLUGS[l.value.kind]}`)

const num = (v: number) => {
  const g = Math.round(v).toLocaleString('en-US')
  return en.value ? g : g.replace(/,/g, '.')
}
const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`

// Headline figures: the strip under the photo.
const figures = computed(() => {
  const x = l.value
  if (x.kind === 'land') {
    const ha = x.sqmLot >= 10000 ? ` (${(x.sqmLot / 10000).toLocaleString(en.value ? 'en-US' : 'es-ES', { maximumFractionDigits: 2 })} ha)` : ''
    return [
      { label: en.value ? 'Price' : 'Precio', value: usd(x.price) },
      { label: en.value ? 'Area' : 'Superficie', value: `${num(x.sqmLot)} m²${ha}` },
      { label: en.value ? 'Price per m²' : 'Precio por m²', value: `$${num(pricePerSqm(x))}` },
      { label: en.value ? 'Terrain' : 'Topografía', value: topoLabel(x.topography) },
    ]
  }
  return [
    { label: en.value ? 'Price' : 'Precio', value: usd(x.price) },
    { label: en.value ? 'Bedrooms' : 'Recámaras', value: String(x.beds) },
    { label: en.value ? 'Bathrooms' : 'Baños', value: String(x.baths) },
    ...(x.sqmBuilt ? [{ label: en.value ? 'Built' : 'Construcción', value: `${num(x.sqmBuilt)} m²` }] : []),
    ...(x.sqmLot ? [{ label: en.value ? 'Lot' : 'Terreno', value: `${num(x.sqmLot)} m²` }] : []),
  ]
})

function topoLabel(v: LandListing['topography']) {
  return { plano: en.value ? 'Flat' : 'Plano', inclinado: en.value ? 'Sloped' : 'Inclinado', mixto: en.value ? 'Mixed' : 'Mixto' }[v]
}

// Detail rows: `ok` marks yes/no facts so they can show a check or a cross.
const details = computed<{ label: string; value: string; ok?: boolean }[]>(() => {
  const x = l.value
  const yes = en.value ? 'Yes' : 'Sí'
  const no = 'No'
  if (x.kind === 'land') {
    const road = { asfalto: en.value ? 'Paved road' : 'Calle asfaltada', tierra: en.value ? 'Dirt road' : 'Camino de tierra', ninguno: en.value ? 'No vehicle access' : 'Sin acceso vehicular' }[x.road]
    return [
      { label: en.value ? 'Water' : 'Agua', value: x.water ? yes : no, ok: x.water },
      { label: en.value ? 'Electricity' : 'Luz eléctrica', value: x.power ? yes : no, ok: x.power },
      { label: en.value ? 'Access' : 'Acceso', value: road, ok: x.road !== 'ninguno' },
      { label: en.value ? 'Terrain' : 'Topografía', value: topoLabel(x.topography) },
    ]
  }
  return [
    { label: en.value ? 'Type' : 'Tipo', value: listingTypeLabel(x, lang.value) },
    { label: en.value ? 'Parking' : 'Estacionamientos', value: String(x.parking ?? 0) },
    ...(x.yearBuilt ? [{ label: en.value ? 'Year built' : 'Año de construcción', value: String(x.yearBuilt) }] : []),
    { label: en.value ? 'Sold furnished' : 'Se vende amueblada', value: x.furnished ? yes : no, ok: !!x.furnished },
    ...(x.hoaFee ? [{ label: en.value ? 'HOA / maintenance' : 'Cuota de mantenimiento', value: `${usd(x.hoaFee)}${en.value ? '/mo' : '/mes'}` }] : []),
  ]
})

const AMEN_ICON: Record<string, IconName> = {
  view: 'mountain', garden: 'home', river: 'waves', spring: 'waves', coffee: 'coffee',
  fireplace: 'flame', parking: 'car', pool: 'waves', security: 'check', furnished: 'sofa', wifi: 'wifi', kitchen: 'kitchen', pets: 'paw',
}
const amenities = computed(() => (l.value.amen ?? []).filter(k => AMEN_LABELS[k]))

const priceNote = computed(() => {
  const x = l.value
  if (x.kind === 'land' && x.sqmLot) return `$${num(pricePerSqm(x))} ${en.value ? 'per m²' : 'por m²'}`
  if (x.kind === 'sale' && x.hoaFee) return `+ ${usd(x.hoaFee)}${en.value ? '/mo maintenance' : '/mes de mantenimiento'}`
  return ''
})

// Without a photo the hero is the engraving, set as a CSS background — which
// the browser only discovers after the stylesheet applies. Preloading it took
// ~2.8 s of "load delay" off this page's LCP.
useHead(() => (hasPhoto(l.value.img) ? {} : { link: [{ rel: 'preload', as: 'image', href: '/fondoblogs-mobile.webp' }] }))

const waHref = computed(() => {
  const digits = (l.value.contact?.phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const msg = en.value
    ? `Hi! I'm interested in "${t(l.value.name)}" (${l.value.id}) on MIKA Homes.`
    : `¡Hola! Me interesa "${t(l.value.name)}" (${l.value.id}) que vi en MIKA Homes.`
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`
})

useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      'name': l.value.name.es,
      'description': l.value.desc?.es || l.value.short?.es,
      ...(hasPhoto(l.value.img) ? { image: [l.value.img] } : {}),
      'about': {
        '@type': l.value.kind === 'land' ? 'Place' : (l.value.type === 'apto' ? 'Apartment' : 'SingleFamilyResidence'),
        'address': { '@type': 'PostalAddress', 'addressLocality': l.value.loc?.es, 'addressRegion': 'Chiriquí', 'addressCountry': 'PA' },
        ...(l.value.approxLocation ? {} : { geo: { '@type': 'GeoCoordinates', 'latitude': l.value.lat, 'longitude': l.value.lng } }),
      },
      'offers': { '@type': 'Offer', 'price': l.value.price, 'priceCurrency': 'USD' },
    }),
  }],
}))
</script>

<template>
  <div class="ld" :style="`--kc:${meta.color}`" data-no-reveal>
    <!-- HEADER -->
    <section class="pad-sec ld-head">
      <NuxtLink :to="backHref" class="ld-back">
        <Icon name="arrow-left" :size="16" />
        {{ l.kind === 'land' ? (en ? 'All land' : 'Todos los terrenos') : (en ? 'All homes for sale' : 'Todas las casas en venta') }}
      </NuxtLink>
      <div class="ld-tags">
        <span class="ld-kind"><span class="ld-dot" />{{ t(meta.label) }}</span>
        <span v-if="l.verified" class="ld-verified"><Icon name="check" :size="14" />{{ en ? 'Verified in person' : 'Verificada en persona' }}</span>
      </div>
      <h1 class="ld-title">{{ t(l.name) }}</h1>
      <p class="ld-loc"><Icon name="location" :size="16" />{{ t(l.loc) }}<template v-if="zone"> · {{ zone.elevation }}</template></p>
    </section>

    <!-- MEDIA -->
    <section class="pad-sec ld-media-wrap">
      <div class="ld-media" :class="{ 'has-video': !!l.video }">
        <div class="ld-photo">
          <NuxtImg
            v-if="hasPhoto(l.img)"
            :src="l.img"
            :width="1100"
            :height="620"
            densities="x1 x2"
            :alt="t(l.name)"
            class="ld-photo-img"
            preload
            fetchpriority="high"
          />
          <BlogPostArt v-else :seed="l.id" :color="meta.color" size="lg" />
        </div>
        <div v-if="l.video" class="ld-video">
          <YouTubeFacade :url="l.video" :title="t(l.name)" />
        </div>
      </div>

      <dl class="ld-figures">
        <div v-for="f in figures" :key="f.label" class="ld-figure">
          <dt>{{ f.label }}</dt>
          <dd class="num">{{ f.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- CONTENT -->
    <section class="pad-sec ld-main">
      <div class="ld-col">
        <p v-if="t(l.short)" class="ld-lead">{{ t(l.short) }}</p>
        <p v-if="t(l.desc)" class="ld-desc">{{ t(l.desc) }}</p>

        <h2 class="ld-h2">{{ en ? 'Details' : 'Características' }}</h2>
        <dl class="ld-details">
          <div v-for="d in details" :key="d.label" class="ld-detail">
            <dt>{{ d.label }}</dt>
            <dd :class="{ 'is-yes': d.ok === true, 'is-no': d.ok === false }">
              <Icon v-if="d.ok === true" name="check" :size="15" />
              <Icon v-else-if="d.ok === false" name="close" :size="15" />
              {{ d.value }}
            </dd>
          </div>
        </dl>
        <ul v-if="amenities.length" class="ld-amen">
          <li v-for="k in amenities" :key="k">
            <Icon :name="AMEN_ICON[k] ?? 'check'" :size="17" />
            {{ en ? AMEN_LABELS[k]!.en : AMEN_LABELS[k]!.es }}
          </li>
        </ul>

        <h2 class="ld-h2">{{ en ? 'Legal status' : 'Situación legal' }}</h2>
        <div v-if="l.title === 'titulo'" class="ld-legal is-titled">
          <span class="ld-legal-icon"><Icon name="document" :size="20" /></span>
          <div>
            <p class="ld-legal-title">{{ en ? 'Titled property' : 'Título de propiedad' }}</p>
            <p>
              {{ en
                ? 'Registered with Panama\'s Public Registry (Registro Público): it can be mortgaged and is transferred by public deed. Before buying, have a lawyer check the property\'s folio in the Registry.'
                : 'Inscrita en el Registro Público de Panamá: se puede hipotecar y se traspasa por escritura pública. Antes de comprar, pide a un abogado que revise el folio de la finca en el Registro.' }}
            </p>
          </div>
        </div>
        <div v-else class="ld-legal is-rights" role="note">
          <span class="ld-legal-icon"><Icon name="alert" :size="20" /></span>
          <div>
            <p class="ld-legal-title">{{ en ? 'Possession rights (not titled)' : 'Derechos posesorios (sin título)' }}</p>
            <p>
              {{ en
                ? 'The seller holds possession but not a title registered in the Public Registry. It is usually cheaper, but it can\'t be mortgaged, and titling it (through ANATI) takes time and costs. Hire an independent Panamanian lawyer before signing anything.'
                : 'El vendedor tiene la posesión, pero no un título inscrito en el Registro Público. Suele ser más barato, pero no se puede hipotecar y titularlo (ante la ANATI) lleva tiempo y costos. Contrata un abogado panameño independiente antes de firmar.' }}
            </p>
          </div>
        </div>

        <h2 class="ld-h2">{{ en ? 'Location' : 'Ubicación' }}</h2>
        <div v-if="zone" class="ld-zone">
          <div class="ld-zone-top">
            <span class="ld-zone-name">{{ zone.name }}</span>
            <span class="ld-zone-climate">{{ zone.elevation }} · {{ t(zone.climate) }}</span>
          </div>
          <p>{{ t(zone.blurb) }}</p>
        </div>
        <ClientOnly>
          <PropertyMap :lat="l.lat" :lng="l.lng" :name="t(l.name)" :approx="l.approxLocation" />
        </ClientOnly>
        <p v-if="l.approxLocation" class="ld-approx">
          {{ en
            ? 'Approximate location (~300 m). The exact address is shared when the visit is confirmed.'
            : 'Ubicación aproximada (~300 m). La dirección exacta se comparte al confirmar la visita.' }}
        </p>
      </div>

      <!-- Sticky price + visit card -->
      <aside class="ld-side">
        <div class="ld-card">
          <div class="ld-price num">{{ formatListingPrice(l, lang) }}</div>
          <p v-if="priceNote" class="ld-price-note">{{ priceNote }}</p>
          <p v-if="l.title === 'derechos'" class="ld-card-warn">
            <Icon name="alert" :size="14" />{{ en ? 'Possession rights' : 'Derechos posesorios' }}
          </p>

          <h2 class="ld-card-h">{{ en ? 'Schedule a visit' : 'Agenda una visita' }}</h2>
          <ListingVisitForm :listing="l" />

          <div v-if="waHref" class="ld-direct">
            <span class="ld-direct-label">{{ en ? 'Or write directly' : 'O escribe directo' }}</span>
            <a :href="waHref" target="_blank" rel="noopener" class="ld-wa">
              <Icon name="chat" :size="17" />
              {{ en ? 'WhatsApp' : 'Escribir por WhatsApp' }}
            </a>
            <span class="ld-contact">{{ l.contact.name }} · {{ t(l.contact.line) }}</span>
          </div>
        </div>
      </aside>
    </section>

    <!-- SIMILAR -->
    <section v-if="similar.length" class="pad-sec ld-similar" aria-labelledby="ld-similar-title">
      <h2 id="ld-similar-title" class="ld-h2">
        {{ l.kind === 'land' ? (en ? 'More land' : 'Más terrenos') : (en ? 'More homes for sale' : 'Más casas en venta') }}
      </h2>
      <div class="ld-similar-grid">
        <ListingCard v-for="s in similar" :key="s.id" :listing="s" :href="localePath(`/propiedades/${s.id}`)" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.ld { padding-bottom: 96px; }
.ld-head, .ld-media-wrap, .ld-main, .ld-similar { max-width: 1120px; margin: 0 auto; }

/* --- Header --- */
.ld-head { padding-top: 44px; padding-bottom: 22px; }
.ld-back {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 7px;
  margin-bottom: 22px;
  font-weight: 700;
  font-size: 14px;
  color: var(--color-ink-soft);
  text-decoration: none;
  transition: color .2s ease, gap .2s var(--ease-out);
}
.ld-back:hover { color: var(--kc); gap: 10px; }
.ld-back:focus-visible { outline: none; box-shadow: var(--shadow-focus); border-radius: 6px; }
.ld-tags { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
.ld-kind {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--kc) 12%, transparent);
  color: var(--kc);
  font-size: 13px;
  font-weight: 700;
}
.ld-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--kc); }
.ld-verified { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: var(--color-forest); }
.ld-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(32px, 4.6vw, 52px);
  line-height: 1.04;
  letter-spacing: -.022em;
  margin: 0 0 10px;
  color: var(--color-ink);
  text-wrap: balance;
}
.ld-loc { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 16px; color: var(--color-ink-soft); }

/* --- Media + figures --- */
.ld-media { display: grid; gap: 12px; }
.ld-media.has-video { grid-template-columns: 1.6fr 1fr; }
.ld-photo, .ld-video {
  position: relative;
  aspect-ratio: 16 / 8;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-sand-deep);
}
.ld-media.has-video .ld-photo, .ld-media.has-video .ld-video { aspect-ratio: auto; min-height: 340px; }
.ld-photo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

.ld-figures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  margin: 18px 0 0;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-white);
  overflow: hidden;
}
.ld-figure { padding: 16px 20px; border-right: 1px solid var(--color-border); }
.ld-figure:last-child { border-right: none; }
.ld-figure dt { font-size: 12.5px; font-weight: 600; color: var(--color-ink-soft); margin-bottom: 4px; }
.ld-figure dd { margin: 0; font-family: var(--font-display); font-weight: 800; font-size: 21px; color: var(--color-ink); }
.ld-figure:first-child dd { color: var(--kc); }

/* --- Main --- */
.ld-main {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(300px, 1fr);
  gap: 48px;
  align-items: start;
  padding-top: 44px;
}
.ld-lead { margin: 0 0 14px; font-size: 20px; line-height: 1.55; color: var(--color-ink); font-weight: 500; text-wrap: pretty; }
.ld-desc { margin: 0; font-size: 17px; line-height: 1.75; color: var(--color-ink-mid); text-wrap: pretty; }
.ld-h2 {
  margin: 44px 0 16px;
  padding-top: 26px;
  border-top: 1px solid var(--color-border);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -.01em;
  color: var(--color-ink);
}
.ld-details { display: grid; grid-template-columns: 1fr 1fr; gap: 0 28px; margin: 0; }
.ld-detail {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-soft);
  font-size: 15px;
}
.ld-detail dt { color: var(--color-ink-soft); }
.ld-detail dd { margin: 0; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; color: var(--color-ink); text-align: right; }
.ld-detail dd.is-yes { color: var(--color-forest); }
.ld-detail dd.is-no { color: var(--color-terracotta); }
.ld-amen {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ld-amen li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  border-radius: 999px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-ink-mid);
}
.ld-amen li :deep(svg) { color: var(--color-forest); }

.ld-legal {
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 14px;
  font-size: 15px;
  line-height: 1.6;
}
.ld-legal p { margin: 0; }
.ld-legal-title { font-weight: 800; font-family: var(--font-display); font-size: 16px; margin-bottom: 4px !important; }
.ld-legal-icon { flex: none; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; }
.ld-legal.is-titled { background: rgba(47, 82, 51, .08); color: var(--color-ink-mid); }
.ld-legal.is-titled .ld-legal-icon { background: var(--color-forest); color: var(--color-sand); }
.ld-legal.is-titled .ld-legal-title { color: var(--color-forest); }
.ld-legal.is-rights { background: rgba(142, 74, 42, .1); color: var(--color-ink-mid); }
.ld-legal.is-rights .ld-legal-icon { background: var(--color-terracotta); color: var(--color-sand); }
.ld-legal.is-rights .ld-legal-title { color: var(--color-terracotta); }

.ld-zone { margin-bottom: 14px; }
.ld-zone-top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
.ld-zone-name { font-family: var(--font-display); font-weight: 800; font-size: 17px; color: var(--color-ink); }
.ld-zone-climate { font-size: 13.5px; font-weight: 600; color: var(--color-terracotta); }
.ld-zone p { margin: 0; font-size: 15px; line-height: 1.6; color: var(--color-ink-mid); }
.ld-approx { margin: 10px 0 0; font-size: 13.5px; color: var(--color-ink-soft); }

/* --- Side card --- */
.ld-side { position: sticky; top: 92px; }
.ld-card {
  padding: 26px;
  border-radius: 16px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
}
.ld-price { font-family: var(--font-display); font-weight: 800; font-size: 30px; line-height: 1.1; color: var(--color-ink); }
.ld-price-note { margin: 4px 0 0; font-size: 14px; color: var(--color-ink-soft); }
.ld-card-warn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 10px 0 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(142, 74, 42, .1);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-terracotta);
}
.ld-card-h {
  margin: 22px 0 14px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  color: var(--color-ink);
}
.ld-direct {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}
.ld-direct-label { font-size: 12.5px; font-weight: 700; color: var(--color-ink-soft); }
.ld-wa {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--color-forest);
  color: var(--color-forest);
  font-weight: 700;
  font-size: 14.5px;
  text-decoration: none;
  transition: background-color .2s ease, color .2s ease;
}
.ld-wa:hover { background: var(--color-forest); color: var(--color-sand); }
.ld-wa:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.ld-contact { font-size: 13px; color: var(--color-ink-soft); text-align: center; }

/* --- Similar --- */
.ld-similar { padding-top: 40px; }
.ld-similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }

@media (max-width: 960px) {
  .ld-main { grid-template-columns: 1fr; gap: 8px; }
  .ld-side { position: static; margin-top: 36px; }
}
@media (max-width: 700px) {
  .ld-media.has-video { grid-template-columns: 1fr; }
  .ld-photo { aspect-ratio: 4 / 3; }
  .ld-media.has-video .ld-video { min-height: 0; aspect-ratio: 16 / 9; }
  .ld-figure { border-right: none; border-bottom: 1px solid var(--color-border); }
  .ld-figures { grid-template-columns: 1fr 1fr; }
  .ld-figure:nth-child(odd) { border-right: 1px solid var(--color-border); }
  .ld-details { grid-template-columns: 1fr; }
  .ld-head { padding-top: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .ld-back, .ld-wa { transition: none; }
}
</style>
