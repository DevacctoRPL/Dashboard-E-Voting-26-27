<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()

const mainMenu = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/', desc: 'Ringkasan pemilihan' },
  { label: 'Data Pemilih', icon: 'i-lucide-users-round', to: '/data-pemilih', desc: 'Daftar & status siswa' },
  { label: 'Quick Count', icon: 'i-lucide-chart-pie', to: '/quick-count', desc: 'Perolehan suara' }
]

const isActive = (item: (typeof mainMenu)[number]) => route.path === item.to

const pageMeta = computed(() => {
  const match = mainMenu.find(item => item.to === route.path)
  return match ?? { label: 'Dashboard', desc: 'Ringkasan pemilihan' }
})

const userName = computed(() => auth.name || 'Pengguna')
const userRole = computed(() => (auth.role === 'admin' ? 'Administrator' : 'Pemilih'))
const userInitials = computed(() =>
  userName.value.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
)

async function logout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen lg:flex">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      Lompat ke konten
    </a>

    <!-- ===== Sidebar ===== -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col gap-8 border-r border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]/85 px-5 py-6 backdrop-blur-xl lg:flex">
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
      <nav class="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        <p class="px-3 pb-1 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-dimmed)]">
          Menu
        </p>

        <NuxtLink
          v-for="item in mainMenu"
          :key="item.label"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
          :class="[
            isActive(item)
              ? 'bg-primary-500 text-white shadow-[0_6px_20px_rgba(22,119,255,0.35)]'
              : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-accented)] hover:text-[var(--ui-text)]'
          ]"
        >
          <UIcon
            :name="item.icon"
            class="size-5 shrink-0"
          />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-semibold">{{ item.label }}</span>
            <span
              class="block truncate text-[11px]"
              :class="isActive(item) ? 'text-white/70' : 'text-[var(--ui-text-dimmed)]'"
            >
              {{ item.desc }}
            </span>
          </span>
        </NuxtLink>
      </nav>

      <!-- Bottom -->
      <div class="flex flex-col gap-3 border-t border-[var(--ui-border)] pt-4">
        <div class="flex items-center gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg-accented)]/60 p-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-400 text-sm font-bold text-white">
            {{ userInitials }}
          </span>
          <div class="min-w-0 flex-1 leading-tight">
            <p class="truncate text-sm font-semibold text-[var(--ui-text)]">
              {{ userName }}
            </p>
            <p class="truncate text-xs text-[var(--ui-text-dimmed)]">
              {{ userRole }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-[var(--ui-text-dimmed)] transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            aria-label="Keluar"
            @click="logout"
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
      <header class="sticky top-0 z-30 border-b border-[var(--ui-border)] bg-[var(--ui-bg)]/80 backdrop-blur-xl">
        <div class="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div class="flex min-w-0 items-center gap-3">
            <NuxtLink
              to="/"
              class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 text-white shadow-[0_4px_16px_rgba(22,119,255,0.35)] lg:hidden"
            >
              <UIcon
                name="i-lucide-vote"
                class="size-5"
              />
            </NuxtLink>
            <div class="min-w-0">
              <h1 class="truncate text-lg font-bold tracking-tight text-[var(--ui-text)]">
                {{ pageMeta.label }}
              </h1>
              <p class="truncate text-sm text-[var(--ui-text-dimmed)]">
                {{ pageMeta.desc }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <span class="hidden items-center gap-2 rounded-full border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] px-3 py-1.5 sm:inline-flex">
              <span class="relative flex size-2">
                <span class="absolute inline-flex size-full animate-ping rounded-full bg-[var(--ui-success)] opacity-60" />
                <span class="relative inline-flex size-2 rounded-full bg-[var(--ui-success)]" />
              </span>
              <span class="font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-muted)]">
                Live
              </span>
            </span>

            <UColorModeButton
              square
              aria-label="Ganti tema"
              class="size-10 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-bg-accented)] hover:text-[var(--ui-text)]"
            />
          </div>
        </div>
      </header>

      <!-- Content -->
      <main
        id="main-content"
        class="flex-1 px-4 py-6 pb-28 md:px-8 md:py-8 lg:pb-8"
      >
        <slot />
      </main>
    </div>

    <!-- ===== Mobile Nav ===== -->
    <nav class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[var(--ui-border)] bg-[var(--ui-bg)]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      <NuxtLink
        v-for="item in mainMenu"
        :key="item.label"
        :to="item.to"
        class="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors"
        :class="isActive(item) ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400' : 'text-[var(--ui-text-dimmed)]'"
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
