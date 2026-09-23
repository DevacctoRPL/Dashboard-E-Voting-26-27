<script setup lang="ts">
import type { Component } from 'vue'
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import { Pie } from 'vue-chartjs'
import type { Kandidat } from '@/utils/mockData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  chartId: string
  title: string
  description: string
  icon: Component
  data: ChartData<'pie'>
  kandidat: Kandidat[]
  total: number
}>()

const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 100,
  animation: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      titleColor: '#0F172A',
      bodyColor: '#64748B',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      callbacks: {
        label: (context: TooltipItem<'pie'>) => {
          const value = context.parsed
          const label = context.label || ''
          return ` ${label}: ${value.toLocaleString('id-ID')} suara`
        }
      }
    }
  }
}

const formatNumber = (value: number) => value.toLocaleString('id-ID')

const persentase = (jumlah: number, total: number) =>
  total === 0 ? 0 : ((jumlah / total) * 100).toFixed(1)
</script>

<template>
  <Card class="rounded-2xl border border-slate-100 shadow-sm">
    <CardHeader>
      <div class="flex items-center gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
        >
          <component
            :is="icon"
            class="size-5"
          />
        </div>
        <div>
          <CardTitle class="text-slate-900">
            {{ title }}
          </CardTitle>
          <CardDescription class="text-slate-500">
            {{ description }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>

    <CardContent class="flex flex-col gap-6">
      <div class="relative mx-auto h-52 w-full max-w-xs sm:h-60">
        <ClientOnly>
          <Pie
            :chart-id="chartId"
            :data="data"
            :options="chartOptions"
          />
          <template #fallback>
            <div
              class="animate-pulse rounded-2xl bg-slate-100"
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
          class="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3"
        >
          <span
            class="size-2.5 shrink-0 rounded-full ring-4"
            :style="{ backgroundColor: item.warna, ['--tw-ring-color' as string]: `${item.warna}30` }"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-900">
              {{ item.nama }}
            </p>
            <p class="truncate text-xs text-slate-400">
              {{ item.visi }}
            </p>
          </div>
          <div class="text-end">
            <p class="text-sm font-bold text-slate-900">
              {{ formatNumber(item.jumlahSuara) }}
            </p>
            <p class="text-xs font-medium text-blue-600">
              {{ persentase(item.jumlahSuara, total) }}%
            </p>
          </div>
        </div>

        <div class="mt-1 flex items-center justify-between border-t border-slate-100 px-1 pt-3.5">
          <span class="text-sm font-medium text-slate-500">Total Suara Masuk</span>
          <span class="text-sm font-bold text-slate-900">{{ formatNumber(total) }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
