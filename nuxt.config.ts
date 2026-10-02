// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // App ini dark-only: halaman login sudah navy pekat, jadi tema terang nggak
  // pernah dipakai dan tombol ganti tema sudah dihapus (lihat
  // `plugins/color-mode.client.ts` buat Penetralan localStorage yang tertinggal).
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  runtimeConfig: {
    public: {
      // Backend Laravel E-Voting. Override: NUXT_PUBLIC_API_BASE=http://host:port/api
      apiBase: 'https://be-e-voting-osem.smkpluspnb.sch.id/api'
    }
  },

  // Semua halaman auth-gated, dan `auth.global.ts` keluar lebih dulu di server
  // (`import.meta.server`). Tanpa ini, hard-refresh `/` tetap SSR-render
  // kerangka dashboard dan mengirimkannya ke siapa pun yang belum login sebelum
  // middleware sempat menendang ke /login.
  routeRules: {
    '/': { ssr: false },
    '/data-pemilih': { ssr: false },
    '/quick-count': { ssr: false },
    '/login': { ssr: false }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
