export type Role = 'admin' | 'siswa'

export interface User {
  id: number
  nis: string
  nama: string
  role: Role | string
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface MessageResponse {
  message: string
}

export interface ValidationErrors {
  message: string
  errors?: Record<string, string[]>
}

export interface Kandidat {
  id: number
  nomor: number
  nama: string
  jumlah_suara?: number
}

export interface PemilihanUmum {
  id: number
  nama: string
  kandidat: Kandidat[]
}

export interface Rekap {
  pemilihan_umum_id: number
  nama: string
  total_suara: number
  kandidat: Kandidat[]
}

export interface Dashboard {
  total_pemilih: number
  sudah_memilih: number
  belum_memilih: number
  partisipasi: number
}

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ImportStatusResponse {
  status: ImportStatus
  total: number
  processed: number
  failed: number
}
