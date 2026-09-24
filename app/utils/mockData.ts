export interface Siswa {
  id: number
  nisn: string
  nama: string
  kelas: string
  status: 'sudah' | 'belum'
  osis?: number // id kandidat OSIS yang dipilih
  mpk?: number // id kandidat MPK yang dipilih
  votedAt?: string // ISO timestamp
}

export interface Kandidat {
  id: number
  nama: string
  visi: string
  jumlahSuara: number
  warna: string
}

export interface VoteEvent {
  label: string
  deskripsi: string
  kandidat: Kandidat[]
}

export interface VoteResults {
  osis: VoteEvent
  mpk: VoteEvent
}

export interface MockStats {
  totalSiswa: number
  sudahVote: number
  belumVote: number
}

export const MOCK_STATS: MockStats = {
  totalSiswa: 1320,
  sudahVote: 987,
  belumVote: 333
}

// ponytail: jumlah suara & statistik tetap angka static terpisah dari daftar siswa mock
// (10 record tidak di-drive balik). Data asli nanti datang dari API agar konsisten.
export const MOCK_SISWA: Siswa[] = [
  { id: 1, nisn: '0068123456', nama: 'Andi Pratama', kelas: 'XI-1', status: 'sudah', osis: 1, mpk: 2, votedAt: new Date(Date.now() - 4 * 60000).toISOString() },
  { id: 2, nisn: '0068123457', nama: 'Bella Kinanti', kelas: 'XI-1', status: 'belum' },
  { id: 3, nisn: '0068123458', nama: 'Chandra Wijaya', kelas: 'XI-2', status: 'sudah', osis: 2, mpk: 1, votedAt: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 4, nisn: '0068123459', nama: 'Dewi Anggraini', kelas: 'XI-2', status: 'sudah', osis: 1, mpk: 3, votedAt: new Date(Date.now() - 28 * 60000).toISOString() },
  { id: 5, nisn: '0068123460', nama: 'Eka Saputra', kelas: 'XI-3', status: 'belum' },
  { id: 6, nisn: '0068123461', nama: 'Fitri Ramadhani', kelas: 'XII-1', status: 'sudah', osis: 3, mpk: 1, votedAt: new Date(Date.now() - 55 * 60000).toISOString() },
  { id: 7, nisn: '0068123462', nama: 'Gilang Permana', kelas: 'XII-1', status: 'belum' },
  { id: 8, nisn: '0068123463', nama: 'Hana Melati Putri', kelas: 'XII-2', status: 'sudah', osis: 2, mpk: 2, votedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 9, nisn: '0068123464', nama: 'Indra Kurniawan', kelas: 'XII-2', status: 'sudah', osis: 1, mpk: 3, votedAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 10, nisn: '0068123465', nama: 'Jihan Nurhaliza', kelas: 'XII-3', status: 'belum' }
]

export function getKandidat(event: 'osis' | 'mpk', id?: number): Kandidat | undefined {
  if (id === undefined) {
    return undefined
  }
  return MOCK_VOTE_RESULTS[event].kandidat.find(k => k.id === id)
}

export const MOCK_VOTE_RESULTS: VoteResults = {
  osis: {
    label: 'Pemilihan Ketua OSIS',
    deskripsi: 'Perolehan suara sementara untuk Pemilihan Ketua OSIS 2026/2027.',
    kandidat: [
      {
        id: 1,
        nama: 'Raka Aditya',
        visi: 'OSIS Inovatif & Berprestasi',
        jumlahSuara: 412,
        warna: '#1677FF'
      },
      {
        id: 2,
        nama: 'Salsabila Zahra',
        visi: 'Wadah Kreativitas Siswa',
        jumlahSuara: 356,
        warna: '#5CB8FF'
      },
      {
        id: 3,
        nama: 'Bagas Prakoso',
        visi: 'Solidaritas & Kolaborasi',
        jumlahSuara: 219,
        warna: '#AAB7C4'
      }
    ]
  },
  mpk: {
    label: 'Pemilihan Anggota MPK',
    deskripsi: 'Perolehan suara sementara untuk Pemilihan Anggota MPK 2026/2027.',
    kandidat: [
      {
        id: 1,
        nama: 'Nadia Safira',
        visi: 'Transparansi Aspirasi Siswa',
        jumlahSuara: 388,
        warna: '#22C55E'
      },
      {
        id: 2,
        nama: 'Dimas Ardiansyah',
        visi: 'Kritis & Aspiratif',
        jumlahSuara: 341,
        warna: '#1677FF'
      },
      {
        id: 3,
        nama: 'Risty Oktaviani',
        visi: 'Pengawasan Berintegritas',
        jumlahSuara: 258,
        warna: '#5CB8FF'
      }
    ]
  }
}
