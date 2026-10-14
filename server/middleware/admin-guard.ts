// Server-side gate for the admin panel: every /admin page (except the login
// screen itself) requires a valid token before any HTML is rendered — the same
// check each v1 admin page did in its frontmatter.
export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (!pathname.startsWith('/admin')) return

  const isLogin = pathname === '/admin/login' || pathname === '/admin/login/'
  const authed = isAuthenticated(event)

  if (!isLogin && !authed) return sendRedirect(event, '/admin/login', 302)
  if (isLogin && authed) return sendRedirect(event, '/admin', 302)
})
