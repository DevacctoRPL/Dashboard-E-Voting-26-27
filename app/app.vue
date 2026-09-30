<script setup lang="ts">
import { SESSION_EXPIRED_STATE } from '@/api/client'

useHead({
  htmlAttrs: { lang: 'id' },
  title: 'Dashboard E-Voting OSIS & MPK'
})

useSeoMeta({
  title: 'Dashboard E-Voting OSIS & MPK',
  description: 'Dashboard pemantauan pemilihan Ketua OSIS & Anggota MPK.'
})

// Toast global: backend membalas 401/419 → `api()` menyalakan state ini.
// Tidak di-reset di sini — `/login` membacanya untuk banner, dan membersihkannya
// sendiri saat sudah pindah atau login berhasil.
const sessionExpired = useState<boolean>(SESSION_EXPIRED_STATE, () => false)
const toast = useToast()

watch(sessionExpired, (value) => {
  if (!value) return
  toast.add({
    title: 'Sesi Berakhir',
    description: 'Token login kamu sudah tidak valid. Silakan masuk kembali.',
    icon: 'i-lucide-clock-alert',
    color: 'warning'
  })
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
