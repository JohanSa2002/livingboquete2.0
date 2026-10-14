<script setup lang="ts">
import { HELP_TEXTS, SCHEMAS, SECTIONS, getPath, placeholderFor, setPath } from '#shared/utils/adminSchemas'
import type { FieldDef } from '#shared/utils/adminSchemas'
import type { ListingKind } from '#shared/types/content'
import { LISTING_KINDS, formatListingPrice, inBoquete, kindMeta } from '#shared/utils/listings'
import { BOQUETE_ZONES } from '#shared/utils/constants'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const section = computed(() => String(route.params.section))
const cfg = computed(() => SECTIONS[section.value])

if (!cfg.value) {
  await navigateTo('/admin')
}

const schema = computed<FieldDef[]>(() => SCHEMAS[section.value] ?? [])
const byKind = computed(() => !!cfg.value?.byKind)
const help = computed(() => HELP_TEXTS[section.value])

useHead(() => ({ title: `${cfg.value?.title ?? 'Admin'} · MIKA Homes` }))

const { data: items, refresh } = await useFetch<any[]>(() => `/api/content/${section.value}`, {
  default: () => [],
})

// --- Kind tabs (listings) ---------------------------------------------------
const kindTab = ref<ListingKind | 'all'>('all')
const kindCounts = computed(() => {
  const c: Record<string, number> = { all: items.value.length }
  for (const it of items.value) c[it.kind] = (c[it.kind] ?? 0) + 1
  return c
})
const shownItems = computed(() =>
  byKind.value && kindTab.value !== 'all' ? items.value.filter(it => it.kind === kindTab.value) : items.value,
)
const zoneName = (id: string) => BOQUETE_ZONES.find(z => z.id === id)?.name ?? id

// --- Modal / form ----------------------------------------------------------
const modalOpen = ref(false)
// Listings are created in two steps: pick the kind, then fill only its fields.
const pickingKind = ref(false)
const editing = ref(false)
const missing = ref<Set<string>>(new Set())

// Fields for the current row: everything, or (listings) only those that apply
// to its kind. A key can be declared once per kind, so at most one survives.
const visibleSchema = computed<FieldDef[]>(() => {
  if (!byKind.value) return schema.value
  const kind = form.value.kind as ListingKind | undefined
  return schema.value.filter(f => !f.kinds || (kind && f.kinds.includes(kind)))
})
const modalTitle = ref('')
const form = ref<Record<string, any>>({})
const saving = ref(false)
const uploadStatus = ref<Record<string, string>>({})

// The form is a plain object mirrored through get/setPath so dotted keys like
// `host.name` stay flat in the schema but nested in the payload.
function field(key: string) {
  return computed({
    get: () => getPath(form.value, key) ?? '',
    set: (v: unknown) => setPath(form.value, key, v),
  })
}

function bilingual(key: string, lang: 'es' | 'en') {
  return computed({
    get: () => getPath(form.value, `${key}.${lang}`) ?? '',
    set: (v: unknown) => setPath(form.value, `${key}.${lang}`, v),
  })
}

function bilingualList(key: string, lang: 'es' | 'en') {
  return computed({
    get: () => {
      const v = getPath(form.value, `${key}.${lang}`)
      return Array.isArray(v) ? v.join('\n') : ''
    },
    set: (v: string) => setPath(form.value, `${key}.${lang}`, v.split('\n').filter(l => l.trim())),
  })
}

function amenText() {
  return computed({
    get: () => {
      const v = form.value.amen
      return Array.isArray(v) ? v.join(', ') : (v ?? '')
    },
    set: (v: string) => { form.value.amen = v.split(',').map(s => s.trim()).filter(Boolean) },
  })
}

function boolSelect(key: string) {
  return computed({
    get: () => String(getPath(form.value, key) ?? 'false'),
    set: (v: string) => setPath(form.value, key, v === 'true'),
  })
}

