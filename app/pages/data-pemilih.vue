<script setup lang="ts">
import { computed, ref } from 'vue'
import { MOCK_SISWA, getKandidat } from '@/utils/mockData'
import type { Siswa } from '@/utils/mockData'
import { exportSiswaToExcel } from '@/utils/exportExcel'
import type { ExportRow } from '@/utils/exportExcel'
import StatHeader from '@/components/StatHeader.vue'

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
        <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
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

    <StatHeader />

    <UCard
      variant="outline"
      class="rounded-2xl border-[var(--ui-border)] shadow-[0_4px_24px_rgba(7,26,51,0.4)]"
    >
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
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
          class="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
          :class="[
            statusFilter === filter.id
              ? 'bg-primary-500 text-white shadow-[0_0_12px_rgba(22,119,255,0.4)]'
              : 'border border-[var(--ui-border)] bg-white/[0.03] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
          ]"
          @click="statusFilter = filter.id"
        >
          {{ filter.label }}
          <span class="opacity-70">{{ counts[filter.id] }}</span>
        </button>
      </div>

      <UTable
        :data="rows"
        :columns="columns"
        sticky="header"
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

        <template #empty>
          <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <span class="flex size-12 items-center justify-center rounded-full bg-white/5 text-[var(--ui-text-dimmed)]">
              <UIcon
                name="i-lucide-search-x"
                class="size-6"
              />
            </span>
            <p class="text-sm font-semibold text-[var(--ui-text)]">
              Tidak ada hasil pencarian
            </p>
            <p class="text-xs text-[var(--ui-text-dimmed)]">
              Coba kata kunci lain untuk nama atau NISN.
            </p>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
