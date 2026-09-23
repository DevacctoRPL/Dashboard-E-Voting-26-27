export interface Siswa {
  id: number
  nisn: string
  nama: string
  kelas: string
  status: 'sudah' | 'belum'
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

export const MOCK_SISWA: Siswa[] = [
  { id: 1, nisn: '0068123456', nama: 'Andi Pratama', kelas: 'XI-1', status: 'sudah' },
  { id: 2, nisn: '0068123457', nama: 'Bella Kinanti', kelas: 'XI-1', status: 'belum' },
  { id: 3, nisn: '0068123458', nama: 'Chandra Wijaya', kelas: 'XI-2', status: 'sudah' },
  { id: 4, nisn: '0068123459', nama: 'Dewi Anggraini', kelas: 'XI-2', status: 'sudah' },
  { id: 5, nisn: '0068123460', nama: 'Eka Saputra', kelas: 'XI-3', status: 'belum' },
  { id: 6, nisn: '0068123461', nama: 'Fitri Ramadhani', kelas: 'XII-1', status: 'sudah' },
  { id: 7, nisn: '0068123462', nama: 'Gilang Permana', kelas: 'XII-1', status: 'belum' },
  { id: 8, nisn: '0068123463', nama: 'Hana Melati Putri', kelas: 'XII-2', status: 'sudah' },
  { id: 9, nisn: '0068123464', nama: 'Indra Kurniawan', kelas: 'XII-2', status: 'sudah' },
  { id: 10, nisn: '0068123465', nama: 'Jihan Nurhaliza', kelas: 'XII-3', status: 'belum' }
]

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
