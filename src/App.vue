<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()

// Jangan tampilkan NavBar di halaman auth
const hideNav = ['auth']
</script>

<template>
  <div id="app-root">
    <NavBar v-if="!hideNav.includes(String(route.name))" />

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #181825;
  color: #cdd6f4;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}
</style>
