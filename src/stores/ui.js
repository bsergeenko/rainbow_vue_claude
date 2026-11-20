import { ref } from 'vue'

// Wird erhöht, wenn ein Navigationslink zur bereits geöffneten Seite angeklickt wird.
// Die Seite wird dann neu aufgebaut (z. B. neuer Auswahlzustand in „Dein Design“).
export const pageReloadKey = ref(0)

export const searchOpen = ref(false)

export const lastOrder = ref(null)