function locationField(key: 'lat' | 'lng') {
  return computed<number | ''>({
    get: () => {
      const v = form.value[key]
      return typeof v === 'number' ? v : ''
    },
    set: (v) => { form.value[key] = v === '' ? undefined : v },
  })
}

function numberField(key: string) {
  return computed({
    get: () => {
      const v = getPath(form.value, key)
      return v === undefined || v === null || v === '' ? '' : v
    },
    set: (v: string) => setPath(form.value, key, v === '' ? 0 : Number(v)),
  })
}

// Sensible starting values per kind, so a new listing is valid-shaped from the
// first save even if optional fields are left untouched.
const KIND_DEFAULTS: Record<ListingKind, Record<string, unknown>> = {
  rent: { type: 'casa', minMonths: 1, availableFrom: '', rating: 0, reviews: 0, reviewsList: [] },
  sale: { type: 'casa', title: 'titulo' },
  land: { title: 'titulo', topography: 'plano', water: true, power: true, road: 'asfalto' },
}

function openAdd() {
  modalTitle.value = 'Agregar nuevo'
  form.value = {}
  uploadStatus.value = {}
  missing.value = new Set()
  editing.value = false
  pickingKind.value = byKind.value
  modalOpen.value = true
}

function pickKind(kind: ListingKind) {
  form.value = {
    kind,
    amen: [],
    sqmLot: 0,
    verified: false,
    featured: false,
    approxLocation: false,
    contact: { name: 'Equipo MIKA Homes', line: { es: 'Asesoría local en Boquete', en: 'Local advisors in Boquete' }, phone: '+507 6812-4471' },
    ...KIND_DEFAULTS[kind],
  }
  modalTitle.value = `Nueva propiedad · ${kindMeta(kind).label.es}`
  pickingKind.value = false
}

function openEdit(item: any) {
  const clone = JSON.parse(JSON.stringify(item))
  delete clone._created
  delete clone._updated
  modalTitle.value = `Editar: ${clone.id}`
  form.value = clone
  uploadStatus.value = {}
  missing.value = new Set()
  editing.value = true
  pickingKind.value = false
  modalOpen.value = true
}

function isEmpty(f: FieldDef) {
  if (f.type === 'location') return typeof form.value.lat !== 'number' || typeof form.value.lng !== 'number'
  const v = getPath(form.value, f.type.startsWith('bilingual') ? `${f.key}.es` : f.key)
  if (f.type === 'number') return v === undefined || v === null || v === '' || Number(v) <= 0
  return v === undefined || v === null || String(v).trim() === ''
}

async function save() {
  // Listings validate every required field at once (below), so the admin sees
  // the full list instead of fixing one alert at a time.
  if (!form.value.id && !byKind.value) {
    alert('El campo ID es obligatorio')
    return
  }
  if (byKind.value) {
    const empty = visibleSchema.value.filter(f => f.required && isEmpty(f))
    missing.value = new Set(empty.map(f => f.key))
    if (empty.length) {
      alert(`Faltan campos obligatorios:\n• ${empty.map(f => f.label).join('\n• ')}`)
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(form.value.id))) {
      missing.value = new Set(['id'])
      alert('El ID solo puede tener minúsculas, números y guiones (ej: venta-casa-jaramillo).')
      return
    }
    if (!inBoquete(form.value.lat, form.value.lng)
      && !confirm('El punto del mapa está fuera de Boquete. ¿Guardar de todos modos?')) return
  }
  saving.value = true
  try {
    await $fetch(`/api/content/${section.value}`, { method: 'POST', body: form.value })
    modalOpen.value = false
    await refresh()
  }
  catch {
    alert('Error al guardar')
  }
  finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('¿Eliminar este elemento?')) return
  try {
    await $fetch(`/api/content/${section.value}`, { method: 'DELETE', body: { id } })
    await refresh()
  }
  catch {
    alert('Error al eliminar')
  }
}

