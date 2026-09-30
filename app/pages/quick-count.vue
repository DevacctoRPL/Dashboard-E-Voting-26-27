<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { rekapSuara } from "@/api";
import type { JenisPemilihan, RekapJenis } from "@/api/types";
import QuickCountCard from "@/components/QuickCountCard.vue";

ChartJS.register(ArcElement, Tooltip, Legend);

// Backend tidak mengirim warna kandidat — palet lokal, satu warna per nomor.
const WARNAPASLON = ["#1677FF", "#22C55E", "#F59E0B", "#A855F7", "#EF4444", "#5CB8FF"];

const warna = (index: number) => WARNAPASLON[index % WARNAPASLON.length]!;

const tabs: { id: JenisPemilihan; label: string; icon: string }[] = [
  { id: "osis", label: "OSIS", icon: "i-lucide-megaphone" },
  { id: "mpk", label: "MPK", icon: "i-lucide-landmark" },
];

const active = ref<JenisPemilihan>("osis");

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const { data: rekap, status, error } = await useAsyncData(
  "rekap-suara",
  () => rekapSuara(active.value),
  { watch: [active] },
);

const current = computed<RekapJenis | null>(() => {
  const byJenis = rekap.value?.data_by_jenis;
  return byJenis?.[active.value] ?? byJenis?.osis ?? byJenis?.mpk ?? null;
});

const kandidat = computed(() =>
  (current.value?.detail ?? []).map((item, index) => ({
    ...item,
    warna: warna(index),
  })),
);

const buildData = (list: typeof kandidat.value): ChartData<"pie"> => ({
  // ponytail: label pre-prefiks ("Paslon 1 - ...") hanya ada di chart.labels;
  // detail[].nama mentah. Pakai chart kalau panjang cocok, fallback ke detail.
  labels: current.value?.chart.labels.length === list.length
    ? current.value.chart.labels
    : list.map(item => item.nama),
  datasets: [
    {
      data: current.value?.chart.data.length === list.length
        ? current.value.chart.data
        : list.map(item => item.total),
      backgroundColor: list.map((item) => item.warna),
      borderColor: isDark.value ? "#071A33" : "#FFFFFF",
      borderWidth: 3,
      hoverOffset: 2,
    },
  ],
});

const chartOptions = computed<ChartOptions<"pie">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 100,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? "#0D2A4A" : "#FFFFFF",
      titleColor: isDark.value ? "#D7E4F2" : "#071A33",
      bodyColor: isDark.value ? "#AAB7C4" : "#55636E",
      borderColor: isDark.value ? "#1A365D" : "#D5DEE8",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      callbacks: {
        label: (context: TooltipItem<"pie">) =>
          ` ${context.label || ""}: ${context.parsed.toLocaleString("id-ID")} suara`,
      },
    },
  },
}));

const isStale = ref(false);
watch(() => status.value, (value) => {
  isStale.value = value === "pending";
});

const total = computed(() => current.value?.total_suara_masuk ?? 0);
const leader = computed(() => current.value?.unggul_sementara?.nama ?? null);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Page Header -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[var(--ui-text)]">
          Quick Count Suara
        </h1>
        <p class="max-w-prose text-sm text-[var(--ui-text-muted)]">
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

    <!-- Segmented Switcher OSIS vs MPK -->
    <div class="flex justify-center">
      <div
        class="inline-flex items-center gap-1 rounded-full border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-1"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          :class="[
            active === tab.id
              ? 'bg-primary-500 text-white'
              : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]',
          ]"
          @click="active = tab.id"
        >
          <UIcon :name="tab.icon" class="size-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div
      v-if="current && current.status !== 'active'"
      class="flex items-center gap-2 rounded-xl border border-dashed border-[var(--ui-border)] bg-[var(--ui-bg)]/60 px-4 py-3 text-sm text-[var(--ui-text-muted)]"
    >
      <UIcon name="i-lucide-lock" class="size-4 shrink-0" />
      Pemilihan ini berstatus <strong>{{ current.status }}</strong> — suara yang masuk
      belum final.
    </div>

    <div
      v-if="error"
      class="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-500 dark:text-rose-400"
      role="alert"
    >
      <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0" />
      {{ error.message }}
    </div>

    <Transition name="tab-fade" mode="out-in">
      <QuickCountCard
        v-if="current"
        :key="active"
        :chart-id="`${active}-chart`"
        :title="current.nama"
        :description="`Perolehan suara sementara · ${current.status}`"
        :icon="tabs.find((tab) => tab.id === active)!.icon"
        :data="buildData(kandidat)"
        :options="chartOptions"
        :kandidat="kandidat"
        :total="total"
        :leader="leader"
      />
      <div
        v-else-if="isStale"
        key="loading"
        class="h-96 animate-pulse rounded-2xl bg-[var(--ui-bg-accented)]"
      />
    </Transition>
  </div>
</template>

<style>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tab-fade-leave-to {
  opacity: 0;
}
</style>
