<template>
  <div class="container page">
    <h1 class="page-title">{{ title }}</h1>

    <ChoiceOptions
      v-if="category === 'kids'"
      v-model="kidsFilter"
      class="filter-group"
      name="kids-filter"
      legend="Anzeigen"
      :options="kidsFilterOptions"
    />

    <LoadingState v-if="loading" text="Produkte werden geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />
    <template v-else>
      <p v-if="variants.length === 0" class="empty-text">In dieser Kategorie sind derzeit keine Produkte vorhanden.</p>
      <ul v-else class="product-grid">
        <li v-for="variant in variants" :key="variant.key">
          <ProductCard :variant="variant" />
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ChoiceOptions from '../components/ChoiceOptions.vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import ProductCard from '../components/ProductCard.vue'
import { api, errorMessage } from '../utils/api.js'
import { CATEGORY_LABELS } from '../utils/format.js'
import { productVariants } from '../utils/products.js'

const props = defineProps({
  category: { type: String, required: true }
})

const kidsFilterOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'girls', label: 'Mädchen' },
  { value: 'boys', label: 'Jungen' }
]

const products = ref([])
const loading = ref(true)
const error = ref('')
const kidsFilter = ref('all')

const title = computed(() => CATEGORY_LABELS[props.category])

const variants = computed(() =>
  products.value
    .filter((product) => product.category === props.category)
    .filter((product) => props.category !== 'kids' || kidsFilter.value === 'all' || product.subcategory === kidsFilter.value)
    .flatMap(productVariants)
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.get('/products')
    products.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = errorMessage(e, 'Die Produkte konnten nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
