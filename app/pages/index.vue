<script setup lang="ts">
import { computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { aktivitasVote, dashboard, rekapSuara } from '@/api'
import { apiErrorMessage, isSessionExpired } from '@/api/client'
import type { DashboardSummary, JenisPemilihan, RekapJenis } from '@/api/types'
import StatHeader from '@/components/StatHeader.vue'

const POLLING_MS = 12000

const {
  data: dash,
  error: dashError,
  refresh: refreshDashboard
} = await useAsyncData('dashboard', () => dashboard(), { server: false, lazy: true, dedupe: 'defer' })

const {
  data: aktivitas,
  refresh: refreshAktivitas
} = await useAsyncData('aktivitas-vote', () => aktivitasVote({ per_page: 10 }), { server: false, lazy: true, dedupe: 'defer' })

const { data: rekap, refresh: refreshRekap } = await useAsyncData('rekap-suara-dash', () => rekapSuara(), { server: false, lazy: true, dedupe: 'defer' })

const summary = computed<DashboardSummary | null>(() => dash.value?.summary ?? null)

// No websocket di backend (api_spec.md §1) — polling 10–15 detik sesuai spec.
const inFlight = ref(false)

const auth = useAuthStore()

const refreshAll = async () => {
  // Sesi habis = sedang pindah ke /login; stop poll supaya tidak 401 terus.
  // Tab hidden = skip, hemat baterai/API.
  if (inFlight.value || !auth.isAuthenticated || document.visibilityState !== 'visible') return
  inFlight.value = true
  try {
    await Promise.all([refreshDashboard(), refreshAktivitas(), refreshRekap()])
  } finally {
    inFlight.value = false
  }
}

const { pause: pausePolling, resume: resumePolling } = useIntervalFn(refreshAll, POLLING_MS, { immediate: false })

// Sesi habis → berhenti poll sepenuhnya, login lagi → jalan lagi.
watch(() => auth.isAuthenticated, (ok) => {
  if (ok) resumePolling()
  else pausePolling()
})

// Badge "Live" di header hanya nyala di halaman yang benar-benar poll.
const pollingFlag = useState<boolean>('live-polling', () => false)
onMounted(() => {
  pollingFlag.value = true
})
onUnmounted(() => {
  pollingFlag.value = false
})

const events = computed(() => {
  const byJenis = rekap.value?.data_by_jenis
  if (!byJenis) return []
  return (Object.values(byJenis) as RekapJenis[]).map(item => ({
    jenis: item.jenis,
    label: item.nama,
    status: item.status,
    total: item.total_suara_masuk,
    totalLabel: item.total_suara_masuk.toLocaleString('id-ID'),
    leader: item.unggul_sementara?.nama ?? null,
    leaderPersen: item.unggul_sementara?.persen ?? 0,
    persen: item.partisipasi.persen_partisipasi
  }))
})

const JENIS_LABEL: Record<JenisPemilihan, string> = { osis: 'OSIS', mpk: 'MPK' }
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Page Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[var(--ui-text)]">
          Dashboard
        </h1>
        <p class="mt-1 max-w-prose text-sm text-[var(--ui-text-muted)]">
          Rekap pemantauan pemilihan Ketua OSIS &amp; MPK secara langsung.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UButton
          to="/data-pemilih"
          variant="outline"
          size="lg"
          icon="i-lucide-users-round"
          class="rounded-xl"
        >
          Data Pemilih
        </UButton>
        <UButton
          to="/quick-count"
          size="lg"
          icon="i-lucide-chart-pie"
          trailing-icon="i-lucide-arrow-right"
          class="rounded-xl bg-primary-500 text-white hover:bg-primary-400"
        >
          Lihat Quick Count
        </UButton>
      </div>
    </div>

    <!-- Sesi habis: plugin auth sudah mengarahkan ke /login, jadi cukup diam. -->
    <div
      v-if="dashError && !isSessionExpired(dashError)"
      class="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-500 dark:text-rose-400"
      role="alert"
    >
      <UIcon
        name="i-lucide-circle-alert"
        class="size-4 shrink-0"
      />
      {{ apiErrorMessage(dashError) }}
    </div>

    <StatHeader
      v-if="summary"
      :summary="summary"
    />

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- Aktivitas Vote Terbaru -->
      <UCard
        variant="outline"
        class="rounded-2xl border-[var(--ui-border)]"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 dark:text-primary-400">
              <UIcon
                name="i-lucide-radio"
                class="size-5"
              />
            </span>
            <div>
              <p class="text-base font-bold text-[var(--ui-text)]">
                Aktivitas Vote Terbaru
              </p>
              <p class="text-sm text-[var(--ui-text-dimmed)]">
                Pemilihan suara yang baru saja masuk.
              </p>
            </div>
          </div>

          <div
            v-if="!aktivitas?.data?.length"
            class="rounded-xl border border-dashed border-[var(--ui-border)] bg-[var(--ui-bg)]/60 px-4 py-8 text-center"
          >
            <p class="text-sm font-semibold text-[var(--ui-text)]">
              Belum ada aktivitas
            </p>
            <p class="mt-1 text-xs text-[var(--ui-text-dimmed)]">
              Feed ini terisi otomatis setiap suara masuk.
            </p>
          </div>

          <div
            v-else
            class="flex flex-col"
          >
            <div
              v-for="(item, index) in aktivitas.data"
              :key="item.label ?? index"
              class="flex items-start gap-3 border-b border-[var(--ui-border)] py-3 last:border-b-0"
            >
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-400 text-xs font-bold text-white">
                {{ index + 1 }}
              </span>
              <p class="min-w-0 flex-1 text-sm leading-snug text-[var(--ui-text)]">
                {{ item.label ?? 'Suara baru masuk' }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Ringkasan Per Event -->
      <UCard
        variant="outline"
        class="rounded-2xl border-[var(--ui-border)]"
      >
        <div class="flex flex-col gap-6">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-xl bg-[var(--ui-success)]/10 text-[var(--ui-success)]">
              <UIcon
                name="i-lucide-activity"
                class="size-5"
              />
            </span>
            <div>
              <p class="text-base font-bold text-[var(--ui-text)]">
                Ringkasan Per Event
              </p>
              <p class="text-sm text-[var(--ui-text-dimmed)]">
                Perkembangan suara masuk tiap pemilihan.
              </p>
            </div>
          </div>

          <div
            v-if="!events.length"
            class="rounded-xl border border-dashed border-[var(--ui-border)] bg-[var(--ui-bg)]/60 px-4 py-8 text-center text-sm text-[var(--ui-text-dimmed)]"
          >
            Belum ada pemilihan aktif.
          </div>

          <div
            v-for="event in events"
            :key="event.jenis"
            class="flex flex-col gap-2"
          >
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm font-medium text-[var(--ui-text)]">
                {{ event.label }}
                <span
                  v-if="event.status !== 'active'"
                  class="ms-1 text-xs text-[var(--ui-text-dimmed)]"
                >({{ event.status }})</span>
              </p>
              <p class="text-xs text-[var(--ui-text-dimmed)]">
                {{ event.totalLabel }} suara · {{ event.persen }}%
              </p>
            </div>
            <UProgress
              :model-value="event.persen"
              size="md"
              :ui="{
                indicator: 'rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500'
              }"
            />
            <p class="text-xs text-[var(--ui-text-dimmed)]">
              <template v-if="event.leader">
                Pemimpin sementara:
                <span class="font-semibold text-[var(--ui-text)]">{{ event.leader }}</span>
                · {{ event.leaderPersen }}%
              </template>
              <template v-else>
                Belum ada suara untuk {{ JENIS_LABEL[event.jenis] }}.
              </template>
            </p>
          </div>

          <NuxtLink
            to="/quick-count"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors hover:text-primary-400 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Lihat detail perolehan suara
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4"
            />
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>
