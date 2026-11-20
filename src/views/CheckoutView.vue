<template>
  <div class="container page">
    <h1 class="page-title">Kasse</h1>

    <LoadingState v-if="loading" text="Kasse wird geladen …" />
    <ErrorState v-else-if="loadError" :message="loadError" retry @retry="load" />

    <form v-else class="checkout-layout" novalidate @submit.prevent="submit">
      <div class="checkout-main">
        <section class="card-section" aria-labelledby="customer-title">
          <h2 id="customer-title" class="section-subtitle">Kundendaten und Lieferadresse</h2>
          <p class="muted small">Felder mit * sind Pflichtfelder.</p>
          <div class="form-grid">
            <FormField id="co-firstName" label="Vorname" required :error="form.errors.value.firstName">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.firstName" v-bind="form.bind('firstName')" class="input" autocomplete="given-name" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-lastName" label="Nachname" required :error="form.errors.value.lastName">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.lastName" v-bind="form.bind('lastName')" class="input" autocomplete="family-name" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-email" class="span-2" label="E-Mail-Adresse" required :error="form.errors.value.email">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.email" v-bind="form.bind('email')" type="email" class="input" autocomplete="email" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-street" class="span-2" label="Straße und Hausnummer" required :error="form.errors.value.street">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.street" v-bind="form.bind('street')" class="input" autocomplete="street-address" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-postalCode" label="Postleitzahl" required :error="form.errors.value.postalCode">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.postalCode" v-bind="form.bind('postalCode')" class="input" autocomplete="postal-code" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-city" label="Ort" required :error="form.errors.value.city">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.city" v-bind="form.bind('city')" class="input" autocomplete="address-level2" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-country" class="span-2" label="Land" required :error="form.errors.value.country">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.country" v-bind="form.bind('country')" class="input" autocomplete="country-name" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
          </div>
          <label v-if="isLoggedIn" class="checkbox">
            <input v-model="saveAddress" type="checkbox" />
            <span>Diese Adresse in meinem Konto speichern</span>
          </label>
        </section>

        <section class="card-section" aria-labelledby="shipping-title">
          <h2 id="shipping-title" class="section-subtitle">Versandart</h2>
          <fieldset class="option-group" :aria-describedby="form.errors.value.shipping ? 'shipping-error' : undefined">
            <legend class="form-label">Versandart wählen<span class="required-mark" aria-hidden="true"> *</span></legend>
            <div class="radio-cards">
              <label v-for="option in shippingOptions" :key="option.id" class="radio-card" :class="{ selected: form.values.shipping === option.id }">
                <input v-model="form.values.shipping" v-bind="form.bind('shipping')" type="radio" name="shipping" :value="option.id" />
                <span class="radio-card-text">{{ option.name }}</span>
                <span class="radio-card-price">{{ formatPrice(option.price) }}</span>
              </label>
            </div>
            <p v-if="form.errors.value.shipping" id="shipping-error" class="form-error" role="alert">{{ form.errors.value.shipping }}</p>
          </fieldset>
        </section>

        <section class="card-section" aria-labelledby="payment-title">
          <h2 id="payment-title" class="section-subtitle">Zahlung</h2>
          <p class="payment-method"><AppIcon name="check" :size="18" /> Kartenzahlung</p>
          <div class="form-grid">
            <FormField id="co-cardNumber" class="span-2" label="Kartennummer" required :error="form.errors.value.cardNumber">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.cardNumber" v-bind="form.bind('cardNumber')" class="input" inputmode="numeric" autocomplete="cc-number" maxlength="19" placeholder="16 Ziffern" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-expiry" label="Ablaufdatum" required :error="form.errors.value.expiry">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.expiry" v-bind="form.bind('expiry')" class="input" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="MM/JJ" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="co-cvc" label="Sicherheitscode" required :error="form.errors.value.cvc">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="form.values.cvc" v-bind="form.bind('cvc')" class="input" inputmode="numeric" autocomplete="cc-csc" maxlength="3" placeholder="3 Ziffern" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
          </div>
        </section>
      </div>

      <aside class="checkout-summary card-section" aria-labelledby="overview-title">
        <h2 id="overview-title" class="section-subtitle">Bestellübersicht</h2>
        <ul class="checkout-lines">
          <li v-for="line in lines" :key="line.itemId" class="checkout-line">
            <CartLineInfo :line="line" :link-to-product="false" />
            <dl class="order-line-prices">
              <div><dt>Menge</dt><dd>{{ line.quantity }}</dd></div>
              <div><dt>Einzelpreis</dt><dd>{{ formatPrice(line.unitPrice) }}</dd></div>
              <div><dt>Positionspreis</dt><dd>{{ formatPrice(line.lineTotal) }}</dd></div>
            </dl>
          </li>
        </ul>
        <dl class="summary-list">
          <div><dt>Zwischensumme</dt><dd>{{ formatPrice(subtotal) }}</dd></div>
          <div><dt>Versandkosten</dt><dd>{{ selectedShipping ? formatPrice(selectedShipping.price) : 'Bitte Versandart wählen' }}</dd></div>
          <div class="summary-total"><dt>Gesamtpreis</dt><dd>{{ formatPrice(total) }}</dd></div>
        </dl>
        <p v-if="submitError" class="alert alert-error" role="alert">{{ submitError }}</p>
        <p v-if="form.submitted.value && !form.isValid.value" class="form-error" role="alert">
          Bitte überprüfe deine Eingaben. Fehlende oder ungültige Angaben sind markiert.
        </p>
        <button type="submit" class="btn btn-primary btn-large btn-block" :disabled="submitting">
          {{ submitting ? 'Bestellung wird gesendet …' : 'Jetzt kaufen' }}
        </button>
        <RouterLink to="/warenkorb" class="btn btn-link btn-block">Zurück zum Warenkorb</RouterLink>
      </aside>
    </form>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import CartLineInfo from '../components/CartLineInfo.vue'
