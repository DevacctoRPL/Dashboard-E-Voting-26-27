import { defineStore } from '#imports'
import { apiErrorMessage, clearToken, getToken, setToken } from '@/api/client'
import { login as apiLogin, logout as apiLogout, me } from '@/api'
import type { User } from '@/api/types'

const STORAGE_KEY = 'evoting-auth'

interface AuthState {
  id: number | null
  nis: string
  name: string
  role: string
  isAuthenticated: boolean
}

const EMPTY: AuthState = { id: null, nis: '', name: '', role: '', isAuthenticated: false }

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ ...EMPTY }),
  getters: {
    isAdmin: state => state.role === 'admin'
  },
  actions: {
    hydrate() {
      if (import.meta.server) return
      if (!getToken()) return

      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          this.$patch({ ...EMPTY, ...JSON.parse(raw) })
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    persist() {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      }
    },
    /**
     * @returns pesan error, atau null kalau sukses.
     */
    async login(nis: string, password: string): Promise<string | null> {
      try {
        const res = await apiLogin(nis.trim(), password)
        setToken(res.token)
        this.$patch({
          id: res.user.id,
          nis: res.user.nis,
          name: res.user.nama,
          role: res.user.role,
          isAuthenticated: true
        })
        this.persist()
        return null
      } catch (err) {
        return apiErrorMessage(err)
      }
    },
    /** Token masih bisa hidup walau server reject (offline / token kadaluarsa). */
    async fetchMe(): Promise<boolean> {
      if (!getToken()) return false
      try {
        const user: User = await me()
        this.$patch({
          id: user.id,
          nis: user.nis,
          name: user.nama,
          role: user.role,
          isAuthenticated: true
        })
        this.persist()
        return true
      } catch {
        this.clear()
        return false
      }
    },
    async logout() {
      try {
        await apiLogout()
      } catch {
        // Token sudah tidak valid di server — abaikan, tetap bersihkan lokal.
      }
      this.clear()
    },
    clear() {
      this.$patch({ ...EMPTY })
      clearToken()
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }
})