// --- Image upload ----------------------------------------------------------
// The browser converts to WebP before uploading, so the admin never has to
// care about formats and /api/upload only ever accepts one type.
async function convertToWebp(file: File, quality = 0.85): Promise<File> {
  if (file.type === 'image/webp') return file
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('No se pudo convertir la imagen'))), 'image/webp', quality)
  })
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' })
}

async function uploadImage(file: File, key: string) {
  if (!file.type.startsWith('image/')) {
    uploadStatus.value[key] = 'Solo se permiten imágenes'
    return
  }
  uploadStatus.value[key] = 'Convirtiendo a WebP...'
  let webpFile: File
  try {
    webpFile = await convertToWebp(file)
  }
  catch {
    uploadStatus.value[key] = 'No se pudo convertir la imagen'
    return
  }

  uploadStatus.value[key] = 'Subiendo...'
  try {
    const fd = new FormData()
    fd.append('file', webpFile)
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    setPath(form.value, key, res.url)
    uploadStatus.value[key] = 'Imagen subida'
  }
  catch (err: any) {
    uploadStatus.value[key] = err?.data?.error ?? err?.message ?? 'Error al subir'
  }
}

function onFileChange(e: Event, key: string) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadImage(file, key)
}

const dragKey = ref<string | null>(null)

function onDrop(e: DragEvent, key: string) {
  dragKey.value = null
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadImage(file, key)
}

// --- Contextual help box ---------------------------------------------------
const helpHidden = ref(false)

onMounted(() => {
  helpHidden.value = localStorage.getItem('admin-help-hidden') === 'true'
})

function toggleHelp() {
  helpHidden.value = !helpHidden.value
  localStorage.setItem('admin-help-hidden', String(helpHidden.value))
}

function displayName(item: any) {
  const v = item[cfg.value!.nameField]
  return typeof v === 'object' && v !== null ? v : null
}
</script>

