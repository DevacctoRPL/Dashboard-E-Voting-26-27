<script setup lang="ts">
import { computed, ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import { apiErrorMessage, isSessionExpired } from '@/api/client'
import { dashboard } from '@/api'
import type { DashboardParams, Pemilih } from '@/api/types'
import { exportSiswaToExcel } from '@/utils/exportExcel'
import type { ExportRow } from '@/utils/exportExcel'

type StatusFilter = 'semua' | 'sudah' | 'belum'
type JenisFilter = '' | 'osis' | 'mpk'

const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('semua')
const jenisFilter = ref<JenisFilter>('')
const kelasFilter = ref('')
const page = ref(1)
const perPage = ref(15)

const statusFilters: { id: StatusFilter, label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'sudah', label: 'Sudah Vote' },
  { id: 'belum', label: 'Belum Vote' }
]

const jenisFilters: { id: JenisFilter, label: string }[] = [
  { id: '', label: 'Semua' },
  { id: 'osis', label: 'OSIS' },
  { id: 'mpk', label: 'MPK' }
]

// ponytail: search debounce 400ms — tiap ketik tak tembak API.
const debouncedSearch = refDebounced(searchQuery, 400)
const params = computed<DashboardParams>(() => ({
  search: debouncedSearch.value.trim(),
  status: statusFilter.value === 'semua' ? undefined : statusFilter.value,
  jenis: jenisFilter.value,
  kelas: kelasFilter.value || undefined,
  per_page: perPage.value,
  page: page.value
}))

const { data, status, error } = await useAsyncData(
  'data-pemilih',
  () => dashboard(params.value),
  { server: false, lazy: true, dedupe: 'defer', watch: [params] }
)

// Server memfilter; hasil tiap ubah filter harus balik ke halaman 1.
watch([debouncedSearch, statusFilter, jenisFilter, kelasFilter, perPage], () => {
  if (page.value !== 1) page.value = 1
})

const summary = computed(() => data.value?.summary ?? null)
const pagination = computed(() => data.value?.pagination ?? null)
const serverRows = computed<Pemilih[]>(() => data.value?.data ?? [])
const isLoading = computed(() => status.value === 'pending')

/** Dibanding case-insensitive supaya "xii rpl 1" tetap ketemu "XII RPL 1". */
const sameKelas = (a: string | null | undefined, b: string) =>
  (a ?? '').trim().toLowerCase() === b.trim().toLowerCase()

/** Backend live belum tentu bisa filter kelas, jadi tetap saring di sisi klien. */
const rows = computed<Pemilih[]>(() =>
  kelasFilter.value
    ? serverRows.value.filter(item => sameKelas(item.kelas, kelasFilter.value))
    : serverRows.value
)

/**
 * Backend yang jalan belum punya endpoint daftar kelas distinct, jadi kita
 * ambil sendiri: sekali jalan, page through SELURUH data (per_page 500) lalu
 * kumpulkan nilai `kelas`-nya. Hasilnya disimpan permanen di `kelasOptions`
 * sehingga tidak ikut berubah saat tabel di-paginasi atau di-filter.
 */
const kelasOptions = ref<string[]>([])
const kelasLoading = ref(false)
const kelasError = ref('')
const kelasLoaded = ref(false)

/** Ungkap kelas yang kebetulan sudah ada di halaman ini biar dropdown tidak kosong. */
const mergeKelas = (rows: Pemilih[]) => {
  const merged = new Set(kelasOptions.value)
  for (const item of rows) {
    const value = item.kelas?.trim()
    if (value) merged.add(value)
  }
  kelasOptions.value = [...merged].sort((a, b) => a.localeCompare(b, 'id'))
}

watch(serverRows, items => mergeKelas(items), { immediate: true })

const loadSemuaKelas = async () => {
  if (kelasLoading.value || kelasLoaded.value) return
  kelasLoading.value = true
  kelasError.value = ''

  try {
    // Tanpa filter apa pun: yang dibutuhkan daftar kelas selruh siswa, bukan
    // kelas yang kebetulan ada di halaman tabel sekarang.
    const seen = new Set<string>()
    let pageNow = 1
    let lastPage = 1

    do {
      const res = await dashboard({ per_page: 500, page: pageNow })
      for (const item of res.data) {
        const value = item.kelas?.trim()
        if (value) seen.add(value)
      }
      lastPage = res.pagination.last_page
      pageNow += 1
    } while (pageNow <= lastPage)

    kelasOptions.value = [...seen].sort((a, b) => a.localeCompare(b, 'id'))
    kelasLoaded.value = true
  } catch (err) {
    kelasError.value = apiErrorMessage(err)
  } finally {
    kelasLoading.value = false
  }
}

