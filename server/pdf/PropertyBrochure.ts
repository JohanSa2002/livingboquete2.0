import { createElement as h, type ComponentProps, type ReactElement } from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

// Brand palette — mirrors app/assets/css/global.css (--color-forest / --color-sand
// / --color-ink) and the admin panel's gold accent (#C8964A), so the brochure
// reads as the same brand as the site.
const COLORS = {
  forest: '#2F5233',
  forestDark: '#223D26',
  gold: '#C8964A',
  clay: '#B95C36',
  sand: '#F5F0E8',
  ink: '#2B2B2B',
  inkSoft: '#5B5650',
  border: '#E5DFD2',
}

const TYPE_LABELS_ES: Record<string, string> = {
  casa: 'Casa',
  habitacion: 'Habitación',
  apto: 'Apartamento',
}

const AMEN_LABELS_ES: Record<string, string> = {
  wifi: 'WiFi',
  kitchen: 'Cocina equipada',
  view: 'Vista panorámica',
  parking: 'Parqueo',
  fireplace: 'Chimenea',
  pool: 'Piscina',
  pets: 'Acepta mascotas',
  furnished: 'Amueblado',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: COLORS.ink,
    paddingBottom: 56,
  },
  header: {
    backgroundColor: COLORS.forest,
    color: COLORS.sand,
    paddingHorizontal: 40,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontFamily: 'Helvetica-Bold', fontSize: 15, letterSpacing: 0.5 },
  brandSub: { fontSize: 8.5, color: COLORS.sand, opacity: 0.8, marginTop: 2 },
  headerDate: { fontSize: 8.5, color: COLORS.sand, opacity: 0.85 },
  hero: { width: '100%', height: 240, objectFit: 'cover' },
  priceBadge: {
    position: 'absolute',
    right: 40,
    top: 200,
    backgroundColor: COLORS.gold,
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceBadgeAmount: { fontFamily: 'Helvetica-Bold', fontSize: 15 },
  priceBadgeUnit: { fontSize: 8, marginTop: 1 },
  body: { paddingHorizontal: 40, paddingTop: 22 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 21, color: COLORS.ink },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  location: { fontSize: 10.5, color: COLORS.inkSoft },
  ratingDot: { fontSize: 10.5, color: COLORS.inkSoft, marginHorizontal: 4 },
  rating: { fontSize: 10.5, color: COLORS.gold, fontFamily: 'Helvetica-Bold' },
  typeBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.sand,
    color: COLORS.forestDark,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  factsGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 14,
  },
  factItem: { width: '25%', marginBottom: 10 },
  factLabel: { fontSize: 7.5, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 0.5 },
  factValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: COLORS.ink, marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 12.5, color: COLORS.forestDark, marginBottom: 8 },
  paragraph: { fontSize: 10, lineHeight: 1.6, color: COLORS.inkSoft },
  noteBox: {
    marginTop: 20,
    backgroundColor: COLORS.sand,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
    borderRadius: 6,
    padding: 14,
  },
  noteLabel: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: COLORS.forestDark, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  noteText: { fontSize: 10, lineHeight: 1.6, color: COLORS.ink },
  amenGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  amenItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  amenBullet: { color: COLORS.gold, fontSize: 10, marginRight: 6 },
  amenText: { fontSize: 10, color: COLORS.ink },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.ink,
    color: COLORS.sand,
    paddingHorizontal: 40,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerHost: { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  footerContact: { fontSize: 8.5, color: COLORS.sand, opacity: 0.8, marginTop: 2 },
  footerSite: { fontSize: 8.5, color: COLORS.gold },
})

export interface BrochureRental {
  id: string
  type: string
  price: number
  guests: number
  beds: number
  baths: number
  parking: number
  sqmBuilt: number
  sqmLot: number
  minMonths: number
  rating: number
  reviews: number
  name: { es: string; en: string }
  loc: { es: string; en: string }
  desc: { es: string; en: string }
  amen: string[]
  host?: { name?: string; phone?: string; email?: string }
  img: string
}

interface Props {
  rental: BrochureRental
  leadName: string
  note?: string
}

// Written with createElement instead of JSX: this is the only React left in an
// otherwise Vue codebase and it never reaches the browser, so keeping it out of
// .tsx avoids configuring a JSX pipeline for a single server-side file.
function fact(label: string, value: string | number): ReactElement {
  return h(View, { style: styles.factItem, key: label }, [
    h(Text, { style: styles.factLabel, key: 'l' }, label),
    h(Text, { style: styles.factValue, key: 'v' }, String(value)),
  ])
}

