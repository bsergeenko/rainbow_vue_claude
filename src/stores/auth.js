import { computed, reactive } from 'vue'
import { api } from '../utils/api.js'
import { loadCart, resetCart } from './cart.js'
import { loadWishlist, resetWishlist } from './wishlist.js'

export const auth = reactive({
  user: null,
  loaded: false
})

export const isLoggedIn = computed(() => !!auth.user)
export const isAdmin = computed(() => ['admin', 'main_admin'].includes(auth.user?.role))
export const isMainAdmin = computed(() => auth.user?.role === 'main_admin')

let pending = null

// Login-Status über GET /me prüfen
export function loadUser() {
  if (!pending) {
    pending = api
      .get('/me')
      .then((user) => {
        auth.user = user
      })
      .catch(() => {
        // 401: nicht angemeldet; andere Fehler: als Gast fortfahren
        auth.user = null
      })
      .finally(() => {
        auth.loaded = true
        pending = null
      })
  }
  return pending
}

export function ensureUserLoaded() {
  if (auth.loaded) return Promise.resolve()
  return loadUser()
}

export function setUser(user) {
  auth.user = user ? { ...auth.user, ...user } : null
}

export async function login(email, password) {
  await api.post('/login', { email, password })
  await loadUser()
  await Promise.allSettled([loadCart(), isAdmin.value ? Promise.resolve() : loadWishlist()])
  return auth.user
}

function clearSession() {
  auth.user = null
  resetWishlist()
  resetCart()
}

export async function logout() {
  await api.post('/logout')
  clearSession()
  await loadCart().catch(() => {})
}

export async function deleteAccount() {
  await api.delete('/me')
  clearSession()
  await loadCart().catch(() => {})
}
