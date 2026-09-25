<script setup lang="ts">
import { computed } from 'vue'
import { MOCK_SISWA, MOCK_STATS, MOCK_VOTE_RESULTS, getKandidat } from '@/utils/mockData'
import StatHeader from '@/components/StatHeader.vue'

const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })

const waktuRelatif = (iso: string) => {
  const diffMin = Math.round((Date.parse(iso) - Date.now()) / 60000)
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute')
  }
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour')
  }
  return rtf.format(Math.round(diffHour / 24), 'day')
}

const avatarClass = computed(() => {
  const colors = [
    'from-primary-500 to-primary-400',
    'from-[#22C55E] to-[#4ae176]',
    'from-primary-400 to-[#5CB8FF]'
  ]
  return (index: number) => colors[index % colors.length]
})

const aktivitas = computed(() =>
  MOCK_SISWA
    .filter(s => s.status === 'sudah')
    .sort((a, b) => Date.parse(b.votedAt ?? '') - Date.parse(a.votedAt ?? ''))
    .slice(0, 5)
)

const events = computed(() =>
  (['osis', 'mpk'] as const).map((event) => {
    const kandidat = MOCK_VOTE_RESULTS[event].kandidat
    const total = kandidat.reduce((acc, k) => acc + k.jumlahSuara, 0)
    const leader = kandidat.reduce((max, k) => (k.jumlahSuara > max.jumlahSuara ? k : max))
    return {
      event,
      label: MOCK_VOTE_RESULTS[event].label,
      total,
      leader,
      persen: Math.min(100, Math.round((total / MOCK_STATS.totalSiswa) * 100))
    }
  })
)

const initial = (nama: string) =>
  nama.split(' ').map(palavra => palavra[0]).join('').slice(0, 2).toUpperCase()
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

    <StatHeader />

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

          <div class="flex flex-col">
            <div
              v-for="(item, index) in aktivitas"
              :key="item.id"
              class="flex items-start gap-3 border-b border-[var(--ui-border)] py-3 last:border-b-0"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white"
                :class="avatarClass(index)"
              >
                {{ initial(item.nama) }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm leading-snug text-[var(--ui-text)]">
                  <span class="font-semibold">{{ item.nama }}</span>
                  memilih
                  <span class="font-semibold text-primary-500 dark:text-primary-400">
                    {{ getKandidat('osis', item.osis)?.nama }}
                  </span>
                  (OSIS) &amp;
                  <span class="font-semibold text-primary-500 dark:text-primary-400">
                    {{ getKandidat('mpk', item.mpk)?.nama }}
                  </span>
                  (MPK)
                </p>
                <p class="mt-0.5 text-xs text-[var(--ui-text-dimmed)]">
                  {{ item.votedAt ? waktuRelatif(item.votedAt) : '' }}
                </p>
              </div>
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
            v-for="event in events"
            :key="event.event"
            class="flex flex-col gap-2"
          >
            <div class="flex items-center justify-between gap-4">
              <p class="text-sm font-medium text-[var(--ui-text)]">
                {{ event.label }}
              </p>
              <p class="text-xs text-[var(--ui-text-dimmed)]">
                {{ event.total.toLocaleString('id-ID') }} suara · {{ event.persen }}%
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
              Pemimpin sementara:
              <span class="font-semibold text-[var(--ui-text)]">{{ event.leader.nama }}</span>
              · {{ event.leader.jumlahSuara.toLocaleString('id-ID') }} suara
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
