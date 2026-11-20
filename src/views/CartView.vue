<template>
  <div class="container page">
    <h1 class="page-title">Warenkorb</h1>

    <LoadingState v-if="loading" text="Warenkorb wird geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />

    <template v-else>
      <div v-if="lines.length === 0" class="empty-state">
        <p class="empty-text">Dein Warenkorb ist leer.</p>
        <RouterLink to="/" class="btn btn-secondary">Weiter einkaufen</RouterLink>
      </div>

      <div v-else class="cart-layout">
        <ul class="cart-list" aria-label="Artikel im Warenkorb">
          <li v-for="line in lines" :key="line.itemId" class="cart-item">
            <CartLineInfo :line="line" />
            <div class="cart-item-prices">
              <div class="price-cell">
                <span class="price-label">Einzelpreis</span>
                <span>{{ formatPrice(line.unitPrice) }}</span>
              </div>
              <div class="price-cell">
                <span :id="`qty-label-${line.itemId}`" class="price-label">Menge</span>
                <div class="quantity" role="group" :aria-labelledby="`qty-label-${line.itemId}`">
                  <button
                    type="button"
                    class="quantity-button"
                    :disabled="line.quantity <= 1 || busyItem === line.itemId"
                    :aria-label="`Menge von ${line.product?.name || 'Artikel'} verringern`"
                    title="Menge verringern"
                    @click="changeQuantity(line, line.quantity - 1)"
                  >
                    <AppIcon name="minus" :size="18" />
                  </button>
                  <span class="quantity-value" aria-live="polite">{{ line.quantity }}</span>
                  <button
                    type="button"
                    class="quantity-button"
                    :disabled="busyItem === line.itemId"
                    :aria-label="`Menge von ${line.product?.name || 'Artikel'} erhöhen`"
                    title="Menge erhöhen"
                    @click="changeQuantity(line, line.quantity + 1)"
                  >
                    <AppIcon name="plus" :size="18" />
                  </button>
                </div>
              </div>
              <div class="price-cell">
                <span class="price-label">Positionspreis</span>
                <strong>{{ formatPrice(line.lineTotal) }}</strong>
              </div>
              <button type="button" class="btn btn-link btn-delete" :disabled="busyItem === line.itemId" @click="remove(line)">
                <AppIcon name="trash" :size="18" /> Löschen
              </button>
            </div>
          </li>
        </ul>

        <aside class="cart-summary" aria-labelledby="cart-summary-title">
          <h2 id="cart-summary-title" class="summary-title">Übersicht</h2>
          <div class="summary-row summary-total">
            <span>Zwischensumme</span>
            <strong>{{ formatPrice(subtotal) }}</strong>
          </div>
          <p class="muted small">Die Versandkosten werden an der Kasse berechnet.</p>
          <RouterLink to="/kasse" class="btn btn-primary btn-large btn-block">Zur Kasse</RouterLink>

          <div v-if="!isLoggedIn" class="cart-login">
            <h3 class="cart-login-title">Schon Kundin oder Kunde?</h3>
            <p class="small">
              Melde dich an oder registriere dich, damit dein Warenkorb und deine Bestellungen in deinem Benutzerkonto gespeichert werden.
              Du kannst auch ohne Anmeldung bestellen.
            </p>
            <div class="button-row">
              <RouterLink :to="{ path: '/login', query: { von: 'warenkorb' } }" class="btn btn-secondary">Anmelden</RouterLink>
              <RouterLink :to="{ path: '/registrieren', query: { von: 'warenkorb' } }" class="btn btn-secondary">Registrieren</RouterLink>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import CartLineInfo from '../components/CartLineInfo.vue'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import { useCartDetails } from '../composables/useCartDetails.js'
import { errorMessage } from '../utils/api.js'
import { formatPrice } from '../utils/format.js'
import { isLoggedIn } from '../stores/auth.js'
import { removeCartItem, updateCartQuantity } from '../stores/cart.js'
import { notify, notifyError } from '../stores/toast.js'

const { lines, subtotal, loading, error, load } = useCartDetails()
const busyItem = ref('')

async function changeQuantity(line, quantity) {
  if (quantity < 1) return
  busyItem.value = line.itemId
  try {
    await updateCartQuantity(line.itemId, quantity)
  } catch (e) {
    notifyError(errorMessage(e, 'Die Menge konnte nicht geändert werden.'))
  } finally {
    busyItem.value = ''
  }
}

async function remove(line) {
  busyItem.value = line.itemId
  try {
    await removeCartItem(line.itemId)
    notify('Der Artikel wurde aus dem Warenkorb gelöscht.')
  } catch (e) {
    notifyError(errorMessage(e, 'Der Artikel konnte nicht gelöscht werden.'))
  } finally {
    busyItem.value = ''
  }
}

onMounted(load)
</script>
