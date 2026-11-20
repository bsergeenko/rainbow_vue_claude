<template>
  <section aria-labelledby="admin-admins-title">
    <h1 id="admin-admins-title" class="page-title">Administratoren</h1>

    <LoadingState v-if="loading" text="Administratoren werden geladen …" />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />

    <template v-else>
      <ul class="admin-list">
        <li v-for="admin in admins" :key="admin.id" class="admin-card">
          <template v-if="editingId !== admin.id">
            <div class="admin-user-head">
              <h2 class="admin-card-title">
                {{ fullName(admin) }}
                <span v-if="admin.id === auth.user?.id" class="muted small">(Du)</span>
              </h2>
              <span class="badge" :class="{ 'badge-strong': admin.role === 'main_admin' }">{{ roleLabel(admin.role) }}</span>
            </div>
            <dl class="data-list compact">
              <div><dt>E-Mail-Adresse</dt><dd class="break">{{ admin.email }}</dd></div>
              <div v-if="admin.createdAt"><dt>Angelegt am</dt><dd>{{ formatDate(admin.createdAt) }}</dd></div>
            </dl>
            <div class="button-row">
              <button v-if="canEdit(admin)" type="button" class="btn btn-secondary btn-small" @click="startEdit(admin)">
                {{ admin.id === auth.user?.id ? 'Meine Daten bearbeiten' : 'Bearbeiten' }}
              </button>
              <button
                v-if="admin.id === auth.user?.id && !changingPassword"
                type="button"
                class="btn btn-secondary btn-small"
                @click="changingPassword = true"
              >
                Passwort ändern
              </button>
              <button v-if="canDelete(admin)" type="button" class="btn btn-danger-outline btn-small" @click="deleteTarget = admin">
                Löschen
              </button>
            </div>
            <div v-if="admin.id === auth.user?.id && changingPassword" class="nested-form">
              <h3 class="order-section-title">Passwort ändern</h3>
              <PasswordChangeForm id-prefix="admin-pw" @done="changingPassword = false" @cancel="changingPassword = false" />
            </div>
          </template>

          <form v-else class="form-stack" novalidate @submit.prevent="saveEdit(admin)">
            <h2 class="admin-card-title">{{ admin.id === auth.user?.id ? 'Meine Daten bearbeiten' : 'Administrator bearbeiten' }}</h2>
            <p v-if="editError" class="alert alert-error" role="alert">{{ editError }}</p>
            <div class="form-grid">
              <FormField :id="`ed-first-${admin.id}`" label="Vorname" required :error="editForm.errors.value.firstName">
                <template #default="{ id, invalid, describedby }">
                  <input :id="id" v-model="editForm.values.firstName" v-bind="editForm.bind('firstName')" class="input" :aria-invalid="invalid" :aria-describedby="describedby" />
                </template>
              </FormField>
              <FormField :id="`ed-last-${admin.id}`" label="Nachname" required :error="editForm.errors.value.lastName">
                <template #default="{ id, invalid, describedby }">
                  <input :id="id" v-model="editForm.values.lastName" v-bind="editForm.bind('lastName')" class="input" :aria-invalid="invalid" :aria-describedby="describedby" />
                </template>
              </FormField>
              <FormField :id="`ed-email-${admin.id}`" class="span-2" label="E-Mail-Adresse" required :error="editForm.errors.value.email">
                <template #default="{ id, invalid, describedby }">
                  <input :id="id" v-model="editForm.values.email" v-bind="editForm.bind('email')" type="email" class="input" :aria-invalid="invalid" :aria-describedby="describedby" />
                </template>
              </FormField>
            </div>
            <div class="button-row">
              <button type="submit" class="btn btn-primary" :disabled="savingEdit">{{ savingEdit ? 'Wird gespeichert …' : 'Speichern' }}</button>
              <button type="button" class="btn btn-secondary" :disabled="savingEdit" @click="cancelEdit">Abbrechen</button>
            </div>
          </form>
        </li>
      </ul>

      <section v-if="isMainAdmin" class="card-section" aria-labelledby="new-admin-title">
        <h2 id="new-admin-title" class="section-subtitle">Neuen Administrator anlegen</h2>
        <p class="muted small">Alle Felder sind Pflichtfelder.</p>
        <form class="form-stack" novalidate @submit.prevent="createAdmin">
          <p v-if="createError" class="alert alert-error" role="alert">{{ createError }}</p>
          <div class="form-grid">
            <FormField id="new-admin-first" label="Vorname" required :error="createForm.errors.value.firstName">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="createForm.values.firstName" v-bind="createForm.bind('firstName')" class="input" autocomplete="off" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="new-admin-last" label="Nachname" required :error="createForm.errors.value.lastName">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="createForm.values.lastName" v-bind="createForm.bind('lastName')" class="input" autocomplete="off" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="new-admin-email" label="E-Mail-Adresse" required :error="createForm.errors.value.email">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="createForm.values.email" v-bind="createForm.bind('email')" type="email" class="input" autocomplete="off" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
            <FormField id="new-admin-password" label="Passwort" required :error="createForm.errors.value.password">
              <template #default="{ id, invalid, describedby }">
                <input :id="id" v-model="createForm.values.password" v-bind="createForm.bind('password')" type="password" class="input" autocomplete="new-password" :aria-invalid="invalid" :aria-describedby="describedby" />
              </template>
            </FormField>
          </div>
          <div>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Wird angelegt …' : 'Administrator anlegen' }}
            </button>
          </div>
        </form>
      </section>
    </template>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Administrator löschen?"
      confirm-label="Ja, löschen"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    >
      <p v-if="deleteTarget">
        Möchtest du den Administrator {{ fullName(deleteTarget) }} ({{ deleteTarget.email }}) wirklich löschen?
      </p>
    </ConfirmDialog>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import ErrorState from '../../components/ErrorState.vue'
