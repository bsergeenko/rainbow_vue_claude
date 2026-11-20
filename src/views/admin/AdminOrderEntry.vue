<template>
  <div class="order-card">
    <div class="order-summary-row">
      <dl class="order-meta" :class="{ 'with-customer': showCustomer }">
        <div><dt>Bestellnummer</dt><dd class="break">{{ order.id }}</dd></div>
        <div><dt>Bestelldatum</dt><dd>{{ formatDate(order.createdAt) }}</dd></div>
        <div v-if="showCustomer">
          <dt>Kunde</dt>
          <dd>
            {{ fullName(order.customer) }}
            <span class="muted small block">{{ order.userId ? 'Registrierter Benutzer' : 'Gastbestellung' }}</span>
          </dd>
        </div>
        <div><dt>Gesamtpreis</dt><dd><strong>{{ formatPrice(order.total) }}</strong></dd></div>
        <div><dt>Status</dt><dd><StatusBadge :status="order.status" /></dd></div>
      </dl>
      <div class="order-actions">
        <button
          type="button"
          class="btn btn-secondary btn-small"
          :aria-expanded="open ? 'true' : 'false'"
          :aria-controls="detailsId"
          @click="open = !open"
        >
          {{ open ? 'Details ausblenden' : 'Details anzeigen' }}
        </button>
      </div>
    </div>

    <div v-if="open" :id="detailsId" class="admin-order-details">
      <div class="status-editor">
        <template v-if="order.status !== 'cancelled'">
          <label :for="`${detailsId}-status`" class="form-label">Bestellstatus</label>
          <div class="status-editor-row">
            <select :id="`${detailsId}-status`" v-model="newStatus" class="input select">
              <option v-for="status in ADMIN_STATUSES" :key="status" :value="status">{{ statusLabel(status) }}</option>
            </select>
            <button type="button" class="btn btn-primary btn-small" :disabled="saving || newStatus === order.status" @click="saveStatus">
              {{ saving ? 'Wird gespeichert …' : 'Status speichern' }}
            </button>
          </div>
        </template>
        <p v-else class="alert alert-info">
          Diese Bestellung wurde storniert. Der Status kann nicht mehr geändert werden. Der Gesamtbetrag von
          {{ formatPrice(order.total) }} (einschließlich Versandkosten) wird auf die ursprünglich verwendete Zahlungsmethode zurückerstattet.
        </p>
      </div>

      <p class="muted small">Bestellt am {{ formatDateTime(order.createdAt) }}</p>
      <OrderDetails
        :order="order"
        :products="products"
        :designs="designs"
        :shipping-options="shippingOptions"
        :users="users"
        admin
        :link-products="false"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import OrderDetails from '../../components/OrderDetails.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { api, errorMessage } from '../../utils/api.js'
import { formatDate, formatDateTime, formatPrice, fullName, statusLabel } from '../../utils/format.js'
import { notify, notifyError } from '../../stores/toast.js'

const ADMIN_STATUSES = ['new', 'processing', 'shipped', 'delivered']

const props = defineProps({
  order: { type: Object, required: true },
  products: { type: Array, default: () => [] },
  designs: { type: Object, default: () => ({ adult: [], kids: [] }) },
  shippingOptions: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  showCustomer: { type: Boolean, default: true },
  idPrefix: { type: String, default: 'order' }
})

const emit = defineEmits(['updated'])

const open = ref(false)
const saving = ref(false)
const newStatus = ref(props.order.status)
const detailsId = computed(() => `${props.idPrefix}-${props.order.id}`)

watch(
  () => props.order.status,
  (status) => {
    newStatus.value = status
  }
)

async function saveStatus() {
  saving.value = true
  try {
    const updated = await api.put(`/orders/${encodeURIComponent(props.order.id)}/status`, { status: newStatus.value })
    emit('updated', updated)
    notify(`Der Status wurde auf „${statusLabel(updated.status)}“ geändert.`)
  } catch (e) {
    notifyError(errorMessage(e, 'Der Status konnte nicht geändert werden.'))
  } finally {
    saving.value = false
  }
}
</script>
