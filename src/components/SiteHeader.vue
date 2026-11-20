<template>
  <header class="site-header">
    <div class="header-inner container">
      <NavLink to="/" class="logo-link" aria-label="Rainbow.design – zur Startseite" @navigate="closeMenu">
        <img :src="logoUrl" alt="Rainbow.design" class="logo" width="80" height="58" />
      </NavLink>

      <nav id="main-navigation" class="main-nav" :class="{ open: menuOpen }" aria-label="Hauptnavigation">
        <ul class="main-nav-list">
          <li v-for="item in navItems" :key="item.label">
            <NavLink :to="item.to" class="main-nav-link" :class="{ active: isActive(item) }" @navigate="closeMenu">
              {{ item.label }}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div class="header-icons">
        <button
          type="button"
          class="icon-button"
          :class="{ active: searchOpen }"
          :aria-expanded="searchOpen ? 'true' : 'false'"
          aria-controls="search-panel"
          aria-label="Suche"
          title="Suche"
          @click="toggleSearch"
        >
          <AppIcon name="search" />
        </button>
        <NavLink :to="accountTarget" class="icon-button" aria-label="Benutzerkonto" title="Benutzerkonto" @navigate="closeMenu">
          <AppIcon name="user" />
        </NavLink>
        <NavLink to="/wunschliste" class="icon-button" aria-label="Wunschliste" title="Wunschliste" @navigate="closeMenu">
          <AppIcon name="heart" />
        </NavLink>
        <NavLink
          to="/warenkorb"
          class="icon-button cart-button"
          :aria-label="cartCount > 0 ? `Warenkorb, ${cartCount} ${cartCount === 1 ? 'Artikel' : 'Artikel'}` : 'Warenkorb'"
          title="Warenkorb"
          @navigate="closeMenu"
        >
          <AppIcon name="cart" />
          <span v-if="cartCount > 0" class="cart-badge" aria-hidden="true">{{ cartCount > 99 ? '99+' : cartCount }}</span>
        </NavLink>
        <button
          type="button"
          class="icon-button menu-toggle"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          aria-controls="main-navigation"
          :aria-label="menuOpen ? 'Menü schließen' : 'Menü öffnen'"
          :title="menuOpen ? 'Menü schließen' : 'Menü öffnen'"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </div>

    <SearchPanel v-if="searchOpen" @close="closeSearch" />
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import NavLink from './NavLink.vue'
import SearchPanel from './SearchPanel.vue'
import { assetUrl } from '../utils/api.js'
import { cartCount } from '../stores/cart.js'
import { isLoggedIn } from '../stores/auth.js'
import { searchOpen } from '../stores/ui.js'

const route = useRoute()
const menuOpen = ref(false)
const logoUrl = assetUrl('/assets/logo.svg')

const navItems = [
  { label: 'Damen', to: '/damen' },
  { label: 'Herren', to: '/herren' },
  { label: 'Kinder', to: '/kinder' },
  { label: 'Hunde', to: '/hunde' },
  { label: 'Dein Design', to: '/dein-design' },
  { label: 'Über uns', to: { path: '/', hash: '#ueber-uns' }, hash: true },
  { label: 'Kontakt', to: '/kontakt' }
]

const accountTarget = computed(() => (isLoggedIn.value ? '/konto' : '/login'))

function isActive(item) {
  if (item.hash) return false
  return route.path === item.to
}

function closeMenu() {
  menuOpen.value = false
  searchOpen.value = false
}

function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) menuOpen.value = false
}

function closeSearch() {
  searchOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  }
)
</script>
