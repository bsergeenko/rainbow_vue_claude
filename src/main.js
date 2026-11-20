import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './styles.css'
import { auth, isAdmin, loadUser } from './stores/auth.js'
import { loadCart } from './stores/cart.js'
import { loadWishlist } from './stores/wishlist.js'

async function start() {
  await loadUser()
  // Warenkorb-Anzahl und gespeicherte Wunschlisten-Einträge laden
  loadCart().catch(() => {})
  if (auth.user && !isAdmin.value) loadWishlist().catch(() => {})

  const app = createApp(App)
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

start()
