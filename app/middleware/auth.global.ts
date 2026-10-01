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

  // Authenticated tapi bukan admin. `clear()` wajib: tanpa itu user non-admin
  // yang punya token valid akan tersangkut di halaman yang forbidden selamanya,
  // karena `isAuthenticated` tetap true dan cek di atas terus lolos. Setelah
  // di-clear, `/login` langsung lolos cek blok pertama — tidak ada loop.
  if (!auth.isAdmin) {
    auth.clear()
    return navigateTo('/login')
  }
})
