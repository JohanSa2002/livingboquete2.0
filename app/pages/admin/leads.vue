<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
import type { Lead } from '#shared/types/content'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Leads · MIKA Homes' })

const { data: leads, refresh } = await useFetch<Lead[]>('/api/leads', { default: () => [] })
const { data: listingRows } = await useFetch<any[]>('/api/content/listings', { default: () => [] })

// The brochure PDF is laid out for rentals, so only rental listings are offered.
const rentals = computed(() => (listingRows.value ?? []).filter(r => r.kind === 'rent').map(r => ({ id: r.id, name: r.name?.es || r.id })))

function kindOf(l: Lead) {
  return l.type === 'propietario' ? 'propietario' : l.type === 'alquiler' ? 'alquiler' : l.type === 'visita' ? 'visita' : 'guide'
}

const ownerLeads = computed(() => leads.value.filter(l => kindOf(l) === 'propietario'))
const rentalLeads = computed(() => leads.value.filter(l => kindOf(l) === 'alquiler'))
const guideLeads = computed(() => leads.value.filter(l => kindOf(l) === 'guide'))
const visitLeads = computed(() => leads.value.filter(l => kindOf(l) === 'visita'))
// Rental requests and visit requests share columns: listing, date, contact.
const aboutListing = (l: Lead) => kindOf(l) === 'alquiler' || kindOf(l) === 'visita'

const filter = ref<'all' | 'guide' | 'alquiler' | 'visita' | 'propietario'>('all')
const visibleLeads = computed(() =>
  filter.value === 'all' ? leads.value : leads.value.filter(l => kindOf(l) === filter.value),
)

const timelineLabels: Record<string, string> = {
  '0-6': '0-6 meses',
  '6-12': '6-12 meses',
  '1ano': '1 año',
  '2anos': '2+ años',
}

async function removeLead(id: number) {
  if (!confirm('¿Eliminar este lead?')) return
  await $fetch('/api/leads', { method: 'DELETE', body: { id } })
  await refresh()
}

// --- Send property brochure as PDF ----------------------------------------
const pdfOpen = ref(false)
const pdfLead = ref<Lead | null>(null)
const pdfRentalId = ref('')
const pdfNote = ref('')
const pdfStatus = ref('')
const pdfStatusColor = ref('#C8964A')
const pdfSending = ref(false)

function openPdf(l: Lead) {
  pdfLead.value = l
  pdfStatus.value = ''
  pdfNote.value = ''
  // Pre-select the property this lead actually asked about, when known.
  pdfRentalId.value = l.rental_id && rentals.value.some(r => r.id === l.rental_id) ? l.rental_id : ''
  pdfOpen.value = true
}

function closePdf() {
  pdfOpen.value = false
  pdfRentalId.value = ''
  pdfNote.value = ''
  pdfStatus.value = ''
}

