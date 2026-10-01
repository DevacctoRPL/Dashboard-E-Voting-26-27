<script setup lang="ts">
import { computed, ref } from 'vue'
import { dashboard } from '@/api'
import type { DashboardSummary } from '@/api/types'

definePageMeta({ layout: false })

const auth = useAuthStore()
const route = useRoute()

const nis = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

/** Banner "sesi berakhir" — dipasang plugin auth saat 401, hilang saat reload. */
const sessionExpired = useState<boolean>('session-expired', () => false)

/** Halaman yang dibuka user sebelum token-nya mati; dipakai setelah login. */
const redirectTo = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') ? target : ''
})

// Halaman login belum punya token, jadi `/dashboard` akan 401. Ambil diam-diam
// supaya statistik di panel brand tetap live untuk yang punya sesi valid.
// ponytail: lazy — jangan block form login, 401 di sini normal.
const { data: dash } = await useAsyncData('login-stats', () => dashboard(), { server: false, lazy: true, dedupe: 'defer' })

const summary = computed<DashboardSummary | null>(() => dash.value?.summary ?? null)
const partisipasi = computed(() => summary.value?.persen_partisipasi ?? 0)

const stats = computed(() => {
  const s = summary.value
  const fmt = (n: number) => n.toLocaleString('id-ID')
  return [
    { label: 'Total Pemilih', value: fmt(s?.total_siswa ?? 0), class: 'text-[var(--ui-text)]' },
    { label: 'Suara Masuk', value: fmt(s?.sudah_memilih ?? 0), class: 'text-[var(--ui-success)]' },
    { label: 'Belum Memilih', value: fmt(s?.belum_memilih ?? 0), class: 'text-primary-500 dark:text-primary-400' }
  ]
})

async function submit() {
  error.value = ''
  if (!nis.value.trim() || !password.value) {
    error.value = 'NIS dan password wajib diisi.'
    return
  }

  loading.value = true
  const err = await auth.login(nis.value, password.value)
  if (!err) {
    sessionExpired.value = false
    // `redirect_to` backend menang (mis. siswa yang voting-nya sudah selesai).
    // Kalau tidak ada, baru pakai halaman asal yang tersimpan dari 401.
    await navigateTo(auth.redirect_to || redirectTo.value || '/', { replace: true })
    return
  }

  error.value = err
  loading.value = false
}

function fieldClass(hasError: boolean) {
  return [
    'h-12 w-full rounded-xl border bg-[var(--ui-bg)] px-4 text-sm text-[var(--ui-text)] outline-none transition-all duration-200 placeholder:text-[var(--ui-text-dimmed)] focus:ring-2',
    hasError
      ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/25'
      : 'border-[var(--ui-border)] focus:border-[var(--ui-primary)] focus:ring-primary-500/25'
  ]
}
</script>

