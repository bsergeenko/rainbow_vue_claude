<template>
  <div class="container page">
    <h1 class="page-title">Dein Design</h1>

    <LoadingState v-if="loading" text="Dein Design wird geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />

    <!-- Schritt 1: Motivkatalog -->
    <section v-else-if="mode === 'catalog'" aria-labelledby="catalog-title">
      <div class="info-box">
        <h2 id="catalog-title" class="info-box-title">Wähle dein Rückenmotiv</h2>
        <p>
          Wähle zuerst ein Rückenmotiv aus. Anschließend konfigurierst du deinen Mantel für Damen, Herren, Kinder oder Hund.
        </p>
      </div>

      <div class="catalog-toolbar">
        <ChoiceOptions v-model="catalogFilter" name="catalog-filter" legend="Motive anzeigen" :options="catalogFilterOptions" />
        <button v-if="selectedDesign" type="button" class="btn btn-secondary" @click="backToConfiguration">
          Zurück zur Konfiguration
        </button>
      </div>

      <ul class="design-grid">
        <li v-for="design in filteredDesigns" :key="design.id">
          <button
            type="button"
            class="design-card"
            :class="{ selected: design.id === selectedDesignId }"
            :aria-pressed="design.id === selectedDesignId ? 'true' : 'false'"
            @click="chooseDesign(design.id)"
          >
            <span class="design-card-image">
              <img :src="assetUrl(design.image)" :alt="designLabel(design, designs)" loading="lazy" />
            </span>
            <span class="design-card-label">{{ designLabel(design, designs) }}</span>
          </button>
        </li>
      </ul>
    </section>

    <!-- Schritt 2: Konfiguration -->
    <section v-else class="configurator" aria-label="Mantel konfigurieren">
      <div class="configurator-visual">
        <div class="selected-motif">
          <p class="selected-motif-caption">Dein Rückenmotiv</p>
          <div class="selected-motif-frame">
            <img :src="assetUrl(selectedDesign.image)" :alt="`Ausgewähltes Rückenmotiv: ${designLabel(selectedDesign, designs)}`" />
          </div>
          <div class="selected-motif-footer">
            <span class="selected-motif-name">{{ designLabel(selectedDesign, designs) }}</span>
            <button type="button" class="btn btn-secondary btn-small" @click="changeDesign">Motiv ändern</button>
          </div>
        </div>

        <div v-if="product && color" class="color-preview">
          <p class="selected-motif-caption">Farbvorschau</p>
          <div v-if="previewImage" class="color-preview-frame">
            <img :src="previewImage" :alt="`Vorschau: ${product.name} für ${TARGET_LABELS[target]} in ${colorLabel(color)}`" />
          </div>
          <p v-else class="alert alert-info">
            Für diese Farbe ist kein Vorschaubild vorhanden. Der Mantel kann trotzdem in dieser Farbe bestellt werden.
          </p>
        </div>
      </div>

      <form class="configurator-form" novalidate @submit.prevent="submit">
        <ChoiceOptions
          v-model="target"
          name="design-target"
          legend="Für wen?"
          required
          large
          :options="targetOptions"
          :error="showErrors && !target ? 'Bitte wähle aus, für wen der Mantel ist.' : ''"
        />

        <ChoiceOptions
          v-if="target === 'kids'"
          v-model="kidsSub"
          name="design-kids"
          legend="Mädchen oder Jungen?"
          required
          :options="kidsOptions"
          :error="showErrors && !kidsSub ? 'Bitte wähle Mädchen oder Jungen aus.' : ''"
        />

        <ColorOptions
          v-model="color"
              required
          name="design-color"
          legend="Mantelfarbe"
          :colors="customColors"
          :error="showErrors && !color ? 'Bitte wähle eine Farbe aus.' : ''"
        />

        <ChoiceOptions
          v-if="product"
          v-model="size"
          name="design-size"
          legend="Größe"
          required
          :options="sizeOptions"
          :error="showErrors && !size ? 'Bitte wähle eine Größe aus.' : ''"
        />
        <div v-else class="option-group">
          <p class="form-label">Größe <span class="required-mark" aria-hidden="true">*</span></p>
          <p class="muted">
            {{ target === 'kids' ? 'Bitte wähle zuerst Mädchen oder Jungen aus.' : 'Bitte wähle zuerst aus, für wen der Mantel ist.' }}
          </p>
          <p v-if="showErrors" class="form-error" role="alert">Bitte wähle eine Größe aus.</p>
        </div>

        <FormField id="design-pocket" label="Taschendesign" optional hint="Die Taschen werden von der Designerin passend zu Mantelfarbe und Rückenmotiv gestaltet.">
          <template #default="{ id, describedby }">
            <textarea
              :id="id"
              v-model="pocket"
              class="input textarea"
              rows="3"
              maxlength="500"
              placeholder="z. B. Lieblingsfarben oder ein kleines Motiv für die Taschen"
              :aria-describedby="describedby"
            ></textarea>
          </template>
        </FormField>

        <div class="summary-box">
          <h2 class="summary-title">Zusammenfassung</h2>
          <dl class="summary-list">
            <div><dt>Für wen?</dt><dd>{{ target ? TARGET_LABELS[target] : NOT_SELECTED }}</dd></div>
            <div v-if="target === 'kids'"><dt>Mädchen oder Jungen</dt><dd>{{ kidsSub ? SUBCATEGORY_LABELS[kidsSub] : NOT_SELECTED }}</dd></div>
            <div><dt>Farbe</dt><dd>{{ color ? colorLabel(color) : NOT_SELECTED }}</dd></div>
            <div><dt>Größe</dt><dd>{{ size ? sizeLabel(size) : NOT_SELECTED }}</dd></div>
            <div><dt>Rückenmotiv</dt><dd>{{ designLabel(selectedDesign, designs) }}</dd></div>
            <div><dt>Taschenwunsch</dt><dd class="pre-wrap">{{ pocket.trim() || 'Keine Angabe' }}</dd></div>
            <div class="summary-total"><dt>Preis</dt><dd>{{ priceText }}</dd></div>
          </dl>
        </div>

        <button type="submit" class="btn btn-primary btn-large btn-block" :disabled="adding">
          {{ adding ? 'Wird hinzugefügt …' : 'In den Warenkorb' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ChoiceOptions from '../components/ChoiceOptions.vue'
import ColorOptions from '../components/ColorOptions.vue'
import ErrorState from '../components/ErrorState.vue'
import FormField from '../components/FormField.vue'
import LoadingState from '../components/LoadingState.vue'
import { api, assetUrl, errorMessage } from '../utils/api.js'
import { SUBCATEGORY_LABELS, TARGET_LABELS, colorLabel, formatPrice, sizeLabel } from '../utils/format.js'
import { designLabel, findDesign, firstImage, hasSizePrices, minPrice, unitPrice } from '../utils/products.js'
import { addToCart } from '../stores/cart.js'
import { notify, notifyError } from '../stores/toast.js'

const NOT_SELECTED = 'Noch nicht ausgewählt'

const route = useRoute()

const catalogFilterOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'adult', label: 'Erwachsene' },
  { value: 'kids', label: 'Kinder' }
]
const targetOptions = [
  { value: 'women', label: 'Damen' },
  { value: 'men', label: 'Herren' },
  { value: 'kids', label: 'Kinder' },
  { value: 'dogs', label: 'Hund' }
]
const kidsOptions = [
  { value: 'girls', label: 'Mädchen' },
  { value: 'boys', label: 'Jungen' }
]

