<template>
  <div class="container page">
    <h1 class="page-title">Benutzerkonto</h1>
    <p v-if="auth.user" class="lead">Hallo {{ auth.user.firstName }}, schön, dass du da bist.</p>

    <nav class="account-quicknav" aria-label="Bereiche des Benutzerkontos">
      <a href="#persoenliche-daten" class="chip-link" @click.prevent="scrollToSection('persoenliche-daten')">Persönliche Daten</a>
      <a href="#bestellungen" class="chip-link" @click.prevent="scrollToSection('bestellungen')">Meine Bestellungen</a>
      <RouterLink :to="{ path: '/wunschliste', query: { von: 'konto' } }" class="chip-link">Meine Wunschliste</RouterLink>
      <a href="#passwort" class="chip-link" @click.prevent="scrollToSection('passwort')">Passwort ändern</a>
    </nav>

    <div class="account-grid">
      <!-- Persönliche Daten -->
      <section id="persoenliche-daten" class="card-section" aria-labelledby="profile-title">
        <div class="section-head">
          <h2 id="profile-title" class="section-subtitle">Persönliche Daten</h2>
          <button v-if="!editing" type="button" class="btn btn-secondary btn-small" @click="startEdit">Bearbeiten</button>
        </div>

        <dl v-if="!editing && auth.user" class="data-list">
          <div><dt>Vorname</dt><dd>{{ auth.user.firstName }}</dd></div>
          <div><dt>Nachname</dt><dd>{{ auth.user.lastName }}</dd></div>
          <div><dt>E-Mail-Adresse</dt><dd class="break">{{ auth.user.email }}</dd></div>
          <div v-if="savedAddress.length">
            <dt>Adresse</dt>
            <dd><span v-for="line in savedAddress" :key="line" class="block">{{ line }}</span></dd>
          </div>
        </dl>

        <form v-else-if="editing" class="form-stack" novalidate @submit.prevent="saveProfile">
          <p v-if="profileError" class="alert alert-error" role="alert">{{ profileError }}</p>
          <div class="form-grid">
            <FormField id="acc-firstName" label="Vorname" required :error="profile.errors.value.firstName">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="profile.values.firstName" v-bind="profile.bind('firstName')" class="input" autocomplete="given-name" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="acc-lastName" label="Nachname" required :error="profile.errors.value.lastName">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="profile.values.lastName" v-bind="profile.bind('lastName')" class="input" autocomplete="family-name" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="acc-email" class="span-2" label="E-Mail-Adresse" required :error="profile.errors.value.email">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="profile.values.email" v-bind="profile.bind('email')" type="email" class="input" autocomplete="email" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="acc-street" class="span-2" label="Straße und Hausnummer" optional>
              <template #default="{ id }">
                <input :id="id" v-model="profile.values.street" class="input" autocomplete="street-address" />
              </template>
            </FormField>
            <FormField id="acc-postalCode" label="Postleitzahl" optional>
              <template #default="{ id }">
                <input :id="id" v-model="profile.values.postalCode" class="input" autocomplete="postal-code" />
              </template>
            </FormField>
            <FormField id="acc-city" label="Ort" optional>
              <template #default="{ id }">
                <input :id="id" v-model="profile.values.city" class="input" autocomplete="address-level2" />
              </template>
            </FormField>
            <FormField id="acc-country" class="span-2" label="Land" optional>
              <template #default="{ id }">
                <input :id="id" v-model="profile.values.country" class="input" autocomplete="country-name" />
              </template>
            </FormField>
          </div>
          <div class="button-row">
            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
              {{ savingProfile ? 'Wird gespeichert …' : 'Speichern' }}
            </button>
            <button type="button" class="btn btn-secondary" :disabled="savingProfile" @click="cancelEdit">Abbrechen</button>
          </div>
        </form>
      </section>

      <!-- Passwort, Wunschliste, Abmelden, Konto löschen -->
      <div class="account-side">
        <section id="passwort" class="card-section" aria-labelledby="password-title">
          <div class="section-head">
            <h2 id="password-title" class="section-subtitle">Passwort ändern</h2>
            <button v-if="!changingPassword" type="button" class="btn btn-secondary btn-small" @click="changingPassword = true">
              Passwort ändern
            </button>
          </div>
          <PasswordChangeForm v-if="changingPassword" id-prefix="acc-pw" @done="changingPassword = false" @cancel="changingPassword = false" />
        </section>

        <section class="card-section" aria-labelledby="wishlist-title">
          <h2 id="wishlist-title" class="section-subtitle">Meine Wunschliste</h2>
          <p class="muted small">Deine gespeicherten Lieblingsprodukte.</p>
          <RouterLink :to="{ path: '/wunschliste', query: { von: 'konto' } }" class="btn btn-secondary">Meine Wunschliste</RouterLink>
        </section>

        <section class="card-section" aria-labelledby="session-title">
          <h2 id="session-title" class="section-subtitle">Abmelden und Konto löschen</h2>
          <div class="button-row">
            <button type="button" class="btn btn-secondary" :disabled="loggingOut" @click="doLogout">
              {{ loggingOut ? 'Abmeldung läuft …' : 'Abmelden' }}
            </button>
            <button type="button" class="btn btn-danger-outline" @click="deleteOpen = true">Konto löschen</button>
          </div>
        </section>
      </div>
    </div>

    <!-- Meine Bestellungen -->
    <section id="bestellungen" class="card-section orders-section" aria-labelledby="orders-title">
      <h2 id="orders-title" class="section-subtitle">Meine Bestellungen</h2>
      <LoadingState v-if="ordersLoading" text="Bestellungen werden geladen …" />
      <ErrorState v-else-if="ordersError" :message="ordersError" retry @retry="loadOrders" />
      <p v-else-if="orders.length === 0" class="empty-text">Du hast noch keine Bestellungen.</p>
      <ul v-else class="order-list">
        <li v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-summary-row">
            <dl class="order-meta">
              <div><dt>Bestellnummer</dt><dd class="break">{{ order.id }}</dd></div>
              <div><dt>Bestelldatum</dt><dd>{{ formatDate(order.createdAt) }}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge :status="order.status" /></dd></div>
              <div><dt>Gesamtpreis</dt><dd><strong>{{ formatPrice(order.total) }}</strong></dd></div>
            </dl>
            <div class="order-actions">
              <button
                type="button"
                class="btn btn-secondary btn-small"
                :aria-expanded="expanded[order.id] ? 'true' : 'false'"
                :aria-controls="`order-details-${order.id}`"
                @click="expanded[order.id] = !expanded[order.id]"
              >
                {{ expanded[order.id] ? 'Details ausblenden' : 'Details anzeigen' }}
              </button>
              <button
                v-if="['new', 'processing'].includes(order.status)"
                type="button"
                class="btn btn-danger-outline btn-small"
                @click="cancelTarget = order"
              >
                Bestellung stornieren
              </button>
            </div>
          </div>
          <p v-if="order.status === 'cancelled'" class="alert alert-info">
            Diese Bestellung wurde storniert. Der Gesamtbetrag von {{ formatPrice(order.total) }} (einschließlich Versandkosten)
            wird auf die ursprünglich verwendete Zahlungsmethode zurückerstattet.
          </p>
          <div v-if="expanded[order.id]" :id="`order-details-${order.id}`">
            <OrderDetails :order="order" :products="products" :designs="designs" :shipping-options="shippingOptions" />
          </div>
        </li>
      </ul>
    </section>

    <ConfirmDialog
      :open="!!cancelTarget"
      title="Bestellung stornieren?"
      confirm-label="Ja, stornieren"
      cancel-label="Nein, behalten"
      danger
      :busy="cancelling"
      @confirm="confirmCancel"
      @cancel="cancelTarget = null"
    >
      <p v-if="cancelTarget">
        Möchtest du die Bestellung {{ cancelTarget.id }} wirklich stornieren? Der Gesamtbetrag von
        {{ formatPrice(cancelTarget.total) }} (einschließlich Versandkosten) wird auf die ursprünglich verwendete
        Zahlungsmethode zurückerstattet.
      </p>
    </ConfirmDialog>

    <ConfirmDialog
      :open="deleteOpen"
      title="Konto löschen?"
      confirm-label="Konto endgültig löschen"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="deleteOpen = false"
    >
      <p>Möchtest du dein Benutzerkonto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
    </ConfirmDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ErrorState from '../components/ErrorState.vue'
