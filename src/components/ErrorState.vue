<template>
  <div class="alert alert-error" role="alert">
    <p>{{ message }}</p>
    <button v-if="retry" type="button" class="btn btn-secondary btn-small" @click="$emit('retry')">
      Erneut versuchen
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, required: true },
  retry: { type: Boolean, default: false }
})

defineEmits(['retry'])
</script>
