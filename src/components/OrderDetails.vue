<template>
  <div class="order-details">
    <section class="order-section" :aria-label="`Produkte der Bestellung ${order.id}`">
      <h3 class="order-section-title">Produkte</h3>
      <ul class="order-lines">
        <li v-for="(line, index) in lines" :key="`${line.productId}-${index}`" class="order-line">
          <CartLineInfo :line="line" :link-to-product="linkProducts" />
          <dl class="order-line-prices">
            <div><dt>Menge</dt><dd>{{ line.quantity }}</dd></div>
            <div><dt>Einzelpreis</dt><dd>{{ formatPrice(line.unitPrice) }}</dd></div>
            <div><dt>Positionspreis</dt><dd><strong>{{ formatPrice(line.lineTotal) }}</strong></dd></div>
          </dl>
        </li>
      </ul>
    </section>

    <div class="order-info-grid">
      <section class="order-section">
        <h3 class="order-section-title">Preise</h3>
        <dl class="summary-list">
          <div><dt>Zwischensumme</dt><dd>{{ formatPrice(order.subtotal) }}</dd></div>
          <div><dt>Versandkosten</dt><dd>{{ formatPrice(order.shippingCost) }}</dd></div>
          <div class="summary-total"><dt>Gesamtpreis</dt><dd>{{ formatPrice(order.total) }}</dd></div>
        </dl>
      </section>

      <section class="order-section">
        <h3 class="order-section-title">Versand und Zahlung</h3>
        <dl class="summary-list">
          <div><dt>Versandart</dt><dd>{{ shippingLabel(order.shippingMethod, shippingOptions) }}</dd></div>
          <div><dt>Versandkosten</dt><dd>{{ formatPrice(order.shippingCost) }}</dd></div>
          <div><dt>Zahlungsmethode</dt><dd>{{ paymentLabel(order.paymentMethod) }}</dd></div>
        </dl>
      </section>

      <section class="order-section">
        <h3 class="order-section-title">{{ admin ? 'Kundendaten' : 'Kundendaten und Lieferadresse' }}</h3>
        <dl class="summary-list">
          <div v-if="admin"><dt>Kundenkonto</dt><dd>{{ accountText }}</dd></div>
          <div><dt>Name</dt><dd>{{ fullName(order.customer) }}</dd></div>
          <div><dt>E-Mail-Adresse</dt><dd class="break">{{ order.customer?.email }}</dd></div>
          <div>
            <dt>Lieferadresse</dt>
            <dd>
              <span v-for="line in addressLines(order.customer)" :key="line" class="block">{{ line }}</span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CartLineInfo from './CartLineInfo.vue'
import { buildLine } from '../utils/lines.js'
import { addressLines, formatPrice, fullName, paymentLabel, shippingLabel } from '../utils/format.js'

const props = defineProps({
  order: { type: Object, required: true },
  products: { type: Array, default: () => [] },
  designs: { type: Object, default: () => ({ adult: [], kids: [] }) },
  shippingOptions: { type: Array, default: () => [] },
  admin: { type: Boolean, default: false },
  users: { type: Array, default: () => [] },
  linkProducts: { type: Boolean, default: true }
})

const lines = computed(() => (props.order.items || []).map((item) => buildLine(item, props.products, props.designs)))

const accountText = computed(() => {
  if (!props.order.userId) return 'Gastbestellung (kein Benutzerkonto)'
  const user = props.users.find((entry) => entry.id === props.order.userId)
  if (user) return `${fullName(user)} (${user.email})`
  return 'Registrierter Benutzer (Benutzerkonto nicht mehr vorhanden)'
})
</script>