async function sendPdf() {
  if (!pdfLead.value) return
  if (!pdfRentalId.value) {
    pdfStatusColor.value = '#dc2626'
    pdfStatus.value = 'Selecciona una propiedad'
    return
  }
  pdfSending.value = true
  pdfStatusColor.value = '#C8964A'
  pdfStatus.value = 'Generando y enviando...'
  try {
    await $fetch('/api/send-brochure', {
      method: 'POST',
      body: { leadId: pdfLead.value.id, rentalId: pdfRentalId.value, note: pdfNote.value },
    })
    pdfStatusColor.value = '#059669'
    pdfStatus.value = 'PDF enviado correctamente'
    setTimeout(closePdf, 1200)
  }
  catch (err: any) {
    pdfStatusColor.value = '#dc2626'
    pdfStatus.value = err?.data?.error ?? err?.message ?? 'Error al enviar'
  }
  finally {
    pdfSending.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Leads</h1>
        <p class="page-subtitle">
          {{ leads.length }} contactos registrados · {{ rentalLeads.length }} solicitudes de alquiler · {{ visitLeads.length }} visitas · {{ ownerLeads.length }} propietarios
        </p>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Total</div>
        <div class="stat-value">{{ leads.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Guía gratuita</div>
        <div class="stat-value">{{ guideLeads.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Solicitudes de alquiler</div>
        <div class="stat-value">{{ rentalLeads.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Visitas (venta / terreno)</div>
        <div class="stat-value">{{ visitLeads.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Propietarios</div>
        <div class="stat-value">{{ ownerLeads.length }}</div>
      </div>
    </div>

    <div class="tabs">
      <button type="button" class="tab" :class="{ 'is-active': filter === 'all' }" @click="filter = 'all'">
        Todos <span class="tab-count">{{ leads.length }}</span>
      </button>
      <button type="button" class="tab" :class="{ 'is-active': filter === 'guide' }" @click="filter = 'guide'">
        Guía <span class="tab-count">{{ guideLeads.length }}</span>
      </button>
      <button type="button" class="tab" :class="{ 'is-active': filter === 'alquiler' }" @click="filter = 'alquiler'">
        Alquiler <span class="tab-count">{{ rentalLeads.length }}</span>
      </button>
      <button type="button" class="tab" :class="{ 'is-active': filter === 'visita' }" @click="filter = 'visita'">
        Visitas <span class="tab-count">{{ visitLeads.length }}</span>
      </button>
      <button type="button" class="tab" :class="{ 'is-active': filter === 'propietario' }" @click="filter = 'propietario'">
        Propietarios <span class="tab-count">{{ ownerLeads.length }}</span>
      </button>
    </div>

    <div class="help-box">
      <svg class="help-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
      <div class="help-box-content">
        <div class="help-box-title">¿Cómo funcionan los leads?</div>
        <div class="help-box-text">
          Hay tres fuentes: el formulario <strong>"Recibe la guía gratis"</strong> en la página de inicio, la <strong>solicitud de información</strong> en la ficha de cada propiedad (3 pasos, sin cuenta), y el formulario <strong>"Publica tu propiedad"</strong> para propietarios. No necesitas crear leads manualmente.
          <ul>
            <li><strong>Tipo</strong> — <code>Guía</code> (interés general/retiro), <code>Alquiler</code> (solicitud sobre un alquiler), <code>Visita</code> (quiere visitar una casa en venta o un terreno; la fecha es la que prefiere para la visita) o <code>Propietario</code> (quiere publicar una propiedad).</li>
            <li><strong>Retiro / Mudanza</strong> — Guía: si planean retirarse. Alquiler: fecha de mudanza deseada.</li>
            <li><strong>Timeline / Duración</strong> — Guía: horizonte de tiempo. Alquiler: duración mínima buscada.</li>
            <li><strong>Interés / Propiedad</strong> — Guía: motivación principal. Alquiler: la propiedad consultada. Propietario: tipo de propiedad a publicar.</li>
            <li><strong>Pais / Detalles</strong> — Guía: país. Alquiler: personas y si viajan con mascota. Propietario: ubicación de la propiedad.</li>
          </ul>
          Puedes eliminar leads que no sean relevantes. Esta acción es permanente.
        </div>
      </div>
    </div>

    <div class="card">
      <div v-if="leads.length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>No hay leads aun. Llegaran desde el formulario del sitio.</p>
      </div>
      <div v-else style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Pais / Detalles</th>
              <th>Retiro / Mudanza</th>
              <th>Timeline / Duración</th>
              <th>Interes / Propiedad</th>
              <th>Mensaje</th>
              <th>Fecha</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in visibleLeads" :key="l.id">
              <td style="color:#b5b5b0;font-size:12px;font-variant-numeric:tabular-nums">{{ l.id }}</td>
              <td>
                <span v-if="kindOf(l) === 'propietario'" class="badge badge-amber">Propietario</span>
                <span v-else-if="kindOf(l) === 'alquiler'" class="badge badge-blue">Alquiler</span>
                <span v-else-if="kindOf(l) === 'visita'" class="badge badge-blue">Visita</span>
                <span v-else class="badge badge-green">Guía</span>
              </td>
              <td style="font-weight:600;color:#1a1918">{{ l.nombre }}</td>
              <td><span v-if="l.email">{{ l.email }}</span><span v-else style="color:#b5b5b0">--</span></td>
              <td><span v-if="l.celular">{{ l.celular }}</span><span v-else style="color:#b5b5b0">--</span></td>
              <td>
                <template v-if="aboutListing(l)">
                  {{ l.personas ? `${l.personas} personas` : '' }}{{ l.personas && l.mascotas != null ? ' · ' : '' }}{{ l.mascotas === true ? 'con mascota' : l.mascotas === false ? 'sin mascota' : '' }}
                </template>
                <template v-else>
                  <span v-if="l.pais || l.ubicacion">{{ l.pais || l.ubicacion }}</span>
                  <span v-else style="color:#b5b5b0">--</span>
                </template>
              </td>
              <td>
                <template v-if="aboutListing(l)">
                  <span v-if="l.move_in" class="badge badge-green">{{ l.move_in }}</span>
                  <span v-else style="color:#b5b5b0">--</span>
                </template>
                <template v-else>
                  <span v-if="l.retiro" class="badge badge-green">{{ l.retiro }}</span>
                  <span v-else style="color:#b5b5b0">--</span>
                </template>
              </td>
              <td>
                <template v-if="aboutListing(l)">
                  <span v-if="l.duracion" class="badge badge-amber">{{ l.duracion }}</span>
                  <span v-else style="color:#b5b5b0">--</span>
                </template>
                <template v-else>
                  <span v-if="l.timeline" class="badge badge-amber">{{ timelineLabels[l.timeline] ?? l.timeline }}</span>
                  <span v-else style="color:#b5b5b0">--</span>
                </template>
              </td>
              <td>
                <template v-if="aboutListing(l)">
                  <span v-if="l.rental_name" class="badge badge-blue">{{ l.rental_name }}</span>
                  <span v-else style="color:#b5b5b0">--</span>
                </template>
                <template v-else>
                  <span v-if="l.interes" class="badge badge-blue">{{ l.interes }}</span>
                  <span v-else-if="l.tipo_propiedad" class="badge badge-blue">{{ l.tipo_propiedad }}</span>
                  <span v-else style="color:#b5b5b0">--</span>
                </template>
              </td>
              <td style="max-width:220px;white-space:normal;color:#5b5650">
                <span v-if="l.mensaje">{{ l.mensaje }}</span><span v-else style="color:#b5b5b0">--</span>
              </td>
              <td style="font-size:12px;color:#8c8c87;white-space:nowrap">{{ formatDate(l.created_at) }}</td>
              <td style="white-space:nowrap">
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <!-- Disabled when the lead only left a WhatsApp number: there
                       is no address to send the brochure to. -->
                  <button
                    class="btn btn-edit btn-sm"
                    :disabled="!l.email"
                    :title="!l.email ? 'Este lead no dejó correo — contáctalo por celular' : undefined"
                    @click="openPdf(l)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 2 11 13" />
                      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                    </svg>
                    Enviar PDF
                  </button>
                  <button class="btn btn-danger btn-sm" @click="removeLead(l.id)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: enviar ficha de propiedad en PDF -->
    <div v-if="pdfOpen" class="modal-overlay" @click.self="closePdf">
      <div class="modal-container" style="max-width:520px">
        <div class="modal-header">
          <h2>Enviar ficha en PDF</h2>
          <button class="modal-close" aria-label="Cerrar" @click="closePdf">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size:13px;color:#6e6e69;margin:-6px 0 4px">
            Se enviará a <strong>{{ pdfLead?.nombre }}</strong> (<span>{{ pdfLead?.email }}</span>)
          </p>
          <div class="f-group">
            <label class="f-label">Propiedad</label>
            <select v-model="pdfRentalId" class="f-select">
              <option value="">Selecciona una propiedad</option>
              <option v-for="r in rentals" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
          <div class="f-group">
            <label class="f-label">Información adicional (opcional)</label>
            <textarea
              v-model="pdfNote"
              class="f-textarea"
              placeholder="Escribe aquí lo que el lead pidió (financiamiento, disponibilidad, etc.)"
            />
          </div>
          <p :style="`font-size:12.5px;color:${pdfStatusColor};min-height:16px;margin:0`">{{ pdfStatus }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closePdf">Cancelar</button>
          <button class="btn btn-primary" :disabled="pdfSending" @click="sendPdf">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { display: flex; position: fixed; inset: 0; background: rgba(0,0,0,.4); backdrop-filter: blur(4px); z-index: 100; align-items: center; justify-content: center; padding: 20px; }
.modal-container { background: #fff; border-radius: 18px; width: 100%; max-width: 720px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: 0 24px 68px rgba(0,0,0,.15); animation: modal-in .2s ease; }
@keyframes modal-in { from { opacity: 0; transform: scale(.97) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-header { padding: 22px 26px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f3f3f2; }
.modal-header h2 { font-size: 17px; font-weight: 700; color: #1a1918; margin: 0; }
.modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: #8c8c87; cursor: pointer; border-radius: 8px; }
.modal-close:hover { background: #f5f5f4; color: #3d3d39; }
.modal-body { padding: 24px 26px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { padding: 16px 26px 22px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #f3f3f2; }

.f-group { display: flex; flex-direction: column; gap: 6px; }
.f-label { font-size: 12px; font-weight: 600; color: #6e6e69; text-transform: uppercase; letter-spacing: .05em; }
.f-textarea, .f-select {
  width: 100%; padding: 10px 14px; border: 1px solid #dddcdb; border-radius: 10px;
  font-size: 14px; font-family: inherit; color: #1a1918; background: #fafaf9; outline: none; transition: all .15s;
}
.f-textarea:focus, .f-select:focus { border-color: #C8964A; background: #fff; box-shadow: 0 0 0 3px rgba(200,150,74,.1); }
.f-textarea { min-height: 90px; resize: vertical; line-height: 1.5; }
.f-select { cursor: pointer; }
</style>
