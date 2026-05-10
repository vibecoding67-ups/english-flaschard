<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDeckStore } from '@/stores/deckStore'
import { useStreakStore } from '@/stores/streakStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const deckStore = useDeckStore()
const streakStore = useStreakStore()

const navLinks = [
  { to: '/', name: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/cards', name: 'cards', label: 'Daftar Flashcard', icon: '📚' },
  { to: '/quiz', name: 'quiz', label: 'Mode Quiz', icon: '🎯' },
  { to: '/add', name: 'add', label: 'Tambah Kata', icon: '➕' },
]

async function handleLogout() {
  await authStore.signOut()
  deckStore.reset()
  streakStore.reset()
  router.push('/auth')
}
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="Navigasi utama">
    <div class="navbar-brand">
      <span class="brand-icon">🗂️</span>
      <span class="brand-name">English Flashcard</span>
    </div>

    <ul class="navbar-links" role="list">
      <li v-for="link in navLinks" :key="link.name" class="navbar-item">
        <RouterLink
          :to="link.to"
          class="navbar-link"
          :class="{ active: route.name === link.name }"
          :aria-current="route.name === link.name ? 'page' : undefined"
        >
          <span class="link-icon" aria-hidden="true">{{ link.icon }}</span>
          <span class="link-label">{{ link.label }}</span>
          <span v-if="route.name === link.name" class="active-indicator" aria-hidden="true" />
        </RouterLink>
      </li>

      <!-- Logout button -->
      <li class="navbar-item">
        <button
          type="button"
          class="navbar-link logout-btn"
          aria-label="Keluar dari akun"
          @click="handleLogout"
        >
          <span class="link-icon" aria-hidden="true">🚪</span>
          <span class="link-label">Keluar</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
  background-color: #1e1e2e;
  border-bottom: 1px solid #313244;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cdd6f4;
}

.brand-icon {
  font-size: 1.4rem;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #cba6f7;
  white-space: nowrap;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-item {
  position: relative;
}

.navbar-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  text-decoration: none;
  color: #a6adc8;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.navbar-link:hover {
  background-color: #313244;
  color: #cdd6f4;
}

.navbar-link.active {
  background-color: #313244;
  color: #cba6f7;
  font-weight: 600;
}

.logout-btn:hover {
  color: #f38ba8;
}

.link-icon {
  font-size: 1rem;
}

.active-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #cba6f7;
  border-radius: 2px;
}

@media (max-width: 600px) {
  .navbar {
    padding: 0 0.75rem;
  }

  .brand-name {
    display: none;
  }

  .link-label {
    display: none;
  }

  .navbar-link {
    padding: 0.5rem;
  }

  .link-icon {
    font-size: 1.25rem;
  }
}
</style>
