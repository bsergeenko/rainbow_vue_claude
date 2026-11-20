import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import CategoryView from './views/CategoryView.vue'
import ProductView from './views/ProductView.vue'
import DesignView from './views/DesignView.vue'
import CartView from './views/CartView.vue'
import CheckoutView from './views/CheckoutView.vue'
import OrderConfirmationView from './views/OrderConfirmationView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import AccountView from './views/AccountView.vue'
import WishlistView from './views/WishlistView.vue'
import ContactView from './views/ContactView.vue'
import NotFoundView from './views/NotFoundView.vue'
import AdminLayout from './views/admin/AdminLayout.vue'
import AdminProducts from './views/admin/AdminProducts.vue'
import AdminUsers from './views/admin/AdminUsers.vue'
import AdminOrders from './views/admin/AdminOrders.vue'
import AdminAdmins from './views/admin/AdminAdmins.vue'
import { auth, ensureUserLoaded, isAdmin } from './stores/auth.js'
import { cartCount, loadCart } from './stores/cart.js'
import { clearOnPageChange } from './stores/toast.js'
import { searchOpen } from './stores/ui.js'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Startseite' } },
  { path: '/damen', component: CategoryView, props: { category: 'women' }, meta: { title: 'Damen' } },
  { path: '/herren', component: CategoryView, props: { category: 'men' }, meta: { title: 'Herren' } },
  { path: '/kinder', component: CategoryView, props: { category: 'kids' }, meta: { title: 'Kinder' } },
  { path: '/hunde', component: CategoryView, props: { category: 'dogs' }, meta: { title: 'Hunde' } },
  { path: '/produkt/:id', component: ProductView, meta: { title: 'Produkt' } },
  { path: '/dein-design', component: DesignView, meta: { title: 'Dein Design' } },
  { path: '/warenkorb', component: CartView, meta: { title: 'Warenkorb' } },
  { path: '/kasse', component: CheckoutView, meta: { title: 'Kasse', requiresCart: true } },
  { path: '/bestellbestaetigung', component: OrderConfirmationView, meta: { title: 'Bestellbestätigung' } },
  { path: '/login', component: LoginView, meta: { title: 'Anmelden', guestOnly: true } },
  { path: '/registrieren', component: RegisterView, meta: { title: 'Registrieren', guestOnly: true } },
  { path: '/konto', component: AccountView, meta: { title: 'Benutzerkonto', requiresAuth: true } },
  { path: '/wunschliste', component: WishlistView, meta: { title: 'Wunschliste', requiresAuth: true } },
  { path: '/kontakt', component: ContactView, meta: { title: 'Kontakt' } },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { admin: true },
    children: [
      { path: '', redirect: '/admin/produkte' },
      { path: 'produkte', component: AdminProducts, meta: { admin: true, title: 'Produkte – Adminbereich' } },
      { path: 'benutzer', component: AdminUsers, meta: { admin: true, title: 'Benutzer – Adminbereich' } },
      { path: 'bestellungen', component: AdminOrders, meta: { admin: true, title: 'Bestellungen – Adminbereich' } },
      { path: 'administratoren', component: AdminAdmins, meta: { admin: true, title: 'Administratoren – Adminbereich' } }
    ]
  },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: 'Seite nicht gefunden' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ el: to.hash, top: 90, behavior: 'smooth' }), 50)
      })
    }
    if (to.path === from.path && JSON.stringify(to.query) === JSON.stringify(from.query)) return false
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  await ensureUserLoaded()

  // Adminbereich: nur für Administratoren
  if (to.meta.admin) {
    if (!auth.user) return { path: '/login' }
    if (!isAdmin.value) return { path: '/' }
    return true
  }

  // Angemeldete Administratoren sehen ausschließlich den Adminbereich
  if (isAdmin.value) return { path: '/admin' }

  if (to.meta.requiresAuth && !auth.user) {
    return { path: '/login' }
  }

  if (to.meta.guestOnly && auth.user) {
    return { path: '/konto' }
  }

  // Ohne Artikel im Warenkorb kann die Kasse nicht geöffnet werden
  if (to.meta.requiresCart) {
    try {
      await loadCart()
    } catch {
      return true
    }
    if (cartCount.value === 0) return { path: '/warenkorb' }
  }

  return true
})

router.afterEach((to, from, failure) => {
  if (failure) return
  const pageChanged = to.path !== from.path || JSON.stringify(to.query) !== JSON.stringify(from.query)
  if (pageChanged) {
    clearOnPageChange()
    searchOpen.value = false
  }
  document.title = to.meta.title ? `${to.meta.title} – Rainbow.design` : 'Rainbow.design'
})

export default router
