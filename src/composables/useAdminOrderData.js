import { ref } from 'vue'
import { api, errorMessage } from '../utils/api.js'

/**
 * Lädt alle Daten, die für Bestellübersichten im Adminbereich benötigt werden.
 */
export function useAdminOrderData() {
  const orders = ref([])
  const users = ref([])
  const products = ref([])
  const designs = ref({ adult: [], kids: [] })
  const shippingOptions = ref([])
  const loading = ref(true)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [orderData, userData, productData, designData, shippingData] = await Promise.all([
        api.get('/orders'),
        api.get('/users'),
        api.get('/products'),
        api.get('/designs'),
        api.get('/shipping-options')
      ])
      orders.value = (Array.isArray(orderData) ? orderData : []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      users.value = Array.isArray(userData) ? userData : []
      products.value = Array.isArray(productData) ? productData : []
      designs.value = designData || { adult: [], kids: [] }
      shippingOptions.value = Array.isArray(shippingData) ? shippingData : []
    } catch (e) {
      error.value = errorMessage(e, 'Die Daten konnten nicht geladen werden.')
    } finally {
      loading.value = false
    }
  }

  function replaceOrder(updated) {
    orders.value = orders.value.map((order) => (order.id === updated.id ? { ...order, ...updated } : order))
  }

  return { orders, users, products, designs, shippingOptions, loading, error, load, replaceOrder }
}
