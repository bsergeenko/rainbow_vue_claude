<template>
  <div class="container page">
    <template v-if="data">
      <div class="confirmation-head">
        <span class="confirmation-icon" aria-hidden="true"><AppIcon name="check" :size="32" /></span>
        <h1 class="page-title">Vielen Dank für deine Bestellung!</h1>
        <p>Deine Bestellung ist bei uns eingegangen.</p>
        <p class="order-number">Bestellnummer: <strong>{{ data.order.id }}</strong></p>
        <p class="muted">Bestellt am {{ formatDateTime(data.order.createdAt) }} · Status: {{ statusLabel(data.order.status) }}</p>
      </div>

      <section class="card-section" aria-labelledby="confirmation-summary">
        <h2 id="confirmation-summary" class="section-subtitle">Zusammenfassung</h2>
        <OrderDetails
          :order="data.order"
          :products="data.products"
          :designs="data.designs"
          :shipping-options="data.shippingOptions"
          :link-products="false"
        />
      </section>

      <div class="button-row center">
        <RouterLink v-if="isLoggedIn" :to="{ path: '/konto', hash: '#bestellungen' }" class="btn btn-secondary">Meine Bestellungen</RouterLink>
        <RouterLink to="/" class="btn btn-primary">Weiter einkaufen</RouterLink>
      </div>
    </template>

    <div v-else class="empty-state">
      <h1 class="page-title">Bestellbestätigung</h1>
      <p class="empty-text">Es liegt keine aktuelle Bestellung vor.</p>
      <RouterLink to="/" class="btn btn-primary">Zur Startseite</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import OrderDetails from '../components/OrderDetails.vue'
import { formatDateTime, statusLabel } from '../utils/format.js'
import { isLoggedIn } from '../stores/auth.js'
import { lastOrder } from '../stores/ui.js'

const data = computed(() => lastOrder.value)
</script>
