<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'search'">
      <circle cx="11" cy="11" r="7" fill="none" />
      <path d="m20 20-3.6-3.6" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" fill="none" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="none" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
    </template>
    <template v-else-if="name === 'cart'">
      <path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.1" fill="none" />
      <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
      <circle cx="17.5" cy="20" r="1.3" fill="currentColor" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'minus'">
      <path d="M6 12h12" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 6v12M6 12h12" />
    </template>
    <template v-else-if="name === 'trash'">
      <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" fill="none" />
    </template>
    <template v-else-if="name === 'instagram'">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" />
      <circle cx="12" cy="12" r="4" fill="none" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'facebook'">
      <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H9v3h2.5V21" fill="none" />
    </template>
    <template v-else-if="name === 'arrow-left'">
      <path d="M19 12H5M11 6l-6 6 6 6" fill="none" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" fill="none" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 22 },
  filled: { type: Boolean, default: false }
})
</script>
