<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
import type { Lead } from '#shared/types/content'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard · MIKA Homes' })

const { data } = await useFetch<{ counts: Record<string, number>; recentLeads: Lead[] }>('/api/admin/stats')

const counts = computed(() => data.value?.counts ?? {})
const recentLeads = computed(() => data.value?.recentLeads ?? [])

const STATS = [
  { key: 'leads', label: 'Leads' },
  { key: 'places', label: 'Lugares' },
  { key: 'events', label: 'Eventos' },
  { key: 'posts', label: 'Blog' },
  { key: 'listings', label: 'Propiedades' },
  { key: 'gallery', label: 'Galeria' },
]
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Vista general del sitio</p>
      </div>
    </div>

    <div class="help-box">
      <svg class="help-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
      <div class="help-box-content">
        <div class="help-box-title">Bienvenido al panel de administración</div>
        <div class="help-box-text">
          Desde aquí puedes gestionar todo el contenido del sitio. Usa el menú lateral para navegar entre secciones:
          <ul>
            <li><strong>Leads</strong> — Contactos capturados desde el formulario del sitio. Se generan automáticamente.</li>
            <li><strong>Lugares</strong> — Atractivos turísticos que aparecen en la página de inicio.</li>
            <li><strong>Eventos</strong> — Ferias, festivales y actividades con fecha.</li>
            <li><strong>Blog</strong> — Artículos y guías para visitantes.</li>
            <li><strong>Alquiler</strong> — Alquileres mensuales para vivir en Boquete (casas, habitaciones, apartamentos).</li>
            <li><strong>Galería</strong> — Fotos que aparecen en la galería del inicio.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="stat-grid">
      <div v-for="s in STATS" :key="s.key" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ counts[s.key] ?? 0 }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Ultimos leads</h2>
        <NuxtLink to="/admin/leads" class="btn btn-secondary btn-sm">Ver todos</NuxtLink>
      </div>
      <div v-if="recentLeads.length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>No hay leads aun</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Pais</th>
            <th>Interes</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in recentLeads" :key="l.id">
            <td style="font-weight:600;color:#1a1918">{{ l.nombre }}</td>
            <td>{{ l.email }}</td>
            <td><span v-if="l.pais">{{ l.pais }}</span><span v-else style="color:#b5b5b0">--</span></td>
            <td>
              <span v-if="l.interes" class="badge badge-blue">{{ l.interes }}</span>
              <span v-else style="color:#b5b5b0">--</span>
            </td>
            <td style="font-size:12px;color:#8c8c87;white-space:nowrap">{{ formatDate(l.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
