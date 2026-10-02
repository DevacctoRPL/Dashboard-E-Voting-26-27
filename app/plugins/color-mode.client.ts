/**
 * App ini dark-only: layar login navy pekat, tombol ganti tema sudah dihapus,
 * dan token `:root` di main.css sudah disamakan dengan `.dark`.
 *
 * Plugin ini jamin class `dark` tetap nempel di <html> walau browser masih
 * nyimpen `nuxt-color-mode` = "light" di localStorage dari sesi sebelum
 * toggle dihapus. Kalau class-nya `light`, semua utility `dark:*` di komponen
 * mati karena warna primary-nya jadi biru gelap di atas navy.
 */
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  colorMode.preference = 'dark'
})
