<script setup lang="ts">
import { computed, ref } from 'vue'

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

const labelClass
  = 'block text-center text-[15px] font-medium italic tracking-[0.04em] text-[#8fd0ff]'

const fieldClass = [
  'h-12 w-full rounded-full bg-white pl-6 pr-12 text-sm font-medium text-[#0b2545] outline-none transition-shadow duration-200 placeholder:text-[#0b2545]/30 focus:ring-4 focus:ring-white/25'
]
</script>

<template>
  <div
    class="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-[#04162e] bg-cover bg-center"
    style="background-image: url('/images/login-bg.png')"
  >
    <div class="pointer-events-none absolute inset-0 bg-[#04162e]/25" />

    <!-- ===== Logo Pill ===== -->
    <header class="relative z-10 mt-8 flex justify-center px-4">
      <img
        src="/images/logo_osis.svg"
        alt="Logo SMK Plus Pelita Nusantara, OSIS, dan MPK"
        class="h-14 w-auto select-none object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] sm:h-16"
      >
    </header>

    <!-- ===== Form ===== -->
    <main class="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-10">
      <div class="w-full max-w-[400px] text-center">
        <!-- Badge Admin Panel yang Rapi -->
        <div class="mb-8 flex justify-center">
          <span class="rounded-full bg-[#2f8ae0] px-4 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_26px_-10px_rgba(47,138,224,0.9)]">
            Admin Panel
          </span>
        </div>

        <img
          src="/images/evotingpenus.svg"
          alt="PENUS E-Voting"
          class="mx-auto mb-3 block h-auto w-[260px] select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)] sm:w-[300px]"
        >

        <p class="mb-11 text-lg italic text-white/90">
          Masukan Data Diri Anda
        </p>

        <p
          v-if="sessionExpired"
          class="mb-6 rounded-full bg-amber-400/15 px-4 py-2 text-sm text-amber-200 ring-1 ring-amber-300/40"
          role="status"
        >
          Sesi kamu sudah berakhir. Silakan masuk kembali
          <template v-if="redirectTo">
            untuk melanjutkan ke halaman tadi.
          </template>
        </p>

        <form
          class="flex flex-col"
          novalidate
          @submit.prevent="submit"
        >
          <label
            for="nis"
            :class="labelClass"
          >NIS/NIG</label>
          <input
            id="nis"
            v-model="nis"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            autofocus
            placeholder="Masukkan NIS/NIG"
            :class="fieldClass"
            @input="error = ''"
          >

          <label
            for="password"
            :class="[labelClass, 'mt-7']"
          >PASSWORD</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Masukkan password"
              :class="fieldClass"
              @input="error = ''"
            >
            <button
              type="button"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#0b2545]/45 transition-colors hover:bg-[#0b2545]/5 hover:text-[#0b2545]"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              @click="showPassword = !showPassword"
            >
              <UIcon
                :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="size-4.5"
              />
            </button>
          </div>

          <p
            v-if="error"
            class="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-rose-200"
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
            :loading="loading"
            class="mx-auto mt-9 rounded-full bg-[#2f8ae0] px-10 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_26px_-10px_rgba(47,138,224,0.9)] hover:bg-[#3f9bf0]"
          >
            Masuk
          </UButton>
        </form>

        <div class="mt-14 flex flex-col items-center gap-5">
          <img
            src="/images/logo_jurusan.svg"
            alt="Logo divisi TKJ, DKV, dan RPL"
            class="h-12 w-auto select-none object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] sm:h-14"
          >

          <p class="text-sm text-white/80">
            <span class="font-semibold text-white">Powered by</span>
            <span class="ml-1 font-bold tracking-[0.06em] text-[#8fd0ff]">DEVACCTO IT</span>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
