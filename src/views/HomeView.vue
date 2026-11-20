<template>
  <div class="home">
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero-inner">
        <img :src="assetUrl('/assets/logo.svg')" alt="" class="hero-logo" width="140" height="101" />
        <h1 id="hero-title" class="hero-title">Rainbow Design bringt Farbe in Regentage</h1>
      </div>
    </section>

    <section class="section container" aria-labelledby="categories-title">
      <h2 id="categories-title" class="section-title">Kategorien</h2>
      <ul class="category-grid">
        <li v-for="category in categories" :key="category.to">
          <RouterLink :to="category.to" class="category-tile">
            <img :src="assetUrl(category.image)" :alt="`Regenmäntel für ${category.label}`" class="category-tile-image" />
            <span class="category-tile-label">{{ category.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="section design-teaser" aria-labelledby="design-title">
      <div class="container">
        <h2 id="design-title" class="section-title">Dein Design</h2>
        <div class="design-teaser-text">
          <p class="design-teaser-lead">Dein Regenmantel, dein Design.</p>
          <p>Finde dein Lieblingsmotiv und mach deinen Regenmantel einzigartig.</p>
        </div>

        <ErrorState v-if="error" :message="error" retry @retry="loadDesigns" />
        <ul class="motif-grid" :aria-busy="loading ? 'true' : 'false'">
          <li v-for="(slot, index) in motifSlots" :key="slot.file">
            <RouterLink
              v-if="slot.design"
              :to="{ path: '/dein-design', query: { motiv: slot.design.id } }"
              class="motif-tile"
              :aria-label="`Motiv ${index + 1} auswählen und Dein Design öffnen`"
            >
              <img :src="assetUrl(slot.design.image)" :alt="`Rückenmotiv ${index + 1}`" class="motif-tile-image" />
            </RouterLink>
            <div v-else class="motif-tile motif-tile-placeholder" aria-hidden="true"></div>
          </li>
        </ul>
        <p v-if="loading" class="visually-hidden" role="status">Motive werden geladen …</p>

        <div class="center">
          <RouterLink to="/dein-design" class="btn btn-primary btn-large">Dein Design gestalten</RouterLink>
        </div>
      </div>
    </section>

    <section id="ueber-uns" class="section container about" aria-labelledby="about-title">
      <h2 id="about-title" class="section-title">Über uns</h2>
      <p class="about-text">
        Rainbow.design steht für handgefertigte Regenmäntel mit individuellen Details. Farben, Rückenmotive und liebevoll
        gestaltete Taschen machen jedes Stück besonders.
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ErrorState from '../components/ErrorState.vue'
import { api, assetUrl, errorMessage } from '../utils/api.js'

const categories = [
  { label: 'Damen', to: '/damen', image: '/assets/home/women.jpg' },
  { label: 'Herren', to: '/herren', image: '/assets/home/men.jpg' },
  { label: 'Kinder', to: '/kinder', image: '/assets/home/kids.jpg' },
  { label: 'Hunde', to: '/hunde', image: '/assets/home/dogs.jpg' }
]

const MOTIF_FILES = ['designe01.jpg', 'designe02.jpg', 'designe03.jpg', 'designe04.jpg']

const designs = ref(null)
const loading = ref(true)
const error = ref('')

// Die vier Startseiten-Motive werden den Motiven aus GET /designs zugeordnet
const motifSlots = computed(() =>
  MOTIF_FILES.map((file) => ({
    file,
    design: (designs.value?.adult || []).find((item) => item.image === `/assets/designs/adult/${file}`) || null
  }))
)

async function loadDesigns() {
  loading.value = true
  error.value = ''
  try {
    designs.value = await api.get('/designs')
  } catch (e) {
    error.value = errorMessage(e, 'Die Motive konnten nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

onMounted(loadDesigns)
</script>
