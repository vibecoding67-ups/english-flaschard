/**
 * Integration test: quiz end-to-end flow.
 *
 * Feature: english-flashcard
 * Validates: Requirements 3.1, 3.4, 3.5, 3.8, 4.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { storeToRefs } from 'pinia'
import { useDeckStore } from '../deckStore'
import { useStreakStore } from '../streakStore'
import { useQuiz } from '@/composables/useQuiz'

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

function createLocalStorageMock() {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(store)) delete store[k]
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Quiz — Integration: end-to-end flow', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    setActivePinia(createPinia())
  })

  it('full quiz session: 3 cards answered, streak incremented, statuses updated', () => {
    const deckStore = useDeckStore()
    const streakStore = useStreakStore()

    // Add 3 cards
    const r1 = deckStore.addCard({ word: 'apple', meaning: 'apel', example: 'I eat an apple.' })
    const r2 = deckStore.addCard({ word: 'book', meaning: 'buku', example: 'I read a book.' })
    const r3 = deckStore.addCard({ word: 'cat', meaning: 'kucing', example: 'The cat sleeps.' })

    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
    expect(r3.success).toBe(true)

    // Create useQuiz with deckStore.cards ref (use storeToRefs to get the actual Ref)
    const { cards } = storeToRefs(deckStore)
    const quiz = useQuiz(cards)

    // Start session with mode 'all'
    quiz.startSession('all')
    expect(quiz.totalCards.value).toBe(3)
    expect(quiz.isSessionComplete.value).toBe(false)

    // Simulate answering all 3 cards: mastered, review, mastered
    quiz.respond('mastered')
    expect(quiz.isSessionComplete.value).toBe(false)

    quiz.respond('review')
    expect(quiz.isSessionComplete.value).toBe(false)

    quiz.respond('mastered')

    // Session should be complete
    expect(quiz.isSessionComplete.value).toBe(true)

    // Verify sessionResults
    expect(quiz.sessionResults.value.totalCount).toBe(3)
    expect(quiz.sessionResults.value.masteredCount).toBe(2)
    expect(quiz.sessionResults.value.reviewCount).toBe(1)

    // Record streak session and verify streak incremented
    const streakBefore = streakStore.currentStreak
    const result = streakStore.recordSession('2025-06-15')
    expect(result.streakIncremented).toBe(true)
    expect(streakStore.currentStreak).toBe(streakBefore + 1)

    // Verify deckStore cards have updated statuses by calling setStatus
    // (useQuiz does not call setStatus internally — the view is responsible)
    if (r1.success) deckStore.setStatus(r1.card.id, 'mastered')
    if (r2.success) deckStore.setStatus(r2.card.id, 'review')
    if (r3.success) deckStore.setStatus(r3.card.id, 'mastered')

    const card1 = deckStore.cards.find((c) => r1.success && c.id === r1.card.id)
    const card2 = deckStore.cards.find((c) => r2.success && c.id === r2.card.id)
    const card3 = deckStore.cards.find((c) => r3.success && c.id === r3.card.id)

    expect(card1?.status).toBe('mastered')
    expect(card2?.status).toBe('review')
    expect(card3?.status).toBe('mastered')
  })
})
