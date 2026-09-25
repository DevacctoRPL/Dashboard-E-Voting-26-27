export default defineNuxtPlugin(() => {
  // Hydrate store dari localStorage sebelum route middleware jalan di client.
  useAuthStore().hydrate()
})
