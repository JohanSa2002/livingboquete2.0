import type { LeadType } from '#shared/types/content'

const LEAD_TYPES: LeadType[] = ['propietario', 'alquiler', 'visita', 'guide']

// Faster than any person fills in a form (see app/composables/useLeadGuard.ts).
const MIN_FILL_MS = 2000
const MAX_FIELD = 200
const MAX_MESSAGE = 4000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const badRequest = (error: string) =>
  createError({ statusCode: 400, statusMessage: error, data: { error } })

// Trimmed string or null; anything past `max` is a paste of garbage, not a lead.
function text(value: unknown, max = MAX_FIELD): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  if (!s) return null
  if (s.length > max) throw badRequest('field too long')
  return s
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, any>>(event) ?? {}

  // Bot signals: the honeypot got filled, or the form went out too fast. The
  // reply looks like a success so the bot has nothing to adjust against.
  // elapsed_ms is only judged when sent, so a page cached from before this
  // check can still submit.
  const elapsed = Number(body.elapsed_ms)
  if (text(body.website) || (body.elapsed_ms !== undefined && elapsed < MIN_FILL_MS)) {
    return { ok: true }
  }

  const nombre = text(body.nombre)
  const email = text(body.email)
  const celular = text(body.celular, 40)

  // Listing leads (rental requests and sale/land visit requests) allow either
  // email or WhatsApp — the guide/owner forms still require an email address.
  const normalizedType: LeadType = LEAD_TYPES.includes(body.type) ? body.type : 'guide'
  const contactOptional = normalizedType === 'alquiler' || normalizedType === 'visita'
  if (!nombre || (contactOptional ? !email && !celular : !email)) {
    throw badRequest('nombre and (email or celular) required')
  }
  if (email && !EMAIL_RE.test(email)) throw badRequest('invalid email')

  const personas = Number(body.personas)
  const lead = {
    nombre,
    email,
    celular,
    pais: text(body.pais),
    retiro: text(body.retiro),
    timeline: text(body.timeline),
    interes: text(body.interes),
    type: normalizedType,
    tipo_propiedad: text(body.tipo_propiedad),
    ubicacion: text(body.ubicacion),
    mensaje: text(body.mensaje, MAX_MESSAGE),
    rental_id: text(body.rental_id),
    rental_name: text(body.rental_name),
    move_in: text(body.move_in),
    duracion: text(body.duracion),
    personas: Number.isFinite(personas) && personas > 0 ? Math.min(Math.round(personas), 50) : null,
    mascotas: typeof body.mascotas === 'boolean' ? body.mascotas : null,
  }

  const { data, error } = await getSupabase()
    .from('leads')
    .insert(lead)
    .select('id')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
  }

  // The alert runs after the response on platforms that support it (Vercel),
  // so the visitor doesn't wait on Resend.
  const alert = notifyNewLead({ ...lead, id: data.id })
  if (typeof event.waitUntil === 'function') event.waitUntil(alert)
  else await alert

  return { ok: true, id: data.id }
})
