import { defineStore } from '#imports'
import { apiErrorMessage, clearToken, getToken, isSessionExpired, markSessionExpired, setToken } from '@/api/client'
import { login as apiLogin, logout as apiLogout, me } from '@/api'
import type { StatusPemilihan, User } from '@/api/types'

const STORAGE_KEY = 'evoting-auth'

/** Sama dengan yang di-hardcode `OnlyAdmin` backend — satu sumber kebenaran. */
const ADMIN_ROLE = 'admin'

const EMPTY_STATUS: StatusPemilihan = {
  sudah_vote_osis: false,
  sudah_vote_mpk: false,
  detail: {
    osis: { sudah_vote: false, kandidat_id: null, waktu_memilih: null },
    mpk: { sudah_vote: false, kandidat_id: null, waktu_memilih: null }
  },
  sudah_selesai_voting: false,
  selesai: false,
  redirect_to: null
}

interface AuthState {
  id: number | null
  nis: string
  name: string
  role: string
  isAuthenticated: boolean
  status_pemilihan: StatusPemilihan
  selesai: boolean
  redirect_to: string | null
}

const EMPTY: AuthState = {
  id: null,
  nis: '',
  name: '',
  role: '',
  isAuthenticated: false,
  status_pemilihan: { ...EMPTY_STATUS },
  selesai: false,
  redirect_to: null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({ ...EMPTY, status_pemilihan: { ...EMPTY_STATUS } }),
  getters: {
    isAdmin: state => state.role === ADMIN_ROLE
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
    patchUser(user: User, status: StatusPemilihan, selesai: boolean, redirectTo: string | null) {
      this.$patch({
        id: user.id,
        nis: user.nis,
        name: user.nama,
        role: user.role,
        isAuthenticated: true,
        status_pemilihan: status,
        selesai,
        redirect_to: redirectTo
      })
      this.persist()
    },
    /**
     * @returns pesan error, atau null kalau sukses.
     */
    async login(nis: string, password: string): Promise<string | null> {
      try {
        const res = await apiLogin(nis.trim(), password)
        const { user, token, status_pemilihan, selesai, redirect_to } = res.data

        // Halaman ini khusus panitia. Backend masih menerbitkan token untuk
        // semua role, jadi token role non-admin harus dicabut di server sebelum
        // dibuang — kalau tidak, token valid akan menggantung di sana. `setToken`
        // dulu supaya `apiLogout` punya bearer, lalu `clear()` supaya tidak
        // pernah sampai ke localStorage/persist().
        if (user.role !== ADMIN_ROLE) {
          setToken(token)
          try {
            await apiLogout()
          } catch {
            // Server mati atau token sudah dicabut — abaikan, tetap tolak lokal.
          }
          this.clear()
          return 'Dashboard ini khusus akun admin (panitia).'
        }

        setToken(token)
        this.patchUser(user, status_pemilihan, selesai, redirect_to)
        return null
      } catch (err) {
        return apiErrorMessage(err)
      }
    },
    /** Token masih bisa hidup walau server reject (offline / token kadaluarsa). */
    async fetchMe(): Promise<boolean> {
      if (!getToken()) return false
      try {
        const { user, status_pemilihan, selesai, redirect_to } = await me()
        this.patchUser(user, status_pemilihan, selesai, redirect_to)
        return true
      } catch (err) {
        // Token ditolak server saat boot: paksa logout agar middleware
        // melempar ke /login, dan tandai supaya banner "sesi berakhir" muncul.
        if (isSessionExpired(err)) {
          this.clear()
          markSessionExpired()
        } else {
          // Error lain = offline/server mati. Login lokal dibiarkan supaya
          // middleware tetap yang memutuskan, bukan diasumsikan session rusak.
          this.clear()
        }
        return false
      }
    },
    async logout() {
      try {
        await apiLogout()
      } catch {
        // Token sudah tidak valid di server / server mati — abaikan, tetap
        // bersihkan lokal. `silentAuth` mencegah 401 memicu toast sesi habis.
      }
      this.clear()
    },
    clear() {
      this.$patch({ ...EMPTY, status_pemilihan: { ...EMPTY_STATUS } })
      clearToken()
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }
})