import FormField from '../../components/FormField.vue'
import LoadingState from '../../components/LoadingState.vue'
import PasswordChangeForm from '../../components/PasswordChangeForm.vue'
import { useForm } from '../../composables/useForm.js'
import { api, errorMessage } from '../../utils/api.js'
import { formatDate, fullName, roleLabel } from '../../utils/format.js'
import { email, required } from '../../utils/validation.js'
import { auth, isMainAdmin, setUser } from '../../stores/auth.js'
import { notify, notifyError } from '../../stores/toast.js'

const admins = ref([])
const loading = ref(true)
const error = ref('')

// Hauptadministrator zuerst, danach Administratoren in Reihenfolge ihrer Erstellung
function sortAdmins(list) {
  return [...list].sort((a, b) => {
    if (a.role === 'main_admin' && b.role !== 'main_admin') return -1
    if (b.role === 'main_admin' && a.role !== 'main_admin') return 1
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.get('/admins')
    admins.value = sortAdmins(Array.isArray(data) ? data : [])
  } catch (e) {
    error.value = errorMessage(e, 'Die Administratoren konnten nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

function canEdit(admin) {
  return isMainAdmin.value || admin.id === auth.user?.id
}

function canDelete(admin) {
  return isMainAdmin.value && admin.id !== auth.user?.id
}

// Bearbeiten
const editingId = ref('')
const editError = ref('')
const savingEdit = ref(false)
const editForm = useForm(
  { firstName: '', lastName: '', email: '' },
  {
    firstName: required('einen Vornamen'),
    lastName: required('einen Nachnamen'),
    email: [required('eine E-Mail-Adresse'), email()]
  }
)

function startEdit(admin) {
  editForm.reset({ firstName: admin.firstName, lastName: admin.lastName, email: admin.email })
  editError.value = ''
  editingId.value = admin.id
}

function cancelEdit() {
  editingId.value = ''
  editError.value = ''
}

async function saveEdit(admin) {
  editError.value = ''
  if (!editForm.validate()) return
  savingEdit.value = true
  try {
    const updated = await api.put(`/admins/${encodeURIComponent(admin.id)}`, {
      firstName: editForm.values.firstName.trim(),
      lastName: editForm.values.lastName.trim(),
      email: editForm.values.email.trim()
    })
    admins.value = sortAdmins(admins.value.map((item) => (item.id === admin.id ? { ...item, ...updated } : item)))
    if (admin.id === auth.user?.id) {
      setUser({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email })
    }
    editingId.value = ''
    notify('Die Daten wurden gespeichert.')
  } catch (e) {
    editError.value = errorMessage(e, 'Die Daten konnten nicht gespeichert werden.')
  } finally {
    savingEdit.value = false
  }
}

// Passwort
const changingPassword = ref(false)

// Neuer Administrator
const creating = ref(false)
const createError = ref('')
const createForm = useForm(
  { firstName: '', lastName: '', email: '', password: '' },
  {
    firstName: required('einen Vornamen'),
    lastName: required('einen Nachnamen'),
    email: [required('eine E-Mail-Adresse'), email()],
    password: required('ein Passwort')
  }
)

async function createAdmin() {
  createError.value = ''
  if (!createForm.validate()) return
  creating.value = true
  try {
    const created = await api.post('/admins', {
      firstName: createForm.values.firstName.trim(),
      lastName: createForm.values.lastName.trim(),
      email: createForm.values.email.trim(),
      password: createForm.values.password
    })
    admins.value = sortAdmins([...admins.value, created])
    createForm.reset()
    notify(`${fullName(created)} wurde als Administrator angelegt.`)
  } catch (e) {
    createError.value = errorMessage(e, 'Der Administrator konnte nicht angelegt werden.')
  } finally {
    creating.value = false
  }
}

// Löschen
const deleteTarget = ref(null)
const deleting = ref(false)

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  deleting.value = true
  try {
    await api.delete(`/admins/${encodeURIComponent(target.id)}`)
    admins.value = admins.value.filter((item) => item.id !== target.id)
    deleteTarget.value = null
    notify('Der Administrator wurde gelöscht.')
  } catch (e) {
    notifyError(errorMessage(e, 'Der Administrator konnte nicht gelöscht werden.'))
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>
