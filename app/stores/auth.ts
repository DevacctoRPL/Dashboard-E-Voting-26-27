import { defineStore } from '#imports'

// ponytail: mock auth — hardcoded kredensial, session di localStorage.
// Ganti ke API real tinggal ubah isi `login` (fetch + token cookie), store shape tetap.
export const DEMO_LOGIN = {
  nis: '212006',
  password: 'admin123',
  name: 'Rizka Zahra'
}

const STORAGE_KEY = 'evoting-auth'

interface AuthState {
  nis: string
  name: string
  isAuthenticated: boolean
}

const EMPTY: AuthState = { nis: '', name: '', isAuthenticated: false }

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ ...EMPTY }),
  actions: {
    hydrate() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          this.$patch({ ...EMPTY, ...JSON.parse(raw) })
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    login(nis: string, password: string): boolean {
      if (nis.trim() !== DEMO_LOGIN.nis || password !== DEMO_LOGIN.password) {
        return false
      }
      this.$patch({ nis: nis.trim(), name: DEMO_LOGIN.name, isAuthenticated: true })
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      }
      return true
    },
    logout() {
      this.$patch({ ...EMPTY })
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }
})
