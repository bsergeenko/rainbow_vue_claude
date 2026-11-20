<template>
  <span class="status-badge" :class="`status-${status}`">{{ statusLabel(status) }}</span>
</template>

<script setup>
import { statusLabel } from '../utils/format.js'

defineProps({
  status: { type: String, required: true }
})
</script>
