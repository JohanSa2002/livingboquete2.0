import { createHash, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export const ADMIN_COOKIE = 'admin_token'

// Both values come from the environment with no fallback. When either is
// missing the admin stays locked: logins fail and no token verifies.
function adminConfig() {
  const { adminPass, adminSecret } = useRuntimeConfig()
  return adminPass && adminSecret ? { adminPass, adminSecret } : null
}

// Hashing first gives both sides the same length, so the comparison takes the
// same time whatever the guess — a plain !== leaks how many leading characters
// matched.
function samePassword(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function verifyLogin(password: string): string | null {
  const config = adminConfig()
  if (!config) {
    console.error('[admin] ADMIN_PASS and ADMIN_SECRET must be set — admin login is disabled')
    return null
  }
  if (!samePassword(password, config.adminPass)) return null
  return jwt.sign({ role: 'admin' }, config.adminSecret, { expiresIn: '24h' })
}

export function verifyToken(token: string): boolean {
  const config = adminConfig()
  if (!config) return false
  try {
    jwt.verify(token, config.adminSecret)
    return true
  }
  catch {
    return false
  }
}

export function isAuthenticated(event: H3Event): boolean {
  const token = getCookie(event, ADMIN_COOKIE)
  if (!token) return false
  return verifyToken(token)
}

// Throws the same 401 shape every admin endpoint returned in v1.
export function requireAdmin(event: H3Event): void {
  if (!isAuthenticated(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { error: 'Unauthorized' } })
  }
}

// --- Login throttling --------------------------------------------------------
// Failed attempts per client IP, kept in memory. On Vercel each warm instance
// has its own map, so this is a brake on guessing, not a hard global limit.
const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const failures = new Map<string, { count: number; first: number }>()

function clientKey(event: H3Event) {
  return getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
}

// Seconds until this client may try again, or 0 when it isn't locked out.
export function loginRetryAfter(event: H3Event): number {
  const entry = failures.get(clientKey(event))
  if (!entry) return 0
  const elapsed = Date.now() - entry.first
  if (elapsed > WINDOW_MS) {
    failures.delete(clientKey(event))
    return 0
  }
  return entry.count >= MAX_FAILURES ? Math.ceil((WINDOW_MS - elapsed) / 1000) : 0
}

export function recordLoginFailure(event: H3Event) {
  const key = clientKey(event)
  const now = Date.now()
  const entry = failures.get(key)
  if (!entry || now - entry.first > WINDOW_MS) failures.set(key, { count: 1, first: now })
  else entry.count++
}

export function clearLoginFailures(event: H3Event) {
  failures.delete(clientKey(event))
}
