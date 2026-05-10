<script setup lang="ts">
import { computed } from 'vue'
import type { Flashcard, CardStatus } from '@/types/index'

const props = defineProps<{
  card: Flashcard
}>()

const emit = defineEmits<{
  delete: []
  'status-change': [payload: { id: string; status: CardStatus }]
}>()

const formattedDate = computed(() => {
  const date = new Date(props.card.createdAt)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})

function toggleStatus() {
  const newStatus: CardStatus = props.card.status === 'mastered' ? 'review' : 'mastered'
  emit('status-change', { id: props.card.id, status: newStatus })
}
</script>

<template>
  <article class="flashcard-item" :class="`flashcard-item--${card.status}`">
    <div class="card-header">
      <h3 class="card-word">{{ card.word }}</h3>
      <span
        class="status-badge"
        :class="`status-badge--${card.status}`"
        :aria-label="`Status: ${card.status === 'mastered' ? 'Hafal' : 'Perlu Diulang'}`"
      >
        {{ card.status === 'mastered' ? 'Hafal ✓' : 'Perlu Diulang' }}
      </span>
    </div>

    <div class="card-body">
      <p class="card-meaning">
        <span class="field-label">Arti:</span>
        {{ card.meaning }}
      </p>
      <p class="card-example">
        <span class="field-label">Contoh:</span>
        <em>{{ card.example }}</em>
      </p>
    </div>

    <div class="card-footer">
      <span class="card-date">Ditambahkan {{ formattedDate }}</span>

      <div class="card-actions">
        <button
          class="btn btn-status"
          :class="card.status === 'mastered' ? 'btn-status--review' : 'btn-status--mastered'"
          type="button"
          @click="toggleStatus"
        >
          {{ card.status === 'mastered' ? 'Tandai Perlu Diulang' : 'Tandai Hafal' }}
        </button>

        <button
          class="btn btn-delete"
          type="button"
          aria-label="`Hapus flashcard ${card.word}`"
          @click="emit('delete')"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.flashcard-item {
  background-color: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.flashcard-item:hover {
  border-color: #45475a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.flashcard-item--mastered {
  border-left: 3px solid #a6e3a1;
}

.flashcard-item--review {
  border-left: 3px solid #fab387;
}

/* Header */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-word {
  font-size: 1.3rem;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
}

.status-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge--mastered {
  background-color: #1e3a2f;
  color: #a6e3a1;
  border: 1px solid #a6e3a1;
}

.status-badge--review {
  background-color: #3a2a1e;
  color: #fab387;
  border: 1px solid #fab387;
}

/* Body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card-meaning,
.card-example {
  margin: 0;
  font-size: 0.92rem;
  color: #cdd6f4;
  line-height: 1.5;
}

.field-label {
  font-weight: 600;
  color: #a6adc8;
  margin-right: 0.3rem;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  border-top: 1px solid #313244;
  padding-top: 0.65rem;
}

.card-date {
  font-size: 0.78rem;
  color: #6c7086;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  padding: 0.35rem 0.8rem;
  border-radius: 7px;
  border: 1px solid transparent;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}

.btn:hover {
  opacity: 0.85;
}

.btn:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 2px;
}

.btn-status--mastered {
  background-color: #1e3a2f;
  color: #a6e3a1;
  border-color: #a6e3a1;
}

.btn-status--review {
  background-color: #3a2a1e;
  color: #fab387;
  border-color: #fab387;
}

.btn-delete {
  background-color: #3a1e1e;
  color: #f38ba8;
  border-color: #f38ba8;
}
</style>
