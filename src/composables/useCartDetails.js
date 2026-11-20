import { computed, ref } from 'vue'
import { api, errorMessage } from '../utils/api.js'
import { buildLine } from '../utils/lines.js'
import { cartItems, loadCart } from '../stores/cart.js'

/**
 * Lädt den Warenkorb (GET /cart) und ergänzt Produktinformationen und Preise
 * (GET /products) sowie Rückenmotive (GET /designs).
 */
export function useCartDetails() {
  const products = ref([])
  const designs = ref({ adult: [], kids: [] })
  const loading = ref(true)
  const error = ref('')

  const lines = computed(() => cartItems.value.map((item) => buildLine(item, products.value, designs.value)))

  const subtotal = computed(() =>
    lines.value.reduce((sum, line) => sum + (Number.isFinite(line.lineTotal) ? line.lineTotal : 0), 0)
  )

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [productData, designData] = await Promise.all([api.get('/products'), api.get('/designs'), loadCart()])
      products.value = Array.isArray(productData) ? productData : []
      designs.value = designData || { adult: [], kids: [] }
    } catch (e) {
      error.value = errorMessage(e, 'Der Warenkorb konnte nicht geladen werden.')
    } finally {
      loading.value = false
    }
  }

  return { lines, subtotal, loading, error, load, products, designs }
}
