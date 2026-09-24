<script setup lang="ts">
import { computed, ref } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { ChartData } from 'chart.js'
import { MOCK_VOTE_RESULTS } from '@/utils/mockData'
import StatHeader from '@/components/StatHeader.vue'
import QuickCountCard from '@/components/QuickCountCard.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

type EventKey = keyof typeof MOCK_VOTE_RESULTS

const tabs: { id: EventKey, label: string, icon: string }[] = [
  { id: 'osis', label: 'OSIS', icon: 'i-lucide-megaphone' },
  { id: 'mpk', label: 'MPK', icon: 'i-lucide-landmark' }
]

const active = ref<EventKey>('osis')

const buildData = (kandidat: (typeof MOCK_VOTE_RESULTS)[EventKey]['kandidat']): ChartData<'pie'> => ({
  labels: kandidat.map(item => item.nama),
  datasets: [
    {
      data: kandidat.map(item => item.jumlahSuara),
      backgroundColor: kandidat.map(item => item.warna),
      borderColor: '#08151E',
      borderWidth: 3,
      hoverOffset: 2
    }
  ]
})

const totalSuara = (kandidat: (typeof MOCK_VOTE_RESULTS)[EventKey]['kandidat']) =>
  kandidat.reduce((acc, item) => acc + item.jumlahSuara, 0)

const current = computed(() => {
  const event = MOCK_VOTE_RESULTS[active.value]
  const kandidat = event.kandidat
  return {
    key: active.value,
    chartId: `${active.value}-chart`,
    title: event.label,
    description: event.deskripsi,
    icon: tabs.find(tab => tab.id === active.value)!.icon,
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
        <h1 class="text-2xl font-bold tracking-tight text-[var(--ui-text)]">
          Quick Count Suara
        </h1>
        <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
          Perolehan suara sementara Pemilihan Ketua OSIS &amp; MPK.
        </p>
      </div>

      <UButton
        to="/"
        variant="outline"
        icon="i-lucide-arrow-left"
        size="lg"
        class="rounded-xl"
      >
        Kembali ke Data Pemilih
      </UButton>
    </div>

    <StatHeader />

    <!-- Segmented Switcher OSIS vs MPK -->
    <div class="flex justify-center">
      <div class="inline-flex items-center gap-1 rounded-full border border-[var(--ui-border)] bg-[#071A33] p-1 shadow-[0_4px_20px_rgba(7,26,51,0.6)]">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all"
          :class="[
            active === tab.id
              ? 'bg-primary-500 text-white shadow-[0_0_16px_rgba(22,119,255,0.45)]'
              : 'text-white/60 hover:text-white'
          ]"
          @click="active = tab.id"
        >
          <UIcon
            :name="tab.icon"
            class="size-4"
          />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <Transition
      name="tab-fade"
      mode="out-in"
    >
      <QuickCountCard
        :key="current.key"
        :chart-id="current.chartId"
        :title="current.title"
        :description="current.description"
        :icon="current.icon"
        :data="current.data"
        :kandidat="current.kandidat"
        :total="current.total"
      />
    </Transition>
  </div>
</template>

<style>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tab-fade-leave-to {
  opacity: 0;
}
</style>
