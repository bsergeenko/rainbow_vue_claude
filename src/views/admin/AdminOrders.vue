<template>
  <section aria-labelledby="admin-orders-title">
    <h1 id="admin-orders-title" class="page-title">Bestellungen</h1>

    <LoadingState v-if="loading" text="Bestellungen werden geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />
    <p v-else-if="orders.length === 0" class="empty-text">Es sind keine Bestellungen vorhanden.</p>
    <ul v-else class="order-list">
      <li v-for="order in orders" :key="order.id">
        <AdminOrderEntry
          :order="order"
          :products="products"
          :designs="designs"
          :shipping-options="shippingOptions"
          :users="users"
          id-prefix="all-orders"
          @updated="replaceOrder"
        />
      </li>
    </ul>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import AdminOrderEntry from './AdminOrderEntry.vue'
import ErrorState from '../../components/ErrorState.vue'
import LoadingState from '../../components/LoadingState.vue'
import { useAdminOrderData } from '../../composables/useAdminOrderData.js'

const { orders, users, products, designs, shippingOptions, loading, error, load, replaceOrder } = useAdminOrderData()

onMounted(load)
</script>
