<script setup lang="ts">
import { computed } from 'vue'
import { MOCK_STATS } from '@/utils/mockData'

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
  props.totalSiswa === 0 ? 0 : Number(((props.sudahVote / props.totalSiswa) * 100).toFixed(1))
)

const persentaseBelum = computed(() => Number((100 - persentaseSudah.value).toFixed(1)))

const stats = computed(() => [
  {
    label: 'Total Siswa (DPT)',
    value: formatNumber(props.totalSiswa),
    sub: 'Daftar Pemilih Tetap',
    icon: 'i-lucide-users-round',
    iconClass: 'bg-primary-500/10 text-primary-400',
    badge: 'Target partisipasi 100%',
    badgeClass: 'bg-white/5 text-[var(--ui-text-muted)]',
    trendIcon: 'i-lucide-arrow-up-right',
    trendClass: 'text-[var(--ui-text-dimmed)]'
  },
  {
    label: 'Sudah Vote',
    value: formatNumber(props.sudahVote),
    sub: 'Berhasil memberikan suara',
    icon: 'i-lucide-check-circle-2',
    iconClass: 'bg-[#22C55E]/10 text-[#22C55E]',
    badge: `${persentaseSudah.value}% partisipasi`,
    badgeClass: 'bg-[#22C55E]/10 text-[#22C55E]',
    trendIcon: 'i-lucide-arrow-up-right',
    trendClass: 'text-[#22C55E]'
  },
  {
    label: 'Belum Vote',
    value: formatNumber(props.belumVote),
    sub: 'Menunggu konfirmasi',
    icon: 'i-lucide-clock-3',
    iconClass: 'bg-rose-500/10 text-rose-400',
    badge: `${persentaseBelum.value}% menunggu`,
    badgeClass: 'bg-rose-500/10 text-rose-400',
    trendIcon: 'i-lucide-arrow-down-right',
    trendClass: 'text-rose-400'
  }
])
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <UCard
      v-for="stat in stats"
      :key="stat.label"
      variant="outline"
      class="rounded-2xl border-[var(--ui-border)] shadow-[0_4px_24px_rgba(7,26,51,0.4)]"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between">
          <span
            class="flex size-12 shrink-0 items-center justify-center rounded-xl"
            :class="stat.iconClass"
          >
            <UIcon
              :name="stat.icon"
              class="size-6"
            />
          </span>
          <span
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="stat.badgeClass"
          >
            <UIcon
              :name="stat.trendIcon"
              class="size-3.5"
              :class="stat.trendClass"
            />
            {{ stat.badge }}
          </span>
        </div>

        <div>
          <p class="font-inter text-3xl font-bold tracking-tight text-[var(--ui-text)]">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-sm font-medium text-[var(--ui-text)]">
            {{ stat.label }}
          </p>
          <p class="text-xs text-[var(--ui-text-dimmed)]">
            {{ stat.sub }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- Turnout Progress -->
    <UCard
      variant="outline"
      class="rounded-2xl border-[var(--ui-border)] shadow-[0_4px_24px_rgba(7,26,51,0.4)] md:col-span-3"
    >
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
              <UIcon
                name="i-lucide-activity"
                class="size-5"
              />
            </span>
            <div>
              <p class="text-sm font-semibold text-[var(--ui-text)]">
                Partisipasi Pemilih
              </p>
              <p class="text-xs text-[var(--ui-text-dimmed)]">
                {{ formatNumber(props.sudahVote) }} dari {{ formatNumber(props.totalSiswa) }} siswa telah memilih
              </p>
            </div>
          </div>
          <p class="font-inter text-2xl font-bold tracking-tight text-primary-400">
            {{ persentaseSudah }}%
          </p>
        </div>

        <UProgress
          :model-value="persentaseSudah"
          size="md"
          :ui="{
            indicator: 'rounded-full bg-gradient-to-r from-primary-500 to-primary-400 shadow-[0_0_12px_rgba(22,119,255,0.6)] transition-all duration-500'
          }"
        />
      </div>
    </UCard>
  </div>
</template>
