/**
 * Property tests for useQuiz composable.
 *
 * Feature: english-flashcard, Property 12: Quiz hanya menampilkan kartu sesuai mode
 *
 * Validates: Requirements 3.1, 3.6
 */

import { describe, it } from 'vitest'
import { ref } from 'vue'
import * as fc from 'fast-check'
import { useQuiz } from '../useQuiz'
import type { Flashcard, CardStatus } from '@/types/index'

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generate a non-empty trimmed string. */
const nonEmptyString = fc
  .string({ minLength: 1, maxLength: 40 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim())

/** Generate a valid CardStatus value. */
const cardStatusArb = fc.constantFrom<CardStatus>('mastered', 'review')

/** Generate a valid Flashcard object. */
const flashcardArb: fc.Arbitrary<Flashcard> = fc.record<Flashcard>({
  id: fc.uuid(),
  word: nonEmptyString,
  meaning: nonEmptyString,
  example: nonEmptyString,
  status: cardStatusArb,
  createdAt: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map((d) => d.toISOString()),
})

/**
 * Generate a deck of 0–15 cards with mixed statuses.
 * We use a unique-id constraint to avoid duplicate ids in the deck.
 */
const deckArb: fc.Arbitrary<Flashcard[]> = fc
  .array(flashcardArb, { minLength: 0, maxLength: 15 })
  .map((cards) => {
    // Ensure unique ids (fast-check may generate duplicates)
    const seen = new Set<string>()
    return cards.filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  })

// ---------------------------------------------------------------------------
// Helper: simulate a full quiz session and collect all seen card ids
// ---------------------------------------------------------------------------
function runFullSession(
  deck: Flashcard[],
  mode: 'all' | 'review-only',
): string[] {
  const cardsRef = ref<Flashcard[]>(deck)
  const quiz = useQuiz(cardsRef)

  quiz.startSession(mode)

  const seenIds: string[] = []

  // If no cards in session, totalCards will be 0 — loop won't execute
  while (!quiz.isSessionComplete.value) {
    const card = quiz.currentCard.value
    if (card === null) break
    seenIds.push(card.id)
    quiz.showAnswer()
    // Alternate between 'mastered' and 'review' responses to exercise both paths
    quiz.respond(seenIds.length % 2 === 0 ? 'mastered' : 'review')
  }

  return seenIds
}

// ---------------------------------------------------------------------------
// Property 12
// ---------------------------------------------------------------------------

describe('useQuiz — Property 12: Quiz hanya menampilkan kartu sesuai mode', () => {
  /**
   * **Validates: Requirements 3.1, 3.6**
   *
   * P12a — mode 'all': every card in the deck appears exactly once.
   */
  it(
    "P12a: mode 'all' — all deck cards appear exactly once in the session",
    () => {
      fc.assert(
        fc.property(deckArb, (deck) => {
          const seenIds = runFullSession(deck, 'all')

          // Every deck card id must appear exactly once
          const deckIds = deck.map((c) => c.id).sort()
          const sortedSeen = [...seenIds].sort()

          expect(sortedSeen).toEqual(deckIds)
        }),
        { numRuns: 100 },
      )
    },
  )

  /**
   * **Validates: Requirements 3.1, 3.6**
   *
   * P12b — mode 'review-only': only 'review' cards appear, each exactly once.
   */
  it(
    "P12b: mode 'review-only' — only review cards appear, each exactly once",
    () => {
      fc.assert(
        fc.property(deckArb, (deck) => {
          const reviewIds = deck
            .filter((c) => c.status === 'review')
            .map((c) => c.id)
            .sort()

          const seenIds = runFullSession(deck, 'review-only')
          const sortedSeen = [...seenIds].sort()

          // Exactly the review cards, no more, no less
          expect(sortedSeen).toEqual(reviewIds)
        }),
        { numRuns: 100 },
      )
    },
  )
})
