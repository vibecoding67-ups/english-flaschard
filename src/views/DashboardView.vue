<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDeckStore } from '@/stores/deckStore'
import { useStreakStore } from '@/stores/streakStore'
import StreakBadge from '@/components/StreakBadge.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const router = useRouter()
const deckStore = useDeckStore()
const streakStore = useStreakStore()

const showToast = ref(false)
const toastMessage = ref('')

onMounted(async () => {
  await Promise.all([
    deckStore.fetchCards(),
    streakStore.fetchStreak(),
  ])

  if (streakStore.isStreakMilestone) {
    toastMessage.value = `🎉 Selamat! Kamu sudah belajar ${streakStore.currentStreak} hari berturut-turut!`
    showToast.value = true
  }
})
</script>

<template>
  <div class="dashboard">
    <!-- Toast notification -->
    <Teleport to="body">
      <div v-if="showToast" class="toast-container">
        <ToastNotification
          :message="toastMessage"
          type="success"
          @close="showToast = false"
        />
      </div>
    </Teleport>

    <!-- Header -->
    <header class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">Pantau progres belajar kamu</p>
    </header>

    <!-- Streak badge -->
    <section class="streak-section" aria-label="Streak belajar">
      <StreakBadge
        :streak="streakStore.currentStreak"
        :last-date="streakStore.lastStudyDate"
      />
    </section>

    <!-- Stats cards -->
    <section class="stats-section" aria-label="Statistik flashcard">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ deckStore.totalCount }}</span>
          <span class="stat-label">Total Kata</span>
        </div>
        <div class="stat-card stat-card--mastered">
          <span class="stat-value">{{ deckStore.masteredCount }}</span>
          <span class="stat-label">Sudah Hafal</span>
        </div>
        <div class="stat-card stat-card--review">
          <span class="stat-value">{{ deckStore.reviewCount }}</span>
          <span class="stat-label">Perlu Diulang</span>
        </div>
      </div>
    </section>

    <!-- Quick actions -->
    <section class="actions-section" aria-label="Aksi cepat">
      <h2 class="actions-title">Mulai Belajar</h2>
      <div class="actions-grid">
        <button
          type="button"
          class="action-btn action-btn--primary"
          @click="router.push('/quiz')"
        >
          <span class="action-icon" aria-hidden="true">🧠</span>
          <span class="action-label">Mulai Quiz</span>
          <span class="action-desc">Uji hafalan kamu</span>
        </button>
        <button
          type="button"
          class="action-btn action-btn--secondary"
          @click="router.push('/add')"
        >
          <span class="action-icon" aria-hidden="true">➕</span>
          <span class="action-label">Tambah Kata</span>
          <span class="action-desc">Perluas kosakata</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 1.5rem 1rem;
  max-width: 640px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  text-align: center;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #cdd6f4;
  margin: 0 0 0.25rem;
}

.dashboard-subtitle {
  font-size: 0.9rem;
  color: #a6adc8;
  margin: 0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1rem 0.5rem;
  background-color: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 12px;
}

.stat-card--mastered {
  border-color: #a6e3a1;
  background-color: #1a2e22;
}

.stat-card--review {
  border-color: #fab387;
  background-color: #2e221a;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #cdd6f4;
  line-height: 1;
}

.stat-card--mastered .stat-value {
  color: #a6e3a1;
}

.stat-card--review .stat-value {
  color: #fab387;
}

.stat-label {
  font-size: 0.78rem;
  color: #a6adc8;
  font-weight: 500;
  text-align: center;
}

/* Actions */
.actions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #a6adc8;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.25rem 1rem;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
  text-align: center;
}

.action-btn:hover {
  opacity: 0.88;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

.action-btn--primary {
  background-color: #cba6f7;
  color: #1e1e2e;
}

.action-btn--secondary {
  background-color: #1e1e2e;
  color: #cdd6f4;
  border-color: #45475a;
}

.action-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.action-label {
  font-size: 1rem;
  font-weight: 700;
}

.action-desc {
  font-size: 0.78rem;
  opacity: 0.75;
}

/* Toast container */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}
</style>