import FormField from '../components/FormField.vue'
import LoadingState from '../components/LoadingState.vue'
import OrderDetails from '../components/OrderDetails.vue'
import PasswordChangeForm from '../components/PasswordChangeForm.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useForm } from '../composables/useForm.js'
import { api, errorMessage } from '../utils/api.js'
import { addressLines, formatDate, formatPrice } from '../utils/format.js'
import { email, required } from '../utils/validation.js'
import { auth, deleteAccount, loadUser, logout, setUser } from '../stores/auth.js'
import { notify, notifyError } from '../stores/toast.js'

const router = useRouter()

function scrollToSection(id) {
  const element = document.getElementById(id)
  if (!element) return
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1')
  element.focus({ preventScroll: true })
}

// Persönliche Daten
const editing = ref(false)
const savingProfile = ref(false)
const profileError = ref('')
const profile = useForm(
  { firstName: '', lastName: '', email: '', street: '', postalCode: '', city: '', country: '' },
  {
    firstName: required('deinen Vornamen'),
    lastName: required('deinen Nachnamen'),
    email: [required('deine E-Mail-Adresse'), email()]
  }
)
const savedAddress = computed(() => addressLines(auth.user?.address))

function startEdit() {
  const user = auth.user || {}
  const address = user.address || {}
  profile.reset({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    street: address.street || '',
    postalCode: address.postalCode || '',
    city: address.city || '',
    country: address.country || ''
  })
  profileError.value = ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  profileError.value = ''
}

