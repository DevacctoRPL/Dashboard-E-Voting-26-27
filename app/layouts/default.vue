<script setup lang="ts">
const route = useRoute()

const mainMenu = [
  { label: 'Data Pemilih', icon: 'i-lucide-users-round', to: '/' },
  { label: 'Quick Count', icon: 'i-lucide-chart-pie', to: '/quick-count' }
]

const isActive = (item: (typeof mainMenu)[number]) => route.path === item.to
</script>

<template>
  <div class="min-h-screen lg:flex">
    <!-- ===== Sidebar ===== -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col gap-8 border-r border-[var(--ui-border)] bg-[rgba(255,255,255,0.7)] px-5 py-6 backdrop-blur-xl dark:bg-[rgba(13,42,74,0.85)] lg:flex">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-2"
      >
        <span class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 text-white shadow-[0_4px_16px_rgba(22,119,255,0.35)]">
          <UIcon
            name="i-lucide-vote"
            class="size-5"
          />
        </span>
        <div class="leading-tight">
          <p class="text-sm font-bold text-[var(--ui-text)]">
            E-Voting Dashboard
          </p>
          <p class="text-xs text-[var(--ui-text-dimmed)]">
            OSIS &amp; MPK 2026/2027
          </p>
        </div>
      </NuxtLink>

      <!-- Main Menu -->
      <nav class="flex flex-1 flex-col gap-2 overflow-y-auto">
        <p class="px-3 pb-1 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-dimmed)]">
          Main Menu
        </p>

        <NuxtLink
          v-for="item in mainMenu"
          :key="item.label"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
          :class="[
            isActive(item)
              ? 'bg-primary-500 text-white shadow-[0_0_16px_rgba(22,119,255,0.45)]'
              : 'text-[var(--ui-text-muted)] hover:bg-black/5 hover:text-[var(--ui-text)] dark:hover:bg-white/5'
          ]"
        >
          <UIcon
            :name="item.icon"
            class="size-5"
          />
          <span class="flex-1">{{ item.label }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 opacity-0 transition-opacity"
            :class="[isActive(item) && 'opacity-70']"
          />
        </NuxtLink>
      </nav>

      <!-- Bottom Menu -->
      <div class="flex flex-col gap-3 border-t border-[var(--ui-border)] pt-4">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--ui-text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--ui-text)] dark:hover:bg-white/5"
        >
          <UIcon
            name="i-lucide-settings"
            class="size-5"
          />
          Pengaturan
        </NuxtLink>

        <div class="flex items-center gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg-accented)]/50 p-3 dark:bg-white/[0.04]">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-400 text-sm font-bold text-white">
            RZ
          </span>
          <div class="min-w-0 flex-1 leading-tight">
            <p class="truncate text-sm font-semibold text-[var(--ui-text)]">
              Rizka Zahra
            </p>
            <p class="truncate text-xs text-[var(--ui-text-dimmed)]">
              Administrator
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-[var(--ui-text-dimmed)] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            aria-label="Keluar"
          >
            <UIcon
              name="i-lucide-log-out"
              class="size-4"
            />
          </button>
        </div>
      </div>
    </aside>

    <!-- ===== Main Area ===== -->
    <div class="flex min-h-screen flex-1 flex-col lg:pl-72">
      <!-- Top Header Bar -->
      <header class="sticky top-0 z-30 border-b border-[var(--ui-border)] bg-[rgba(255,255,255,0.8)] backdrop-blur-xl dark:bg-[rgba(8,21,30,0.75)]">
        <div class="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 text-white shadow-[0_4px_16px_rgba(22,119,255,0.35)] lg:hidden">
              <UIcon
                name="i-lucide-vote"
                class="size-5"
              />
            </span>
            <div>
              <p class="text-lg font-bold tracking-tight text-[var(--ui-text)]">
                Welcome back, Admin!
              </p>
              <p class="text-sm text-[var(--ui-text-dimmed)]">
                Kelola pemilihan OSIS &amp; MPK hari ini.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <UInput
              type="search"
              placeholder="Cari cepat..."
              variant="soft"
              color="neutral"
              icon="i-lucide-search"
              class="w-full md:w-72"
            />

            <UColorModeButton
              square
              aria-label="Ganti tema"
              class="size-10 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-accented)]/60 text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-bg-accented)] hover:text-[var(--ui-text)] dark:bg-white/5 dark:hover:bg-white/10"
            />

            <button
              type="button"
              class="relative flex size-10 items-center justify-center rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-accented)]/60 text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-bg-accented)] hover:text-[var(--ui-text)] dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Notifikasi"
            >
              <UIcon
                name="i-lucide-bell"
                class="size-4"
              />
              <span class="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary-400 ring-2 ring-[var(--ui-bg)]" />
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 px-4 py-6 pb-28 md:px-8 md:py-8 lg:pb-8">
        <slot />
      </main>
    </div>

    <!-- ===== Mobile Nav ===== -->
    <nav class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-[var(--ui-border)] bg-[rgba(255,255,255,0.92)] px-4 py-2 backdrop-blur-xl dark:bg-[rgba(8,21,30,0.9)] lg:hidden">
      <NuxtLink
        v-for="item in mainMenu"
        :key="item.label"
        :to="item.to"
        class="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors"
        :class="isActive(item) ? 'text-primary-400' : 'text-[var(--ui-text-dimmed)]'"
      >
        <UIcon
          :name="item.icon"
          class="size-5"
        />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
