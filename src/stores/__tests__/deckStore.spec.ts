/**
 * Property tests for deckStore.
 *
 * Feature: english-flashcard
 *
 * P1 — Validates: Requirements 1.2, 1.4
 * P2 — Validates: Requirements 1.3
 * P3 — Validates: Requirements 1.6
 * P4 — Validates: Requirements 1.7
 * P5 — Validates: Requirements 2.1, 2.2
 * P6 — Validates: Requirements 2.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as fc from 'fast-check'
import { useDeckStore } from '../deckStore'
import type { CardStatus } from '@/types/index'

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
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string with no leading/trailing whitespace. */
const nonEmptyString = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim())

/** Valid AddCardPayload. */
const validPayload = fc.record({
  word: nonEmptyString,
  meaning: nonEmptyString,
  example: nonEmptyString,
})

/** A whitespace-only or empty string. */
const blankString = fc.constantFrom('', '   ', '\t', '\n')

/** CardStatus arbitrary. */
const cardStatusArb = fc.constantFrom<CardStatus>('mastered', 'review')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Populate the store with `n` cards using unique words.
 * Returns the list of added cards (only successful ones).
 */
function populateStore(
  store: ReturnType<typeof useDeckStore>,
  payloads: Array<{ word: string; meaning: string; example: string }>,
) {
  const added: Array<{ id: string; word: string; meaning: string; example: string; status: CardStatus; createdAt: string }> = []
  for (const p of payloads) {
    const result = store.addCard(p)
    if (result.success) {
      added.push(result.card)
    }
  }
  return added
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('deckStore — Property Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    setActivePinia(createPinia())
  })

  // -------------------------------------------------------------------------
  // P1: Valid card addition increases deck length by 1, card found by id,
  //     status === 'review'
  // -------------------------------------------------------------------------
  it(
    'P1: Valid card addition increases deck length by 1, card found by id, status === review',
    () => {
      fc.assert(
        fc.property(validPayload, (payload) => {
          // Fresh store for each run
          vi.stubGlobal('localStorage', createLocalStorageMock())
          setActivePinia(createPinia())
          const store = useDeckStore()

          const before = store.cards.length
          const result = store.addCard(payload)

          expect(result.success).toBe(true)
          if (!result.success) return

          expect(store.cards.length).toBe(before + 1)

          const found = store.cards.find((c) => c.id === result.card.id)
          expect(found).toBeDefined()
          expect(found?.status).toBe('review')
        }),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P2: Whitespace/empty input rejected, deck unchanged
  // -------------------------------------------------------------------------
  it(
    'P2: Whitespace/empty input rejected, deck unchanged',
    () => {
      fc.assert(
        fc.property(
          // At least one field is blank; the others may be valid or blank
          fc.tuple(
            fc.oneof(blankString, nonEmptyString),
            fc.oneof(blankString, nonEmptyString),
            fc.oneof(blankString, nonEmptyString),
          ).filter(([w, m, e]) => !w.trim() || !m.trim() || !e.trim()),
          ([word, meaning, example]) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useDeckStore()

            const before = store.cards.length
            const result = store.addCard({ word, meaning, example })

            expect(result.success).toBe(false)
            if (result.success) return
            expect(result.error).toBe('validation')
            expect(store.cards.length).toBe(before)
          },
        ),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P3: Delete removes exactly one card with matching id
  // -------------------------------------------------------------------------
  it(
    'P3: Delete removes exactly one card with matching id',
    () => {
      fc.assert(
        fc.property(
          fc.array(validPayload, { minLength: 1, maxLength: 10 }),
          (payloads) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useDeckStore()

            const added = populateStore(store, payloads)
            if (added.length === 0) return // all were duplicates — skip

            const before = store.cards.length
            // Pick a random card from what was actually added
            const target = added[Math.floor(Math.random() * added.length)]

            store.deleteCard(target.id)

            expect(store.cards.length).toBe(before - 1)
            expect(store.cards.find((c) => c.id === target.id)).toBeUndefined()
          },
        ),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P4: Duplicate detection is case-insensitive
  // -------------------------------------------------------------------------
  it(
    'P4: Duplicate detection is case-insensitive',
    () => {
      fc.assert(
        fc.property(
          fc.array(validPayload, { minLength: 1, maxLength: 5 }),
          (payloads) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useDeckStore()

            const added = populateStore(store, payloads)
            if (added.length === 0) return

            const existingWord = added[0].word

            // Existing word (exact case) → true
            expect(store.isDuplicate(existingWord)).toBe(true)
            // Existing word (upper case) → true
            expect(store.isDuplicate(existingWord.toUpperCase())).toBe(true)
            // Word definitely not in deck → false
            expect(store.isDuplicate('definitely_not_in_deck_xyz123')).toBe(false)
          },
        ),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P5: setStatus only changes status field, all other fields unchanged
  // -------------------------------------------------------------------------
  it(
    'P5: setStatus only changes status field, all other fields unchanged',
    () => {
      fc.assert(
        fc.property(
          fc.array(validPayload, { minLength: 1, maxLength: 5 }),
          cardStatusArb,
          (payloads, targetStatus) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useDeckStore()

            const added = populateStore(store, payloads)
            if (added.length === 0) return

            const target = added[Math.floor(Math.random() * added.length)]
            // Snapshot the card before mutation
            const before = { ...store.cards.find((c) => c.id === target.id)! }

            store.setStatus(target.id, targetStatus)

            const after = store.cards.find((c) => c.id === target.id)!
            expect(after).toBeDefined()

            // Only status should change
            expect(after.status).toBe(targetStatus)
            // All other fields must remain identical
            expect(after.id).toBe(before.id)
            expect(after.word).toBe(before.word)
            expect(after.meaning).toBe(before.meaning)
            expect(after.example).toBe(before.example)
            expect(after.createdAt).toBe(before.createdAt)
          },
        ),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P6: masteredCount + reviewCount === totalCount === cards.length always
  // -------------------------------------------------------------------------
  it(
    'P6: masteredCount + reviewCount === totalCount === cards.length always',
    () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              payload: validPayload,
              status: cardStatusArb,
            }),
            { minLength: 0, maxLength: 20 },
          ),
          (entries) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useDeckStore()

            // Add cards and then set their statuses
            for (const { payload, status } of entries) {
              const result = store.addCard(payload)
              if (result.success) {
                store.setStatus(result.card.id, status)
              }
            }

            expect(store.masteredCount + store.reviewCount).toBe(store.totalCount)
            expect(store.totalCount).toBe(store.cards.length)
          },
        ),
        { numRuns: 100 },
      )
    },
  )
})

// ---------------------------------------------------------------------------
// Unit Tests
// ---------------------------------------------------------------------------

describe('deckStore — Unit Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    setActivePinia(createPinia())
  })

  it('addCard with valid payload: card is added with correct fields and status review', () => {
    const store = useDeckStore()
    const payload = { word: 'hello', meaning: 'halo', example: 'Hello, world!' }

    const result = store.addCard(payload)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(store.cards.length).toBe(1)
    expect(result.card.word).toBe('hello')
    expect(result.card.meaning).toBe('halo')
    expect(result.card.example).toBe('Hello, world!')
    expect(result.card.status).toBe('review')
  })

  it('addCard with empty word: returns { success: false, error: "validation" }, deck unchanged', () => {
    const store = useDeckStore()
    const result = store.addCard({ word: '', meaning: 'halo', example: 'Hello!' })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('validation')
    expect(store.cards.length).toBe(0)
  })

  it('addCard with whitespace-only meaning: returns validation error', () => {
    const store = useDeckStore()
    const result = store.addCard({ word: 'hello', meaning: '   ', example: 'Hello!' })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toBe('validation')
    expect(store.cards.length).toBe(0)
  })

  it('deleteCard: add a card then delete it, card is gone from cards array', () => {
    const store = useDeckStore()
    const result = store.addCard({ word: 'hello', meaning: 'halo', example: 'Hello!' })
    expect(result.success).toBe(true)
    if (!result.success) return

    store.deleteCard(result.card.id)

    expect(store.cards.length).toBe(0)
    expect(store.cards.find((c) => c.id === result.card.id)).toBeUndefined()
  })

  it('setStatus: add a card (status review), call setStatus to mastered, verify status changed', () => {
    const store = useDeckStore()
    const result = store.addCard({ word: 'hello', meaning: 'halo', example: 'Hello!' })
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.card.status).toBe('review')

    store.setStatus(result.card.id, 'mastered')

    const updated = store.cards.find((c) => c.id === result.card.id)
    expect(updated?.status).toBe('mastered')
  })

  it('isDuplicate: case-insensitive detection', () => {
    const store = useDeckStore()
    store.addCard({ word: 'hello', meaning: 'halo', example: 'Hello!' })

    expect(store.isDuplicate('hello')).toBe(true)
    expect(store.isDuplicate('HELLO')).toBe(true)
    expect(store.isDuplicate('Hello')).toBe(true)
    expect(store.isDuplicate('world')).toBe(false)
  })
})
