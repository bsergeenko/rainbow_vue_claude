<template>
  <div class="container page narrow">
    <h1 class="page-title">Anmelden</h1>
    <form class="card-section form-stack" novalidate @submit.prevent="submit">
      <p v-if="submitError" class="alert alert-error" role="alert">{{ submitError }}</p>

      <FormField id="login-email" label="E-Mail-Adresse" required :error="form.errors.value.email">
        <template #default="{ id, invalid, describedby }">
          <input :id="id" v-model="form.values.email" v-bind="form.bind('email')" type="email" class="input" autocomplete="email" :aria-invalid="invalid" :aria-describedby="describedby" />
        </template>
      </FormField>

      <FormField id="login-password" label="Passwort" required :error="form.errors.value.password">
        <template #default="{ id, invalid, describedby }">
          <input :id="id" v-model="form.values.password" v-bind="form.bind('password')" type="password" class="input" autocomplete="current-password" :aria-invalid="invalid" :aria-describedby="describedby" />
        </template>
      </FormField>

      <button type="submit" class="btn btn-primary btn-large btn-block" :disabled="submitting">
        {{ submitting ? 'Anmeldung läuft …' : 'Anmelden' }}
      </button>

      <p class="form-switch">
        Noch kein Benutzerkonto?
        <RouterLink :to="{ path: '/registrieren', query: fromCart ? { von: 'warenkorb' } : {} }">Registrieren</RouterLink>
      </p>
      <p v-if="fromCart" class="form-switch">
        <RouterLink to="/warenkorb">Zurück zum Warenkorb</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormField from '../components/FormField.vue'
import { useForm } from '../composables/useForm.js'
import { ApiError, errorMessage } from '../utils/api.js'
import { email, required } from '../utils/validation.js'
import { isAdmin, login } from '../stores/auth.js'
import { notify } from '../stores/toast.js'

const route = useRoute()
const router = useRouter()

const fromCart = computed(() => route.query.von === 'warenkorb')
const submitting = ref(false)
const submitError = ref('')

const form = useForm(
  { email: '', password: '' },
  {
    email: [required('deine E-Mail-Adresse'), email()],
    password: required('dein Passwort')
  }
)

async function submit() {
  submitError.value = ''
  if (!form.validate()) return
  submitting.value = true
  try {
    await login(form.values.email.trim(), form.values.password)
    if (isAdmin.value) {
      router.replace('/admin')
      return
    }
    notify('Du bist jetzt angemeldet.', { keepOnNextPage: true })
    router.replace(fromCart.value ? '/warenkorb' : '/konto')
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 400)) {
      submitError.value = 'E-Mail-Adresse oder Passwort ist falsch.'
    } else {
      submitError.value = errorMessage(e, 'Die Anmeldung ist fehlgeschlagen.')
    }
  } finally {
    submitting.value = false
  }
}
</script>