const kelasDropdownOpen = ref(false)
const kelasSearch = ref('')

watch(kelasDropdownOpen, (open) => {
  if (open) loadSemuaKelas()
})

const kelasOptionsFiltered = computed(() => {
  const q = kelasSearch.value.trim().toLowerCase()
  if (!q) return kelasOptions.value
  return kelasOptions.value.filter(item => item.toLowerCase().includes(q))
})

const selectKelas = (value: string) => {
  kelasFilter.value = value
  kelasSearch.value = ''
  kelasDropdownOpen.value = false
}

/**
 * Kalau `pagination.total` masih sebesar total siswa sementara tabel sudah
 * terpotong, artinya backend mengabaikan `?kelas=` — filter ini cuma berlaku
 * untuk halaman yang sedang termuat, bukan seluruh data.
 */
const kelasOnlyHalamanIni = computed(
  () => Boolean(kelasFilter.value)
    && (pagination.value?.total ?? 0) > serverRows.value.length
    && rows.value.length < serverRows.value.length
)

const counts = computed(() => ({
  semua: summary.value?.total_siswa ?? 0,
  sudah: summary.value?.sudah_memilih ?? 0,
  belum: summary.value?.belum_memilih ?? 0
}))

const columns = [
  { accessorKey: 'nama', header: 'Nama' },
  { accessorKey: 'nis', header: 'NIS' },
  { accessorKey: 'kelas', header: 'Kelas' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'sudah_memilih',
    header: 'Status',
    meta: { class: { th: 'pe-6 text-right', td: 'pe-6' } }
  }
]

const roleLabel = (role: string) => role.charAt(0).toUpperCase() + role.slice(1)

/** `voted_jenis` isinya belum pernah terprobe (backend masih `draft`). Tampilkan apa adanya. */
const votedJenis = (item: Pemilih) =>
  item.voting_status.voted_jenis.map(String).filter(Boolean).join(', ')

const exporting = ref(false)
const exportError = ref('')

