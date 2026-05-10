/**
 * Unit tests for useQuiz composable.
 *
 * Feature: english-flashcard
 * Validates: Requirements 3.1, 3.4, 3.5, 3.6
 */

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useQuiz } from '../useQuiz'
import type { Flashcard } from '@/types/index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCard(id: string, status: 'mastered' | 'review'): Flashcard {
  return {
    id,
    word: `word-${id}`,
    meaning: `meaning-${id}`,
    example: `example-${id}`,
    status,
    createdAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useQuiz — Unit Tests', () => {
  it("startSession('all'): deck with 3 cards (mix of mastered/review) → totalCards === 3", () => {
    const cards = ref<Flashcard[]>([
      makeCard('1', 'mastered'),
      makeCard('2', 'review'),
      makeCard('3', 'mastered'),
    ])
    const quiz = useQuiz(cards)

    quiz.startSession('all')

    expect(quiz.totalCards.value).toBe(3)
  })

  it("startSession('review-only'): 2 mastered + 2 review → totalCards === 2", () => {
    const cards = ref<Flashcard[]>([
      makeCard('1', 'mastered'),
      makeCard('2', 'mastered'),
      makeCard('3', 'review'),
      makeCard('4', 'review'),
    ])
    const quiz = useQuiz(cards)

    quiz.startSession('review-only')

    expect(quiz.totalCards.value).toBe(2)
  })

  it("respond('mastered'): sessionResults.masteredCount === 1", () => {
    const cards = ref<Flashcard[]>([makeCard('1', 'review'), makeCard('2', 'review')])
    const quiz = useQuiz(cards)

    quiz.startSession('all')
    quiz.respond('mastered')

    expect(quiz.sessionResults.value.masteredCount).toBe(1)
    expect(quiz.sessionResults.value.reviewCount).toBe(0)
  })

  it("respond('review'): sessionResults.reviewCount === 1", () => {
    const cards = ref<Flashcard[]>([makeCard('1', 'review'), makeCard('2', 'review')])
    const quiz = useQuiz(cards)

    quiz.startSession('all')
    quiz.respond('review')

    expect(quiz.sessionResults.value.reviewCount).toBe(1)
    expect(quiz.sessionResults.value.masteredCount).toBe(0)
  })

  it('isSessionComplete after all cards answered: true', () => {
    const cards = ref<Flashcard[]>([makeCard('1', 'review'), makeCard('2', 'review')])
    const quiz = useQuiz(cards)

    quiz.startSession('all')
    expect(quiz.isSessionComplete.value).toBe(false)

    quiz.respond('mastered')
    expect(quiz.isSessionComplete.value).toBe(false)

    quiz.respond('review')
    expect(quiz.isSessionComplete.value).toBe(true)
  })

  it('reset(): currentIndex === 0, isSessionComplete === false, sessionResults all 0', () => {
    const cards = ref<Flashcard[]>([makeCard('1', 'review'), makeCard('2', 'review')])
    const quiz = useQuiz(cards)

    quiz.startSession('all')
    quiz.respond('mastered')

    // Sanity check before reset
    expect(quiz.currentIndex.value).toBe(1)
    expect(quiz.sessionResults.value.masteredCount).toBe(1)

    quiz.reset()

    expect(quiz.currentIndex.value).toBe(0)
    expect(quiz.isSessionComplete.value).toBe(false)
    expect(quiz.sessionResults.value.masteredCount).toBe(0)
    expect(quiz.sessionResults.value.reviewCount).toBe(0)
    expect(quiz.sessionResults.value.totalCount).toBe(0)
  })
})
