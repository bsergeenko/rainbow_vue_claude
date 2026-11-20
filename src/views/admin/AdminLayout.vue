<template>
  <div class="admin">
    <header class="admin-header">
      <div class="container admin-header-inner">
        <RouterLink to="/admin/produkte" class="admin-brand" aria-label="Adminbereich – Produkte">
          <img :src="logoUrl" alt="Rainbow.design" class="admin-logo" width="64" height="46" />
          <span class="admin-brand-text">Adminbereich</span>
        </RouterLink>
        <nav class="admin-nav" aria-label="Adminnavigation">
          <ul>
            <li><RouterLink to="/admin/produkte" class="admin-nav-link">Produkte</RouterLink></li>
            <li><RouterLink to="/admin/benutzer" class="admin-nav-link">Benutzer</RouterLink></li>
            <li><RouterLink to="/admin/bestellungen" class="admin-nav-link">Bestellungen</RouterLink></li>
            <li><RouterLink to="/admin/administratoren" class="admin-nav-link">Administratoren</RouterLink></li>
            <li>
              <button type="button" class="admin-nav-link admin-logout" :disabled="loggingOut" @click="doLogout">
                {{ loggingOut ? 'Abmeldung läuft …' : 'Abmelden' }}
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div v-if="auth.user" class="container admin-user">
        Angemeldet als {{ fullName(auth.user) }} · {{ roleLabel(auth.user.role) }}
      </div>
    </header>
    <main id="main" class="admin-main container" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { assetUrl, errorMessage } from '../../utils/api.js'
import { fullName, roleLabel } from '../../utils/format.js'
import { auth, logout } from '../../stores/auth.js'
import { notify, notifyError } from '../../stores/toast.js'

const router = useRouter()
const logoUrl = assetUrl('/assets/logo.svg')
const loggingOut = ref(false)

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
</script>
