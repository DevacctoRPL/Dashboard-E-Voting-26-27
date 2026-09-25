export default defineNuxtRouteMiddleware((to) => {
  // ponytail: client-only — session di localStorage, tidak ada di server.
  // Mock admin dashboard (data moc belum sensitif); proteksi API real nanti via cookie.
  if (import.meta.server) return

  const auth = useAuthStore()

  if (to.path === '/login') {
    if (auth.isAuthenticated) {
      return navigateTo('/')
    }
    return
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
