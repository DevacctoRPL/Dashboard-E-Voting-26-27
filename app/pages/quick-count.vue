<script setup lang="ts">
import { computed, ref } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js'
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

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const buildData = (kandidat: (typeof MOCK_VOTE_RESULTS)[EventKey]['kandidat']): ChartData<'pie'> => ({
  labels: kandidat.map(item => item.nama),
  datasets: [
    {
      data: kandidat.map(item => item.jumlahSuara),
      backgroundColor: kandidat.map(item => item.warna),
      borderColor: isDark.value ? '#071A33' : '#FFFFFF',
      borderWidth: 3,
      hoverOffset: 2
    }
  ]
})

const totalSuara = (kandidat: (typeof MOCK_VOTE_RESULTS)[EventKey]['kandidat']) =>
  kandidat.reduce((acc, item) => acc + item.jumlahSuara, 0)

const chartOptions = computed<ChartOptions<'pie'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 100,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#0D2A4A' : '#FFFFFF',
      titleColor: isDark.value ? '#D7E4F2' : '#071A33',
      bodyColor: isDark.value ? '#AAB7C4' : '#55636E',
      borderColor: isDark.value ? '#1A365D' : '#D5DEE8',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      callbacks: {
        label: (context: TooltipItem<'pie'>) =>
          ` ${context.label || ''}: ${context.parsed.toLocaleString('id-ID')} suara`
      }
    }
  }
}))

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
        <p class="mt-1 max-w-prose text-sm text-[var(--ui-text-muted)]">
          Perolehan suara sementara Pemilihan Ketua OSIS &amp; MPK.
        </p>
      </div>

      <UButton
        to="/data-pemilih"
        variant="outline"
        icon="i-lucide-arrow-left"
        size="lg"
        class="rounded-xl"
      >
        Data Pemilih
      </UButton>
    </div>

    <StatHeader />

    <!-- Segmented Switcher OSIS vs MPK -->
    <div class="flex justify-center">
      <div class="inline-flex items-center gap-1 rounded-full border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          :class="[
            active === tab.id
              ? 'bg-primary-500 text-white'
              : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
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
        :options="chartOptions"
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
