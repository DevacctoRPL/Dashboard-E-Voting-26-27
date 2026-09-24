<script setup lang="ts">
import {
  Bell,
  ChartPie,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UsersRound,
  Vote
} from 'lucide-vue-next'
import { Input } from '@/components/ui/input'

const route = useRoute()

const mainMenu = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/'
  },
  {
    label: 'Data Pemilih',
    icon: UsersRound,
    to: '/'
  },
  {
    label: 'Quick Count',
    icon: ChartPie,
    to: '/quick-count'
  }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:flex">
    <!-- ===== Sidebar ===== -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col gap-8 border-r border-slate-100 bg-white px-5 py-6 lg:flex">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-2"
      >
        <span class="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-blue-200/60">
          <Vote class="size-5" />
        </span>
        <div class="leading-tight">
          <p class="text-sm font-bold text-slate-900">E-Voting Dashboard</p>
          <p class="text-xs text-slate-400">OSIS &amp; MPK 2026/2027</p>
        </div>
      </NuxtLink>

      <!-- Main Menu -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto">
        <p class="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <NuxtLink
          v-for="item in mainMenu"
          :key="item.label"
          :to="item.to"
          active-class="bg-blue-50 text-blue-600"
          inactive-class="text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
          :class="[route.path === item.to && 'bg-blue-50 text-blue-600']"
        >
          <component
            :is="item.icon"
            class="size-5"
          />
          <span class="flex-1">{{ item.label }}</span>
          <ChevronRight class="size-4 opacity-0 transition-opacity group-data-active:opacity-60 group-[.active]:opacity-60" />
        </NuxtLink>
      </nav>

      <!-- Bottom Menu -->
      <div class="flex flex-col gap-1 border-t border-slate-100 pt-4">
        <p class="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Lainnya
        </p>

        <NuxtLink
          to="/"
          inactive-class="text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <Settings class="size-5" />
          Pengaturan
        </NuxtLink>

        <div class="mt-2 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <span class="flex size-10 items-center justify-center rounded-full bg-primary/90 text-sm font-bold text-white">
            RZ
          </span>
          <div class="min-w-0 flex-1 leading-tight">
            <p class="truncate text-sm font-semibold text-slate-900">
              Rizka Zahra
            </p>
            <p class="truncate text-xs text-slate-400">
              Administrator
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-rose-500"
            aria-label="Keluar"
          >
            <LogOut class="size-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- ===== Main Area ===== -->
    <div class="flex min-h-screen flex-1 flex-col lg:pl-72">
      <!-- Top Header Bar -->
      <header class="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div class="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-primary text-white lg:hidden">
              <Vote class="size-5" />
            </span>
            <div>
              <p class="text-lg font-bold text-slate-900">
                Welcome back, Admin!
              </p>
              <p class="text-sm text-slate-400">
                Kelola pemilihan OSIS &amp; MPK hari ini.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative w-full md:w-72">
              <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Cari cepat..."
                class="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:bg-white"
              />
            </div>

            <button
              type="button"
              class="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
              aria-label="Notifikasi"
            >
              <Bell class="size-4" />
              <span class="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-white" />
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 px-4 py-6 md:px-8 md:py-8">
        <slot />
      </main>
    </div>

    <!-- ===== Mobile Nav ===== -->
    <nav class="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-100 bg-white px-4 py-2 lg:hidden">
      <NuxtLink
        v-for="item in mainMenu"
        :key="item.label"
        :to="item.to"
        class="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium"
        :class="route.path === item.to ? 'text-blue-600' : 'text-slate-400'"
      >
        <component
          :is="item.icon"
          class="size-5"
        />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
