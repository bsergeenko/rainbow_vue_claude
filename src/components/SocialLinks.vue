<template>
  <ul class="social-links">
    <li>
      <a :href="INSTAGRAM_URL" target="_blank" rel="noopener noreferrer" class="social-link">
        <AppIcon name="instagram" />
        <span>Instagram</span>
        <span class="visually-hidden">(öffnet in einem neuen Tab)</span>
      </a>
    </li>
    <li>
      <a :href="FACEBOOK_URL" target="_blank" rel="noopener noreferrer" class="social-link">
        <AppIcon name="facebook" />
        <span>Facebook</span>
        <span class="visually-hidden">(öffnet in einem neuen Tab)</span>
      </a>
    </li>
  </ul>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

const INSTAGRAM_URL = 'https://www.instagram.com/rainbow.georgiandesign?stkn=dGE4M3drcmIxYndu'
const FACEBOOK_URL = 'https://www.facebook.com/rainbow.georgiandesign'
</script>
