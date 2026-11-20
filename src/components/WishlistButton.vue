<template>
  <button
    type="button"
    class="wishlist-button"
    :class="{ saved }"
    :aria-pressed="saved ? 'true' : 'false'"
    :aria-label="label"
    :title="label"
    :disabled="busy"
    @click="toggle(productId, color)"
  >
    <AppIcon name="heart" :filled="saved" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { useWishlistToggle } from '../composables/useWishlistToggle.js'

const props = defineProps({
  productId: { type: String, required: true },
  color: { type: String, required: true }
})

const { isSaved, toggle, busyKey } = useWishlistToggle()

const saved = computed(() => isSaved(props.productId, props.color))
const busy = computed(() => busyKey.value === `${props.productId}-${props.color}`)
const label = computed(() => (saved.value ? 'Von der Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'))
</script>