<template>
  <div v-if="cfg">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ cfg.title }}</h1>
        <p class="page-subtitle">{{ items.length }} elementos</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Agregar
      </button>
    </div>

    <div v-if="help" class="help-box">
      <svg class="help-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
      <div class="help-box-content">
        <div class="help-box-title">{{ help.title }}</div>
        <div v-show="!helpHidden" class="help-box-text">
          <ul>
            <li v-for="(line, i) in help.lines" :key="i" v-html="line" />
          </ul>
        </div>
        <button class="help-toggle" @click="toggleHelp">
          {{ helpHidden ? 'Mostrar instrucciones' : 'Ocultar instrucciones' }}
        </button>
      </div>
    </div>

    <div v-if="byKind" class="kind-tabs" role="tablist">
      <button
        v-for="k in [{ value: 'all', label: { es: 'Todas' }, color: '#3d3d39' }, ...LISTING_KINDS]"
        :key="k.value"
        type="button"
        role="tab"
        class="kind-tab"
        :class="{ 'is-active': kindTab === k.value }"
        :aria-selected="kindTab === k.value"
        :style="`--kc:${k.color}`"
        @click="kindTab = k.value as ListingKind | 'all'"
      >
        <span v-if="k.value !== 'all'" class="kind-dot" />
        {{ k.label.es }}
        <span class="kind-count">{{ kindCounts[k.value] ?? 0 }}</span>
      </button>
    </div>

    <div class="card">
      <div v-if="shownItems.length === 0" class="empty"><p>No hay elementos</p></div>
      <div v-else style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre (ES)</th>
              <th>Nombre (EN)</th>
              <th v-if="section === 'posts'">Autor</th>
              <th v-if="section === 'rentals'">Precio</th>
              <th v-if="byKind">Tipo</th>
              <th v-if="byKind">Zona</th>
              <th v-if="byKind">Precio</th>
              <th>Imagen</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in shownItems" :key="item.id">
              <td style="font-size:12px;color:#8c8c87">{{ item.id }}</td>
              <td style="font-weight:600;color:#1a1918">
                <span v-if="(section === 'rentals' || byKind) && item.featured" title="Destacado" style="color:#c8964a">★ </span>
                {{ displayName(item) ? displayName(item).es : item[cfg.nameField] }}
              </td>
              <td>{{ displayName(item) ? displayName(item).en : '--' }}</td>
              <td v-if="section === 'posts'">{{ item.author }}</td>
              <td v-if="section === 'rentals'" style="font-weight:600">${{ item.price }}/mes</td>
              <td v-if="byKind">
                <span class="kind-badge" :style="`--kc:${kindMeta(item.kind).color}`">{{ kindMeta(item.kind).label.es }}</span>
                <span v-if="item.demo" class="demo-badge" title="Dato de prueba">demo</span>
              </td>
              <td v-if="byKind">{{ zoneName(item.zone) }}</td>
              <td v-if="byKind" style="font-weight:600;white-space:nowrap">{{ formatListingPrice(item, 'es') }}</td>
              <td>
                <img v-if="item.img" :src="item.img" alt="" style="width:56px;height:38px;object-fit:cover;border-radius:8px;border:1px solid #ebebea">
              </td>
              <td style="white-space:nowrap">
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button class="btn btn-edit btn-sm" @click="openEdit(item)">Editar</button>
                  <button class="btn btn-danger btn-sm" @click="remove(item.id)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="modalOpen = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="modal-close" aria-label="Cerrar" @click="modalOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Step 1 (listings): choose what is being published -->
        <div v-if="pickingKind" class="modal-body">
          <p class="kind-pick-intro">¿Qué vas a publicar?</p>
          <div class="kind-pick">
            <button
              v-for="k in LISTING_KINDS"
              :key="k.value"
              type="button"
              class="kind-pick-btn"
              :style="`--kc:${k.color}`"
              @click="pickKind(k.value)"
            >
              <span class="kind-pick-dot" />
              <span class="kind-pick-title">{{ k.label.es }}</span>
              <span class="kind-pick-desc">{{
                k.value === 'rent' ? 'Casa, apartamento o habitación por meses'
                : k.value === 'sale' ? 'Casa o apartamento a la venta'
                  : 'Lote o finca, con o sin servicios' }}</span>
            </button>
          </div>
        </div>

        <div v-else class="modal-body">
          <div v-if="byKind" class="kind-current" :style="`--kc:${kindMeta(form.kind).color}`">
            <span class="kind-dot" /> {{ kindMeta(form.kind).label.es }}
            <span class="kind-current-note">El tipo no se puede cambiar después de crear la propiedad.</span>
          </div>
          <template v-for="(f, i) in visibleSchema" :key="`${f.key}-${f.kinds?.join() ?? ''}`">
          <h3 v-if="f.group && f.group !== visibleSchema[i - 1]?.group" class="f-section">{{ f.group }}</h3>
          <div class="f-group" :class="{ 'is-missing': missing.has(f.key) }">
            <label class="f-label">{{ f.label }}<span v-if="f.required" class="f-req" aria-label="obligatorio"> *</span></label>

            <!-- text (amen is a comma-joined list) -->
            <template v-if="f.type === 'text'">
              <input v-if="f.key === 'amen'" v-model="amenText().value" class="f-input" :placeholder="placeholderFor(f.key)">
              <input v-else-if="f.key === 'id' && byKind && editing" :value="form.id" class="f-input" readonly>
              <input v-else v-model="field(f.key).value" class="f-input" :placeholder="placeholderFor(f.key)">
            </template>

            <select v-else-if="f.type === 'boolean'" v-model="boolSelect(f.key).value" class="f-select">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>

            <AdminLocationPicker
              v-else-if="f.type === 'location'"
              v-model:lat="locationField('lat').value"
              v-model:lng="locationField('lng').value"
              :approx="!!form.approxLocation"
            />

            <input
              v-else-if="f.type === 'number'"
              v-model="numberField(f.key).value"
              class="f-input"
              type="number"
              step="any"
              :placeholder="placeholderFor(f.key)"
            >

            <select
              v-else-if="f.type === 'select'"
              v-model="(f.key === 'verified' || f.key === 'featured' ? boolSelect(f.key) : field(f.key)).value"
              class="f-select"
            >
              <option v-for="[v, l] in (f.options ?? [])" :key="v" :value="v">{{ l }}</option>
            </select>

            <div v-else-if="f.type === 'bilingual'" class="f-row">
              <div>
                <div class="f-bi-label">Español</div>
                <input v-model="bilingual(f.key, 'es').value" class="f-input">
              </div>
              <div>
                <div class="f-bi-label">English</div>
                <input v-model="bilingual(f.key, 'en').value" class="f-input">
              </div>
            </div>

            <div v-else-if="f.type === 'bilingual-area'" class="f-row">
              <div>
                <div class="f-bi-label">Español</div>
                <textarea v-model="bilingual(f.key, 'es').value" class="f-textarea" />
              </div>
              <div>
                <div class="f-bi-label">English</div>
                <textarea v-model="bilingual(f.key, 'en').value" class="f-textarea" />
              </div>
            </div>

            <div v-else-if="f.type === 'bilingual-list'" class="f-row">
              <div>
                <div class="f-bi-label">Español</div>
                <textarea v-model="bilingualList(f.key, 'es').value" class="f-textarea" />
              </div>
              <div>
                <div class="f-bi-label">English</div>
                <textarea v-model="bilingualList(f.key, 'en').value" class="f-textarea" />
              </div>
            </div>

            <div v-else-if="f.type === 'image'" class="f-image">
              <label
                class="f-image-drop"
                :class="{ 'is-dragover': dragKey === f.key }"
                @dragover.prevent="dragKey = f.key"
                @dragleave="dragKey = null"
                @drop.prevent="onDrop($event, f.key)"
              >
                <div
                  class="f-image-preview"
                  :style="field(f.key).value ? `background-image:url('${field(f.key).value}')` : ''"
                >
                  <span v-if="!field(f.key).value">Arrastra una imagen o haz clic para subir</span>
                </div>
                <input type="file" accept="image/*" class="f-image-file" hidden @change="onFileChange($event, f.key)">
              </label>
              <div class="f-image-controls">
                <input :value="field(f.key).value" class="f-input" :placeholder="placeholderFor(f.key)" readonly>
                <span class="f-image-status">{{ uploadStatus[f.key] ?? '' }}</span>
              </div>
            </div>

            <span v-if="f.hint" class="f-hint">{{ f.hint }}</span>
          </div>
          </template>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="modalOpen = false">Cancelar</button>
          <button v-if="!pickingKind" class="btn btn-primary" :disabled="saving" @click="save">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
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
.modal-body { padding: 24px 26px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
.modal-footer { padding: 16px 26px 22px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #f3f3f2; }

.f-group { display: flex; flex-direction: column; gap: 6px; }
.f-label { font-size: 12px; font-weight: 600; color: #6e6e69; text-transform: uppercase; letter-spacing: .05em; }
.f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.f-input, .f-textarea, .f-select {
  width: 100%; padding: 10px 14px; border: 1px solid #dddcdb; border-radius: 10px;
  font-size: 14px; font-family: inherit; color: #1a1918; background: #fafaf9; outline: none; transition: all .15s;
}
.f-input:focus, .f-textarea:focus, .f-select:focus { border-color: #C8964A; background: #fff; box-shadow: 0 0 0 3px rgba(200,150,74,.1); }
.f-textarea { min-height: 80px; resize: vertical; line-height: 1.5; }
.f-select { cursor: pointer; }
.f-hint { font-size: 11px; color: #a8a8a3; margin-top: 2px; }
.f-bi-label { font-size: 11px; font-weight: 600; color: #a8a8a3; margin-bottom: 4px; }

.f-req { color: #b42318; }
.f-group.is-missing .f-input,
.f-group.is-missing .f-select,
.f-group.is-missing .f-textarea { border-color: #b42318; background: #fff6f5; }
.f-group.is-missing .f-label { color: #b42318; }
.f-section {
  margin: 8px 0 -6px;
  padding-top: 14px;
  border-top: 1px solid #f0f0ef;
  font-size: 14px;
  font-weight: 700;
  color: #1a1918;
}
.f-section:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }

/* Kind: tabs, badges, picker */
.kind-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.kind-tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 14px; border-radius: 999px; border: 1px solid #dddcdb; background: #fff;
  font: inherit; font-size: 13px; font-weight: 600; color: #3d3d39; cursor: pointer;
  transition: background-color .15s, border-color .15s, color .15s;
}
.kind-tab:hover { border-color: var(--kc); }
.kind-tab.is-active { background: var(--kc); border-color: var(--kc); color: #fff; }
.kind-tab.is-active .kind-dot { background: #fff; }
.kind-count { font-size: 11.5px; font-weight: 700; opacity: .7; }
.kind-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--kc); flex: none; display: inline-block; }
.kind-badge {
  display: inline-block; padding: 3px 10px; border-radius: 999px; white-space: nowrap;
  font-size: 12px; font-weight: 700; color: var(--kc);
  background: color-mix(in srgb, var(--kc) 12%, white);
}
.demo-badge {
  margin-left: 6px; padding: 2px 7px; border-radius: 6px;
  font-size: 10.5px; font-weight: 700; color: #8c8c87; background: #f3f3f2; text-transform: uppercase;
}
.kind-pick-intro { margin: 0; font-size: 15px; font-weight: 600; color: #1a1918; }
.kind-pick { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.kind-pick-btn {
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left;
  padding: 18px 16px; border-radius: 14px; border: 1.5px solid #e6e6e4; background: #fff;
  font: inherit; cursor: pointer; transition: border-color .15s, background-color .15s, transform .15s;
}
.kind-pick-btn:hover { border-color: var(--kc); background: color-mix(in srgb, var(--kc) 6%, white); }
.kind-pick-btn:active { transform: scale(.98); }
.kind-pick-btn:focus-visible { outline: none; border-color: var(--kc); box-shadow: 0 0 0 3px color-mix(in srgb, var(--kc) 25%, transparent); }
.kind-pick-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--kc); }
.kind-pick-title { font-size: 15px; font-weight: 700; color: #1a1918; }
.kind-pick-desc { font-size: 12.5px; line-height: 1.45; color: #6e6e69; }
.kind-current {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  padding: 10px 14px; border-radius: 10px;
  background: color-mix(in srgb, var(--kc) 8%, white);
  font-size: 13.5px; font-weight: 700; color: var(--kc);
}
.kind-current-note { font-weight: 500; font-size: 12px; color: #8c8c87; }
@media (max-width: 640px) {
  .kind-pick { grid-template-columns: 1fr; }
}

.f-image { display: flex; gap: 14px; align-items: flex-start; }
.f-image-drop {
  flex: none; width: 120px; height: 90px; border-radius: 12px; border: 1.5px dashed #dddcdb;
  background: #fafaf9 center/cover no-repeat; cursor: pointer; overflow: hidden; transition: border-color .15s, background-color .15s;
}
.f-image-drop:hover, .f-image-drop.is-dragover { border-color: #C8964A; background-color: #fdf6ec; }
.f-image-preview {
  width: 100%; height: 100%; background: center/cover no-repeat; display: flex; align-items: center; justify-content: center;
}
.f-image-preview span { font-size: 10.5px; line-height: 1.4; text-align: center; color: #a8a8a3; padding: 6px; }
.f-image-controls { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.f-image-status { font-size: 11px; color: #C8964A; min-height: 14px; }
</style>
