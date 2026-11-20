<template>
  <fieldset class="option-group" :class="{ 'has-error': !!error }" :aria-describedby="error ? `${name}-error` : undefined">
    <legend class="form-label">
      {{ legend }}<span v-if="required" class="required-mark" aria-hidden="true"> *</span>
    </legend>
    <div class="choice-options" :class="{ 'choice-options-large': large }">
      <label v-for="option in options" :key="option.value" class="choice-option" :class="{ selected: modelValue === option.value }">
        <input
          type="radio"
          class="visually-hidden"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="$emit('update:modelValue', option.value)"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>
    <p v-if="error" :id="`${name}-error`" class="form-error" role="alert">{{ error }}</p>
  </fieldset>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  name: { type: String, required: true },
  legend: { type: String, required: true },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  large: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])
</script>
