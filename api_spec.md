# API Spec: Evoting Backend (OSIS & MPK)

Dokumen ini disusun dari Postman collection **"Evoting Backend (OSIS & MPK)"** (schema v2.1.0).
Hanya informasi yang benar-benar ada di collection (request, deskripsi, dan test script) yang ditulis sebagai fakta. Hal yang **tidak** tertera di collection ditandai `⚠️ Tidak terdokumentasi` supaya tidak ada tebakan yang tampak seperti fakta.

---

## 1. Informasi Umum

| Item | Nilai |
|---|---|
| Base URL (default) | `http://localhost:8000/api` (variable `baseUrl`) |
| Framework (indikasi) | Laravel (disebut `php artisan migrate`, queue, log Laravel) |
| Format request | JSON (`Content-Type: application/json`), kecuali import (`multipart/form-data`) |
| Format response | JSON (`Accept: application/json`) |
| Autentikasi | Bearer token (`Authorization: Bearer <token>`) |
| Real-time | Belum ada websocket. Gunakan polling 10–15 detik untuk feed aktivitas |

### Header standar

```
Accept: application/json
Content-Type: application/json      # untuk request dengan body JSON
Authorization: Bearer {{token}}     # semua endpoint kecuali POST /login
```

### Autentikasi

- Auth level collection: **Bearer `{{token}}`**. Semua endpoint mewarisinya, kecuali `POST /login` yang di-set `noauth`.
- Token didapat dari `data.token` pada response login.
- Token lama otomatis dicabut saat login ulang (per deskripsi endpoint Logout).

### Role

| Role | Nilai valid |
|---|---|
| Role user | `admin`, `siswa`, `guru` |

