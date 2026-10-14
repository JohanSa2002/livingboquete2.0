import sharp from 'sharp'

const BUCKET = 'images'
const MAX_BYTES = 8 * 1024 * 1024
// Largest size any public page renders (the property hero at 900px x2). The
// stored file is what @nuxt/image resizes from, so anything past this is
// bandwidth spent for nothing — uploads used to land as-is at 800KB+.
const MAX_EDGE = 1800
const QUALITY = 80
const ALLOWED_TYPES: Record<string, string> = {
  'image/webp': 'webp',
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const form = await readMultipartFormData(event)
  const file = form?.find(part => part.name === 'file' && part.filename)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'file required', data: { error: 'file required' } })
  }

  const contentType = file.type ?? ''
  const ext = ALLOWED_TYPES[contentType]
  if (!ext) {
    const error = 'Solo se permiten imágenes en formato WebP'
    throw createError({ statusCode: 400, statusMessage: error, data: { error } })
  }
  if (file.data.byteLength > MAX_BYTES) {
    const error = 'La imagen supera el límite de 8MB'
    throw createError({ statusCode: 400, statusMessage: error, data: { error } })
  }

  const optimized = await sharp(file.data)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer()

  const path = 'uploads/' + crypto.randomUUID() + '.' + ext
  const { error: uploadError } = await getSupabase()
    .storage
    .from(BUCKET)
    .upload(path, optimized, { contentType, upsert: false })

  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: uploadError.message, data: { error: uploadError.message } })
  }

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
})
