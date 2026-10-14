// https://nuxt.com/docs/api/configuration/nuxt-config

// Uploaded content lives in Supabase Storage. @nuxt/image only optimizes hosts
// it knows about — anything else is passed through untouched, which means the
// full-size originals would be served regardless of width/height/quality.
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : ''

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: ['@nuxt/image'],

  css: ['~/assets/css/global.css', '~/assets/css/stays.css', 'lenis/dist/lenis.css'],

  // picsum.photos 302s to fastly.picsum.photos, so both hosts are allowed —
  // the seed data points at picsum and real content lives in Supabase storage.
  image: {
    domains: ['picsum.photos', 'fastly.picsum.photos', ...(supabaseHost ? [supabaseHost] : [])],
    // Provider stays 'auto': IPX locally, /_vercel/image on Vercel. Vercel only
    // renders the widths listed here and rounds any other request UP to the
    // next one, so every width (and its x2) that a <NuxtImg> or useImage()
    // asks for is listed — otherwise a 340px card would be served at 640px.
    screens: {
      'xs': 320,
      'card': 340,
      'thumb': 420,
      'thumb-lg': 480,
      'tile': 560,
      'tile-lg': 600,
      'sm': 640,
      'card-2x': 680,
      'md': 768,
      'article': 800,
      'thumb-2x': 840,
      'hero': 900,
      'thumb-lg-2x': 960,
      'article-lg': 980,
      'lg': 1024,
      'tile-2x': 1120,
      'tile-lg-2x': 1200,
      'xl': 1280,
      '2xl': 1536,
      'article-2x': 1600,
      'hero-2x': 1800,
      'article-lg-2x': 1960,
    },
  },

  // Same .env keys as the v1 Astro app so both projects can point at the same
  // Supabase project without duplicating credentials.
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    // No fallbacks: a deploy missing these must lock the admin, not open it
    // with a password that's sitting in the source (see server/utils/adminAuth.ts).
    adminSecret: process.env.ADMIN_SECRET || '',
    adminPass: process.env.ADMIN_PASS || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || 'MIKA Homes <onboarding@resend.dev>',
    emailReplyTo: process.env.EMAIL_REPLY_TO || '',
    // Where new-lead alerts go; falls back to EMAIL_REPLY_TO.
    leadsNotifyTo: process.env.LEADS_NOTIFY_TO || '',
    public: {
      siteUrl: process.env.SITE_URL || 'https://www.mikahomes.com',
      // Optional: switches the Leaflet base map to Google Map Tiles (see app/utils/addBaseLayer.ts).
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    },
  },

  // Mirrors the v1 middleware's cache policy: public pages get a wide
  // stale-while-revalidate window at the edge so navigations don't block on a
  // Supabase round-trip, while admin and API responses stay uncached so edits
  // show up immediately.
  routeRules: {
    '/**': {
      headers: { 'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=1800' },
    },
    '/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/api/**': { headers: { 'cache-control': 'no-store' } },
  },

  nitro: {
    // @react-pdf/renderer is CommonJS-flavoured and only ever runs inside the
    // brochure endpoint — bundling it keeps the serverless runtime from trying
    // to resolve it (and React) as external ESM.
    externals: { inline: ['@react-pdf/renderer'] },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/webp', href: '/favicon.webp' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Non-blocking font load: media="print" + onload swap lets first paint
        // proceed on fallback fonts, display=swap avoids invisible text after.
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Spectral:ital,wght@1,400;1,500&display=swap',
          media: 'print',
          onload: "this.media='all'",
        },
      ],
    },
  },

  // Nuxt 4 drops a useFetch result from the payload as soon as the page that
  // asked for it unmounts, so /es → /blog → /es re-requested every table on the
  // way back. The content changes rarely and is already served from a 60s
  // cache, so it's kept for the session and revisited pages render at once.
  experimental: { purgeCachedData: false },

  typescript: { strict: true },
})
