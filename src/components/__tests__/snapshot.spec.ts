import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FlashcardItem from '@/components/FlashcardItem.vue'
import SessionSummary from '@/components/SessionSummary.vue'
import StreakBadge from '@/components/StreakBadge.vue'
import type { Flashcard, SessionResult } from '@/types/index'

// --- FlashcardItem snapshots ---

describe('FlashcardItem snapshots', () => {
  const baseCard: Flashcard = {
    id: 'test-id-1',
    word: 'ephemeral',
    meaning: 'berlangsung singkat',
    example: 'The ephemeral beauty of cherry blossoms.',
    status: 'mastered',
    createdAt: '2025-06-15T10:00:00.000Z',
  }

  it('renders with status mastered', () => {
    const wrapper = mount(FlashcardItem, {
      props: { card: { ...baseCard, status: 'mastered' } },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders with status review', () => {
    const wrapper = mount(FlashcardItem, {
      props: { card: { ...baseCard, status: 'review' } },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})

// --- SessionSummary snapshots ---

describe('SessionSummary snapshots', () => {
  it('renders all mastered', () => {
    const results: SessionResult = { masteredCount: 5, reviewCount: 0, totalCount: 5 }
    const wrapper = mount(SessionSummary, {
      props: { results },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders all review', () => {
    const results: SessionResult = { masteredCount: 0, reviewCount: 5, totalCount: 5 }
    const wrapper = mount(SessionSummary, {
      props: { results },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders mixed results', () => {
    const results: SessionResult = { masteredCount: 3, reviewCount: 2, totalCount: 5 }
    const wrapper = mount(SessionSummary, {
      props: { results },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})

// --- StreakBadge snapshots ---

describe('StreakBadge snapshots', () => {
  it('renders streak 0 with no last date', () => {
    const wrapper = mount(StreakBadge, {
      props: { streak: 0, lastDate: null },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders streak 7 (milestone)', () => {
    const wrapper = mount(StreakBadge, {
      props: { streak: 7, lastDate: '2025-06-15' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders streak 14 (milestone)', () => {
    const wrapper = mount(StreakBadge, {
      props: { streak: 14, lastDate: '2025-06-08' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
