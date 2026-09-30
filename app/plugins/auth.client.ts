import { setSessionExpiredHandler } from '@/api/client'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  /**
   * Dipanggil `api()` setiap backend membalas 401/419. `client.ts` sudah
   * membersihkan token + store, di sini kita kasih umpan balik ke user:
   * toast penjelas (dibaca app.vue dari state) lalu lempar ke /login sambil
   * menyimpan halaman asal supaya user balik ke sana setelah login.
   *
   * `router` ditangkap di sini, bukan diambil di dalam callback — handler
   * dipanggil dari dalam promise fetch, di luar konteks setup Vue, di mana
   * `useRoute()`/`navigateTo()` tidak bisa resolve instance Nuxt.
   */
  const router = useRouter()

  setSessionExpiredHandler(() => {
    const current = router.currentRoute.value.fullPath
    void router.replace({
      path: '/login',
      query: current && current !== '/login' ? { redirect: current } : {}
    })
  })

  auth.hydrate()

  // Token di localStorage bisa kedaluwarsa; konfirmasi ke /me sebelum middleware jalan.
  if (auth.isAuthenticated) {
    await auth.fetchMe()
  }
})