import ErrorState from '../components/ErrorState.vue'
import FormField from '../components/FormField.vue'
import LoadingState from '../components/LoadingState.vue'
import { useCartDetails } from '../composables/useCartDetails.js'
import { useForm } from '../composables/useForm.js'
import { api, errorMessage } from '../utils/api.js'
import { formatPrice } from '../utils/format.js'
import { cardNumber, email, expiryDate, required, securityCode } from '../utils/validation.js'
import { auth, isLoggedIn, loadUser } from '../stores/auth.js'
import { loadCart } from '../stores/cart.js'
import { lastOrder } from '../stores/ui.js'

const router = useRouter()
const { lines, subtotal, loading: cartLoading, error: cartError, load: loadCartDetails, products, designs } = useCartDetails()

const shippingOptions = ref([])
const shippingLoading = ref(true)
const shippingError = ref('')
const saveAddress = ref(false)
const submitting = ref(false)
const submitError = ref('')

const form = useForm(
  {
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    postalCode: '',
    city: '',
    country: '',
    shipping: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  },
  {
    firstName: required('deinen Vornamen'),
    lastName: required('deinen Nachnamen'),
    email: [required('deine E-Mail-Adresse'), email()],
    street: required('Straße und Hausnummer'),
    postalCode: required('deine Postleitzahl'),
    city: required('deinen Ort'),
    country: required('dein Land'),
    shipping: (value) => (value ? '' : 'Bitte wähle eine Versandart aus.'),
    cardNumber: [required('deine Kartennummer'), cardNumber()],
    expiry: [required('das Ablaufdatum'), expiryDate()],
    cvc: [required('den Sicherheitscode'), securityCode()]
  }
)

const loading = computed(() => cartLoading.value || shippingLoading.value)
const loadError = computed(() => cartError.value || shippingError.value)
const selectedShipping = computed(() => shippingOptions.value.find((option) => option.id === form.values.shipping) || null)
const total = computed(() => subtotal.value + (selectedShipping.value ? Number(selectedShipping.value.price) : 0))

async function loadShipping() {
  shippingLoading.value = true
  shippingError.value = ''
  try {
    const data = await api.get('/shipping-options')
    shippingOptions.value = Array.isArray(data) ? data : []
  } catch (e) {
    shippingError.value = errorMessage(e, 'Die Versandarten konnten nicht geladen werden.')
  } finally {
    shippingLoading.value = false
  }
}

// Kundendaten eingeloggter Nutzer aus GET /me vorausfüllen
async function prefill() {
  if (!isLoggedIn.value) return
  await loadUser()
  const user = auth.user
  if (!user) return
  const address = user.address || {}
  form.reset({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    street: address.street || '',
    postalCode: address.postalCode || '',
    city: address.city || '',
    country: address.country || ''
  })
}

async function load() {
  await Promise.all([loadCartDetails(), loadShipping(), prefill()])
  if (!cartError.value && lines.value.length === 0) {
    router.replace('/warenkorb')
  }
}

async function focusFirstError() {
  await nextTick()
  const element = document.querySelector('.checkout-layout [aria-invalid="true"], .checkout-layout .form-error')
  if (element) {
    const target = element.matches('input') ? element : element.closest('fieldset')?.querySelector('input') || element
    target.focus?.()
  }
}

async function submit() {
  submitError.value = ''
  if (!form.validate()) {
    focusFirstError()
    return
  }
  submitting.value = true
  const values = form.values
  const customer = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    street: values.street.trim(),
    postalCode: values.postalCode.trim(),
    city: values.city.trim(),
    country: values.country.trim()
  }
  const body = {
    customer,
    shippingMethod: values.shipping,
    paymentMethod: 'card',
    items: lines.value.map((line) => ({
      productId: line.productId,
      color: line.color,
      size: line.size,
      quantity: line.quantity,
      designId: line.designId ?? null,
      pocketRequest: line.pocketRequest || ''
    }))
  }
  if (isLoggedIn.value) body.saveAddress = saveAddress.value

  try {
    const order = await api.post('/orders', body)
    lastOrder.value = {
      order,
      products: products.value,
      designs: designs.value,
      shippingOptions: shippingOptions.value
    }
    await Promise.allSettled([loadCart(), isLoggedIn.value ? loadUser() : Promise.resolve()])
    router.push('/bestellbestaetigung')
  } catch (e) {
    submitError.value = errorMessage(e, 'Die Bestellung konnte nicht abgeschlossen werden.')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>
