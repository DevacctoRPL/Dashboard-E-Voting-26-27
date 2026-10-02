export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'slate'
    },

    /**
     * Semua UCard jadi permukaan glass di atas foto background (login-bg.png):
     * navy transparan + blur + garis putih tipis. Override di sini, bukan di
     * tiap pemakai, karena variant bawaan Nuxt UI (`bg-default`/`ring-default`)
     * bersifat solid dan nggak bisa ditembus utility di `class` satu-satu.
     */
    card: {
      slots: {
        root: 'rounded-2xl overflow-hidden border border-glass-300 bg-glass-100 backdrop-blur-xl'
      },
      variants: {
        variant: {
          outline: { root: 'divide-y divide-glass-200' },
          soft: { root: 'divide-y divide-glass-200' },
          subtle: { root: 'divide-y divide-glass-200' },
          solid: { root: 'bg-[#0a2a4e] divide-y divide-glass-200' }
        }
      }
    }
  }
})
