import { api } from './client'
import type {
  AktivitasParams,
  AktivitasResponse,
  DashboardParams,
  DashboardResponse,
  ImportStatusResponse,
  Kandidat,
  LoginResponse,
  MeResponse,
  MessageResponse,
  PemilihanUmumResponse,
  RekapResponse,
  User,
  ValidationErrors,
  VoteResponse
} from './types'

// ===== 1. Auth =====

export const login = (nis: string, password: string) =>
  api<LoginResponse>('/login', { method: 'POST', body: { nis, password } })

/** Backend bungkus user di `data` — bukan field datar seperti asumsi lama. */
export const me = async (): Promise<MeResponse['data']> => {
  const res = await api<MeResponse>('/me')
  return res.data
}

export const logout = () => api<MessageResponse>('/logout', { method: 'POST' })

// ===== 2. Admin — dashboard & rekap =====

export const dashboard = (params: DashboardParams = {}) =>
  api<DashboardResponse>('/dashboard', { query: { ...params } })

export const rekapSuara = (jenis?: 'osis' | 'mpk') =>
  api<RekapResponse>('/rekap-suara', { query: { jenis } })

export const aktivitasVote = (params: AktivitasParams = {}) =>
  api<AktivitasResponse>('/aktivitas-vote', { query: { ...params } })

// ===== 3. Siswa — pemilihan & voting =====

export const pemilihanUmum = () => api<PemilihanUmumResponse>('/pemilihan-umum')

export const vote = (payload: { pemilihan_umum_id: number, kandidat_id: number }) =>
  api<VoteResponse>('/vote', { method: 'POST', body: payload })

// ===== 4. Kandidat =====

export const createKandidat = (payload: {
  pemilihan_umum_id: number
  nomor: number
  nama: string
  kelas?: string | null
  foto_url?: string | null
  visi?: string | null
  misi?: string | null
  deskripsi?: string | null
}) => api<MessageResponse & { data: Kandidat }>('/kandidat', { method: 'POST', body: payload })

// ===== 5. User & import =====

export const register = (payload: { nis: string, nama: string, password: string, role: string }) =>
  api<ValidationErrors & { data: User }>('/users/register', { method: 'POST', body: payload })

export const importUsers = (file: File | Blob) => {
  const form = new FormData()
  form.append('file', file)
  return api<MessageResponse>('/import/users', { method: 'POST', body: form })
}

export const importStatus = () => api<ImportStatusResponse>('/import/users/status')
