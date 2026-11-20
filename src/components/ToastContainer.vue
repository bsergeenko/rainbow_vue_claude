<template>
  <div class="toast-container" aria-live="polite" aria-atomic="false">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="`toast-${toast.type}`"
      :role="toast.type === 'error' ? 'alert' : 'status'"
    >
      <p class="toast-message">{{ toast.message }}</p>
      <button type="button" class="toast-close" aria-label="Meldung schließen" title="Meldung schließen" @click="dismiss(toast.id)">
        <AppIcon name="close" :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
import { dismiss, toasts } from '../stores/toast.js'
</script>
