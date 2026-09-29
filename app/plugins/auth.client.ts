export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  auth.hydrate()

  // Token di localStorage bisa kedaluwarsa; konfirmasi ke /me sebelum middleware jalan.
  if (auth.isAuthenticated) {
    await auth.fetchMe()
  }
})
