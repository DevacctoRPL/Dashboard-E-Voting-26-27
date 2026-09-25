<script setup lang="ts">
import { computed, ref } from 'vue'
import { MOCK_SISWA, getKandidat } from '@/utils/mockData'
import type { Siswa } from '@/utils/mockData'
import { exportSiswaToExcel } from '@/utils/exportExcel'
import type { ExportRow } from '@/utils/exportExcel'

type StatusFilter = 'semua' | 'sudah' | 'belum'

const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('semua')

const filters: { id: StatusFilter, label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'sudah', label: 'Sudah Vote' },
  { id: 'belum', label: 'Belum Vote' }
]

const counts = computed(() => ({
  semua: MOCK_SISWA.length,
  sudah: MOCK_SISWA.filter(s => s.status === 'sudah').length,
  belum: MOCK_SISWA.filter(s => s.status === 'belum').length
}))

const filteredSiswa = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return MOCK_SISWA.filter((siswa: Siswa) => {
    if (statusFilter.value !== 'semua' && siswa.status !== statusFilter.value) {
      return false
    }
    if (!query) {
      return true
    }
    return siswa.nama.toLowerCase().includes(query) || siswa.nisn.includes(query)
  })
})

const rows = computed(() =>
  filteredSiswa.value.map((siswa, index) => ({ no: index + 1, ...siswa }))
)

const columns = [
  {
    accessorKey: 'no',
    header: 'No',
    meta: { class: { th: 'ps-6', td: 'ps-6 w-12' } }
  },
  { accessorKey: 'nisn', header: 'NISN' },
  { accessorKey: 'nama', header: 'Nama' },
  { accessorKey: 'kelas', header: 'Kelas' },
  { accessorKey: 'osis', header: 'OSIS' },
  { accessorKey: 'mpk', header: 'MPK' },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { class: { th: 'pe-6 text-right', td: 'pe-6' } }
  }
]

const pilihanNama = (event: 'osis' | 'mpk', id?: number) => {
  if (id === undefined) {
    return '-'
  }
  return getKandidat(event, id)?.nama ?? '-'
}

const handleExport = () => {
  const data: ExportRow[] = filteredSiswa.value.map((siswa, index) => ({
    'No': index + 1,
    'NISN': siswa.nisn,
    'Nama': siswa.nama,
    'Kelas': siswa.kelas,
    'Pilihan OSIS': pilihanNama('osis', siswa.osis),
    'Pilihan MPK': pilihanNama('mpk', siswa.mpk),
    'Status': siswa.status === 'sudah' ? 'Sudah Vote' : 'Belum Vote'
  }))

  exportSiswaToExcel(data)
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
                {{ rows.length }} dari {{ MOCK_SISWA.length }} siswa ditampilkan
              </p>
            </div>
          </div>

          <div class="flex w-full items-center gap-2 lg:w-auto">
            <UInput
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama / NISN..."
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
              @click="handleExport"
            />
          </div>
        </div>
      </template>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <button
          v-for="filter in filters"
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
      </div>

      <!-- Empty state -->
      <div
        v-if="rows.length === 0"
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
          v-for="siswa in filteredSiswa"
          :key="siswa.id"
          class="flex flex-col gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg)] p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-[var(--ui-text)]">
                {{ siswa.nama }}
              </p>
              <p class="font-inter text-xs text-[var(--ui-text-dimmed)]">
                {{ siswa.nisn }} · {{ siswa.kelas }}
              </p>
            </div>
            <UBadge
              v-if="siswa.status === 'sudah'"
              color="success"
              variant="soft"
              size="sm"
              class="shrink-0"
            >
              Sudah
            </UBadge>
            <UBadge
              v-else
              color="error"
              variant="soft"
              size="sm"
              class="shrink-0"
            >
              Belum
            </UBadge>
          </div>

          <div class="grid grid-cols-2 gap-2 border-t border-[var(--ui-border)] pt-3">
            <div>
              <p class="font-inter text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-dimmed)]">
                OSIS
              </p>
              <p class="truncate text-xs text-[var(--ui-text-muted)]">
                {{ pilihanNama('osis', siswa.osis) }}
              </p>
            </div>
            <div>
              <p class="font-inter text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-dimmed)]">
                MPK
              </p>
              <p class="truncate text-xs text-[var(--ui-text-muted)]">
                {{ pilihanNama('mpk', siswa.mpk) }}
              </p>
            </div>
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
          sticky="header"
          class="[&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[var(--ui-bg-accented)]/50"
        >
          <template #osis-cell="{ row }">
            <CandidatePick :kandidat="getKandidat('osis', row.original.osis)" />
          </template>

          <template #mpk-cell="{ row }">
            <CandidatePick :kandidat="getKandidat('mpk', row.original.mpk)" />
          </template>

          <template #status-cell="{ row }">
            <div class="flex justify-end">
              <UBadge
                v-if="row.original.status === 'sudah'"
                color="success"
                variant="soft"
                size="sm"
              >
                <template #leading>
                  <UIcon
                    name="i-lucide-check-circle-2"
                    class="size-3.5"
                  />
                </template>
                Sudah Vote
              </UBadge>
              <UBadge
                v-else
                color="error"
                variant="soft"
                size="sm"
              >
                <template #leading>
                  <UIcon
                    name="i-lucide-clock-3"
                    class="size-3.5"
                  />
                </template>
                Belum Vote
              </UBadge>
            </div>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>
