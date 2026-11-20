<template>
  <div id="search-panel" class="search-panel" @keydown.esc="$emit('close')">
    <div class="container search-inner">
      <form class="search-form" role="search" @submit.prevent>
        <label for="search-input" class="form-label">Produkte suchen</label>
        <div class="search-row">
          <div class="search-input-wrap">
            <AppIcon name="search" class="search-input-icon" :size="20" />
            <input
              id="search-input"
              ref="inputRef"
              v-model="query"
              type="search"
              class="input search-input"
              placeholder="z. B. Regenmantel, Damen oder Rot"
              autocomplete="off"
              aria-describedby="search-status"
            />
          </div>
          <button type="button" class="icon-button search-close" aria-label="Suche schließen" title="Suche schließen" @click="$emit('close')">
            <AppIcon name="close" />
          </button>
        </div>
      </form>

      <div id="search-status" class="search-results" aria-live="polite">
        <LoadingState v-if="loading" text="Produkte werden geladen …" />
        <ErrorState v-else-if="error" :message="error" retry @retry="load" />
        <template v-else-if="trimmedQuery">
          <p v-if="results.length === 0" class="empty-text">Keine Produkte gefunden.</p>
          <template v-else>
            <p class="visually-hidden">{{ results.length }} Treffer</p>
            <ul class="search-result-list">
              <li v-for="variant in results" :key="variant.key">
                <RouterLink :to="productLink(variant.product.id, variant.color)" class="search-result" @click="$emit('close')">
                  <span class="search-result-image">
                    <img v-if="variant.image" :src="variant.image" :alt="`${variant.product.name} in ${colorLabel(variant.color)}`" loading="lazy" />
                  </span>
                  <span class="search-result-text">
                    <span class="search-result-name">{{ variant.product.name }}</span>
                    <span class="search-result-meta">
                      {{ categoryLabel(variant.product.category) }}<template v-if="variant.product.subcategory"> · {{ subcategoryLabel(variant.product.subcategory) }}</template>
                      · {{ colorLabel(variant.color) }}
                    </span>
                    <span class="search-result-price">{{ displayPrice(variant.product) }}</span>
                  </span>
                </RouterLink>
              </li>
            </ul>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import LoadingState from './LoadingState.vue'
import ErrorState from './ErrorState.vue'
import { api, errorMessage } from '../utils/api.js'
import { searchProducts } from '../utils/search.js'
import { categoryLabel, colorLabel, subcategoryLabel } from '../utils/format.js'
import { displayPrice, productLink } from '../utils/products.js'

defineEmits(['close'])

const query = ref('')
const products = ref([])
const loading = ref(false)
const error = ref('')
const inputRef = ref(null)

const trimmedQuery = computed(() => query.value.trim())
const results = computed(() => searchProducts(products.value, trimmedQuery.value))

async function load() {
  loading.value = true
  error.value = ''
  try {
    products.value = await api.get('/products')
  } catch (e) {
    error.value = errorMessage(e, 'Die Produkte konnten nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  inputRef.value?.focus()
  load()
})
</script>
