<template>
  <div class="container page narrow-wide">
    <h1 class="page-title">Registrieren</h1>
    <form class="card-section" novalidate @submit.prevent="submit">
      <p class="muted small">Felder mit * sind Pflichtfelder.</p>
      <p v-if="submitError" class="alert alert-error" role="alert">{{ submitError }}</p>

      <div class="form-grid">
        <FormField id="reg-firstName" label="Vorname" required :error="form.errors.value.firstName">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.firstName" v-bind="form.bind('firstName')" class="input" autocomplete="given-name" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
        <FormField id="reg-lastName" label="Nachname" required :error="form.errors.value.lastName">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.lastName" v-bind="form.bind('lastName')" class="input" autocomplete="family-name" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
        <FormField id="reg-email" class="span-2" label="E-Mail-Adresse" required :error="form.errors.value.email">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.email" v-bind="form.bind('email')" type="email" class="input" autocomplete="email" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
        <FormField id="reg-password" label="Passwort" required :error="form.errors.value.password">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.password" v-bind="form.bind('password')" type="password" class="input" autocomplete="new-password" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
        <FormField id="reg-passwordConfirm" label="Passwortbestätigung" required :error="form.errors.value.passwordConfirm">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.passwordConfirm" v-bind="form.bind('passwordConfirm')" type="password" class="input" autocomplete="new-password" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
      </div>

      <fieldset class="form-fieldset">
        <legend class="fieldset-legend">Adresse <span class="optional-mark">(optional)</span></legend>
        <div class="form-grid">
          <FormField id="reg-street" class="span-2" label="Straße und Hausnummer" optional>
            <template #default="{ id }">
              <input :id="id" v-model="form.values.street" class="input" autocomplete="street-address" />
            </template>
          </FormField>
          <FormField id="reg-postalCode" label="Postleitzahl" optional>
            <template #default="{ id }">
              <input :id="id" v-model="form.values.postalCode" class="input" autocomplete="postal-code" />
            </template>
          </FormField>
          <FormField id="reg-city" label="Ort" optional>
            <template #default="{ id }">
              <input :id="id" v-model="form.values.city" class="input" autocomplete="address-level2" />
            </template>
          </FormField>
          <FormField id="reg-country" class="span-2" label="Land" optional>
            <template #default="{ id }">
              <input :id="id" v-model="form.values.country" class="input" autocomplete="country-name" />
            </template>
          </FormField>
        </div>
      </fieldset>

      <button type="submit" class="btn btn-primary btn-large btn-block" :disabled="submitting">
        {{ submitting ? 'Registrierung läuft …' : 'Registrieren' }}
      </button>

      <p class="form-switch">
        Du hast bereits ein Benutzerkonto?
        <RouterLink :to="{ path: '/login', query: fromCart ? { von: 'warenkorb' } : {} }">Anmelden</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormField from '../components/FormField.vue'
import { useForm } from '../composables/useForm.js'
import { api, errorMessage } from '../utils/api.js'
import { email, matches, required } from '../utils/validation.js'
import { notify } from '../stores/toast.js'

const route = useRoute()
const router = useRouter()
const fromCart = computed(() => route.query.von === 'warenkorb')
const submitting = ref(false)
const submitError = ref('')

const form = useForm(
  {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    street: '',
    postalCode: '',
    city: '',
    country: ''
  },
  {
    firstName: required('deinen Vornamen'),
    lastName: required('deinen Nachnamen'),
    email: [required('deine E-Mail-Adresse'), email()],
    password: required('ein Passwort'),
    passwordConfirm: [
      required('dein Passwort erneut'),
      matches(() => form.values.password, 'Die Passwörter stimmen nicht überein.')
    ]
  }
)

async function submit() {
  submitError.value = ''
  if (!form.validate()) return
  submitting.value = true
  const values = form.values
  // Die Passwortbestätigung wird nicht an das Backend gesendet
  const body = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    password: values.password
  }
  const address = {
    street: values.street.trim(),
    postalCode: values.postalCode.trim(),
    city: values.city.trim(),
    country: values.country.trim()
  }
  for (const [key, value] of Object.entries(address)) {
    if (value) body[key] = value
  }

  try {
    await api.post('/register', body)
    notify('Deine Registrierung war erfolgreich. Du kannst dich jetzt anmelden.', { keepOnNextPage: true, duration: 7000 })
    router.push({ path: '/login', query: fromCart.value ? { von: 'warenkorb' } : {} })
  } catch (e) {
    submitError.value = errorMessage(e, 'Die Registrierung ist fehlgeschlagen.')
  } finally {
    submitting.value = false
  }
}
</script>
