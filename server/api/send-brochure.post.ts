import { renderToBuffer } from '@react-pdf/renderer'
import { PropertyBrochure, type BrochureRental } from '../pdf/PropertyBrochure'

function emailHtml(rawLeadName: string, rawRentalName: string, rawNote: string) {
  const leadName = escapeHtml(rawLeadName)
  const rentalName = escapeHtml(rawRentalName)
  const note = escapeHtml(rawNote)
  const noteBlock = note
    ? `<p style="margin:0 0 20px;padding:14px 16px;background:#F5F0E8;border-left:3px solid #C8964A;border-radius:6px;font-size:14px;line-height:1.6;color:#2B2B2B">${note.replace(/\n/g, '<br/>')}</p>`
    : ''
  return `
  <div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;color:#2B2B2B">
    <div style="background:#2F5233;padding:22px 28px;border-radius:12px 12px 0 0">
      <span style="color:#F5F0E8;font-weight:800;font-size:16px;letter-spacing:.02em">MIKA HOMES</span>
    </div>
    <div style="padding:28px;border:1px solid #E5DFD2;border-top:none;border-radius:0 0 12px 12px">
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hola ${leadName},</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
        Gracias por tu interés en <strong>${rentalName}</strong>. Adjuntamos la ficha completa de la propiedad en PDF con toda la información.
      </p>
      ${noteBlock}
      <p style="font-size:15px;line-height:1.6;margin:0 0 4px">Cualquier duda, responde directamente a este correo.</p>
      <p style="font-size:13px;color:#5B5650;margin-top:24px">— Equipo MIKA Homes · mikahomes.com</p>
    </div>
  </div>`
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const { leadId, rentalId, note } = await readBody<{ leadId?: number; rentalId?: string; note?: string }>(event)
  if (!leadId || !rentalId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'leadId and rentalId required',
      data: { error: 'leadId and rentalId required' },
    })
  }

  const supabase = getSupabase()
  const [{ data: lead, error: leadError }, { data: rentalRow, error: rentalError }] = await Promise.all([
    supabase.from('leads').select('*').eq('id', leadId).maybeSingle(),
    supabase.from('listings').select('data').eq('id', rentalId).eq('kind', 'rent').maybeSingle(),
  ])

  if (leadError || !lead) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found', data: { error: 'Lead not found' } })
  }
  if (rentalError || !rentalRow) {
    throw createError({ statusCode: 404, statusMessage: 'Rental not found', data: { error: 'Rental not found' } })
  }
  // Rental and visit leads may leave only a WhatsApp number. The admin UI
  // already disables the button for them; this keeps a direct call from
  // reaching Resend with a null recipient.
  if (!lead.email) {
    const error = 'Este lead no dejó correo — contáctalo por celular'
    throw createError({ statusCode: 400, statusMessage: error, data: { error } })
  }

  // Listings call the contact `contact`; the brochure layout still reads `host`.
  const rental = { ...rentalRow.data, host: rentalRow.data.contact ?? rentalRow.data.host } as BrochureRental
  const leadName = String(lead.nombre || '').split(' ')[0] || String(lead.nombre)

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(
      PropertyBrochure({ rental, leadName: String(lead.nombre), note: note ? String(note) : undefined }),
    )
  }
  catch {
    throw createError({ statusCode: 500, statusMessage: 'No se pudo generar el PDF', data: { error: 'No se pudo generar el PDF' } })
  }

  try {
    const { error } = await getResend().emails.send({
      ...getMailFrom(),
      to: lead.email as string,
      subject: `${rental.name.es} · Información de la propiedad — MIKA Homes`,
      html: emailHtml(leadName, rental.name.es, note ? String(note) : ''),
      attachments: [
        {
          filename: `${rental.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    })
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message, data: { error: error.message } })
    }
  }
  catch (err: any) {
    if (err?.statusCode) throw err
    const message = err instanceof Error ? err.message : 'Error al enviar el correo'
    throw createError({ statusCode: 500, statusMessage: message, data: { error: message } })
  }

  return { ok: true }
})
