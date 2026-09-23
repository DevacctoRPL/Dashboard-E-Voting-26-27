<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, ChartPie, Filter, Search, UsersRound } from 'lucide-vue-next'
import { MOCK_SISWA } from '@/utils/mockData'
import StatHeader from '@/components/StatHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const searchQuery = ref('')

const filteredSiswa = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return MOCK_SISWA
  }

  return MOCK_SISWA.filter(siswa =>
    siswa.nama.toLowerCase().includes(query) || siswa.nisn.includes(query)
  )
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Page Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          Data Pemilih
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Pantau rekap Daftar Pemilih Tetap Pemilihan Ketua OSIS &amp; MPK.
        </p>
      </div>

      <Button
        as-child
        size="lg"
        class="rounded-xl shadow-lg shadow-blue-200/50"
      >
        <NuxtLink
          to="/quick-count"
          class="inline-flex items-center gap-2"
        >
          <ChartPie class="size-4" />
          Lihat Quick Count
          <ArrowRight class="size-4" />
        </NuxtLink>
      </Button>
    </div>

    <StatHeader />

    <Card class="rounded-2xl border border-slate-100 shadow-sm">
      <CardHeader class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UsersRound class="size-5" />
          </div>
          <div>
            <CardTitle class="text-slate-900">
              Daftar Siswa
            </CardTitle>
            <CardDescription class="text-slate-500">
              {{ filteredSiswa.length }} dari {{ MOCK_SISWA.length }} siswa ditampilkan
            </CardDescription>
          </div>
        </div>

        <div class="flex w-full items-center gap-2 md:w-auto">
          <div class="relative w-full md:w-72">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama / NISN..."
              class="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:bg-white"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            class="size-10 shrink-0 rounded-xl border-slate-200 bg-white text-slate-500"
            aria-label="Filter"
          >
            <Filter class="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow class="border-slate-100 hover:bg-transparent">
              <TableHead class="ps-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
                No
              </TableHead>
              <TableHead class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                NISN
              </TableHead>
              <TableHead class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Nama
              </TableHead>
              <TableHead class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Kelas
              </TableHead>
              <TableHead class="text-end pe-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="(siswa, index) in filteredSiswa"
              :key="siswa.id"
              class="border-slate-100 transition-colors hover:bg-slate-50"
            >
              <TableCell class="ps-6 text-sm text-slate-400">
                {{ index + 1 }}
              </TableCell>
              <TableCell class="font-mono text-sm text-slate-500">
                {{ siswa.nisn }}
              </TableCell>
              <TableCell class="font-medium text-slate-900">
                {{ siswa.nama }}
              </TableCell>
              <TableCell class="text-sm text-slate-500">
                {{ siswa.kelas }}
              </TableCell>
              <TableCell class="pe-6">
                <div class="flex justify-end">
                  <Badge
                    v-if="siswa.status === 'sudah'"
                    class="rounded-full border-transparent bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600"
                  >
                    Sudah Vote
                  </Badge>
                  <Badge
                    v-else
                    class="rounded-full border-transparent bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500"
                  >
                    Belum Vote
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div
          v-if="filteredSiswa.length === 0"
          class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center"
        >
          <Search class="mx-auto mb-2 size-6 text-slate-300" />
          <p class="text-sm font-medium text-slate-500">
            Tidak ada hasil pencarian
          </p>
          <p class="text-xs text-slate-400">
            Coba kata kunci lain untuk nama atau NISN.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