<template>
  <div class="flex min-h-[100dvh]">
    <!-- ===== Brand Panel (Desktop) ===== -->
    <aside
      class="relative hidden overflow-hidden border-r border-[var(--ui-border)] lg:flex lg:w-[52%] lg:flex-col lg:justify-between"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_420px_at_88%_-5%,rgba(22,119,255,0.18),transparent_60%),radial-gradient(520px_420px_at_-8%_112%,rgba(92,184,255,0.12),transparent_60%)]"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(22,119,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,119,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_65%_at_50%_45%,black,transparent)]"
      />

      <div class="relative flex flex-col justify-between gap-16 p-12 xl:p-16">
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <span
            class="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 text-white shadow-[0_4px_16px_rgba(22,119,255,0.35)]"
          >
            <UIcon
              name="i-lucide-vote"
              class="size-5"
            />
          </span>
          <div class="leading-tight">
            <p class="text-sm font-bold tracking-tight text-[var(--ui-text)]">
              E-Voting Dashboard
            </p>
            <p class="text-xs text-[var(--ui-text-dimmed)]">
              OSIS &amp; MPK 2026/2027
            </p>
          </div>
        </div>

        <!-- Messaging -->
        <div class="flex flex-col gap-5">
          <p class="font-inter text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-500 dark:text-primary-400">
            Pemilihan Digital 2026/2027
          </p>
          <h1
            class="max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--ui-text)] xl:text-5xl"
          >
            Suara masuk, terpantau real&nbsp;time.
          </h1>
          <p class="max-w-sm text-sm leading-relaxed text-[var(--ui-text-muted)]">
            Kelola pemilihan Ketua OSIS &amp; Anggota MPK secara transparan, aman, dan tervalidasi.
          </p>
        </div>
        <!-- Telemetry -->
      </div>
    </aside>

    <!-- ===== Form Panel ===== -->
    <main class="relative flex flex-1 items-center justify-center overflow-y-auto px-4 py-10 sm:px-8">
      <div class="w-full max-w-md">
        <!-- Brand (Mobile) -->
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span
            class="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 text-white shadow-[0_4px_16px_rgba(22,119,255,0.35)]"
          >
            <UIcon
              name="i-lucide-vote"
              class="size-5"
            />
          </span>
          <div class="leading-tight">
            <p class="text-sm font-bold tracking-tight text-[var(--ui-text)]">
              E-Voting Dashboard
            </p>
            <p class="text-xs text-[var(--ui-text-dimmed)]">
              OSIS &amp; MPK 2026/2027
            </p>
          </div>
        </div>

        <div
          class="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]/80 p-8 shadow-[0_18px_48px_-24px_rgba(7,26,51,0.55)] backdrop-blur-xl sm:p-10"
        >
          <div class="mb-8 flex flex-col gap-1.5">
            <h1 class="text-2xl font-bold tracking-tight text-[var(--ui-text)]">
              Masuk Dashboard
            </h1>
            <p class="text-sm text-[var(--ui-text-muted)]">
              Gunakan NIS dan password akun panitia.
            </p>
          </div>

          <p
            v-if="sessionExpired"
            class="mb-6 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-600 dark:text-amber-400"
            role="status"
          >
            <UIcon
              name="i-lucide-clock-alert"
              class="mt-0.5 size-4 shrink-0"
            />
            <span>
              Sesi kamu sudah berakhir. Silakan masuk kembali
              <template v-if="redirectTo">
                untuk melanjutkan ke halaman tadi.
              </template>
            </span>
          </p>

          <form
            class="flex flex-col gap-5"
            novalidate
            @submit.prevent="submit"
          >
            <div class="flex flex-col gap-2">
              <label
                for="nis"
                class="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-muted)]"
              >
                NIS
              </label>
              <input
                id="nis"
                v-model="nis"
                type="text"
                inputmode="numeric"
                autocomplete="username"
                autofocus
                placeholder="Masukkan NIS"
                :aria-invalid="!!error"
                :class="fieldClass(!!error)"
                @input="error = ''"
              >
            </div>

            <div class="flex flex-col gap-2">
              <label
                for="password"
                class="font-inter text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ui-text-muted)]"
              >
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Masukkan password"
                  :aria-invalid="!!error"
                  :class="[fieldClass(!!error), 'pr-12']"
                  @input="error = ''"
                >
                <button
                  type="button"
                  class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--ui-text-dimmed)] transition-colors hover:bg-[var(--ui-bg-accented)] hover:text-[var(--ui-text)]"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  @click="showPassword = !showPassword"
                >
                  <UIcon
                    :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    class="size-5"
                  />
                </button>
              </div>
            </div>

            <p
              v-if="error"
              class="-mt-2 flex items-center gap-1.5 text-sm font-medium text-rose-500 dark:text-rose-400"
              role="alert"
              aria-live="polite"
            >
              <UIcon
                name="i-lucide-circle-alert"
                class="size-4 shrink-0"
              />
              {{ error }}
            </p>

            <UButton
              type="submit"
              size="lg"
              block
              :loading="loading"
              class="rounded-xl bg-primary-500 font-inter text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-primary-400"
            >
              Masuk
            </UButton>
          </form>

          <p class="mt-8 rounded-xl border border-dashed border-[var(--ui-border)] bg-[var(--ui-bg)]/60 px-4 py-3 text-center text-xs text-[var(--ui-text-dimmed)]">
            Akun panitia &amp; siswa dibuat oleh admin. Hubungi admin bila belum bisa masuk.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
