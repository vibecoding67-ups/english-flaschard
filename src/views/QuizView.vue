<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDeckStore } from '@/stores/deckStore'
import { useStreakStore } from '@/stores/streakStore'
import { useQuiz } from '@/composables/useQuiz'
import QuizCard from '@/components/QuizCard.vue'
import SessionSummary from '@/components/SessionSummary.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import type { CardStatus, QuizMode } from '@/types/index'

const router = useRouter()
const deckStore = useDeckStore()
const streakStore = useStreakStore()

// Pass cards ref from store to useQuiz
const { cards } = storeToRefs(deckStore)
const quiz = useQuiz(cards)

type QuizState = 'select-mode' | 'in-progress' | 'complete'
const quizState = ref<QuizState>('select-mode')

const showToast = ref(false)
const toastMessage = ref('')

// Computed counts for mode selection
const allCardsCount = computed(() => deckStore.totalCount)
const reviewCardsCount = computed(() => deckStore.reviewCount)

// Progress display: 1-based index
const currentCardNumber = computed(() => quiz.currentIndex.value + 1)

function startQuiz(mode: QuizMode) {
  quiz.startSession(mode)
  quizState.value = 'in-progress'
}

function handleShowAnswer() {
  quiz.showAnswer()
}

function handleRespond(status: CardStatus) {
  const card = quiz.currentCard.value
  if (!card) return

  // Update the card status in the store
  deckStore.setStatus(card.id, status)
  // Advance the quiz session
  quiz.respond(status)

  // Check if session is now complete
  if (quiz.isSessionComplete.value) {
    quizState.value = 'complete'
    onSessionComplete()
  }
}

function onSessionComplete() {
  streakStore.recordSession()

  if (streakStore.isStreakMilestone) {
    toastMessage.value = `🎉 Selamat! Kamu sudah belajar ${streakStore.currentStreak} hari berturut-turut!`
    showToast.value = true
  }
}

function handleRestart() {
  quiz.reset()
  quizState.value = 'select-mode'
}

function handleGoHome() {
  quiz.reset()
  router.push('/')
}

// Watch isSessionComplete as a safety net (in case it changes reactively)
watch(
  () => quiz.isSessionComplete.value,
  (complete) => {
    if (complete && quizState.value === 'in-progress') {
      quizState.value = 'complete'
      onSessionComplete()
    }
  },
)
</script>

<template>
  <div class="quiz-view">
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

    <!-- ── SELECT MODE ── -->
    <template v-if="quizState === 'select-mode'">
      <header class="quiz-header">
        <h1 class="quiz-title">Mode Quiz</h1>
        <p class="quiz-subtitle">Pilih mode belajar yang kamu inginkan</p>
      </header>

      <!-- Empty state: no cards at all -->
      <div v-if="allCardsCount === 0" class="empty-state">
        <span class="empty-icon" aria-hidden="true">📭</span>
        <h2 class="empty-title">Belum ada flashcard</h2>
        <p class="empty-desc">Tambahkan kata terlebih dahulu sebelum memulai quiz.</p>
        <button type="button" class="btn-primary" @click="router.push('/add')">
          ➕ Tambah Kata
        </button>
      </div>

      <!-- Mode selection -->
      <div v-else class="mode-grid">
        <button
          type="button"
          class="mode-card"
          @click="startQuiz('all')"
        >
          <span class="mode-icon" aria-hidden="true">🃏</span>
          <span class="mode-name">Quiz Semua Kata</span>
          <span class="mode-count">{{ allCardsCount }} kartu</span>
          <span class="mode-desc">Latih semua kosakata dalam koleksimu</span>
        </button>

        <button
          type="button"
          class="mode-card"
          :class="{ 'mode-card--disabled': reviewCardsCount === 0 }"
          :disabled="reviewCardsCount === 0"
          :aria-disabled="reviewCardsCount === 0"
          @click="reviewCardsCount > 0 && startQuiz('review-only')"
        >
          <span class="mode-icon" aria-hidden="true">🔁</span>
          <span class="mode-name">Fokus Review</span>
          <span class="mode-count">{{ reviewCardsCount }} kartu</span>
          <span class="mode-desc">
            {{ reviewCardsCount === 0 ? 'Tidak ada kartu yang perlu diulang' : 'Fokus pada kartu yang perlu diulang' }}
          </span>
        </button>
      </div>
    </template>

    <!-- ── IN PROGRESS ── -->
    <template v-else-if="quizState === 'in-progress'">
      <header class="quiz-header">
        <div class="progress-row">
          <span class="progress-text" aria-live="polite">
            Kartu {{ currentCardNumber }} dari {{ quiz.totalCards.value }}
          </span>
          <div
            class="progress-bar"
            role="progressbar"
            :aria-valuenow="currentCardNumber"
            :aria-valuemax="quiz.totalCards.value"
            aria-valuemin="1"
          >
            <div
              class="progress-fill"
              :style="{ width: `${(currentCardNumber / quiz.totalCards.value) * 100}%` }"
            />
          </div>
        </div>
      </header>

      <div v-if="quiz.currentCard.value" class="quiz-card-wrapper">
        <QuizCard
          :card="quiz.currentCard.value"
          :show-answer="quiz.isAnswerVisible.value"
          @show-answer="handleShowAnswer"
          @respond="handleRespond"
        />
      </div>
    </template>

    <!-- ── COMPLETE ── -->
    <template v-else-if="quizState === 'complete'">
      <header class="quiz-header">
        <h1 class="quiz-title">Sesi Selesai</h1>
      </header>

      <SessionSummary
        :results="quiz.sessionResults.value"
        @restart="handleRestart"
        @go-home="handleGoHome"
      />
    </template>
  </div>
</template>

<style scoped>
.quiz-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
  max-width: 640px;
  margin: 0 auto;
}

/* Header */
.quiz-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.quiz-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #cdd6f4;
  margin: 0;
}

.quiz-subtitle {
  font-size: 0.9rem;
  color: #a6adc8;
  margin: 0;
}

/* Progress row */
.progress-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.88rem;
  color: #a6adc8;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background-color: #313244;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #cba6f7;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  line-height: 1;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
}

.empty-desc {
  font-size: 0.9rem;
  color: #a6adc8;
  margin: 0;
}

.btn-primary {
  margin-top: 0.5rem;
  padding: 0.65rem 1.5rem;
  background-color: #cba6f7;
  color: #1e1e2e;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn-primary:hover {
  opacity: 0.88;
}

.btn-primary:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

/* Mode selection grid */
.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.5rem 1rem;
  background-color: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 14px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
}

.mode-card:hover:not(.mode-card--disabled) {
  border-color: #cba6f7;
  background-color: #252535;
}

.mode-card:active:not(.mode-card--disabled) {
  transform: scale(0.97);
}

.mode-card:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

.mode-card--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.mode-icon {
  font-size: 2rem;
  line-height: 1;
}

.mode-name {
  font-size: 1rem;
  font-weight: 700;
  color: #cdd6f4;
}

.mode-count {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cba6f7;
}

.mode-desc {
  font-size: 0.78rem;
  color: #a6adc8;
  line-height: 1.4;
}

/* Quiz card wrapper */
.quiz-card-wrapper {
  width: 100%;
}

/* Toast container */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}
</style>
