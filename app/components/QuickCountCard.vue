<script setup lang="ts">
import { computed } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { Pie } from 'vue-chartjs'
import type { Kandidat } from '@/utils/mockData'

const props = defineProps<{
  chartId: string
  title: string
  description: string
  icon: string
  data: ChartData<'pie'>
  options: ChartOptions<'pie'>
  kandidat: Kandidat[]
  total: number
}>()

const formatNumber = (value: number) => value.toLocaleString('id-ID')

const persentase = (jumlah: number, total: number) =>
  total === 0 ? 0 : ((jumlah / total) * 100).toFixed(1)

const leaderId = computed(() => {
  if (!props.kandidat.length) {
    return -1
  }
  const leader = props.kandidat.reduce<Kandidat | undefined>(
    (max, item) => (!max || item.jumlahSuara > max.jumlahSuara ? item : max),
    props.kandidat[0]
  )
  return leader?.id ?? -1
})
</script>

<template>
  <UCard
    variant="outline"
    class="rounded-2xl border-[var(--ui-border)]"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 dark:text-primary-400">
          <UIcon
            :name="icon"
            class="size-5"
          />
        </span>
        <div>
          <p class="text-base font-bold text-[var(--ui-text)]">
            {{ title }}
          </p>
          <p class="text-sm text-[var(--ui-text-dimmed)]">
            {{ description }}
          </p>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-6">
      <div class="relative mx-auto h-52 w-full max-w-xs sm:h-60">
        <ClientOnly>
          <Pie
            :chart-id="chartId"
            :data="data"
            :options="options"
          />
          <template #fallback>
            <div
              class="animate-pulse rounded-2xl bg-[var(--ui-bg-accented)]"
              role="status"
              aria-label="Memuat grafik"
            >
              <div class="h-52 sm:h-60" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Custom Legend -->
      <div class="flex flex-col gap-2.5">
        <div
          v-for="item in kandidat"
          :key="item.id"
          class="flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors"
          :class="[
            item.id === leaderId
              ? 'border-[var(--ui-success)]/50 bg-[var(--ui-success)]/5'
              : 'border-[var(--ui-border)] bg-[var(--ui-bg)]'
          ]"
        >
          <span
            class="size-2.5 shrink-0 rounded-full ring-4"
            :style="{
              'backgroundColor': item.warna,
              '--tw-ring-color': `${item.warna}30`
            }"
          />
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 truncate text-sm font-semibold text-[var(--ui-text)]">
              {{ item.nama }}
              <UBadge
                v-if="item.id === leaderId"
                color="success"
                variant="soft"
                size="xs"
              >
                Terbanyak
              </UBadge>
            </p>
            <p class="truncate text-xs text-[var(--ui-text-dimmed)]">
              {{ item.visi }}
            </p>
          </div>
          <div class="text-end">
            <p class="font-inter text-sm font-bold text-[var(--ui-text)]">
              {{ formatNumber(item.jumlahSuara) }}
            </p>
            <p class="text-xs font-medium text-primary-500 dark:text-primary-400">
              {{ persentase(item.jumlahSuara, total) }}%
            </p>
          </div>
        </div>

        <div class="mt-1 flex items-center justify-between border-t border-[var(--ui-border)] px-1 pt-3.5">
          <span class="text-sm font-medium text-[var(--ui-text-muted)]">Total Suara Masuk</span>
          <span class="font-inter text-sm font-bold text-[var(--ui-text)]">{{ formatNumber(total) }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
