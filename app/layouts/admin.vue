<script setup lang="ts">
// The admin panel is its own visual world — a dark sidebar shell on a neutral
// grey canvas, nothing to do with the public site's sand/forest palette. Every
// rule below is nested under .admin-shell / body.admin-body so the two design
// systems can share one document without colliding on .card, .btn or .badge.
const route = useRoute()

const nav = [
  { key: 'dashboard', href: '/admin', label: 'Dashboard', svg: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' },
  { key: 'leads', href: '/admin/leads', label: 'Leads', svg: '<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>' },
  { key: 'places', href: '/admin/places', label: 'Lugares', svg: '<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>' },
  { key: 'events', href: '/admin/events', label: 'Eventos', svg: '<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>' },
  { key: 'posts', href: '/admin/posts', label: 'Blog', svg: '<path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>' },
  { key: 'listings', href: '/admin/listings', label: 'Propiedades', svg: '<path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>' },
  { key: 'gallery', href: '/admin/gallery', label: 'Galeria', svg: '<path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>' },
]

const active = computed(() => {
  if (route.path === '/admin') return 'dashboard'
  return route.path.replace('/admin/', '').split('/')[0] ?? ''
})

useHead({
  htmlAttrs: { lang: 'es' },
  bodyAttrs: { class: 'admin-body' },
  link: [{
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap',
  }],
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  window.location.href = '/admin/login'
}
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar admin-sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">B</div>
        <div>
          <div class="sidebar-brand-text">Boquete</div>
          <div class="sidebar-brand-sub">Panel admin</div>
        </div>
      </div>
      <div class="sidebar-label">Navegacion</div>
      <nav>
        <NuxtLink
          v-for="item in nav"
          :key="item.key"
          :to="item.href"
          :class="active === item.key ? 'active' : ''"
        >
          <svg viewBox="0 0 24 24" v-html="item.svg" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div class="sidebar-footer">
        <button @click="logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesion
        </button>
        <a href="/" class="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al sitio
        </a>
      </div>
    </aside>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style>
body.admin-body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #f7f8fa;
  color: #251D14;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body.admin-body .admin-shell { display: flex; min-height: 100vh; }
.admin-shell *, .admin-shell *::before, .admin-shell *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* ─── Sidebar ─── */
.admin-shell .sidebar {
  width: 260px;
  background: #111110;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 50;
}
.admin-shell .sidebar-brand {
  padding: 22px 22px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.admin-shell .sidebar-brand-icon {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #C8964A 0%, #8E4A2A 100%);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 15px; color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(200,150,74,.25);
}
.admin-shell .sidebar-brand-text {
  font-weight: 700; font-size: 15px; color: #fafaf9;
  letter-spacing: -.02em;
}
.admin-shell .sidebar-brand-sub {
  font-size: 11px; color: #64645f; font-weight: 500; margin-top: 1px;
}
.admin-shell .sidebar-label {
  padding: 24px 22px 8px;
  font-size: 10.5px; font-weight: 600; color: #4a4a45;
  text-transform: uppercase; letter-spacing: .08em;
}
.admin-shell .sidebar nav {
  flex: 1;
  padding: 4px 10px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.admin-shell .sidebar a {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px;
  border-radius: 9px;
  text-decoration: none;
  color: #8c8c87;
  font-size: 13.5px; font-weight: 500;
  transition: all .12s ease;
}
.admin-shell .sidebar a svg {
  width: 18px; height: 18px; flex-shrink: 0;
  stroke: currentColor; fill: none;
  stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
}
.admin-shell .sidebar a:hover {
  background: rgba(255,255,255,.06);
  color: #d4d4cf;
}
.admin-shell .sidebar a.active {
  background: rgba(200,150,74,.1);
  color: #C8964A;
  font-weight: 600;
}
.admin-shell .sidebar-footer {
  padding: 14px 10px 18px;
  border-top: 1px solid rgba(255,255,255,.06);
  display: flex; flex-direction: column; gap: 6px;
}
.admin-shell .sidebar-footer button {
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(255,255,255,.08);
  background: transparent;
  color: #6e6e69; border-radius: 9px;
  font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit;
  transition: all .12s;
  display: flex; align-items: center; justify-content: center; gap: 7px;
}
.admin-shell .sidebar-footer button:hover {
  background: rgba(255,255,255,.05);
  color: #b5b5b0;
  border-color: rgba(255,255,255,.12);
}
.admin-shell .sidebar-footer .back-link {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 12px; color: #4a4a45;
  text-decoration: none; padding: 4px;
  transition: color .12s;
}
.admin-shell .sidebar-footer .back-link:hover { color: #8c8c87; }

/* ─── Main content ─── */
.admin-shell .main {
  margin-left: 260px;
  flex: 1;
  min-width: 0;
  padding: 36px 44px;
  min-height: 100vh;
}
.admin-shell .page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 32px;
}
.admin-shell .page-title {
  font-size: 24px; font-weight: 700;
  color: #1a1918; letter-spacing: -.03em;
}
.admin-shell .page-subtitle {
  font-size: 14px; color: #8c8c87; font-weight: 400;
  margin-top: 2px;
}

/* ─── Cards ─── */
.admin-shell .card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ebebea;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.03), 0 1px 2px rgba(0,0,0,.02);
}
.admin-shell .card-header {
  padding: 18px 24px;
  border-bottom: 1px solid #f3f3f2;
  display: flex; align-items: center; justify-content: space-between;
}
.admin-shell .card-header h2 {
  font-size: 15px; font-weight: 600; color: #1a1918;
  letter-spacing: -.01em;
}

/* ─── Tables ─── */
.admin-shell table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.admin-shell th {
  text-align: left;
  padding: 12px 14px;
  font-weight: 600; color: #8c8c87;
  font-size: 11px; text-transform: uppercase;
  letter-spacing: .06em;
  background: #fafaf9;
  border-bottom: 1px solid #ebebea;
  white-space: nowrap;
}
.admin-shell td {
  padding: 12px 14px;
  border-bottom: 1px solid #f5f5f4;
  color: #3d3d39;
  vertical-align: middle;
}
.admin-shell tr:last-child td { border-bottom: none; }
.admin-shell tbody tr { transition: background .1s ease; }
.admin-shell tbody tr:hover td { background: #fafbfc; }

/* ─── Buttons ─── */
.admin-shell .btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 9px;
  font-size: 13px; font-weight: 600; font-family: inherit;
  cursor: pointer; border: 1px solid transparent;
  transition: all .12s ease;
  text-decoration: none;
  line-height: normal;
  white-space: nowrap;
}
.admin-shell .btn-primary {
  background: #1a1918; color: #fafaf9;
  border-color: #1a1918;
  box-shadow: 0 1px 2px rgba(0,0,0,.08);
}
.admin-shell .btn-primary:hover { background: #2c2c28; border-color: #2c2c28; transform: none; }
.admin-shell .btn-secondary {
  background: #fff; color: #3d3d39;
  border-color: #dddcdb;
}
.admin-shell .btn-secondary:hover { background: #fafaf9; border-color: #c5c5c3; box-shadow: none; transform: none; }
.admin-shell .btn-danger {
  background: #fff; color: #dc2626;
  border-color: #fecaca;
}
.admin-shell .btn-danger:hover { background: #fef2f2; border-color: #fca5a5; }
.admin-shell .btn-edit {
  background: #f0f0ff; color: #4338ca;
  border-color: #e0e0ff;
}
.admin-shell .btn-edit:hover { background: #e8e8ff; border-color: #c7c7ff; }
.admin-shell .btn-sm { padding: 5px 12px; font-size: 12px; border-radius: 7px; }
.admin-shell .btn:disabled { opacity: .55; cursor: not-allowed; }

/* ─── Stat cards ─── */
.admin-shell .stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.admin-shell .stat-card {
  background: #fff;
  border: 1px solid #ebebea;
  border-radius: 14px;
  padding: 22px 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.03);
  transition: all .15s ease;
}
.admin-shell .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,.06);
  transform: translateY(-1px);
}
.admin-shell .stat-card::before {
  content: '';
  position: absolute; top: 0; left: 0; bottom: 0;
  width: 3px;
}
.admin-shell .stat-card:nth-child(1)::before { background: #C8964A; }
.admin-shell .stat-card:nth-child(2)::before { background: #2C3A2A; }
.admin-shell .stat-card:nth-child(3)::before { background: #8E4A2A; }
.admin-shell .stat-card:nth-child(4)::before { background: #6366f1; }
.admin-shell .stat-card:nth-child(5)::before { background: #0891b2; }
.admin-shell .stat-card:nth-child(6)::before { background: #8b5cf6; }
.admin-shell .stat-label {
  font-size: 12px; font-weight: 500;
  color: #8c8c87; letter-spacing: .02em;
}
.admin-shell .stat-value {
  font-size: 32px; font-weight: 800;
  color: #1a1918; margin-top: 8px;
  letter-spacing: -.03em; line-height: 1;
}

/* ─── Badges ─── */
.admin-shell .badge {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 6px;
  font-size: 11.5px; font-weight: 600;
  letter-spacing: .01em;
  gap: 0;
  line-height: normal;
}
.admin-shell .badge-green { background: #ecfdf5; color: #059669; }
.admin-shell .badge-blue { background: #eff6ff; color: #2563eb; }
.admin-shell .badge-amber { background: #fffbeb; color: #d97706; }

/* ─── Tabs (filter toggle, e.g. leads by type) ─── */
.admin-shell .tabs {
  display: flex; gap: 6px;
  margin-bottom: 18px;
}
.admin-shell .tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 14px; border-radius: 9px;
  border: 1px solid #ebebea;
  background: #fff; color: #6e6e69;
  font-size: 13px; font-weight: 600; font-family: inherit;
  cursor: pointer;
  transition: all .12s ease;
}
.admin-shell .tab:hover { background: #fafaf9; color: #3d3d39; }
.admin-shell .tab.is-active {
  background: #1a1918; color: #fafaf9; border-color: #1a1918;
}
.admin-shell .tab-count {
  font-size: 11px; font-weight: 700;
  padding: 1px 6px; border-radius: 999px;
  background: rgba(0,0,0,.06); color: inherit;
}
.admin-shell .tab.is-active .tab-count { background: rgba(255,255,255,.18); }

.admin-shell .empty {
  text-align: center;
  padding: 56px 24px; color: #a8a8a3;
  font-size: 14px; font-weight: 500;
}
.admin-shell .empty svg {
  width: 40px; height: 40px;
  stroke: #d4d4cf; margin-bottom: 12px;
}

/* ─── Help box ─── */
.admin-shell .help-box {
  background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;
  padding: 18px 22px; margin-bottom: 24px; display: flex; gap: 14px; align-items: flex-start;
}
.admin-shell .help-box-icon {
  width: 22px; height: 22px; flex: none; margin-top: 1px;
  color: #d97706;
}
.admin-shell .help-box-content { flex: 1; }
.admin-shell .help-box-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 6px; }
.admin-shell .help-box-text { font-size: 13px; line-height: 1.6; color: #78350f; }
.admin-shell .help-box-text ul { margin: 6px 0 0; padding-left: 18px; }
.admin-shell .help-box-text li { margin-bottom: 3px; }
.admin-shell .help-box-text code { background: rgba(0,0,0,.06); padding: 1px 5px; border-radius: 4px; font-size: 12px; font-family: monospace; }
.admin-shell .help-toggle { font-size: 12px; font-weight: 600; color: #d97706; cursor: pointer; background: none; border: none; padding: 0; margin-top: 8px; font-family: inherit; }
.admin-shell .help-toggle:hover { text-decoration: underline; }

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .admin-shell .sidebar { width: 64px; }
  .admin-shell .sidebar-brand-text,
  .admin-shell .sidebar-brand-sub,
  .admin-shell .sidebar-label { display: none; }
  .admin-shell .sidebar a span { display: none; }
  .admin-shell .main { margin-left: 64px; padding: 20px 16px; }
}
</style>
