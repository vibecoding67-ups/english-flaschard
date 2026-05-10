<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  streak: number
  lastDate: string | null
}>()

const isMilestone = computed(
  () => props.streak > 0 && props.streak % 7 === 0,
)

const formattedLastDate = computed(() => {
  if (!props.lastDate) return null

  // lastDate is "YYYY-MM-DD"
  const [year, month, day] = props.lastDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<template>
  <div class="streak-badge" :class="{ 'streak-badge--milestone': isMilestone }">
    <div class="streak-main">
      <span class="streak-fire" aria-hidden="true">🔥</span>
      <div class="streak-info">
        <span class="streak-count" aria-label="`${streak} hari berturut-turut`">
          {{ streak }}
        </span>
        <span class="streak-label">hari berturut-turut</span>
      </div>
      <span
        v-if="isMilestone"
        class="milestone-star"
        title="Milestone! Kelipatan 7 hari"
        aria-label="Milestone tercapai!"
      >
        ⭐
      </span>
    </div>

    <div class="streak-date">
      <span v-if="formattedLastDate" class="date-text">
        Terakhir belajar: {{ formattedLastDate }}
      </span>
      <span v-else class="date-text date-text--empty">
        Belum pernah belajar
      </span>
    </div>

    <div v-if="isMilestone" class="milestone-banner" role="status" aria-live="polite">
      🎉 Selamat! Kamu sudah belajar {{ streak }} hari berturut-turut!
    </div>
  </div>
</template>

<style scoped>
.streak-badge {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background-color: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 12px;
  transition: border-color 0.2s ease;
}

.streak-badge--milestone {
  border-color: #f9e2af;
  background-color: #2a2518;
}

.streak-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.streak-fire {
  font-size: 2rem;
  line-height: 1;
}

.streak-info {
  display: flex;
  flex-direction: column;
}

.streak-count {
  font-size: 2rem;
  font-weight: 800;
  color: #f38ba8;
  line-height: 1;
}

.streak-label {
  font-size: 0.8rem;
  color: #a6adc8;
  margin-top: 0.1rem;
}

.milestone-star {
  font-size: 1.5rem;
  margin-left: auto;
  animation: pulse 1.5s ease-in-out infinite;
}

.streak-date {
  border-top: 1px solid #313244;
  padding-top: 0.5rem;
}

.date-text {
  font-size: 0.82rem;
  color: #a6adc8;
}

.date-text--empty {
  font-style: italic;
  color: #6c7086;
}

.milestone-banner {
  background-color: #3a2e1e;
  border: 1px solid #f9e2af;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: #f9e2af;
  font-weight: 500;
  text-align: center;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>
