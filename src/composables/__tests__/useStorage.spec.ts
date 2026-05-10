/**
 * Property tests for useStorage composable.
 *
 * Feature: english-flashcard, Property 7: Serialisasi data round-trip
 *
 * Validates: Requirements 5.2, 5.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { useStorage } from '../useStorage'
import type { Flashcard, StreakData } from '@/types/index'

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generate a non-empty trimmed string (no leading/trailing whitespace). */
const nonEmptyString = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0)
  .map((s) => s.trim())

/** Generate a valid CardStatus value. */
const cardStatusArb = fc.constantFrom<'mastered' | 'review'>('mastered', 'review')

/** Generate a valid ISO 8601 timestamp string. */
const isoTimestampArb = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .map((d) => d.toISOString())

/** Generate a valid Flashcard object. */
const flashcardArb: fc.Arbitrary<Flashcard> = fc.record<Flashcard>({
  id: fc.uuid(),
  word: nonEmptyString,
  meaning: nonEmptyString,
  example: nonEmptyString,
  status: cardStatusArb,
  createdAt: isoTimestampArb,
})

/** Generate a valid StreakData object. */
const streakDataArb: fc.Arbitrary<StreakData> = fc.record<StreakData>({
  currentStreak: fc.integer({ min: 0, max: 9999 }),
  lastStudyDate: fc.oneof(
    fc.constant(null),
    fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map((d) => d.toISOString().slice(0, 10)), // "YYYY-MM-DD"
  ),
})

// ---------------------------------------------------------------------------
// localStorage mock helpers
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

describe('useStorage — Property 7: Serialisasi data round-trip', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    mockStorage = createLocalStorageMock()
    vi.stubGlobal('localStorage', mockStorage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // -------------------------------------------------------------------------
  // Property 7a: Flashcard[] round-trip
  // -------------------------------------------------------------------------
  it(
    'P7a: save then load returns deep-equal Flashcard[] for any valid array',
    () => {
      fc.assert(
        fc.property(fc.array(flashcardArb, { minLength: 0, maxLength: 20 }), (cards) => {
          const { save, load } = useStorage()
          const KEY = 'ef_deck'

          save(KEY, cards)
          const loaded = load<Flashcard[]>(KEY, [])

          expect(loaded).toEqual(cards)
        }),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // Property 7b: StreakData round-trip
  // -------------------------------------------------------------------------
  it(
    'P7b: save then load returns deep-equal StreakData for any valid object',
    () => {
      fc.assert(
        fc.property(streakDataArb, (streak) => {
          const { save, load } = useStorage()
          const KEY = 'ef_streak'
          const fallback: StreakData = { currentStreak: 0, lastStudyDate: null }

          save(KEY, streak)
          const loaded = load<StreakData>(KEY, fallback)

          expect(loaded).toEqual(streak)
        }),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // Property 7c: missing key returns fallback unchanged
  // -------------------------------------------------------------------------
  it(
    'P7c: load with missing key returns the provided fallback',
    () => {
      fc.assert(
        fc.property(fc.array(flashcardArb, { minLength: 0, maxLength: 10 }), (fallback) => {
          const { load } = useStorage()
          const result = load<Flashcard[]>('nonexistent_key', fallback)
          expect(result).toEqual(fallback)
        }),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // Unit: load returns fallback when stored value is corrupt JSON
  // -------------------------------------------------------------------------
  it('load returns fallback when stored JSON is corrupt', () => {
    mockStorage.getItem.mockReturnValueOnce('{ not valid json !!!')
    const { load } = useStorage()
    const fallback: Flashcard[] = []
    const result = load<Flashcard[]>('ef_deck', fallback)
    expect(result).toEqual(fallback)
  })

  // -------------------------------------------------------------------------
  // Unit: isAvailable returns true when localStorage works
  // -------------------------------------------------------------------------
  it('isAvailable returns true when localStorage is functional', () => {
    const { isAvailable } = useStorage()
    expect(isAvailable()).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Unit: isAvailable returns false when localStorage throws
  // -------------------------------------------------------------------------
  it('isAvailable returns false when localStorage.setItem throws', () => {
    mockStorage.setItem.mockImplementationOnce(() => {
      throw new DOMException('Storage disabled', 'SecurityError')
    })
    const { isAvailable } = useStorage()
    expect(isAvailable()).toBe(false)
  })
})
