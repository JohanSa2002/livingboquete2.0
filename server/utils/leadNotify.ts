const TYPE_LABELS: Record<string, string> = {
  guide: 'Guía gratuita',
  propietario: 'Propietario quiere publicar',
  alquiler: 'Solicitud de alquiler',
  visita: 'Solicitud de visita',
}

// Labels for the lead columns worth showing in the alert, in reading order.
const FIELDS: [string, string][] = [
  ['nombre', 'Nombre'],
  ['email', 'Correo'],
  ['celular', 'Celular / WhatsApp'],
  ['rental_name', 'Propiedad'],
  ['move_in', 'Fecha'],
  ['duracion', 'Duración (meses)'],
  ['personas', 'Personas'],
  ['mascotas', 'Mascotas'],
  ['tipo_propiedad', 'Tipo de propiedad'],
  ['ubicacion', 'Ubicación'],
  ['pais', 'País'],
  ['retiro', '¿Retiro?'],
  ['timeline', 'Plazo'],
  ['interes', 'Interés'],
  ['mensaje', 'Mensaje'],
]

// Emails the team when a lead comes in, so nobody has to keep the admin open
// to notice one. Goes to LEADS_NOTIFY_TO, or the reply-to inbox when that
// isn't set. Never throws: the lead is already saved, and a failed alert must
// not turn the visitor's submission into an error.
export async function notifyNewLead(lead: Record<string, unknown> & { id: number; type: string }) {
  const config = useRuntimeConfig()
  const to = config.leadsNotifyTo || config.emailReplyTo
  if (!config.resendApiKey || !to) return

  const rows = FIELDS
    .filter(([key]) => lead[key] !== null && lead[key] !== undefined && lead[key] !== '')
    .map(([key, label]) => {
      const raw = lead[key]
      const value = typeof raw === 'boolean' ? (raw ? 'Sí' : 'No') : String(raw)
      return `<tr><td style="padding:6px 12px 6px 0;color:#5B5650;vertical-align:top;white-space:nowrap">${label}</td>`
        + `<td style="padding:6px 0;color:#2B2B2B">${escapeHtml(value).replace(/\n/g, '<br/>')}</td></tr>`
    })
    .join('')

  const typeLabel = TYPE_LABELS[lead.type] ?? lead.type
  const adminUrl = `${config.public.siteUrl.replace(/\/$/, '')}/admin/leads`
  const html = `
  <div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;color:#2B2B2B">
    <p style="font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#2F5233;font-weight:700;margin:0 0 6px">Nuevo lead</p>
    <h2 style="font-size:20px;margin:0 0 18px">${escapeHtml(typeLabel)}</h2>
    <table style="font-size:14px;line-height:1.5;border-collapse:collapse">${rows}</table>
    <p style="margin-top:24px"><a href="${adminUrl}" style="color:#2F5233;font-weight:600">Ver en el panel →</a></p>
  </div>`

  try {
    const { error } = await getResend().emails.send({
      from: config.emailFrom,
      to,
      // Replying to the alert answers the lead directly when they left an email.
      ...(typeof lead.email === 'string' && lead.email ? { replyTo: lead.email } : {}),
      subject: `Nuevo lead · ${typeLabel} · ${String(lead.nombre)}`,
      html,
    })
    if (error) console.error('[leads] notification failed:', error.message)
  }
  catch (err) {
    console.error('[leads] notification failed:', err)
  }
}
