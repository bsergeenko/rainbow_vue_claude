<template>
  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="cancel">
      <div
        ref="dialogRef"
        class="dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="textId"
        @keydown="onKeydown"
      >
        <h2 :id="titleId" class="dialog-title">{{ title }}</h2>
        <div :id="textId" class="dialog-text">
          <slot />
        </div>
        <div class="dialog-actions">
          <button ref="cancelRef" type="button" class="btn btn-secondary" :disabled="busy" @click="cancel">
            {{ cancelLabel }}
          </button>
          <button type="button" class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" :disabled="busy" @click="$emit('confirm')">
            {{ busy ? 'Bitte warten …' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  confirmLabel: { type: String, default: 'Bestätigen' },
  cancelLabel: { type: String, default: 'Abbrechen' },
  danger: { type: Boolean, default: false },
  busy: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel'])

const id = `dialog-${Math.random().toString(36).slice(2, 10)}`
const titleId = `${id}-title`
const textId = `${id}-text`
const dialogRef = ref(null)
const cancelRef = ref(null)
let previousFocus = null

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement
      await nextTick()
      cancelRef.value?.focus()
    } else if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus()
      previousFocus = null
    }
  }
)

function cancel() {
  if (!props.busy) emit('cancel')
}

// Fokus bleibt innerhalb des Dialogs; Escape schließt ihn
function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return
  const focusable = [...dialogRef.value.querySelectorAll('button:not([disabled]), a[href], input, textarea, select')]
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>
