<script setup lang="ts">
import type { Kandidat } from '@/utils/mockData'

defineProps<{
  kandidat?: Kandidat
}>()
</script>

<template>
  <UTooltip
    v-if="kandidat"
    :text="`${kandidat.nama} · ${kandidat.visi}`"
  >
    <span class="inline-flex cursor-help items-center gap-2">
      <span class="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-400 text-[10px] font-bold text-white">
        {{ String(kandidat.id).padStart(2, '0') }}
      </span>
      <span class="text-sm text-[var(--ui-text-muted)]">{{ kandidat.nama }}</span>
    </span>
  </UTooltip>
  <span
    v-else
    class="text-[var(--ui-text-dimmed)]"
  >
    —
  </span>
</template>
