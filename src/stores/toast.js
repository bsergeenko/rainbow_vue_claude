import { ref } from 'vue'

export const toasts = ref([])
let nextId = 1
const timers = new Map()

/**
 * Zeigt eine temporäre Statusmeldung an.
 * keepOnNextPage: Meldung überlebt genau einen anschließenden Seitenwechsel
 * (z. B. Bestätigung nach Registrierung → Login-Seite).
 */
export function notify(message, { type = 'success', duration = 5000, keepOnNextPage = false } = {}) {
  const id = nextId++
  toasts.value = [...toasts.value, { id, message, type, keep: keepOnNextPage }]
  if (duration > 0) {
    timers.set(id, setTimeout(() => dismiss(id), duration))
  }
  return id
}

export function notifyError(message, options = {}) {
  return notify(message, { type: 'error', duration: 8000, ...options })
}

export function dismiss(id) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

// Nach einem Seitenwechsel werden Meldungen entfernt
export function clearOnPageChange() {
  const remaining = []
  for (const toast of toasts.value) {
    if (toast.keep) {
      remaining.push({ ...toast, keep: false })
    } else {
      const timer = timers.get(toast.id)
      if (timer) {
        clearTimeout(timer)
        timers.delete(toast.id)
      }
    }
  }
  toasts.value = remaining
}
