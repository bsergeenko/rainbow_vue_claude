import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isLoggedIn } from '../stores/auth.js'
import { addToWishlist, findWishlistItem, removeFromWishlist } from '../stores/wishlist.js'
import { notify, notifyError } from '../stores/toast.js'
import { errorMessage } from '../utils/api.js'

export function useWishlistToggle() {
  const router = useRouter()
  const busyKey = ref('')

  function isSaved(productId, color) {
    return !!findWishlistItem(productId, color)
  }

  async function toggle(productId, color) {
    // Gäste werden zur Login-Seite geleitet – keine lokale Wunschliste
    if (!isLoggedIn.value) {
      notify('Bitte melde dich an, um Produkte auf deiner Wunschliste zu speichern.', {
        type: 'info',
        keepOnNextPage: true
      })
      router.push('/login')
      return
    }

    const key = `${productId}-${color}`
    if (busyKey.value) return
    busyKey.value = key
    try {
      const existing = findWishlistItem(productId, color)
      if (existing) {
        await removeFromWishlist(existing.itemId)
        notify('Das Produkt wurde von deiner Wunschliste entfernt.')
      } else {
        await addToWishlist(productId, color)
        notify('Das Produkt wurde zu deiner Wunschliste hinzugefügt.')
      }
    } catch (error) {
      notifyError(errorMessage(error, 'Die Wunschliste konnte nicht aktualisiert werden.'))
    } finally {
      busyKey.value = ''
    }
  }

  return { isSaved, toggle, busyKey }
}