async function saveProfile() {
  profileError.value = ''
  if (!profile.validate()) return
  savingProfile.value = true
  const values = profile.values
  try {
    const updated = await api.put('/me', {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      street: values.street.trim(),
      postalCode: values.postalCode.trim(),
      city: values.city.trim(),
      country: values.country.trim()
    })
    setUser(updated)
    editing.value = false
    notify('Deine persönlichen Daten wurden gespeichert.')
  } catch (e) {
    profileError.value = errorMessage(e, 'Deine Daten konnten nicht gespeichert werden.')
  } finally {
    savingProfile.value = false
  }
}

// Passwort
const changingPassword = ref(false)

// Bestellungen
const orders = ref([])
const products = ref([])
const designs = ref({ adult: [], kids: [] })
const shippingOptions = ref([])
const ordersLoading = ref(true)
const ordersError = ref('')
const expanded = reactive({})
const cancelTarget = ref(null)
const cancelling = ref(false)

async function loadOrders() {
  ordersLoading.value = true
  ordersError.value = ''
  try {
    const [orderData, productData, designData, shippingData] = await Promise.all([
      api.get('/orders'),
      api.get('/products'),
      api.get('/designs'),
      api.get('/shipping-options')
    ])
    orders.value = Array.isArray(orderData) ? orderData : []
    products.value = Array.isArray(productData) ? productData : []
    designs.value = designData || { adult: [], kids: [] }
    shippingOptions.value = Array.isArray(shippingData) ? shippingData : []
  } catch (e) {
    ordersError.value = errorMessage(e, 'Deine Bestellungen konnten nicht geladen werden.')
  } finally {
    ordersLoading.value = false
  }
}

async function confirmCancel() {
  const order = cancelTarget.value
  if (!order) return
  cancelling.value = true
  try {
    const updated = await api.put(`/orders/${encodeURIComponent(order.id)}/cancel`)
    orders.value = orders.value.map((item) => (item.id === order.id ? { ...item, ...updated } : item))
    notify(`Die Bestellung wurde storniert. ${formatPrice(order.total)} werden auf deine ursprünglich verwendete Zahlungsmethode zurückerstattet.`, {
      duration: 8000
    })
    cancelTarget.value = null
  } catch (e) {
    notifyError(errorMessage(e, 'Die Bestellung konnte nicht storniert werden.'))
  } finally {
    cancelling.value = false
  }
}

// Abmelden und Konto löschen
const loggingOut = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)

async function doLogout() {
  loggingOut.value = true
  try {
    await logout()
    notify('Du wurdest abgemeldet.', { keepOnNextPage: true })
    router.push('/')
  } catch (e) {
    notifyError(errorMessage(e, 'Die Abmeldung ist fehlgeschlagen.'))
  } finally {
    loggingOut.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await deleteAccount()
    deleteOpen.value = false
    notify('Dein Konto wurde gelöscht.', { keepOnNextPage: true })
    router.push('/')
  } catch (e) {
    notifyError(errorMessage(e, 'Dein Konto konnte nicht gelöscht werden.'))
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadUser()
  loadOrders()
})
</script>
