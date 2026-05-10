<script setup lang="ts">
import type { Flashcard, CardStatus } from '@/types/index'

defineProps<{
  card: Flashcard
  showAnswer: boolean
}>()

const emit = defineEmits<{
  'show-answer': []
  respond: [status: CardStatus]
}>()
</script>

<template>
  <div class="quiz-card" :class="{ 'quiz-card--revealed': showAnswer }">
    <!-- Word — always visible -->
    <div class="quiz-word-section">
      <p class="quiz-word-label">Apa artinya?</p>
      <h2 class="quiz-word">{{ card.word }}</h2>
    </div>

    <!-- Answer section — visible only when showAnswer is true -->
    <Transition name="reveal">
      <div v-if="showAnswer" class="quiz-answer-section" aria-live="polite">
        <div class="divider" aria-hidden="true" />

        <div class="answer-block">
          <p class="answer-label">Arti</p>
          <p class="answer-meaning">{{ card.meaning }}</p>
        </div>

        <div class="answer-block">
          <p class="answer-label">Contoh Kalimat</p>
          <p class="answer-example">
            <em>{{ card.example }}</em>
          </p>
        </div>
      </div>
    </Transition>

    <!-- Action buttons -->
    <div class="quiz-actions">
      <!-- Before answer is shown -->
      <button
        v-if="!showAnswer"
        type="button"
        class="btn btn-show-answer"
        @click="emit('show-answer')"
      >
        👁️ Tampilkan Jawaban
      </button>

      <!-- After answer is shown -->
      <template v-else>
        <button
          type="button"
          class="btn btn-mastered"
          @click="emit('respond', 'mastered')"
        >
          Sudah Hafal ✓
        </button>
        <button
          type="button"
          class="btn btn-review"
          @click="emit('respond', 'review')"
        >
          Perlu Diulang ↩
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.quiz-card {
  background-color: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 280px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  transition: border-color 0.2s ease;
}

.quiz-card--revealed {
  border-color: #45475a;
}

/* Word section */
.quiz-word-section {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.quiz-word-label {
  font-size: 0.85rem;
  color: #6c7086;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.quiz-word {
  font-size: 2.5rem;
  font-weight: 800;
  color: #cdd6f4;
  margin: 0;
  word-break: break-word;
}

/* Answer section */
.quiz-answer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.divider {
  height: 1px;
  background-color: #313244;
}

.answer-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.answer-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6c7086;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.answer-meaning {
  font-size: 1.1rem;
  color: #cdd6f4;
  margin: 0;
  font-weight: 500;
}

.answer-example {
  font-size: 0.92rem;
  color: #a6adc8;
  margin: 0;
  line-height: 1.5;
}

/* Actions */
.quiz-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.65rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
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

.btn-show-answer {
  background-color: #313244;
  color: #cdd6f4;
  border: 1px solid #45475a;
  min-width: 200px;
}

.btn-mastered {
  background-color: #1e3a2f;
  color: #a6e3a1;
  border: 1px solid #a6e3a1;
  flex: 1;
  max-width: 220px;
}

.btn-review {
  background-color: #3a2a1e;
  color: #fab387;
  border: 1px solid #fab387;
  flex: 1;
  max-width: 220px;
}

/* Reveal transition */
.reveal-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.reveal-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.reveal-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
