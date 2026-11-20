<template>
  <RouterLink :to="to" @click="onClick">
    <slot />
  </RouterLink>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { pageReloadKey } from '../stores/ui.js'

const props = defineProps({
  to: { type: [String, Object], required: true }
})

const emit = defineEmits(['navigate'])
const router = useRouter()

// Klick auf einen Link zur bereits geöffneten Seite: Seite neu aufbauen bzw. zum Abschnitt scrollen
function onClick(event) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return
  const target = router.resolve(props.to)
  const current = router.currentRoute.value
  if (target.fullPath === current.fullPath) {
    if (target.hash) {
      const element = document.querySelector(target.hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1')
        element.focus({ preventScroll: true })
      }
    } else {
      pageReloadKey.value++
      window.scrollTo({ top: 0 })
    }
  }
  emit('navigate')
}
</script>
