<template>
  <article class="product-card">
    <div class="product-card-media">
      <RouterLink :to="link" class="product-card-image-link" tabindex="-1" aria-hidden="true">
        <img v-if="variant.image" :src="variant.image" :alt="imageAlt" loading="lazy" class="product-card-image" />
        <span v-else class="product-card-noimage">{{ variant.product.name }}</span>
      </RouterLink>
      <WishlistButton v-if="variant.color" class="product-card-heart" :product-id="variant.product.id" :color="variant.color" />
    </div>
    <div class="product-card-body">
      <h3 class="product-card-title">
        <RouterLink :to="link">{{ variant.product.name }}</RouterLink>
      </h3>
      <p v-if="subLabel" class="product-card-sub">{{ subLabel }}</p>
      <p class="product-card-color">
        <span class="swatch swatch-small" :style="{ background: COLOR_SWATCHES[variant.color] }" aria-hidden="true"></span>
        Farbe: {{ colorLabel(variant.color) }}
      </p>
      <p class="product-card-price">{{ displayPrice(variant.product) }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import WishlistButton from './WishlistButton.vue'
import { COLOR_SWATCHES, colorLabel, subcategoryLabel } from '../utils/format.js'
import { displayPrice, productLink } from '../utils/products.js'

const props = defineProps({
  variant: { type: Object, required: true }
})

const link = computed(() => productLink(props.variant.product.id, props.variant.color))
const subLabel = computed(() => (props.variant.product.subcategory ? subcategoryLabel(props.variant.product.subcategory) : ''))
const imageAlt = computed(() => `${props.variant.product.name} in ${colorLabel(props.variant.color)}`)
</script>
