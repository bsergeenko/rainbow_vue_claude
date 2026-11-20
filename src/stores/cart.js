import { computed, ref } from 'vue'
import { api } from '../utils/api.js'

export const cartItems = ref([])

// Summe der Artikelmengen für das Warenkorb-Symbol
export const cartCount = computed(() =>
  cartItems.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
)

export async function loadCart() {
  const items = await api.get('/cart')
  cartItems.value = Array.isArray(items) ? items : []
  return cartItems.value
}

export async function addToCart(item) {
  const result = await api.post('/cart', { quantity: 1, ...item })
  await loadCart().catch(() => {})
  return result
}

export async function updateCartQuantity(itemId, quantity) {
  const updated = await api.put(`/cart/${encodeURIComponent(itemId)}`, { quantity })
  cartItems.value = cartItems.value.map((item) => (item.itemId === itemId ? { ...item, quantity: updated.quantity } : item))
  return updated
}

export async function removeCartItem(itemId) {
  await api.delete(`/cart/${encodeURIComponent(itemId)}`)
  cartItems.value = cartItems.value.filter((item) => item.itemId !== itemId)
}

export function resetCart() {
  cartItems.value = []
}
