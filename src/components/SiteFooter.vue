<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <NavLink to="/" class="logo-link" aria-label="Rainbow.design – zur Startseite">
          <img :src="logoUrl" alt="Rainbow.design" class="footer-logo" width="96" height="70" />
        </NavLink>
      </div>

      <nav class="footer-nav" aria-label="Footer-Navigation">
        <ul>
          <li><NavLink to="/damen">Damen</NavLink></li>
          <li><NavLink to="/herren">Herren</NavLink></li>
          <li><NavLink to="/kinder">Kinder</NavLink></li>
          <li><NavLink to="/hunde">Hunde</NavLink></li>
          <li><NavLink to="/dein-design">Dein Design</NavLink></li>
          <li><NavLink :to="{ path: '/', hash: '#ueber-uns' }">Über uns</NavLink></li>
          <li><NavLink to="/kontakt">Kontakt</NavLink></li>
        </ul>
      </nav>

      <div class="footer-social">
        <SocialLinks />
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© Rainbow.design</p>
    </div>
  </footer>
</template>

<script setup>
import NavLink from './NavLink.vue'
import SocialLinks from './SocialLinks.vue'
import { assetUrl } from '../utils/api.js'

const logoUrl = assetUrl('/assets/logo.svg')
</script>