const loading = ref(true)
const error = ref('')
const products = ref([])
const customColors = ref([])
const designs = ref({ adult: [], kids: [] })

// Bei jedem neuen Öffnen beginnt die Konfiguration mit einem neuen Auswahlzustand
const mode = ref('catalog')
const catalogFilter = ref('all')
const selectedDesignId = ref('')
const target = ref('')
const kidsSub = ref('')
const color = ref('')
const size = ref('')
const pocket = ref('')
const showErrors = ref(false)
const adding = ref(false)

const selectedDesign = computed(() => findDesign(designs.value, selectedDesignId.value))

const filteredDesigns = computed(() => {
  if (catalogFilter.value === 'adult') return designs.value.adult || []
  if (catalogFilter.value === 'kids') return designs.value.kids || []
  return [...(designs.value.adult || []), ...(designs.value.kids || [])]
})

// Passendes individualisierbares Produkt für die gewählte Zielgruppe
const product = computed(() => {
  if (!target.value) return null
  if (target.value === 'kids' && !kidsSub.value) return null
  return (
    products.value.find(
      (item) =>
        item.customizable === true &&
        item.category === target.value &&
        (target.value !== 'kids' || item.subcategory === kidsSub.value)
    ) || null
  )
})

const sizeOptions = computed(() => (product.value?.sizes || []).map((value) => ({ value, label: sizeLabel(value) })))
const previewImage = computed(() => (product.value && color.value ? firstImage(product.value, color.value) : ''))

const priceText = computed(() => {
  if (!product.value) return 'Noch nicht festgelegt'
  if (hasSizePrices(product.value)) {
    return size.value ? formatPrice(unitPrice(product.value, size.value)) : `ab ${formatPrice(minPrice(product.value))}`
  }
  return formatPrice(product.value.price)
})

watch(target, (value) => {
  if (value !== 'kids') kidsSub.value = ''
})

watch(product, (value) => {
  if (!value || !value.sizes.includes(size.value)) size.value = ''
})

function chooseDesign(id) {
  selectedDesignId.value = id
  mode.value = 'configure'
  window.scrollTo({ top: 0 })
}

function changeDesign() {
  const current = selectedDesign.value
  if (current) {
    catalogFilter.value = (designs.value.kids || []).some((item) => item.id === current.id) ? 'kids' : 'adult'
  }
  mode.value = 'catalog'
  window.scrollTo({ top: 0 })
}

function backToConfiguration() {
  mode.value = 'configure'
  window.scrollTo({ top: 0 })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [productData, colorData, designData] = await Promise.all([
      api.get('/products'),
      api.get('/custom-colors'),
      api.get('/designs')
    ])
    products.value = Array.isArray(productData) ? productData : []
    customColors.value = Array.isArray(colorData) ? colorData : []
    designs.value = designData || { adult: [], kids: [] }

    const preselected = String(route.query.motiv || '')
    if (preselected && findDesign(designs.value, preselected)) {
      selectedDesignId.value = preselected
      mode.value = 'configure'
    }
  } catch (e) {
    error.value = errorMessage(e, 'Die Daten für Dein Design konnten nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

async function submit() {
  showErrors.value = true
  if (!selectedDesign.value || !target.value || !product.value || !color.value || !size.value) return

  adding.value = true
  try {
    await addToCart({
      productId: product.value.id,
      color: color.value,
      size: size.value,
      designId: selectedDesign.value.id,
      pocketRequest: pocket.value.trim(),
      quantity: 1
    })
    notify('Dein Design wurde in den Warenkorb gelegt.')
    showErrors.value = false
  } catch (e) {
    notifyError(errorMessage(e, 'Dein Design konnte nicht in den Warenkorb gelegt werden.'))
  } finally {
    adding.value = false
  }
}

onMounted(load)
</script>