- Endpoint folder **Admin** digunakan dengan login sebagai admin. Pernyataan **403** untuk non-admin hanya tercantum eksplisit di deskripsi folder *"2. Admin - Dashboard & Rekap"* (lihat [Catatan #10](#2-ringkasan-endpoint)).
- Endpoint folder **Siswa** dipakai dengan login sebagai siswa.

### Collection variables

| Variable | Default | Keterangan |
|---|---|---|
| `baseUrl` | `http://localhost:8000/api` | Base URL API |
| `token` | *(kosong)* | Diisi otomatis oleh test script login |
| `adminNis` | `ADM001` | NIS admin untuk testing |
| `adminPassword` | `password` | Password admin untuk testing |
| `siswaNis` | `S001` | NIS siswa untuk testing |
| `siswaPassword` | `password` | Password siswa untuk testing |
| `pemilihanUmumId` | `1` | Diisi otomatis oleh request Daftar Pemilihan |
| `kandidatId` | `1` | Diisi otomatis oleh request Daftar Pemilihan |

### Prasyarat

Jalankan `php artisan migrate` agar kolom kandidat (`visi`, `misi`, `kelas`, `foto_url`, `deskripsi`) tersedia.

### Test script di collection

Collection berisi 19 request; 5 di antaranya punya test script. Test script ini sumber utama fakta tentang nama field response, jadi beberapa bagian dokumen ini mengutip apa yang dibaca script tersebut.

| Request | Efek samping test script |
|---|---|
| *Login Admin* | set variable `token` dari `data.token` |
| *Login Siswa* | set variable `token` (menimpa token sebelumnya) |
| *Daftar Pemilihan (dengan status vote)* | set `pemilihanUmumId` dari `data[0].id` dan `kandidatId` dari `data[0].kandidat[0].id` |
| *Rekap Suara - Semua Jenis* | hanya `console.log`, tidak menyimpan apa pun |
| *Vote - OSIS* | hanya `console.log`, tidak menyimpan apa pun |

Sisa 14 request tidak punya test script, termasuk *Vote - MPK* yang body-nya merupakan salinan dari *Vote - OSIS*.

---

## 2. Ringkasan Endpoint

| # | Method | Path | Auth | Akses | Deskripsi |
|---|---|---|---|---|---|
| 1 | POST | `/login` | Tidak | Publik | Login admin/siswa |
| 2 | GET | `/me` | Bearer | Login | User aktif + `status_pemilihan` |
| 3 | POST | `/logout` | Bearer | Login | Hapus token aktif |
| 4 | GET | `/dashboard` | Bearer | Admin | Statistik global + daftar pemilih (paginasi) |
| 5 | GET | `/rekap-suara` | Bearer | Admin | Rekap suara + data quick count |
| 6 | GET | `/aktivitas-vote` | Bearer | Admin | Feed vote terbaru |
| 7 | GET | `/pemilihan-umum` | Bearer | Siswa | Daftar pemilihan + kandidat + status vote |
| 8 | POST | `/vote` | Bearer | Siswa | Simpan suara |
| 9 | POST | `/kandidat` | Bearer | ⚠️ Lihat catatan | Tambah kandidat |
| 10 | POST | `/users/register` | Bearer | Admin ⚠️ | Tambah satu user |
| 11 | POST | `/import/users` | Bearer | Admin ⚠️ | Import user dari Excel/CSV (async) |
| 12 | GET | `/import/users/status` | Bearer | Admin ⚠️ | Progres import |

> ⚠️ **Catatan #9:** Di Postman, `POST /kandidat` berada di folder *"Siswa - Pemilihan & Voting"*, padahal secara fungsi ini operasi tambah data. Collection tidak menyebut role yang diizinkan. Konfirmasi ke backend.

> ⚠️ **Catatan #10:** Akses `Admin` pada baris 10–12 disimpulkan dari **nama folder** saja, bukan dari deskripsi. Folder *"4. Admin - User & Import"* hanya berbunyi "Kelola user siswa dan import dari Excel" dan tidak menyebut kode 403. Pernyataan 403 hanya tercantum eksplisit di deskripsi folder *"2. Admin - Dashboard & Rekap"*. Konfirmasi ke backend apakah folder 4 juga menolak non-admin dengan 403.

---

## 3. Auth

### 3.1 POST `/login`

Login. Auth: **tidak perlu token**. Token otomatis disimpan ke variable `token` oleh test script.

**Body (JSON)**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `nis` | string | Ya | NIS user (admin memakai NIS juga, contoh `ADM001`) |
| `password` | string | Ya | Password |

```json
{
  "nis": "S001",
  "password": "password"
}
```

**Response (field yang terkonfirmasi dari test script)**

| Field | Keterangan |
|---|---|
| `data.token` | Bearer token, dipakai untuk request berikutnya |
| `message` | Pesan (dibaca saat login gagal) |
| `data.selesai` | Dibaca pada login **admin** |
| `data.redirect_to` | Dibaca pada login **admin**; tujuan redirect frontend |
| `data.status_pemilihan.sudah_vote_osis` | Dibaca pada login **siswa** |
| `data.status_pemilihan.sudah_vote_mpk` | Dibaca pada login **siswa** |

Contoh bentuk (hanya field yang terkonfirmasi, nilai ilustrasi). **Field bergantung role** — jangan diasumsikan keduanya selalu ada di response yang sama.

**Login admin** — field yang dibaca test script *Login Admin*:

```json
{
  "data": {
    "token": "…",
    "selesai": false,
    "redirect_to": "…"
  }
}
```

**Login siswa** — field yang dibaca test script *Login Siswa*:

```json
{
  "data": {
    "token": "…",
    "status_pemilihan": {
      "sudah_vote_osis": false,
      "sudah_vote_mpk": false
    }
  }
}
```

> `selesai` dan `redirect_to` hanya dibaca pada request *Login Admin*, sedangkan `status_pemilihan` hanya dibaca pada *Login Siswa*. Keduanya adalah request ke endpoint yang sama (`POST /login`), jadi bentuk response sebenarnya perlu diverifikasi di kedua skenario tersebut.

⚠️ Tidak terdokumentasi: apakah `selesai`, `redirect_to`, dan `status_pemilihan` benar-benar hanya ada sesuai role atau selalu dikirim apa adanya; wrapper `success`/`message` pada login sukses; data user (id, nama, role); format `redirect_to`; kode error dan body error (login gagal).

### 3.2 GET `/me`

User yang sedang login beserta `status_pemilihan`. Dipakai untuk cek session masih valid.

- Auth: Bearer
- Body/query: tidak ada

⚠️ Tidak terdokumentasi: struktur lengkap response (di luar `status_pemilihan`) dan bentuk error saat token tidak valid atau kadaluarsa. Collection tidak menyebut kode status maupun nama library autentikasi yang dipakai.

### 3.3 POST `/logout`

Hapus token aktif.

- Auth: Bearer
- Body: tidak ada

⚠️ Tidak terdokumentasi: bentuk response.

---

## 4. Admin: Dashboard & Rekap

> Semua endpoint di bagian ini wajib login sebagai **admin**, selain itu **403**. Aturan ini diambil dari deskripsi folder *"2. Admin - Dashboard & Rekap"* di collection, satu-satunya folder yang menyebut kode 403 secara eksplisit. Untuk bagian 6, lihat [Catatan #10](#2-ringkasan-endpoint) — di sana akses admin hanya disimpulkan dari nama folder.

### 4.1 GET `/dashboard`

Kartu statistik global + daftar pemilih (halaman pertama secara default).

**Query params**

| Param | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `search` | string | Tidak | *(kosong)* | Cari di `nama` atau `nis` |
| `status` | string | Tidak | *(kosong)* | `belum` atau `sudah`. Kosong = semua |
| `jenis` | string | Tidak | *(kosong)* | `osis` atau `mpk`. Kosong = semua |
| `per_page` | integer | Tidak | `15` | Rentang 1–500 |
| `page` | integer | Tidak | `1` | Nomor halaman |

**Contoh**

```
GET {{baseUrl}}/dashboard
GET {{baseUrl}}/dashboard?search=&status=belum&jenis=&per_page=15&page=1
GET {{baseUrl}}/dashboard?per_page=500&search=&status=&jenis=
```

**Field response yang disebut di collection**

| Field | Keterangan |
|---|---|
| `summary` | Statistik **global**, tidak berubah karena paginasi |
| `summary.total_siswa` | Seluruh siswa |
| `summary.total_siswa_terfilter` | Jumlah siswa hasil filter |
| `pagination.total` | Total baris (dipakai untuk memutuskan perlu loop halaman atau tidak) |
| `pagination.last_page` | Halaman terakhir |

**Catatan penggunaan (export Excel):** `per_page` maksimal 500. Jika `pagination.total` > 500, frontend loop `page=1` sampai `last_page`, lalu gabungkan hasilnya.

⚠️ Tidak terdokumentasi: nama key array daftar pemilih dan field per baris, serta field `summary` lainnya.

### 4.2 GET `/rekap-suara`

Ringkasan per event + data quick count untuk pie chart.

**Query params**

| Param | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `jenis` | string | Tidak | `osis` atau `mpk`. Nilai lain → **422** |

**Contoh**

```
GET {{baseUrl}}/rekap-suara
GET {{baseUrl}}/rekap-suara?jenis=osis
GET {{baseUrl}}/rekap-suara?jenis=mpk
```

**Field response yang terkonfirmasi**

| Field | Keterangan |
|---|---|
| `data` | Array (format versi lama) |
| `data_by_jenis` | Object dengan key `osis` / `mpk`. Direkomendasikan untuk frontend agar tidak perlu `.find()` |
| `data_by_jenis.{jenis}.unggul_sementara.nama` | Nama kandidat unggul sementara |
| `data_by_jenis.{jenis}.unggul_sementara.persen` | Persentase kandidat unggul |
| `data_by_jenis.{jenis}.chart.percentages` | Data persentase untuk pie chart |
| `data_by_jenis.{jenis}.participasi.belum_memilih` | Jumlah yang belum memilih |

Catatan: warna pie chart **tidak** dikirim API; gunakan palet warna lokal di frontend. `unggul_sementara` dicek kemungkinan kosong oleh script (bisa falsy jika belum ada suara, belum dikonfirmasi).

### 4.3 GET `/aktivitas-vote`

Feed vote terbaru untuk kartu "Aktivitas Vote Terbaru". Data sudah diurutkan dari yang terbaru.

**Query params**

| Param | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `per_page` | integer | Tidak | `10` | Rentang 1–100 |
| `jenis` | string | Tidak | *(kosong)* | `osis` atau `mpk`. Kosong = semua |

**Contoh**

```
GET {{baseUrl}}/aktivitas-vote?per_page=10&jenis=
GET {{baseUrl}}/aktivitas-vote?jenis=mpk
```

Field yang disebut: `label`, sudah diformat `Paslon 2 - Nama`.

Belum ada websocket → polling tiap 10–15 detik.

⚠️ Tidak terdokumentasi: key array dan field lain per item (misalnya waktu vote).

---

## 5. Siswa: Pemilihan & Voting

> Login sebagai **siswa**, bukan admin.

### 5.1 GET `/pemilihan-umum`

Daftar pemilihan + kandidat + status voting user dalam satu request.

- Auth: Bearer
- Body/query: tidak ada

**Field response yang terkonfirmasi**

| Field | Keterangan |
|---|---|
| `data[]` | Array pemilihan |
| `data[].id` | ID pemilihan (dipakai sebagai `pemilihan_umum_id` saat vote) |
| `data[].kandidat[]` | Array kandidat milik pemilihan |
| `data[].kandidat[].id` | ID kandidat (dipakai sebagai `kandidat_id` saat vote) |
| `status_pemilihan.sudah_vote_osis` | Boolean |
| `status_pemilihan.sudah_vote_mpk` | Boolean |
| `status_pemilihan.detail.{osis\|mpk}.sudah_vote` | Dipakai untuk menentukan tombol "Pilih" atau "Sudah memilih" |
| `redirect_to` | Tujuan redirect frontend |

Catatan: test script menyimpan `data[0].id` → `pemilihanUmumId` dan `data[0].kandidat[0].id` → `kandidatId`.

> ⚠️ **Inkonsistensi struktur:** pada `/login` (siswa) `status_pemilihan` dibaca dari `res.data.status_pemilihan`, sedangkan pada `/pemilihan-umum` dibaca dari `res.status_pemilihan` (top-level). Verifikasi response aslinya.

⚠️ Tidak terdokumentasi: field pemilihan lain (judul, jenis, status, tanggal) dan field kandidat lain di response ini.

### 5.2 POST `/vote`

Simpan suara.

**Body (JSON)**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `pemilihan_umum_id` | integer | Ya | ID pemilihan (OSIS atau MPK) |
| `kandidat_id` | integer | Ya | ID kandidat; harus milik pemilihan tersebut |

```json
{
  "pemilihan_umum_id": 1,
  "kandidat_id": 1
}
```

> **Catatan interpolasi Postman:** di collection, kedua value di-embed sebagai `{{pemilihanUmumId}}` dan `{{kandidatId}}` **tanpa tanda kutip**, sedangkan kedua variable itu bertipe `string` di tab Variables. Kalau variable kosong atau berisi teks, body akan menjadi JSON tidak valid. Pastikan keduanya terisi (mis. dengan menjalankan *Daftar Pemilihan* lebih dulu) sebelum mengirim request.

**Aturan bisnis**

- Pemilihan harus berstatus `active`.
- Kandidat harus milik pemilihan yang dipilih.
- Satu user hanya bisa vote **sekali per pemilihan**. Vote kedua → **422**.
- Untuk vote MPK, gunakan `pemilihan_umum_id` pemilihan MPK (jalankan `GET /pemilihan-umum` dulu untuk ID yang benar).

**Field response yang terkonfirmasi**

| Field | Keterangan |
|---|---|
| `success` | Boolean |
| `data.selesai` | Jika `true`, arahkan frontend ke `data.redirect_to` |
| `data.redirect_to` | Tujuan redirect |

**Error**

| Status | Kondisi |
|---|---|
| 422 | Sudah vote di pemilihan ini |

⚠️ Tidak terdokumentasi: kode/body error untuk pemilihan tidak aktif atau kandidat tidak cocok (kemungkinan juga 422, belum dikonfirmasi).

### 5.3 POST `/kandidat`

Tambah kandidat baru.

**Body (JSON)**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `pemilihan_umum_id` | integer | Ya (contoh selalu menyertakan) | Pemilihan tempat kandidat ditambahkan |
| `nomor` | integer | Ya (contoh selalu menyertakan) | Nomor urut; **unik per pemilihan** |
| `nama` | string | Ya (contoh selalu menyertakan) | Nama kandidat |
| `kelas` | string | Tidak | Nullable |
| `foto_url` | string | Tidak | Nullable |
| `visi` | string | Tidak | Nullable |
| `misi` | string | Tidak | Nullable |
| `deskripsi` | string | Tidak | Nullable |

```json
{
  "pemilihan_umum_id": 1,
  "nomor": 3,
  "nama": "Kandidat 3",
  "kelas": "XII IPA 1",
  "foto_url": "https://example.com/foto.jpg",
  "visi": "Sekolah lebih baik",
  "misi": "Membangun generasi unggul",
  "deskripsi": "Pengalaman organisasi"
}
```

Catatan: status wajib/opsional `pemilihan_umum_id`, `nomor`, `nama` disimpulkan dari contoh body; collection hanya eksplisit menyebut `kelas`, `foto_url`, `visi`, `misi`, `deskripsi` sebagai opsional (semua boleh null).

> **Catatan interpolasi Postman:** pada request ini, `pemilihan_umum_id` juga di-embed sebagai `{{pemilihanUmumId}}` **tanpa tanda kutip**, sementara `nomor` ditulis sebagai angka literal `3`. Konsekuensinya, kandidat baru akan ditambahkan ke pemilihan yang tersimpan di variable tersebut — pastikan bukan pemilihan yang tidak diinginkan.

⚠️ Tidak terdokumentasi: bentuk response dan error (duplikat `nomor` kemungkinan 422).

---

## 6. Admin: User & Import

### 6.1 POST `/users/register`

Tambah satu user.

**Body (JSON)**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `nis` | string | Ya | Harus unik |
| `nama` | string | Ya | Nama user |
| `password` | string | Ya | Dikirim apa adanya |
| `role` | string | Ya | `admin`, `siswa`, atau `guru` |

```json
{
  "nis": "2026001",
  "nama": "Budi Santoso",
  "password": "rahasia123",
  "role": "siswa"
}
```

Catatan dari collection: password dikirim apa adanya, sehingga untuk production sebaiknya password sudah di-hash di sisi pemanggil atau gunakan import Excel.

⚠️ Tidak terdokumentasi: bentuk response dan error (NIS duplikat / role tidak valid kemungkinan 422).

### 6.2 POST `/import/users`

Import user dari Excel, diproses di **background queue**.

**Body (`multipart/form-data`)**

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `file` | file | Ya | `.xlsx`, `.xls`, atau `.csv`. Maksimal **10 MB** |

**Format kolom di file**

| Header | Wajib | Keterangan |
|---|---|---|
| `nis` | Ya | |
| `nama` | Ya | Header `name` juga diterima sebagai pengganti `nama` |
| `role` | Ya | `admin`, `siswa`, atau `guru` |

- Password awal semua user hasil import: **`password`**.
- Header `Content-Type` **tidak** diset manual (biarkan client mengisi boundary multipart).

**Response**

| Status | Arti |
|---|---|
| 202 | File diterima, **belum** berarti selesai diproses. Cek endpoint status untuk progres |

⚠️ Tidak terdokumentasi: body response 202 dan error validasi file.

### 6.3 GET `/import/users/status`

Cek progres import.

**Field response yang disebut**

| Field | Keterangan |
|---|---|
| `queue_pending` | Job yang masih antre |
| `queue_failed` | Job yang gagal. Jika naik, cek log Laravel |
| `total_users` | Total user di database |

⚠️ Tidak terdokumentasi: apakah field berada di dalam `data` atau top-level.

---

## 7. Alur Penggunaan

**Alur siswa**

1. `POST /login` (NIS siswa) → simpan `data.token`.
2. `GET /pemilihan-umum` → ambil pemilihan, kandidat, dan status vote.
3. `POST /vote` untuk OSIS, lalu `POST /vote` untuk MPK (`pemilihan_umum_id` berbeda).
4. Saat `data.selesai == true`, redirect ke `data.redirect_to`.
5. `POST /logout`.

> **Catatan Postman:** request *Logout* tidak mengosongkan variable `token`, sehingga request berikutnya masih mengirim token lama. Setelah logout, kosongkan `token` secara manual atau login ulang (login baru otomatis menimpa variable `token`).

**Alur admin**

1. `POST /login` (NIS admin).
2. `GET /dashboard`, `GET /rekap-suara`, `GET /aktivitas-vote` (polling 10–15 detik).
3. Kelola user: `POST /users/register` atau `POST /import/users` lalu pantau `GET /import/users/status`.

---

## 8. Ringkasan Kode Status yang Disebut di Collection

| Kode | Konteks |
|---|---|
| 202 | `POST /import/users`, file diterima untuk diproses di background |
| 403 | Endpoint di folder *"2. Admin - Dashboard & Rekap"* diakses tanpa role admin. (Belum dikonfirmasi untuk folder *"4. Admin - User & Import"* — lihat [Catatan #10](#2-ringkasan-endpoint)) |
| 422 | `GET /rekap-suara?jenis=` dengan nilai selain `osis`/`mpk`; vote kedua pada pemilihan yang sama |

Kode lain (200, 201, 401, 404, dst.) tidak disebut di collection.

---

## 9. Daftar Hal yang Perlu Dikonfirmasi ke Backend

1. Struktur lengkap response semua endpoint (collection tidak menyertakan contoh response tersimpan).
2. Format envelope response yang konsisten (`success`, `message`, `data`).
3. Role yang diizinkan untuk `POST /kandidat`.
4. Konsistensi lokasi `status_pemilihan` (`data.status_pemilihan` vs top-level).
5. Kode dan body error untuk login gagal, token tidak valid, dan validasi lainnya.
6. Field daftar pemilih pada `/dashboard` dan field item pada `/aktivitas-vote`.
7. Endpoint untuk edit/hapus kandidat, dan pengelolaan pemilihan (tidak ada di collection).
8. Kode status dan body error saat Bearer token tidak valid atau sudah kadaluarsa (collection tidak menyebut apa pun, termasuk nama library autentikasinya).
9. Apakah folder *"4. Admin - User & Import"* juga menolak non-admin dengan **403**, seperti folder *"2. Admin - Dashboard & Rekap"* (lihat [Catatan #10](#2-ringkasan-endpoint)).
10. Apakah `selesai`, `redirect_to`, dan `status_pemilihan` pada `POST /login` benar-benar bergantung role, atau selalu dikirim apa adanya.
11. Keberadaan endpoint untuk edit/hapus kandidat, edit pemilihan, dan set status pemilihan (`active`/selesai) — `POST /vote` mensyaratkan pemilihan berstatus `active`, tapi tidak ada endpoint untuk mengubahnya di collection.