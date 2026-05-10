<script setup lang="ts">
import { computed } from 'vue'
import type { SessionResult } from '@/types/index'

const props = defineProps<{
  results: SessionResult
}>()

const emit = defineEmits<{
  restart: []
  'go-home': []
}>()

const percentageMastered = computed(() => {
  if (props.results.totalCount === 0) return 0
  return Math.round((props.results.masteredCount / props.results.totalCount) * 100)
})

const allMastered = computed(
  () => props.results.totalCount > 0 && props.results.masteredCount === props.results.totalCount,
)
</script>

<template>
  <div class="session-summary" :class="{ 'session-summary--perfect': allMastered }">
    <!-- Celebratory header for perfect score -->
    <div v-if="allMastered" class="perfect-banner" role="status" aria-live="polite">
      <span class="perfect-emoji" aria-hidden="true">🎉</span>
      <h2 class="perfect-title">Luar Biasa! Semua Hafal!</h2>
      <p class="perfect-subtitle">Kamu berhasil menghafal semua kata dalam sesi ini.</p>
    </div>

    <!-- Normal header -->
    <div v-else class="summary-header">
      <h2 class="summary-title">Sesi Selesai!</h2>
      <p class="summary-subtitle">Berikut hasil belajar kamu:</p>
    </div>

    <!-- Stats grid -->
    <div class="stats-grid" role="list" aria-label="Hasil sesi quiz">
      <div class="stat-card stat-card--total" role="listitem">
        <span class="stat-value">{{ results.totalCount }}</span>
        <span class="stat-label">Total Kartu</span>
      </div>

      <div class="stat-card stat-card--mastered" role="listitem">
        <span class="stat-value">{{ results.masteredCount }}</span>
        <span class="stat-label">Hafal ✓</span>
      </div>

      <div class="stat-card stat-card--review" role="listitem">
        <span class="stat-value">{{ results.reviewCount }}</span>
        <span class="stat-label">Perlu Diulang</span>
      </div>
    </div>

    <!-- Percentage bar -->
    <div class="progress-section" aria-label="Persentase hafal">
      <div class="progress-header">
        <span class="progress-label">Persentase Hafal</span>
        <span class="progress-value">{{ percentageMastered }}%</span>
      </div>
      <div class="progress-bar" role="progressbar" :aria-valuenow="percentageMastered" aria-valuemin="0" aria-valuemax="100">
        <div
          class="progress-fill"
          :style="{ width: `${percentageMastered}%` }"
          :class="{
            'progress-fill--perfect': percentageMastered === 100,
            'progress-fill--good': percentageMastered >= 70 && percentageMastered < 100,
            'progress-fill--low': percentageMastered < 70,
          }"
        />
      </div>
    </div>

    <!-- Action buttons -->
    <div class="summary-actions">
      <button
        type="button"
        class="btn btn-restart"
        @click="emit('restart')"
      >
        🔄 Quiz Lagi
      </button>
      <button
        type="button"
        class="btn btn-home"
        @click="emit('go-home')"
      >
        🏠 Ke Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
.session-summary {
  background-color: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.session-summary--perfect {
  border-color: #a6e3a1;
}

/* Perfect banner */
.perfect-banner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.perfect-emoji {
  font-size: 3rem;
  animation: bounce 0.6s ease infinite alternate;
}

.perfect-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #a6e3a1;
  margin: 0;
}

.perfect-subtitle {
  font-size: 0.9rem;
  color: #a6adc8;
  margin: 0;
}

/* Normal header */
.summary-header {
  text-align: center;
}

.summary-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0 0 0.25rem;
}

.summary-subtitle {
  font-size: 0.9rem;
  color: #a6adc8;
  margin: 0;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.85rem 0.5rem;
  border-radius: 10px;
  border: 1px solid #313244;
}

.stat-card--total {
  background-color: #181825;
}

.stat-card--mastered {
  background-color: #1e3a2f;
  border-color: #a6e3a1;
}

.stat-card--review {
  background-color: #3a2a1e;
  border-color: #fab387;
}

.stat-value {
  font-size: 1.8rem;
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
  font-size: 0.75rem;
  color: #a6adc8;
  font-weight: 500;
  text-align: center;
}

/* Progress bar */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.85rem;
  color: #a6adc8;
  font-weight: 500;
}

.progress-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #cdd6f4;
}

.progress-bar {
  height: 10px;
  background-color: #313244;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.6s ease;
}

.progress-fill--perfect {
  background-color: #a6e3a1;
}

.progress-fill--good {
  background-color: #89b4fa;
}

.progress-fill--low {
  background-color: #fab387;
}

/* Actions */
.summary-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
  text-align: center;
}

.btn:hover {
  opacity: 0.88;
}

.btn:active {
  transform: scale(0.97);
}

.btn:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

.btn-restart {
  background-color: #313244;
  color: #cdd6f4;
  border-color: #45475a;
}

.btn-home {
  background-color: #cba6f7;
  color: #1e1e2e;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-6px); }
}
</style>
