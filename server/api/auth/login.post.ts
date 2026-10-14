export default defineEventHandler(async (event) => {
  const retryAfter = loginRetryAfter(event)
  if (retryAfter) {
    setResponseHeader(event, 'Retry-After', retryAfter)
    const error = 'Demasiados intentos. Prueba de nuevo en unos minutos.'
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts', data: { error } })
  }

  const body = await readBody<{ password?: string }>(event)
  const token = verifyLogin(String(body?.password ?? ''))
  if (!token) {
    recordLoginFailure(event)
    throw createError({ statusCode: 401, statusMessage: 'Invalid password', data: { error: 'Invalid password' } })
  }
  clearLoginFailures(event)
  setCookie(event, ADMIN_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 86400,
  })
  return { ok: true }
})
