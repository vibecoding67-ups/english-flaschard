/**
 * Integration tests: data persistence via localStorage.
 *
 * Feature: english-flashcard
 * Validates: Requirements 5.1, 5.2, 5.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDeckStore } from '../deckStore'
import { useStreakStore } from '../streakStore'

// ---------------------------------------------------------------------------
// Shared localStorage mock that persists across store instances within a test
// ---------------------------------------------------------------------------

function createPersistentLocalStorageMock() {
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

describe('Persistence — Integration: data survives store re-creation', () => {
  beforeEach(() => {
    // Reset to a fresh empty localStorage before each test
    vi.stubGlobal('localStorage', createPersistentLocalStorageMock())
  })

  it('Test 1: Add card → create new store instance → card loaded from localStorage', () => {
    // First store instance: add a card
    setActivePinia(createPinia())
    const store1 = useDeckStore()
    const result = store1.addCard({ word: 'persist', meaning: 'bertahan', example: 'Data persists.' })
    expect(result.success).toBe(true)

    // Second store instance (simulating reload): same localStorage, new Pinia
    setActivePinia(createPinia())
    const store2 = useDeckStore()

    expect(store2.cards.length).toBe(1)
    expect(store2.cards[0].word).toBe('persist')
    expect(store2.cards[0].meaning).toBe('bertahan')
    expect(store2.cards[0].example).toBe('Data persists.')
  })

  it('Test 2: Add card, change status to mastered → new store instance → status is mastered', () => {
    // First store instance: add card and change status
    setActivePinia(createPinia())
    const store1 = useDeckStore()
    const result = store1.addCard({ word: 'status', meaning: 'status', example: 'Check status.' })
    expect(result.success).toBe(true)
    if (!result.success) return

    store1.setStatus(result.card.id, 'mastered')
    expect(store1.cards.find((c) => c.id === result.card.id)?.status).toBe('mastered')

    // Second store instance (simulating reload)
    setActivePinia(createPinia())
    const store2 = useDeckStore()

    expect(store2.cards.length).toBe(1)
    expect(store2.cards[0].status).toBe('mastered')
  })

  it('Test 3: Record streak session → new streakStore instance → streak loaded correctly', () => {
    // First streak store instance: record a session
    setActivePinia(createPinia())
    const streak1 = useStreakStore()
    const result = streak1.recordSession('2025-06-15')
    expect(result.streakIncremented).toBe(true)
    expect(streak1.currentStreak).toBe(1)
    expect(streak1.lastStudyDate).toBe('2025-06-15')

    // Second streak store instance (simulating reload)
    setActivePinia(createPinia())
    const streak2 = useStreakStore()

    expect(streak2.currentStreak).toBe(1)
    expect(streak2.lastStudyDate).toBe('2025-06-15')
  })
})
