import { ref } from 'vue'
import { api } from '../utils/api.js'

export const wishlistItems = ref([])
export const wishlistLoaded = ref(false)

export async function loadWishlist() {
  const items = await api.get('/wishlist')
  wishlistItems.value = Array.isArray(items) ? items : []
  wishlistLoaded.value = true
  return wishlistItems.value
}

export function findWishlistItem(productId, color) {
  return wishlistItems.value.find((item) => item.productId === productId && item.color === color) || null
}

export async function addToWishlist(productId, color) {
  await api.post('/wishlist', { productId, color })
  await loadWishlist()
}

export async function removeFromWishlist(itemId) {
  await api.delete(`/wishlist/${encodeURIComponent(itemId)}`)
  wishlistItems.value = wishlistItems.value.filter((item) => item.itemId !== itemId)
}

export function resetWishlist() {
  wishlistItems.value = []
  wishlistLoaded.value = false
}
