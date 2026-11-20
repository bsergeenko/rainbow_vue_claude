<template>
  <section aria-labelledby="admin-products-title">
    <h1 id="admin-products-title" class="page-title">Produkte</h1>

    <LoadingState v-if="loading" text="Produkte werden geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />
    <p v-else-if="products.length === 0" class="empty-text">Es sind keine Produkte vorhanden.</p>

    <ul v-else class="admin-list">
      <li v-for="product in products" :key="product.id" class="admin-card">
        <div class="admin-product">
          <div class="admin-product-image">
            <img v-if="thumbnail(product)" :src="thumbnail(product)" :alt="product.name" loading="lazy" />
          </div>
          <div class="admin-product-body">
            <template v-if="editingId !== product.id">
              <div class="section-head">
                <div>
                  <h2 class="admin-card-title">{{ product.name }}</h2>
                  <p class="muted small">
                    {{ categoryLabel(product.category) }}<template v-if="product.subcategory"> · {{ subcategoryLabel(product.subcategory) }}</template>
                    · {{ product.customizable ? 'Individualisierbar' : 'Nicht individualisierbar' }}
                  </p>
                </div>
                <button type="button" class="btn btn-secondary btn-small" @click="startEdit(product)">Bearbeiten</button>
              </div>
              <p class="admin-description">{{ product.description }}</p>
              <dl class="data-list compact">
                <template v-if="hasSizePrices(product)">
                  <div v-for="size in product.sizes" :key="size">
                    <dt>Preis {{ sizeLabel(size) }}</dt>
                    <dd>{{ formatPrice(product.pricesBySize[size]) }}</dd>
                  </div>
                </template>
                <div v-else><dt>Preis</dt><dd>{{ formatPrice(product.price) }}</dd></div>
                <div><dt>Farben</dt><dd>{{ product.colors.map(colorLabel).join(', ') }}</dd></div>
                <div><dt>Größen</dt><dd>{{ product.sizes.map(sizeLabel).join(', ') }}</dd></div>
              </dl>
            </template>

            <form v-else class="form-stack" novalidate @submit.prevent="save(product)">
              <h2 class="admin-card-title">Produkt bearbeiten</h2>
              <p v-if="saveError" class="alert alert-error" role="alert">{{ saveError }}</p>
              <FormField :id="`p-name-${product.id}`" label="Produktname" required :error="form.errors.value.name">
                <template #default="{ id, invalid, describedby }">
                  <input :id="id" v-model="form.values.name" v-bind="form.bind('name')" class="input" :aria-invalid="invalid" :aria-describedby="describedby" />
                </template>
              </FormField>
              <FormField :id="`p-desc-${product.id}`" label="Beschreibung" required :error="form.errors.value.description">
                <template #default="{ id, invalid, describedby }">
                  <textarea :id="id" v-model="form.values.description" v-bind="form.bind('description')" class="input textarea" rows="4" :aria-invalid="invalid" :aria-describedby="describedby"></textarea>
                </template>
              </FormField>
              <div v-if="hasSizePrices(product)" class="form-grid three">
                <FormField
                  v-for="size in product.sizes"
                  :id="`p-price-${product.id}-${size}`"
                  :key="size"
                  :label="`Preis ${sizeLabel(size)} (€)`"
                  required
                  :error="form.errors.value[`size_${size}`]"
                >
                  <template #default="{ id, invalid, describedby }">
                    <input :id="id" v-model="form.values[`size_${size}`]" v-bind="form.bind(`size_${size}`)" class="input" inputmode="decimal" :aria-invalid="invalid" :aria-describedby="describedby" />
                  </template>
                </FormField>
              </div>
              <FormField v-else :id="`p-price-${product.id}`" label="Preis (€)" required :error="form.errors.value.price">
                <template #default="{ id, invalid, describedby }">
                  <input :id="id" v-model="form.values.price" v-bind="form.bind('price')" class="input input-short" inputmode="decimal" :aria-invalid="invalid" :aria-describedby="describedby" />
                </template>
              </FormField>
              <div class="button-row">
                <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Wird gespeichert …' : 'Speichern' }}</button>
                <button type="button" class="btn btn-secondary" :disabled="saving" @click="cancelEdit">Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { onMounted, ref, shallowRef } from 'vue'
import ErrorState from '../../components/ErrorState.vue'
import FormField from '../../components/FormField.vue'
import LoadingState from '../../components/LoadingState.vue'
import { useForm } from '../../composables/useForm.js'
import { api, errorMessage } from '../../utils/api.js'
import { categoryLabel, colorLabel, formatPrice, sizeLabel, subcategoryLabel } from '../../utils/format.js'
import { colorsWithImages, firstImage, hasSizePrices } from '../../utils/products.js'
import { nonNegativePrice, parsePrice, required } from '../../utils/validation.js'
import { notify } from '../../stores/toast.js'

const products = ref([])
const loading = ref(true)
const error = ref('')
const editingId = ref('')
const saving = ref(false)
const saveError = ref('')
const form = shallowRef(useForm({}, {}))

function thumbnail(product) {
  const color = colorsWithImages(product)[0]
  return color ? firstImage(product, color) : ''
}

function formatInput(value) {
  const number = Number(value)
  return Number.isFinite(number) ? String(number).replace('.', ',') : ''
}

function startEdit(product) {
  const values = { name: product.name, description: product.description }
  const rules = {
    name: required('einen Produktnamen'),
    description: required('eine Beschreibung')
  }
  if (hasSizePrices(product)) {
    for (const size of product.sizes) {
      values[`size_${size}`] = formatInput(product.pricesBySize[size])
      rules[`size_${size}`] = [required('einen Preis'), nonNegativePrice()]
    }
  } else {
    values.price = formatInput(product.price)
    rules.price = [required('einen Preis'), nonNegativePrice()]
  }
  form.value = useForm(values, rules)
  saveError.value = ''
  editingId.value = product.id
}

function cancelEdit() {
  editingId.value = ''
  saveError.value = ''
}

async function save(product) {
  saveError.value = ''
  if (!form.value.validate()) return
  const values = form.value.values
  const body = { name: values.name.trim(), description: values.description.trim() }
  if (hasSizePrices(product)) {
    body.pricesBySize = {}
    for (const size of product.sizes) body.pricesBySize[size] = parsePrice(values[`size_${size}`])
  } else {
    body.price = parsePrice(values.price)
  }
  saving.value = true
  try {
    const updated = await api.put(`/products/${encodeURIComponent(product.id)}`, body)
    products.value = products.value.map((item) =>
      item.id === product.id ? { ...item, ...updated, imagesByColor: item.imagesByColor } : item
    )
    editingId.value = ''
    notify(`Das Produkt „${updated.name}“ wurde gespeichert.`)
  } catch (e) {
    saveError.value = errorMessage(e, 'Das Produkt konnte nicht gespeichert werden.')
  } finally {
    saving.value = false
  }
}

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
