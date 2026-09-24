<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock3, UsersRound } from 'lucide-vue-next'
import { MOCK_STATS } from '@/utils/mockData'
import { Card, CardContent } from '@/components/ui/card'

const props = withDefaults(
  defineProps<{
    totalSiswa?: number
    sudahVote?: number
    belumVote?: number
  }>(),
  {
    totalSiswa: MOCK_STATS.totalSiswa,
    sudahVote: MOCK_STATS.sudahVote,
    belumVote: MOCK_STATS.belumVote
  }
)

const formatNumber = (value: number) => value.toLocaleString('id-ID')

const persentaseSudah = computed(() =>
  props.totalSiswa === 0 ? 0 : ((props.sudahVote / props.totalSiswa) * 100).toFixed(1)
)

const persentaseBelum = computed(() => (100 - Number(persentaseSudah.value)).toFixed(1))

const stats = computed(() => [
  {
    label: 'Total Siswa (DPT)',
    value: formatNumber(props.totalSiswa),
    sub: 'Daftar Pemilih Tetap',
    icon: UsersRound,
    iconClass: 'bg-blue-50 text-blue-600',
    badge: 'Target partisipasi 100%',
    badgeClass: 'bg-slate-100 text-slate-600',
    trendClass: 'text-slate-400',
    TrendIcon: ArrowUpRight
  },
  {
    label: 'Sudah Vote',
    value: formatNumber(props.sudahVote),
    sub: 'Berhasil memberikan suara',
    icon: CheckCircle2,
    iconClass: 'bg-emerald-50 text-emerald-600',
    badge: `${persentaseSudah.value}% partisipasi`,
    badgeClass: 'bg-emerald-50 text-emerald-600',
    trendClass: 'text-emerald-500',
    TrendIcon: ArrowUpRight
  },
  {
    label: 'Belum Vote',
    value: formatNumber(props.belumVote),
    sub: 'Menunggu konfirmasi',
    icon: Clock3,
    iconClass: 'bg-rose-50 text-rose-500',
    badge: `${persentaseBelum.value}% menunggu`,
    badgeClass: 'bg-rose-50 text-rose-500',
    trendClass: 'text-rose-500',
    TrendIcon: ArrowDownRight
  }
])
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <Card
      v-for="stat in stats"
      :key="stat.label"
      class="rounded-2xl border border-slate-100 shadow-sm"
    >
      <CardContent class="flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-xl"
            :class="stat.iconClass"
          >
            <component
              :is="stat.icon"
              class="size-6"
            />
          </div>
          <span
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="stat.badgeClass"
          >
            <component
              :is="stat.TrendIcon"
              class="size-3.5"
              :class="stat.trendClass"
            />
            {{ stat.badge }}
          </span>
        </div>

        <div>
          <p class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-sm font-medium text-slate-500">
            {{ stat.label }}
          </p>
          <p class="text-xs text-slate-400">
            {{ stat.sub }}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
