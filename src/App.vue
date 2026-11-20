<template>
  <a class="skip-link" href="#main" @click.prevent="focusMain">Zum Inhalt springen</a>

  <RouterView v-if="isAdminArea" />

  <div v-else class="shop">
    <SiteHeader />
    <main id="main" class="shop-main" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="viewKey" />
      </RouterView>
    </main>
    <SiteFooter />
  </div>

  <ToastContainer />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import ToastContainer from './components/ToastContainer.vue'
import { pageReloadKey } from './stores/ui.js'

const route = useRoute()

const isAdminArea = computed(() => route.matched.some((record) => record.meta.admin))

// Seiten werden bei neuem Aufruf (auch gleicher Link) neu aufgebaut, Abschnittsanker ausgenommen
const viewKey = computed(() => `${route.fullPath.split('#')[0]}::${pageReloadKey.value}`)

function focusMain() {
  const main = document.getElementById('main')
  if (main) {
    main.focus()
    main.scrollIntoView()
  }
}
</script>
