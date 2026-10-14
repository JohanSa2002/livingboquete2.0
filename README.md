# MIKA Homes 2.0 — Nuxt

Port de [`../livingboquete`](../livingboquete) (Astro + React islands) a **Nuxt 4 / Vue 3**, que
ya creció por su cuenta: un solo catálogo en mapa para **alquileres, casas en venta y terrenos**
en Boquete, Chiriquí.

## Arranque

Requiere Node ≥ 22 y Docker (para el Supabase local).

```bash
npm install
npm run db:start     # Supabase local (aplica supabase/migrations)
npm run dev          # http://localhost:3000
```

`.env` apunta al **Supabase local**. Las credenciales del proyecto en la nube (compartido con el
v1) viven aparte en `.env.cloud`. Ver `.env.example` para todas las claves:

| Clave | Para qué |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Toda lectura/escritura pasa por el servidor con la service_role |
| `ADMIN_PASS`, `ADMIN_SECRET` | **Obligatorias.** Sin ellas el panel queda bloqueado (no hay valores por defecto) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | Envío de la ficha PDF y avisos de leads |
| `LEADS_NOTIFY_TO` | Opcional: buzón que recibe un aviso por cada lead nuevo (si falta, usa `EMAIL_REPLY_TO`) |
| `NUXT_PUBLIC_GOOGLE_MAPS_KEY` | Opcional: tiles de Google en vez de OpenStreetMap |
| `SITE_URL` | URL pública (sitemap, SEO, enlaces en correos) |

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (regenera antes las imágenes del hero) |
| `npm run build` / `preview` | Build de producción a `.output/` y servirlo |
| `npm run typecheck` | `vue-tsc` sobre todo el proyecto |
| `npm run db:start` / `db:stop` | Levanta/para el Supabase local (sin los servicios que no se usan) |
| `npm run seed` | **Escribe datos de ejemplo** (lugares, eventos, posts, galería). No contra producción |
| `npm run seed:listings` | 18 propiedades demo (`demo: true`) repartidas por las seis zonas |
| `npm run setup-storage` | Crea el bucket `images` en Supabase Storage |
| `npx tsx scripts/copy-cloud-to-local.ts` | Copia contenido e imágenes de la nube al Supabase local (solo lectura en la nube, sin leads) |

## Estructura

```
app/
  pages/[lang]/…         Sitio público bajo /es y /en
    index                Home: hero, garantías, atractivos, zonas, eventos, costo de vida, guía
    propiedades/         Explorador lista + mapa (filtros en la URL) y ficha /propiedades/[id]
    blog/ · como-funciona · publicar-propiedad
  pages/admin/…          Panel privado: CRUD genérico por sección + leads
  components/            Header/Footer, Listing* (tarjeta, mapa, ficha, visita), RequestModal,
                         Home*, BoqueteZones/ZonesMap, LeadForm, LeadTrap (honeypot)…
  composables/           useLocale, usePageSeo, useContent, useListingFilters, useLeadGuard
  middleware/            locale.global — normaliza un /:lang desconocido
  plugins/               lenis.client · scroll-reveal.client
server/
  api/                   auth · content/[table] (admin) · public/[table] (lectura con caché 60 s)
                         leads · upload (sharp → WebP) · send-brochure · admin/stats
  middleware/            locale-redirect (301 a /es|/en) · admin-guard · legacy-alquiler
  pdf/                   Ficha de propiedad en PDF (@react-pdf, solo servidor)
  routes/                sitemap.xml
  utils/                 supabase, adminAuth, publicContent, email, leadNotify
shared/                  Tipos, i18n, constantes, helpers de listings y esquemas del CMS
supabase/migrations/     0001 init · 0002/0003 tipos de lead · 0004 listings
scripts/                 seeds, setup de storage, copia nube→local, imágenes del hero
.archive/                Código de la fase /alquiler, retirado al pasar a /propiedades
```

## Modelo de datos

- Cada tabla de contenido (`places`, `events`, `posts`, `gallery`, `listings`) guarda un
  documento JSON bilingüe en `data`, con `id` de tipo slug. El admin es un CRUD genérico que se
  arma desde `shared/utils/adminSchemas.ts`.
- `listings` es una unión discriminada por `kind` (`rent` | `sale` | `land`). `kind` también es
  una columna generada e indexada.
- `leads` tiene un discriminador `type`: `guide` (home), `propietario`, `alquiler` y `visita`.
- RLS está activo **sin políticas**: solo la service_role (en el servidor) lee o escribe.

## Decisiones

- **Nuxt, no Vite a secas.** SSR (listado prefiltrado), rutas `/es` y `/en` indexables, y
  endpoints para login, subida de imágenes, PDF y correo.
- **Un solo idioma por render.** La URL decide el idioma; no hay contenido duplicado oculto por CSS.
- **Lectura pública por endpoint** (`/api/public/[table]`), memoizada 60 s igual que la caché
  del edge. Las escrituras del admin invalidan la caché de esa tabla.
- **`/alquiler` → `/propiedades`** con 301 (`legacy-alquiler`), conservando el id de la ficha.
- **El PDF sigue con `@react-pdf/renderer`** escrito con `createElement`. Nunca llega al navegador.

## Seguridad y anti-spam

- Login del admin: comparación en tiempo constante y bloqueo de 15 min tras 5 intentos fallidos
  por IP. El contador vive en memoria, así que en Vercel aplica por instancia.
- Formularios públicos: honeypot (`LeadTrap`) y tiempo mínimo de llenado (2 s). Si el servidor
  detecta un bot, responde éxito sin guardar nada. Además valida longitudes y el formato del email.
- Todo texto de un visitante que va a un correo se escapa (`escapeHtml`).

## Pendientes conocidos

- Rating de alquileres manual en vez de derivado de las reseñas.
- Fallback de idioma cuando un campo bilingüe está vacío en uno de los dos idiomas.
- La ficha PDF solo existe para alquileres.
