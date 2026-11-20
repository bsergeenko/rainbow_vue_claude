<template>
  <NotFoundView v-if="notFound" />
  <div v-else class="container page">
    <LoadingState v-if="loading" text="Produkt wird geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />

    <template v-else-if="product">
      <RouterLink :to="categoryRoute" class="back-link">
        <AppIcon name="arrow-left" :size="18" /> Zurück zu {{ categoryLabel(product.category) }}
      </RouterLink>

      <div class="product-detail">
        <div class="gallery">
          <div class="gallery-main">
            <img
              v-if="images.length"
              :src="images[activeImage]"
              :alt="`${product.name} in ${colorLabel(selectedColor)} – Bild ${activeImage + 1} von ${images.length}`"
              class="gallery-main-image"
            />
          </div>
          <ul v-if="images.length > 1" class="gallery-thumbs" aria-label="Weitere Produktbilder">
            <li v-for="(image, index) in images" :key="image">
              <button
                type="button"
                class="gallery-thumb"
                :class="{ selected: index === activeImage }"
                :aria-pressed="index === activeImage ? 'true' : 'false'"
                :aria-label="`Bild ${index + 1} anzeigen`"
                @click="activeImage = index"
              >
                <img :src="image" alt="" loading="lazy" />
              </button>
            </li>
          </ul>
        </div>

        <div class="product-info">
          <p class="product-info-category">
            {{ categoryLabel(product.category) }}<template v-if="product.subcategory"> · {{ subcategoryLabel(product.subcategory) }}</template>
          </p>
          <div class="product-info-head">
            <h1 class="page-title product-title">{{ product.name }}</h1>
            <WishlistButton v-if="selectedColor" :product-id="product.id" :color="selectedColor" />
          </div>
          <p class="product-price" aria-live="polite">{{ priceText }}</p>
          <p class="product-description">{{ product.description }}</p>

          <form class="product-form" novalidate @submit.prevent="submit">
            <ColorOptions
              v-model="selectedColor"
              required
              name="product-color"
              :colors="colors"
              :error="showErrors && !selectedColor ? 'Bitte wähle eine Farbe aus.' : ''"
            />

            <ChoiceOptions
              v-model="selectedSize"
              name="product-size"
              legend="Größe"
              required
              :options="sizeOptions"
              :error="showErrors && !selectedSize ? 'Bitte wähle eine Größe aus.' : ''"
            />

            <button type="submit" class="btn btn-primary btn-large btn-block" :disabled="adding">
              {{ adding ? 'Wird hinzugefügt …' : 'In den Warenkorb' }}
            </button>
          </form>

          <div v-if="product.customizable" class="design-hint">
            <p>Gestalte diesen Mantel mit deinem eigenen Rückenmotiv.</p>
            <RouterLink to="/dein-design" class="btn btn-secondary">Dein Design</RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import ChoiceOptions from '../components/ChoiceOptions.vue'
import ColorOptions from '../components/ColorOptions.vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import WishlistButton from '../components/WishlistButton.vue'
import NotFoundView from './NotFoundView.vue'
import { api, ApiError, errorMessage } from '../utils/api.js'
import { CATEGORY_ROUTES, categoryLabel, colorLabel, formatPrice, sizeLabel, subcategoryLabel } from '../utils/format.js'
import { colorsWithImages, displayPrice, hasSizePrices, imagesFor, unitPrice } from '../utils/products.js'
import { addToCart } from '../stores/cart.js'
import { notify, notifyError } from '../stores/toast.js'

const route = useRoute()

const product = ref(null)
const loading = ref(true)
const error = ref('')
const notFound = ref(false)
const selectedColor = ref('')
const selectedSize = ref('')
const activeImage = ref(0)
const showErrors = ref(false)
const adding = ref(false)

const colors = computed(() => colorsWithImages(product.value))
const images = computed(() => imagesFor(product.value, selectedColor.value))
const sizeOptions = computed(() => (product.value?.sizes || []).map((size) => ({ value: size, label: sizeLabel(size) })))
const categoryRoute = computed(() => CATEGORY_ROUTES[product.value?.category] || '/')

const priceText = computed(() => {
  if (!product.value) return ''
  if (hasSizePrices(product.value) && selectedSize.value) {
    return formatPrice(unitPrice(product.value, selectedSize.value))
  }
  return displayPrice(product.value)
})

watch(selectedColor, () => {
  activeImage.value = 0
})

async function load() {
  loading.value = true
  error.value = ''
  notFound.value = false
  try {
    const data = await api.get(`/products/${encodeURIComponent(route.params.id)}`)
    product.value = data
    const requested = String(route.query.farbe || '')
    const available = colorsWithImages(data)
    selectedColor.value = available.includes(requested) ? requested : available[0] || ''
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound.value = true
    } else {
      error.value = errorMessage(e, 'Das Produkt konnte nicht geladen werden.')
    }
  } finally {
    loading.value = false
  }
}

async function submit() {
  showErrors.value = true
  if (!selectedColor.value || !selectedSize.value) return
  adding.value = true
  try {
    await addToCart({
      productId: product.value.id,
      color: selectedColor.value,
      size: selectedSize.value,
      quantity: 1
    })
    notify(`„${product.value.name}“ wurde in den Warenkorb gelegt.`)
    showErrors.value = false
  } catch (e) {
    notifyError(errorMessage(e, 'Das Produkt konnte nicht in den Warenkorb gelegt werden.'))
  } finally {
    adding.value = false
  }
}

onMounted(load)
</script>
