<template>
  <form class="form-stack" novalidate @submit.prevent="submit">
    <p v-if="submitError" class="alert alert-error" role="alert">{{ submitError }}</p>
    <FormField :id="`${idPrefix}-current`" label="Aktuelles Passwort" required :error="form.errors.value.currentPassword">
      <template #default="{ id, invalid, describedby }">
        <input :id="id" v-model="form.values.currentPassword" v-bind="form.bind('currentPassword')" type="password" class="input" autocomplete="current-password" :aria-invalid="invalid" :aria-describedby="describedby" />
      </template>
    </FormField>
    <FormField :id="`${idPrefix}-new`" label="Neues Passwort" required :error="form.errors.value.newPassword">
      <template #default="{ id, invalid, describedby }">
        <input :id="id" v-model="form.values.newPassword" v-bind="form.bind('newPassword')" type="password" class="input" autocomplete="new-password" :aria-invalid="invalid" :aria-describedby="describedby" />
      </template>
    </FormField>
    <FormField :id="`${idPrefix}-confirm`" label="Neues Passwort bestätigen" required :error="form.errors.value.confirmPassword">
      <template #default="{ id, invalid, describedby }">
        <input :id="id" v-model="form.values.confirmPassword" v-bind="form.bind('confirmPassword')" type="password" class="input" autocomplete="new-password" :aria-invalid="invalid" :aria-describedby="describedby" />
      </template>
    </FormField>
    <div class="button-row">
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Wird gespeichert …' : 'Passwort speichern' }}
      </button>
      <button type="button" class="btn btn-secondary" :disabled="submitting" @click="cancel">Abbrechen</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import FormField from './FormField.vue'
import { useForm } from '../composables/useForm.js'
import { api, errorMessage } from '../utils/api.js'
import { required } from '../utils/validation.js'
import { notify } from '../stores/toast.js'

defineProps({
  idPrefix: { type: String, default: 'pw' }
})

const emit = defineEmits(['done', 'cancel'])

const submitting = ref(false)
const submitError = ref('')

const form = useForm(
  { currentPassword: '', newPassword: '', confirmPassword: '' },
  {
    currentPassword: required('dein aktuelles Passwort'),
    newPassword: required('ein neues Passwort'),
    confirmPassword: [
      required('das neue Passwort erneut'),
      (value, values) => (value && value !== values.newPassword ? 'Die neuen Passwörter stimmen nicht überein.' : '')
    ]
  }
)

async function submit() {
  submitError.value = ''
  if (!form.validate()) return
  submitting.value = true
  try {
    // Nur aktuelles und neues Passwort werden gesendet
    await api.put('/me/password', {
      currentPassword: form.values.currentPassword,
      newPassword: form.values.newPassword
    })
    notify('Dein Passwort wurde geändert.')
    form.reset()
    emit('done')
  } catch (e) {
    submitError.value = errorMessage(e, 'Das Passwort konnte nicht geändert werden.')
  } finally {
    submitting.value = false
  }
}

function cancel() {
  form.reset()
  submitError.value = ''
  emit('cancel')
}
</script>
