<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { apiErrorMessage } from '@/api/client'
import { dashboard } from '@/api'
import type { DashboardParams, Pemilih } from '@/api/types'
import { exportSiswaToExcel } from '@/utils/exportExcel'
import type { ExportRow } from '@/utils/exportExcel'

type StatusFilter = 'semua' | 'sudah' | 'belum'
type JenisFilter = '' | 'osis' | 'mpk'

const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('semua')
const jenisFilter = ref<JenisFilter>('')
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

const params = computed<DashboardParams>(() => ({
  search: searchQuery.value.trim(),
  status: statusFilter.value === 'semua' ? undefined : statusFilter.value,
  jenis: jenisFilter.value,
  per_page: perPage.value,
  page: page.value
}))

const { data, status, error } = await useAsyncData(
  'data-pemilih',
  () => dashboard(params.value),
  { server: false, watch: [params] }
)

// Server memfilter; hasil tiap ubah filter harus balik ke halaman 1.
watch([searchQuery, statusFilter, jenisFilter], () => {
  page.value = 1
})

const summary = computed(() => data.value?.summary ?? null)
const pagination = computed(() => data.value?.pagination ?? null)
const rows = computed<Pemilih[]>(() => data.value?.data ?? [])
const isLoading = computed(() => status.value === 'pending')

const counts = computed(() => ({
  semua: summary.value?.total_siswa ?? 0,
  sudah: summary.value?.sudah_memilih ?? 0,
  belum: summary.value?.belum_memilih ?? 0
}))

const columns = [
  { accessorKey: 'nama', header: 'Nama' },
  { accessorKey: 'nis', header: 'NIS' },
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

    const data: ExportRow[] = collected.map((item, index) => ({
      'No': index + 1,
      'NIS': item.nis,
      'Nama': item.nama,
      'Role': roleLabel(item.role),
      'Status': item.sudah_memilih ? 'Sudah Vote' : 'Belum Vote',
      'Info Voting': item.voting_status.message,
      'Jenis Dipilih': votedJenis(item) || '-'
    }))

    exportSiswaToExcel(data)
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
      class="rounded-2xl border-[var(--ui-border)]"
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
              : 'border-[var(--ui-border)] bg-[var(--ui-bg)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
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
              : 'border-[var(--ui-border)] bg-[var(--ui-bg)] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
          ]"
          @click="jenisFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>

      <p
        v-if="exportError"
        class="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-500 dark:text-rose-400"
        role="alert"
      >
        <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0" />
        {{ exportError }}
      </p>

      <div
        v-if="error"
        class="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-500 dark:text-rose-400"
        role="alert"
      >
        <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0" />
        {{ error.message }}
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
          Coba kata kunci lain atau ubah filter status pemilih.
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
          class="flex flex-col gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4"
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
