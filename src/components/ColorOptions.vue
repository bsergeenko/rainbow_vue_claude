<template>
  <fieldset class="option-group" :class="{ 'has-error': !!error }" :aria-describedby="error ? `${name}-error` : undefined">
    <legend class="form-label">
      {{ legend }}<span v-if="required" class="required-mark" aria-hidden="true"> *</span><span v-if="selectedLabel" class="legend-value"> · Ausgewählt: {{ selectedLabel }}</span>
    </legend>
    <div class="color-options">
      <label v-for="color in colors" :key="color" class="color-option" :class="{ selected: modelValue === color }">
        <input
          type="radio"
          class="visually-hidden"
          :name="name"
          :value="color"
          :checked="modelValue === color"
          @change="$emit('update:modelValue', color)"
        />
        <span class="swatch" :style="{ background: COLOR_SWATCHES[color] }" aria-hidden="true"></span>
        <span class="color-option-label">{{ colorLabel(color) }}</span>
      </label>
    </div>
    <p v-if="error" :id="`${name}-error`" class="form-error" role="alert">{{ error }}</p>
  </fieldset>
</template>

<script setup>
import { computed } from 'vue'
import { COLOR_SWATCHES, colorLabel } from '../utils/format.js'

const props = defineProps({
  colors: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  name: { type: String, required: true },
  legend: { type: String, default: 'Farbe' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

const selectedLabel = computed(() => (props.modelValue ? colorLabel(props.modelValue) : ''))
</script>
