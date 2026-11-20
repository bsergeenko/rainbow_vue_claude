<template>
  <div class="form-field" :class="{ 'has-error': !!error }">
    <label :for="id" class="form-label">
      {{ label }}<span v-if="required" class="required-mark" aria-hidden="true"> *</span>
      <span v-if="required" class="visually-hidden"> (Pflichtfeld)</span>
      <span v-if="optional" class="optional-mark"> (optional)</span>
    </label>
    <slot :id="id" :invalid="!!error" :describedby="describedby" />
    <p v-if="hint" :id="`${id}-hint`" class="form-hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="form-error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: '' }
})

const describedby = computed(() => {
  const ids = []
  if (props.hint) ids.push(`${props.id}-hint`)
  if (props.error) ids.push(`${props.id}-error`)
  return ids.length ? ids.join(' ') : undefined
})
</script>