const handleExport = async () => {
  if (exporting.value) return
  exporting.value = true
  exportError.value = ''

  try {
    // ponytail: backend cap per_page di 500, jadi export harus loop semua
    // halaman — satu halaman aja akan terpotong diam-diam.
    const collected: Pemilih[] = []
    let pageNow = 1
    let lastPage = 1
    do {
      const res = await dashboard({ ...params.value, per_page: 500, page: pageNow })
      collected.push(...res.data)
      lastPage = res.pagination.last_page
      pageNow += 1
    } while (pageNow <= lastPage)

    // Backend live belum tentu menyaring `?kelas=`, jadi rapikan di sini
    // supaya file Excel sama persis dengan yang tampil di tabel.
    const selected = kelasFilter.value.trim()
    const exported = selected
      ? collected.filter(item => sameKelas(item.kelas, selected))
      : collected

    const data: ExportRow[] = exported.map((item, index) => ({
      'No': index + 1,
      'NIS': item.nis,
      'Nama': item.nama,
      'Kelas': item.kelas?.trim() || '-',
      'Role': roleLabel(item.role),
      'Status': item.sudah_memilih ? 'Sudah Vote' : 'Belum Vote',
      'Info Voting': item.voting_status.message,
      'Jenis Dipilih': votedJenis(item) || '-'
    }))

    if (exported.length === 0) {
      exportError.value = 'Tidak ada siswa yang cocok dengan filter kelas.'
      return
    }

    await exportSiswaToExcel(data)
  } catch (err) {
    exportError.value = apiErrorMessage(err)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Page Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[var(--ui-text)]">
          Data Pemilih
        </h1>
        <p class="mt-1 max-w-prose text-sm text-[var(--ui-text-muted)]">
          Pantau rekap Daftar Pemilih Tetap Pemilihan Ketua OSIS &amp; MPK.
        </p>
      </div>

      <UButton
        to="/quick-count"
        variant="outline"
        size="lg"
        icon="i-lucide-chart-pie"
        class="rounded-xl"
      >
        Lihat Quick Count
      </UButton>
    </div>

    <UCard
      variant="outline"
    >
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 dark:text-primary-400">
              <UIcon
                name="i-lucide-users-round"
                class="size-5"
              />
            </span>
            <div>
              <p class="text-base font-bold text-[var(--ui-text)]">
                Daftar Siswa
              </p>
              <p class="text-sm text-[var(--ui-text-dimmed)]">
                <template v-if="pagination">
                  {{ rows.length }} dari {{ pagination.total }} siswa ditampilkan
                </template>
              </p>
            </div>
          </div>

          <div class="flex w-full items-center gap-2 lg:w-auto">
            <UInput
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama / NIS..."
              variant="soft"
              color="neutral"
              icon="i-lucide-search"
              class="w-full lg:w-64"
            />
            <UButton
              icon="i-lucide-download"
              color="primary"
              variant="subtle"
              label="Export"
              class="shrink-0"
              :disabled="rows.length === 0"
              :loading="exporting"
              @click="handleExport"
            />
          </div>
        </div>
      </template>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <button
          v-for="filter in statusFilters"
          :key="filter.id"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors"
          :class="[
            statusFilter === filter.id
              ? 'border-primary-500 bg-primary-500 text-white'
              : 'border-glass-200 bg-glass-100 text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
          ]"
          @click="statusFilter = filter.id"
        >
          {{ filter.label }}
          <span :class="statusFilter === filter.id ? 'text-white/80' : 'text-[var(--ui-text-dimmed)]'">{{ counts[filter.id] }}</span>
        </button>

        <span class="mx-1 h-5 w-px bg-[var(--ui-border)]" />

        <button
          v-for="filter in jenisFilters"
          :key="filter.id || 'semua'"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
          :class="[
            jenisFilter === filter.id
              ? 'border-primary-500 bg-primary-500 text-white'
              : 'border-glass-200 bg-glass-100 text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
          ]"
          @click="jenisFilter = filter.id"
        >
          {{ filter.label }}
        </button>

        <span class="mx-1 h-5 w-px bg-[var(--ui-border)]" />

        <UPopover v-model:open="kelasDropdownOpen">
          <UButton
            icon="i-lucide-school"
            trailing-icon="i-lucide-chevron-down"
            variant="soft"
            color="neutral"
            class="rounded-full font-semibold"
            :class="kelasFilter ? 'text-primary-500 dark:text-primary-400' : 'text-[var(--ui-text-muted)]'"
          >
            {{ kelasFilter || 'Semua Kelas' }}
          </UButton>

          <template #content>
            <div class="w-64 p-1">
              <UInput
                v-model="kelasSearch"
                type="search"
                placeholder="Cari kelas..."
                icon="i-lucide-search"
                variant="soft"
                color="neutral"
                autofocus
                class="w-full"
                :ui="{ base: 'w-full' }"
              />

              <div class="mt-1 max-h-64 overflow-y-auto">
                <p
                  v-if="kelasLoading"
                  class="flex items-center gap-2 px-2 py-3 text-xs text-[var(--ui-text-dimmed)]"
                >
                  <UIcon
                    name="i-lucide-loader-circle"
                    class="size-3.5 animate-spin"
                  />
                  Mengambil semua kelas...
                </p>

                <p
                  v-else-if="kelasError"
                  class="flex items-center justify-between gap-2 px-2 py-3 text-xs text-rose-500 dark:text-rose-400"
                >
                  <span class="min-w-0 truncate">{{ kelasError }}</span>
                  <button
                    type="button"
                    class="shrink-0 font-semibold underline"
                    @click="loadSemuaKelas"
                  >
                    Coba lagi
                  </button>
                </p>

                <button
                  v-if="!kelasLoading && !kelasError"
                  type="button"
                  class="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-[var(--ui-bg-accented)]"
                  :class="kelasFilter === '' ? 'font-semibold text-primary-500 dark:text-primary-400' : 'text-[var(--ui-text)]'"
                  @click="selectKelas('')"
                >
                  Semua Kelas
                  <UIcon
                    v-if="kelasFilter === ''"
                    name="i-lucide-check"
                    class="size-4 shrink-0"
                  />
                </button>

                <template v-if="!kelasLoading && !kelasError">
                  <button
                    v-for="option in kelasOptionsFiltered"
                    :key="option"
                    type="button"
                    class="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-[var(--ui-bg-accented)]"
                    :class="sameKelas(option, kelasFilter) ? 'font-semibold text-primary-500 dark:text-primary-400' : 'text-[var(--ui-text)]'"
                    @click="selectKelas(option)"
                  >
                    <span class="truncate">{{ option }}</span>
                    <UIcon
                      v-if="sameKelas(option, kelasFilter)"
                      name="i-lucide-check"
                      class="size-4 shrink-0"
                    />
                  </button>

                  <p
                    v-if="kelasOptionsFiltered.length === 0"
                    class="px-2 py-3 text-center text-xs text-[var(--ui-text-dimmed)]"
                  >
                    {{ kelasSearch.trim() ? 'Kelas tidak ditemukan.' : 'Belum ada data kelas.' }}
                  </p>
                </template>
              </div>
            </div>
          </template>
        </UPopover>
      </div>

      <p
        v-if="kelasOnlyHalamanIni"
        class="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-600 dark:text-amber-400"
      >
        <UIcon
          name="i-lucide-info"
          class="size-4 shrink-0"
        />
        Server belum memfilter per kelas, jadi yang tersaring hanya {{ pagination?.per_page }} siswa per halaman ini.
      </p>

      <p
        v-if="exportError"
        class="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-500 dark:text-rose-400"
        role="alert"
      >
        <UIcon
          name="i-lucide-circle-alert"
          class="size-4 shrink-0"
        />
        {{ exportError }}
      </p>

      <div
        v-if="error && !isSessionExpired(error)"
        class="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-500 dark:text-rose-400"
        role="alert"
      >
        <UIcon
          name="i-lucide-circle-alert"
          class="size-4 shrink-0"
        />
        {{ apiErrorMessage(error) }}
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!isLoading && rows.length === 0"
        class="flex flex-col items-center justify-center gap-2 py-12 text-center"
      >
        <span class="flex size-12 items-center justify-center rounded-full bg-[var(--ui-bg-accented)] text-[var(--ui-text-dimmed)]">
          <UIcon
            name="i-lucide-search-x"
            class="size-6"
          />
        </span>
        <p class="text-sm font-semibold text-[var(--ui-text)]">
          Tidak ada hasil
        </p>
        <p class="max-w-xs text-xs text-[var(--ui-text-dimmed)]">
          Coba kata kunci lain atau ubah filter status / kelas pemilih.
        </p>
      </div>

      <!-- Mobile: card list -->
      <ul
        v-if="rows.length > 0"
        class="flex flex-col gap-3 md:hidden"
      >
        <li
          v-for="item in rows"
          :key="item.id"
          class="flex flex-col gap-3 rounded-xl border border-glass-200 bg-glass-100 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-[var(--ui-text)]">
                {{ item.nama }}
              </p>
              <p class="font-inter text-xs text-[var(--ui-text-dimmed)]">
                {{ item.nis }} · {{ roleLabel(item.role) }}
              </p>
            </div>
            <UBadge
              :color="item.sudah_memilih ? 'success' : 'error'"
              variant="soft"
              size="sm"
              class="shrink-0"
            >
              {{ item.sudah_memilih ? 'Sudah' : 'Belum' }}
            </UBadge>
          </div>

          <p
            v-if="item.kelas"
            class="flex items-center gap-1.5 text-xs font-medium text-[var(--ui-text-muted)]"
          >
            <UIcon
              name="i-lucide-school"
              class="size-3.5 shrink-0"
            />
            {{ item.kelas }}
          </p>

          <div class="border-t border-[var(--ui-border)] pt-3">
            <p class="font-inter text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-dimmed)]">
              Info Voting
            </p>
            <p class="truncate text-xs text-[var(--ui-text-muted)]">
              {{ item.voting_status.message }}
            </p>
          </div>
        </li>
      </ul>

      <!-- Desktop: table -->
      <div
        v-if="rows.length > 0"
        class="hidden md:block"
      >
        <UTable
          :data="rows"
          :columns="columns"
          :loading="isLoading"
          sticky="header"
          class="[&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[var(--ui-bg-accented)]/50"
        >
          <template #kelas-cell="{ row }">
            <span
              v-if="row.original.kelas"
              class="whitespace-nowrap font-inter text-xs font-medium text-[var(--ui-text-muted)]"
            >
              {{ row.original.kelas }}
            </span>
            <span
              v-else
              class="font-inter text-xs text-[var(--ui-text-dimmed)]"
            >-</span>
          </template>

          <template #role-cell="{ row }">
            <UBadge
              color="neutral"
              variant="soft"
              size="sm"
            >
              {{ roleLabel(row.original.role) }}
            </UBadge>
          </template>

          <template #sudah_memilih-cell="{ row }">
            <div class="flex justify-end">
              <UBadge
                :color="row.original.sudah_memilih ? 'success' : 'error'"
                variant="soft"
                size="sm"
              >
                <template #leading>
                  <UIcon
                    :name="row.original.sudah_memilih ? 'i-lucide-check-circle-2' : 'i-lucide-clock-3'"
                    class="size-3.5"
                  />
                </template>
                {{ row.original.sudah_memilih ? 'Sudah Vote' : 'Belum Vote' }}
              </UBadge>
            </div>
          </template>
        </UTable>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.last_page > 1"
        class="mt-4 flex flex-wrap items-center justify-between gap-3"
      >
        <UPagination
          v-model:page="page"
          :items-per-page="pagination.per_page"
          :total="pagination.total"
        />
        <USelect
          v-model="perPage"
          :items="[
            { label: '15 per halaman', value: 15 },
            { label: '30 per halaman', value: 30 },
            { label: '50 per halaman', value: 50 },
            { label: '100 per halaman', value: 100 }
          ]"
          class="w-40"
        />
      </div>
    </UCard>
  </div>
</template>
