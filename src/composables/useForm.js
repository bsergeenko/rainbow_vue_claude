import { computed, reactive, ref } from 'vue'

/**
 * Kleine Formularhilfe: Fehlermeldungen erscheinen erst nach einem
 * Absendeversuch oder nachdem das betroffene Feld bearbeitet wurde.
 */
export function useForm(initialValues, rules = {}) {
  const initial = { ...initialValues }
  const values = reactive({ ...initialValues })
  const edited = reactive({})
  const touched = reactive({})
  const submitted = ref(false)

  const allErrors = computed(() => {
    const result = {}
    for (const key of Object.keys(rules)) {
      const list = Array.isArray(rules[key]) ? rules[key] : [rules[key]]
      result[key] = ''
      for (const rule of list) {
        const message = rule(values[key], values)
        if (message) {
          result[key] = message
          break
        }
      }
    }
    return result
  })

  const errors = computed(() => {
    const result = {}
    for (const key of Object.keys(allErrors.value)) {
      result[key] = submitted.value || touched[key] ? allErrors.value[key] : ''
    }
    return result
  })

  const isValid = computed(() => Object.values(allErrors.value).every((message) => !message))

  function touch(key) {
    touched[key] = true
  }

  // Bindungen für Eingabefelder: Prüfung nach Bearbeitung (Verlassen des Feldes)
  function bind(key) {
    return {
      onInput: () => {
        edited[key] = true
      },
      onChange: () => {
        edited[key] = true
        touched[key] = true
      },
      onBlur: () => {
        if (edited[key]) touched[key] = true
      }
    }
  }

  function validate() {
    submitted.value = true
    return isValid.value
  }

  function reset(newValues) {
    const next = newValues ? { ...initial, ...newValues } : { ...initial }
    for (const key of Object.keys(values)) {
      values[key] = next[key]
    }
    for (const key of Object.keys(next)) {
      values[key] = next[key]
    }
    for (const key of Object.keys(touched)) delete touched[key]
    for (const key of Object.keys(edited)) delete edited[key]
    submitted.value = false
  }

  return { values, errors, isValid, submitted, touch, bind, validate, reset }
}
