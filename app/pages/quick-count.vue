<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Landmark, Megaphone } from 'lucide-vue-next'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { ChartData } from 'chart.js'
import { MOCK_VOTE_RESULTS } from '@/utils/mockData'
import StatHeader from '@/components/StatHeader.vue'
import QuickCountCard from '@/components/QuickCountCard.vue'
import { Button } from '@/components/ui/button'

ChartJS.register(ArcElement, Tooltip, Legend)

const buildData = (kandidat: typeof MOCK_VOTE_RESULTS.osis.kandidat): ChartData<'pie'> => ({
  labels: kandidat.map(item => item.nama),
  datasets: [
    {
      data: kandidat.map(item => item.jumlahSuara),
      backgroundColor: kandidat.map(item => item.warna),
      borderColor: '#FFFFFF',
      borderWidth: 4,
      hoverOffset: 2
    }
  ]
})

const totalSuara = (kandidat: typeof MOCK_VOTE_RESULTS.osis.kandidat) =>
  kandidat.reduce((acc, item) => acc + item.jumlahSuara, 0)

const osis = computed(() => {
  const kandidat = MOCK_VOTE_RESULTS.osis.kandidat
  return {
    data: buildData(kandidat),
    kandidat,
    total: totalSuara(kandidat)
  }
})

const mpk = computed(() => {
  const kandidat = MOCK_VOTE_RESULTS.mpk.kandidat
  return {
    data: buildData(kandidat),
    kandidat,
    total: totalSuara(kandidat)
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Page Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          Quick Count Suara
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Perolehan suara sementara Pemilihan Ketua OSIS &amp; MPK.
        </p>
      </div>

      <Button
        as-child
        variant="outline"
        size="lg"
        class="rounded-xl border-slate-200 bg-white"
      >
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2"
        >
          <ArrowLeft class="size-4" />
          Kembali ke Data Pemilih
        </NuxtLink>
      </Button>
    </div>

    <StatHeader />

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <QuickCountCard
        chart-id="osis-chart"
        :title="MOCK_VOTE_RESULTS.osis.label"
        :description="MOCK_VOTE_RESULTS.osis.deskripsi"
        :icon="Megaphone"
        :data="osis.data"
        :kandidat="osis.kandidat"
        :total="osis.total"
      />

      <QuickCountCard
        chart-id="mpk-chart"
        :title="MOCK_VOTE_RESULTS.mpk.label"
        :description="MOCK_VOTE_RESULTS.mpk.deskripsi"
        :icon="Landmark"
        :data="mpk.data"
        :kandidat="mpk.kandidat"
        :total="mpk.total"
      />
    </div>
  </div>
</template>
