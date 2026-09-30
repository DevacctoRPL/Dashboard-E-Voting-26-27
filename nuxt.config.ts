// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  runtimeConfig: {
    public: {
      // Backend Laravel E-Voting. Override: NUXT_PUBLIC_API_BASE=http://host:port/api
      apiBase: 'http://127.0.0.1:8000/api'
    }
  },

  // ponytail: no routeRules prerender — / dan /quick-count auth-gated,
  // prerender bakar shell logged-out ke HTML statis.

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
