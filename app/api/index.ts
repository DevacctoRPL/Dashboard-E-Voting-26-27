import { api } from './client'
import type {
  Dashboard,
  ImportStatusResponse,
  Kandidat,
  LoginResponse,
  MessageResponse,
  PemilihanUmum,
  Rekap,
  User,
  ValidationErrors
} from './types'

// ===== 1. Auth =====

export const me = () => api<User>('/me')

export const login = (nis: string, password: string) =>
  api<LoginResponse>('/login', { method: 'POST', body: { nis, password } })

export const logout = () => api<MessageResponse>('/logout', { method: 'POST' })

export const register = (payload: { nis: string, nama: string, password: string, role: string }) =>
  api<ValidationErrors & { data: User }>('/users/register', { method: 'POST', body: payload })

// ===== 2. Pemilihan Umum =====

// ponytail: path `/pemilihan-umum` masih tebakan — URL-nya kosong di Postman collection.
// Ganti di sini kalau route backend ternyata lain.
export const pemilihanUmum = () => api<{ data: PemilihanUmum[] }>('/pemilihan-umum')

export const vote = (payload: { pemilihan_umum_id: number, kandidat_id: number }) =>
  api<MessageResponse>('/vote', { method: 'POST', body: payload })

// ===== 3. Kandidat =====

export const createKandidat = (payload: { nomor: number, nama: string, pemilihan_umum_id: number }) =>
  api<MessageResponse & { data: Kandidat }>('/kandidat', { method: 'POST', body: payload })

// ===== 4. Import =====

export const importUsers = (file: File | Blob) => {
  const form = new FormData()
  form.append('file', file)
  return api<MessageResponse>('/import/users', { method: 'POST', body: form })
}

// ===== 5. Dashboard =====

export const dashboard = () => api<Dashboard>('/dashboard')

export const importStatus = () => api<ImportStatusResponse>('/import/users/status')

export const rekapSuara = () => api<{ data: Rekap[] }>('/rekap-suara')
