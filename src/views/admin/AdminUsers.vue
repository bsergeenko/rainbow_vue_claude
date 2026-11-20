<template>
  <section aria-labelledby="admin-users-title">
    <h1 id="admin-users-title" class="page-title">Benutzer</h1>

    <LoadingState v-if="loading" text="Benutzer werden geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />
    <p v-else-if="users.length === 0" class="empty-text">Es sind keine Benutzer registriert.</p>

    <ul v-else class="admin-list">
      <li v-for="user in users" :key="user.id" class="admin-card">
        <div class="admin-user-head">
          <h2 class="admin-card-title">{{ fullName(user) }}</h2>
          <span class="badge">{{ roleLabel(user.role) }}</span>
        </div>
        <dl class="data-list">
          <div><dt>Vorname</dt><dd>{{ user.firstName }}</dd></div>
          <div><dt>Nachname</dt><dd>{{ user.lastName }}</dd></div>
          <div><dt>E-Mail-Adresse</dt><dd class="break">{{ user.email }}</dd></div>
          <div>
            <dt>Gespeicherte Adresse</dt>
            <dd>
              <template v-if="addressLines(user.address).length">
                <span v-for="line in addressLines(user.address)" :key="line" class="block">{{ line }}</span>
              </template>
              <span v-else class="muted">Keine Adresse gespeichert</span>
            </dd>
          </div>
        </dl>

        <h3 class="order-section-title">Bestellungen</h3>
        <p v-if="ordersOf(user).length === 0" class="muted">Für diesen Benutzer sind keine Bestellungen vorhanden.</p>
        <ul v-else class="order-list">
          <li v-for="order in ordersOf(user)" :key="order.id">
            <AdminOrderEntry
              :order="order"
              :products="products"
              :designs="designs"
              :shipping-options="shippingOptions"
              :users="users"
              :show-customer="false"
              :id-prefix="`user-${user.id}`"
              @updated="replaceOrder"
            />
          </li>
        </ul>
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
import { addressLines, fullName, roleLabel } from '../../utils/format.js'

const { orders, users, products, designs, shippingOptions, loading, error, load, replaceOrder } = useAdminOrderData()

// Zuordnung der Bestellungen über die userId
function ordersOf(user) {
  return orders.value.filter((order) => order.userId === user.id)
}

onMounted(load)
</script>
