<template>
  <div class="container page">
    <h1 class="page-title">Kontakt</h1>
    <div class="contact-layout">
      <form class="card-section form-stack" novalidate @submit.prevent="submit">
        <p class="lead">Du hast eine Frage oder einen besonderen Wunsch? Schreib uns!</p>
        <p class="muted small">Alle Felder sind Pflichtfelder.</p>
        <p v-if="submitError" class="alert alert-error" role="alert">{{ submitError }}</p>

        <FormField id="contact-name" label="Name" required :error="form.errors.value.name">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.name" v-bind="form.bind('name')" class="input" autocomplete="name" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
        <FormField id="contact-email" label="E-Mail-Adresse" required :error="form.errors.value.email">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.email" v-bind="form.bind('email')" type="email" class="input" autocomplete="email" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
        <FormField id="contact-subject" label="Betreff" required :error="form.errors.value.subject">
          <template #default="{ id, invalid, describedby }">
            <input :id="id" v-model="form.values.subject" v-bind="form.bind('subject')" class="input" :aria-invalid="invalid" :aria-describedby="describedby" />
          </template>
        </FormField>
        <FormField id="contact-message" label="Nachricht" required :error="form.errors.value.message">
          <template #default="{ id, invalid, describedby }">
            <textarea :id="id" v-model="form.values.message" v-bind="form.bind('message')" class="input textarea" rows="6" :aria-invalid="invalid" :aria-describedby="describedby"></textarea>
          </template>
        </FormField>

        <button type="submit" class="btn btn-primary btn-large" :disabled="submitting">
          {{ submitting ? 'Nachricht wird gesendet …' : 'Nachricht senden' }}
        </button>
      </form>

      <aside class="card-section contact-aside" aria-labelledby="social-title">
        <h2 id="social-title" class="section-subtitle">Folge uns</h2>
        <p>Neue Designs, Einblicke in die Werkstatt und Inspiration für Regentage findest du auf Instagram und Facebook.</p>
        <SocialLinks />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FormField from '../components/FormField.vue'
import SocialLinks from '../components/SocialLinks.vue'
import { useForm } from '../composables/useForm.js'
import { api, errorMessage } from '../utils/api.js'
import { fullName } from '../utils/format.js'
import { email, required } from '../utils/validation.js'
import { auth, isLoggedIn, loadUser } from '../stores/auth.js'
import { notify } from '../stores/toast.js'

const submitting = ref(false)
const submitError = ref('')

const form = useForm(
  { name: '', email: '', subject: '', message: '' },
  {
    name: required('deinen Namen'),
    email: [required('deine E-Mail-Adresse'), email()],
    subject: required('einen Betreff'),
    message: required('deine Nachricht')
  }
)

// Name und E-Mail-Adresse eingeloggter Nutzer aus GET /me vorausfüllen
async function prefill() {
  if (!isLoggedIn.value) return
  await loadUser()
  if (!auth.user) return
  if (!form.values.name) form.values.name = fullName(auth.user)
  if (!form.values.email) form.values.email = auth.user.email || ''
}

async function submit() {
  submitError.value = ''
  if (!form.validate()) return
  submitting.value = true
  try {
    await api.post('/contact', {
      name: form.values.name.trim(),
      email: form.values.email.trim(),
      subject: form.values.subject.trim(),
      message: form.values.message.trim()
    })
    form.reset({ name: '', email: '', subject: '', message: '' })
    notify('Vielen Dank für deine Nachricht.', { duration: 7000 })
  } catch (e) {
    submitError.value = errorMessage(e, 'Deine Nachricht konnte nicht gesendet werden.')
  } finally {
    submitting.value = false
  }
}

onMounted(prefill)
</script>