// `renderToBuffer` only accepts an element whose root is a <Document>, and
// @react-pdf/renderer does not export `DocumentProps`, so the props type is
// read off the component itself — it cannot drift from the library.
type DocumentElement = ReactElement<ComponentProps<typeof Document>>

export function PropertyBrochure({ rental, leadName, note }: Props): DocumentElement {
  const today = new Date().toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })
  const host = rental.host || {}

  const bodyChildren: (ReactElement | false)[] = [
    h(Text, { style: styles.title, key: 'title' }, rental.name.es),
    h(View, { style: styles.locationRow, key: 'loc' }, [
      h(Text, { style: styles.location, key: 'a' }, rental.loc.es),
      h(Text, { style: styles.ratingDot, key: 'b' }, '·'),
      h(Text, { style: styles.rating, key: 'c' }, '★ ' + rental.rating.toFixed(1)),
      h(Text, { style: styles.location, key: 'd' }, '(' + rental.reviews + ' reseñas)'),
    ]),
    h(Text, { style: styles.typeBadge, key: 'type' }, TYPE_LABELS_ES[rental.type] || rental.type),

    h(View, { style: styles.factsGrid, key: 'facts' }, [
      fact('Huéspedes', rental.guests),
      fact('Habitaciones', rental.beds),
      fact('Baños', rental.baths),
      fact('Parqueos', rental.parking),
      fact('M² construidos', rental.sqmBuilt || '--'),
      fact('M² de terreno', rental.sqmLot || '--'),
      fact('Estadía mínima', rental.minMonths + (rental.minMonths === 1 ? ' mes' : ' meses')),
    ]),

    !!note && h(View, { style: styles.noteBox, key: 'note' }, [
      h(Text, { style: styles.noteLabel, key: 'l' }, 'Nota de nuestro equipo'),
      h(Text, { style: styles.noteText, key: 't' }, note),
    ]),

    h(View, { style: styles.section, key: 'desc' }, [
      h(Text, { style: styles.sectionTitle, key: 'l' }, 'Descripción'),
      h(Text, { style: styles.paragraph, key: 't' }, rental.desc.es),
    ]),

    rental.amen?.length > 0 && h(View, { style: styles.section, key: 'amen' }, [
      h(Text, { style: styles.sectionTitle, key: 'l' }, 'Amenidades'),
      h(View, { style: styles.amenGrid, key: 'g' }, rental.amen.map(key =>
        h(View, { style: styles.amenItem, key }, [
          h(Text, { style: styles.amenBullet, key: 'b' }, '•'),
          h(Text, { style: styles.amenText, key: 't' }, AMEN_LABELS_ES[key] || key),
        ]),
      )),
    ]),
  ]

  return h(Document, { title: rental.name.es + ' · MIKA Homes' },
    h(Page, { size: 'A4', style: styles.page }, [
      h(View, { style: styles.header, fixed: true, key: 'header' }, [
        h(View, { key: 'brand' }, [
          h(Text, { style: styles.brand, key: 'n' }, 'MIKA HOMES'),
          h(Text, { style: styles.brandSub, key: 's' }, 'Alquileres mensuales en Boquete, Panamá'),
        ]),
        h(Text, { style: styles.headerDate, key: 'date' }, 'Preparado para ' + leadName + ' · ' + today),
      ]),

      h(Image, { src: rental.img, style: styles.hero, key: 'hero' }),
      h(View, { style: styles.priceBadge, key: 'price' }, [
        h(Text, { style: styles.priceBadgeAmount, key: 'a' }, '$' + rental.price),
        h(Text, { style: styles.priceBadgeUnit, key: 'u' }, 'por mes'),
      ]),

      h(View, { style: styles.body, key: 'body' }, bodyChildren.filter(Boolean) as ReactElement[]),

      h(View, { style: styles.footer, fixed: true, key: 'footer' }, [
        h(View, { key: 'host' }, [
          h(Text, { style: styles.footerHost, key: 'n' }, host.name || 'Equipo MIKA Homes'),
          h(Text, { style: styles.footerContact, key: 'c' }, [host.phone, host.email].filter(Boolean).join('  ·  ')),
        ]),
        h(Text, { style: styles.footerSite, key: 'site' }, 'mikahomes.com'),
      ]),
    ]),
  )
}
