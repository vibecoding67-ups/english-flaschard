import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { Flashcard, CardStatus, QuizMode, SessionResult } from '@/types/index'

/**
 * useQuiz — manages a quiz session.
 *
 * Accepts the deck cards as a parameter for testability.
 * Does NOT call deckStore.setStatus internally — that is the responsibility
 * of the view that uses this composable.
 */
export function useQuiz(cards: Ref<Flashcard[]>) {
  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  /** Cards in the current session (shuffled subset). */
  const sessionCards = ref<Flashcard[]>([])

  /** 0-based index of the current card in sessionCards. */
  const currentIndex = ref<number>(0)

  /** Whether the answer side is currently visible. */
  const isAnswerVisible = ref<boolean>(false)

  /** Whether the session has been completed (all cards answered). */
  const isSessionComplete = ref<boolean>(false)

  /** Accumulated results for the current session. */
  const sessionResults = ref<SessionResult>({
    masteredCount: 0,
    reviewCount: 0,
    totalCount: 0,
  })

  // ---------------------------------------------------------------------------
  // Computed / derived state
  // ---------------------------------------------------------------------------

  /** The card currently being shown, or null if no active session. */
  const currentCard: ComputedRef<Flashcard | null> = computed(() => {
    if (sessionCards.value.length === 0 || isSessionComplete.value) return null
    return sessionCards.value[currentIndex.value] ?? null
  })

  /** Total number of cards in the current session. */
  const totalCards: ComputedRef<number> = computed(() => sessionCards.value.length)

  // ---------------------------------------------------------------------------
  // Fisher-Yates shuffle (in-place)
  // ---------------------------------------------------------------------------
  function fisherYatesShuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Start a new quiz session.
   * - 'all'         → include every card in the deck
   * - 'review-only' → include only cards with status 'review'
   * Cards are shuffled with Fisher-Yates before the session begins.
   */
  function startSession(mode: QuizMode): void {
    const subset =
      mode === 'all'
        ? [...cards.value]
        : cards.value.filter((c) => c.status === 'review')

    sessionCards.value = fisherYatesShuffle(subset)
    currentIndex.value = 0
    isAnswerVisible.value = false
    isSessionComplete.value = false
    sessionResults.value = {
      masteredCount: 0,
      reviewCount: 0,
      totalCount: sessionCards.value.length,
    }
  }

  /**
   * Reveal the answer for the current card.
   */
  function showAnswer(): void {
    isAnswerVisible.value = true
  }

  /**
   * Record the user's response for the current card and advance the session.
   * - Increments masteredCount or reviewCount in sessionResults.
   * - Advances to the next card, or marks the session complete if this was the last card.
   */
  function respond(status: CardStatus): void {
    if (status === 'mastered') {
      sessionResults.value.masteredCount++
    } else {
      sessionResults.value.reviewCount++
    }

    const nextIndex = currentIndex.value + 1
    if (nextIndex >= sessionCards.value.length) {
      isSessionComplete.value = true
    } else {
      currentIndex.value = nextIndex
      isAnswerVisible.value = false
    }
  }

  /**
   * Reset all session state back to initial values.
   */
  function reset(): void {
    sessionCards.value = []
    currentIndex.value = 0
    isAnswerVisible.value = false
    isSessionComplete.value = false
    sessionResults.value = {
      masteredCount: 0,
      reviewCount: 0,
      totalCount: 0,
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    // Reactive state
    currentCard,
    currentIndex,
    totalCards,
    isAnswerVisible,
    isSessionComplete,
    sessionResults,
    // Actions
    startSession,
    showAnswer,
    respond,
    reset,
  }
}
