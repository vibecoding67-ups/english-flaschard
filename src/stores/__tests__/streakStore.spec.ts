/**
 * Property tests for streakStore.
 *
 * Feature: english-flashcard
 *
 * P8  — Validates: Requirements 4.2
 * P9  — Validates: Requirements 4.2
 * P10 — Validates: Requirements 4.4
 * P11 — Validates: Requirements 4.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as fc from 'fast-check'
import { useStreakStore } from '../streakStore'

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

/**
 * Generates a date string in "YYYY-MM-DD" format between 2020-01-01 and
 * 2024-12-31 (inclusive). These are guaranteed to be in the past relative to
 * any reasonable "today" used in tests.
 */
const pastDateArb = fc
  .integer({ min: 0, max: 1826 }) // 1827 days from 2020-01-01 to 2024-12-31
  .map((offset) => {
    const base = new Date('2020-01-01')
    base.setDate(base.getDate() + offset)
    return base.toISOString().slice(0, 10)
  })

/** Non-negative integer streak value. */
const nonNegativeStreakArb = fc.integer({ min: 0, max: 1000 })

/** Positive integer streak value. */
const positiveStreakArb = fc.integer({ min: 1, max: 1000 })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('streakStore — Property Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    setActivePinia(createPinia())
  })

  // -------------------------------------------------------------------------
  // P8: Streak increments by exactly 1 for a new study day
  // -------------------------------------------------------------------------
  it(
    'P8: Streak increments by exactly 1 for a new study day',
    () => {
      /**
       * **Validates: Requirements 4.2**
       *
       * For any StreakData where lastStudyDate is different from today,
       * recordSession(today) must return newStreak === currentStreak + 1
       * and streakIncremented === true.
       */
      fc.assert(
        fc.property(
          nonNegativeStreakArb,
          pastDateArb,
          (streak, lastStudyDate) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useStreakStore()

            // Manually set state to simulate a StreakData with a past lastStudyDate
            store.currentStreak = streak
            store.lastStudyDate = lastStudyDate

            // Use a fixed "today" that is definitely different from lastStudyDate
            const today = '2025-06-15'

            const result = store.recordSession(today)

            expect(result.newStreak).toBe(streak + 1)
            expect(result.streakIncremented).toBe(true)
          },
        ),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P9: Streak is idempotent for the same day
  // -------------------------------------------------------------------------
  it(
    'P9: Streak is idempotent for the same day',
    () => {
      /**
       * **Validates: Requirements 4.2**
       *
       * For any StreakData where lastStudyDate equals today,
       * recordSession(today) must return newStreak === currentStreak
       * and streakIncremented === false.
       */
      fc.assert(
        fc.property(
          nonNegativeStreakArb,
          (streak) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useStreakStore()

            const today = '2025-06-15'

            // Set lastStudyDate to today — same-day scenario
            store.currentStreak = streak
            store.lastStudyDate = today

            const result = store.recordSession(today)

            expect(result.newStreak).toBe(streak)
            expect(result.streakIncremented).toBe(false)
          },
        ),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P10: Streak resets to 0 if more than 1 day is skipped
  // -------------------------------------------------------------------------
  it(
    'P10: Streak resets to 0 if more than 1 day is skipped',
    () => {
      /**
       * **Validates: Requirements 4.4**
       *
       * For any StreakData where lastStudyDate is more than 1 calendar day ago,
       * checkAndResetStreak(today) must result in currentStreak === 0.
       */
      fc.assert(
        fc.property(
          nonNegativeStreakArb,
          fc.integer({ min: 2, max: 365 }), // gap in days (must be > 1)
          (streak, daysAgo) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useStreakStore()

            // Compute a lastStudyDate that is `daysAgo` days before our fixed today
            const today = new Date('2025-06-15')
            const lastDate = new Date(today)
            lastDate.setDate(lastDate.getDate() - daysAgo)
            const lastStudyDate = lastDate.toISOString().slice(0, 10)

            store.currentStreak = streak
            store.lastStudyDate = lastStudyDate

            store.checkAndResetStreak('2025-06-15')

            expect(store.currentStreak).toBe(0)
          },
        ),
        { numRuns: 100 },
      )
    },
  )

  // -------------------------------------------------------------------------
  // P11: Milestone is true exactly at positive multiples of 7
  // -------------------------------------------------------------------------
  it(
    'P11: Milestone is true exactly at positive multiples of 7',
    () => {
      /**
       * **Validates: Requirements 4.6**
       *
       * For any positive integer streak value,
       * isStreakMilestone === (streak % 7 === 0 && streak > 0).
       */
      fc.assert(
        fc.property(
          positiveStreakArb,
          (streak) => {
            vi.stubGlobal('localStorage', createLocalStorageMock())
            setActivePinia(createPinia())
            const store = useStreakStore()

            store.currentStreak = streak

            const expected = streak % 7 === 0 && streak > 0
            expect(store.isStreakMilestone).toBe(expected)
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

describe('streakStore — Unit Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    setActivePinia(createPinia())
  })

  it('recordSession on new day: streak is incremented', () => {
    const store = useStreakStore()
    store.currentStreak = 3
    store.lastStudyDate = '2020-01-01'

    const result = store.recordSession('2025-06-15')

    expect(result.streakIncremented).toBe(true)
    expect(result.newStreak).toBe(4)
    expect(store.currentStreak).toBe(4)
  })

  it('recordSession on same day: streak NOT incremented', () => {
    const store = useStreakStore()
    store.currentStreak = 5
    store.lastStudyDate = '2025-06-15'

    const result = store.recordSession('2025-06-15')

    expect(result.streakIncremented).toBe(false)
    expect(result.newStreak).toBe(5)
    expect(store.currentStreak).toBe(5)
  })

  it('checkAndResetStreak after >1 day gap: currentStreak reset to 0', () => {
    const store = useStreakStore()
    store.currentStreak = 10
    store.lastStudyDate = '2025-06-10'

    store.checkAndResetStreak('2025-06-15')

    expect(store.currentStreak).toBe(0)
  })

  it('checkAndResetStreak after exactly 1 day: streak NOT reset', () => {
    const store = useStreakStore()
    store.currentStreak = 10
    store.lastStudyDate = '2025-06-14'

    store.checkAndResetStreak('2025-06-15')

    expect(store.currentStreak).toBe(10)
  })

  it('isStreakMilestone: true at 7, true at 14, false at 8, false at 0', () => {
    const store = useStreakStore()

    store.currentStreak = 7
    expect(store.isStreakMilestone).toBe(true)

    store.currentStreak = 14
    expect(store.isStreakMilestone).toBe(true)

    store.currentStreak = 8
    expect(store.isStreakMilestone).toBe(false)

    store.currentStreak = 0
    expect(store.isStreakMilestone).toBe(false)
  })
})
