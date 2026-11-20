<template>
  <div class="container page">
    <RouterLink v-if="fromAccount" to="/konto" class="back-link">
      <AppIcon name="arrow-left" :size="18" /> Zurück zum Benutzerkonto
    </RouterLink>
    <h1 class="page-title">Wunschliste</h1>

    <LoadingState v-if="loading" text="Wunschliste wird geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />
    <template v-else>
      <div v-if="entries.length === 0" class="empty-state">
        <p class="empty-text">Deine Wunschliste ist leer.</p>
        <RouterLink to="/" class="btn btn-secondary">Weiter einkaufen</RouterLink>
      </div>
      <ul v-else class="product-grid">
        <li v-for="entry in entries" :key="entry.itemId">
          <article class="product-card">
            <div class="product-card-media">
              <RouterLink :to="entry.link" class="product-card-image-link" tabindex="-1" aria-hidden="true">
                <img v-if="entry.image" :src="entry.image" :alt="`${entry.product.name} in ${colorLabel(entry.color)}`" loading="lazy" class="product-card-image" />
              </RouterLink>
              <WishlistButton class="product-card-heart" :product-id="entry.productId" :color="entry.color" />
            </div>
            <div class="product-card-body">
              <h2 class="product-card-title">
                <RouterLink :to="entry.link">{{ entry.product.name }}</RouterLink>
              </h2>
              <p v-if="entry.product.subcategory" class="product-card-sub">
                {{ categoryLabel(entry.product.category) }} · {{ subcategoryLabel(entry.product.subcategory) }}
              </p>
              <p v-else class="product-card-sub">{{ categoryLabel(entry.product.category) }}</p>
              <p class="product-card-color">
                <span class="swatch swatch-small" :style="{ background: COLOR_SWATCHES[entry.color] }" aria-hidden="true"></span>
                Farbe: {{ colorLabel(entry.color) }}
              </p>
              <p class="product-card-price">{{ displayPrice(entry.product) }}</p>
              <RouterLink :to="entry.link" class="btn btn-secondary btn-small">Größe wählen</RouterLink>
            </div>
          </article>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import WishlistButton from '../components/WishlistButton.vue'
import { errorMessage } from '../utils/api.js'
import { COLOR_SWATCHES, categoryLabel, colorLabel, subcategoryLabel } from '../utils/format.js'
import { displayPrice, firstImage, productLink } from '../utils/products.js'
import { loadWishlist, wishlistItems } from '../stores/wishlist.js'

const route = useRoute()
const fromAccount = computed(() => route.query.von === 'konto')
const loading = ref(true)
const error = ref('')

const entries = computed(() =>
  wishlistItems.value
    .filter((item) => item.product)
    .map((item) => ({
      ...item,
      image: firstImage(item.product, item.color),
      link: productLink(item.productId, item.color)
    }))
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    await loadWishlist()
  } catch (e) {
    error.value = errorMessage(e, 'Deine Wunschliste konnte nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
