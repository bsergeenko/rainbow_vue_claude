<template>
  <div class="line-info">
    <div class="line-image">
      <img v-if="line.image" :src="line.image" :alt="line.imageIsDesign ? `Rückenmotiv: ${line.designName}` : `${productName} in ${colorLabel(line.color)}`" loading="lazy" />
    </div>
    <div class="line-text">
      <p class="line-name">
        <RouterLink v-if="line.product && !line.isCustom && linkToProduct" :to="productLink(line.product.id, line.color)">{{ productName }}</RouterLink>
        <template v-else>{{ productName }}</template>
        <span v-if="line.isCustom" class="badge">Dein Design</span>
      </p>
      <p v-if="!line.isCustom && line.product?.subcategory" class="line-sub">{{ categoryLabel(line.product.category) }} – {{ subcategoryLabel(line.product.subcategory) }}</p>
      <dl class="line-details">
        <template v-if="line.isCustom">
          <div><dt class="no-colon">Für wen?</dt><dd>{{ line.target }}<template v-if="line.targetSub"> – {{ line.targetSub }}</template></dd></div>
        </template>
        <div><dt>Farbe</dt><dd>{{ colorLabel(line.color) }}</dd></div>
        <div><dt>Größe</dt><dd>{{ sizeLabel(line.size) }}</dd></div>
        <template v-if="line.isCustom">
          <div class="line-motif">
            <dt>Rückenmotiv</dt>
            <dd>
              <img v-if="line.designImage && !line.imageIsDesign" :src="line.designImage" alt="" class="line-motif-thumb" loading="lazy" />
              {{ line.designName || 'Unbekanntes Motiv' }}
            </dd>
          </div>
          <div><dt>Taschenwunsch</dt><dd class="pre-wrap">{{ line.pocketRequest || 'Keine Angabe' }}</dd></div>
        </template>
      </dl>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { categoryLabel, colorLabel, sizeLabel, subcategoryLabel } from '../utils/format.js'
import { productLink } from '../utils/products.js'

const props = defineProps({
  line: { type: Object, required: true },
  linkToProduct: { type: Boolean, default: true }
})

const productName = computed(() => props.line.product?.name || 'Produkt nicht mehr verfügbar')
</script>
