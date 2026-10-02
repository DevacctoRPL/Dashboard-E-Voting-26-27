// Bentuk response di bawah diambil dari probe langsung ke backend Laravel
// (GET /me, /dashboard, /rekap-suara, /aktivitas-vote, /pemilihan-umum,
// /import/users/status), bukan dari api_spec.md — spec menandai banyak field
// sebagai "tidak terdokumentasi".

export type Role = 'admin' | 'siswa' | 'guru'

export type JenisPemilihan = 'osis' | 'mpk'

export interface User {
  id: number
  nama: string
  nis: string
  role: Role | string
  created_at?: string
  updated_at?: string
}

export interface DetailStatus {
  sudah_vote: boolean
  kandidat_id: number | null
  waktu_memilih: string | null
}

export interface StatusPemilihan {
  sudah_vote_osis: boolean
  sudah_vote_mpk: boolean
  detail: Record<JenisPemilihan, DetailStatus>
  sudah_selesai_voting: boolean
  selesai: boolean
  redirect_to: string | null
}

// ===== Envelope =====

/** Mayoritas endpoint: `{ success, message, data }`. */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** `GET /dashboard` satu-satunya yang pakai key `status`, bukan `success`. */
export interface DashboardResponse {
  status: boolean
  message: string
  filter: {
    search: string | null
    status: string | null
    jenis: string | null
    /** Belum tentu di-echo backend yang sedang jalan — opsional. */
    kelas?: string | null
    per_page: number
  }
  summary: DashboardSummary
  data: Pemilih[]
  pagination: Pagination
}

export interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface DashboardSummary {
  total_pemilihan_aktif: number
  total_siswa: number
  total_siswa_terfilter: number
  sudah_memilih: number
  belum_memilih: number
  sudah_memilih_semua: number
  sudah_memilih_sebagian: number
  persen_partisipasi: number
  statistik: {
    Belum_memilih: number
    Sudah_memilih_sebagian: number
    Sudah_memilih_semua: number
  }
}

export interface VotingStatus {
  message: string
  voted_count: number
  total_pemilihan: number
  // ponytail: array, isi saat sudah vote belum pernah terprobe (pemilihan masih
  // `draft` waktu types ini ditulis). Tampilkan apa adanya kalau non-empty,
  // fallback ke `voting_status.message`. Konfirmasi ke backend lalu ketik jadi
  // tipe konkret.
  voted_jenis: unknown[]
}

export interface Pemilih {
  id: number
  nama: string
  nis: string
  /** Boleh `null` — siswa yang belum diisi kelasnya. */
  kelas: string | null
  role: Role | string
  sudah_memilih: boolean
  sudah_memilih_semua: boolean
  voting_status: VotingStatus
}

// ===== Rekap suara =====

export interface RekapChart {
  /** Sudah diprefiks backend, mis. "Paslon 1 - Nama Kandidat". */
  labels: string[]
  data: number[]
  percentages: number[]
}

export interface RekapDetail {
  kandidat_id: number
  nomor: number
  nama: string
  total: number
  persen: number
}

export interface Partisipasi {
  total_siswa: number
  sudah_memilih: number
  belum_memilih: number
  persen_partisipasi: number
}

export interface UnggulSementara {
  nama: string
  persen: number
}

export interface RekapJenis {
  jenis: JenisPemilihan
  pemilihan_umum_id: number
  nama: string
  slug: string
  status: string
  total_suara_masuk: number
  chart: RekapChart
  detail: RekapDetail[]
  partisipasi: Partisipasi
  /** `null` saat belum ada suara sama sekali. */
  unggul_sementara: UnggulSementara | null
}

export interface RekapResponse extends ApiEnvelope<RekapJenis[]> {
  filter: { jenis: JenisPemilihan | null }
  data_by_jenis: Record<JenisPemilihan, RekapJenis>
}

// ===== Aktivitas vote =====

/**
 * ponytail: `label` satu-satunya field yang dikonfirmasi; sisanya belum pernah
 * terisi karena belum ada vote di DB saat types ini ditulis. Render `label`
 * saja, sisakan untuk request ulang setelah polling pertama.
 */
export interface AktivitasItem {
  label?: string
  [key: string]: unknown
}

export interface AktivitasResponse extends ApiEnvelope<AktivitasItem[]> {
  filter: { jenis: JenisPemilihan | null }
  pagination: Pagination
}

// ===== Pemilihan umum =====

export interface Kandidat {
  id: number
  pemilihan_umum_id: number
  nomor: number
  nama: string
  kelas: string | null
  foto_url: string | null
  visi: string | null
  misi: string | null
  deskripsi: string | null
  created_at?: string
  updated_at?: string
}

export interface PemilihanUmum {
  id: number
  nama: string
  jenis: JenisPemilihan
  slug: string
  deskripsi: string | null
  status: string
  dibuat_oleh: number | null
  created_at?: string
  updated_at?: string
  kandidat: Kandidat[]
}

export interface PemilihanUmumResponse {
  success: boolean
  data: PemilihanUmum[]
  status_pemilihan: StatusPemilihan
  selesai: boolean
  redirect_to: string | null
}

// ===== Auth =====

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    status_pemilihan: StatusPemilihan
    selesai: boolean
    redirect_to: string | null
  }
}

export interface MeResponse {
  success: boolean
  data: {
    user: User
    status_pemilihan: StatusPemilihan
    selesai: boolean
    redirect_to: string | null
  }
}

export interface VoteResponse {
  success: boolean
  message?: string
  data?: {
    selesai?: boolean
    redirect_to?: string | null
  }
}

// ===== Import =====

export interface ImportStatusData {
  queue_pending: number
  queue_failed: number
  total_users: number
}

export type ImportStatusResponse = ApiEnvelope<ImportStatusData>

// ===== Error =====

export interface MessageResponse {
  success?: boolean
  message: string
}

export interface ValidationErrors {
  message: string
  errors?: Record<string, string[]>
}

// ===== Query params =====

export interface DashboardParams {
  search?: string
  /** `belum` | `sudah`. */
  status?: string
  /** `osis` | `mpk`. */
  jenis?: JenisPemilihan | ''
  /** Nama kelas untuk filter, mis. `XII RPL 1`. */
  kelas?: string
  per_page?: number
  page?: number
}

export interface AktivitasParams {
  per_page?: number
  jenis?: JenisPemilihan | ''
}
