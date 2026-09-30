export default defineNuxtRouteMiddleware((to) => {
  // ponytail: client-only — session di localStorage, tidak ada di server.
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
