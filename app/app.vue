<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  title: 'Dashboard E-Voting OSIS & MPK'
})

useSeoMeta({
  title: 'Dashboard E-Voting OSIS & MPK',
  description: 'Dashboard pemantauan pemilihan Ketua OSIS & Anggota MPK.'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
