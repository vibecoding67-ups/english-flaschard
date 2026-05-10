import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Flashcard, CardStatus, AddCardPayload, AddCardResult } from '@/types/index'

export const useDeckStore = defineStore('deck', () => {
  const cards = ref<Flashcard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  const totalCount = computed(() => cards.value.length)
  const masteredCount = computed(() => cards.value.filter((c) => c.status === 'mastered').length)
  const reviewCount = computed(() => cards.value.filter((c) => c.status === 'review').length)
  const reviewCards = computed(() => cards.value.filter((c) => c.status === 'review'))

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** Load all flashcards for the current user from Supabase */
  async function fetchCards() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: true })

    if (err) {
      error.value = err.message
    } else {
      // Map snake_case DB columns to camelCase
      cards.value = (data ?? []).map((row) => ({
        id: row.id,
        word: row.word,
        meaning: row.meaning,
        example: row.example,
        status: row.status as CardStatus,
        createdAt: row.created_at,
      }))
    }

    loading.value = false
  }

  /** Add a new flashcard */
  async function addCard(payload: AddCardPayload): Promise<AddCardResult> {
    const authStore = useAuthStore()
    if (!authStore.user) return { success: false, error: 'validation' }

    const word = payload.word.trim()
    const meaning = payload.meaning.trim()
    const example = payload.example.trim()

    if (!word || !meaning || !example) {
      return { success: false, error: 'validation' }
    }

    if (isDuplicate(word)) {
      return { success: false, error: 'duplicate_pending' }
    }

    const { data, error: err } = await supabase
      .from('flashcards')
      .insert({
        user_id: authStore.user.id,
        word,
        meaning,
        example,
        status: 'review',
      })
      .select()
      .single()

    if (err || !data) {
      return { success: false, error: 'validation' }
    }

    const card: Flashcard = {
      id: data.id,
      word: data.word,
      meaning: data.meaning,
      example: data.example,
      status: data.status as CardStatus,
      createdAt: data.created_at,
    }

    cards.value.push(card)
    return { success: true, card }
  }

  /** Delete a flashcard by id */
  async function deleteCard(id: string) {
    const { error: err } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)

    if (!err) {
      cards.value = cards.value.filter((c) => c.id !== id)
    }
  }

  /** Update only the status of a flashcard */
  async function setStatus(id: string, status: CardStatus) {
    const { error: err } = await supabase
      .from('flashcards')
      .update({ status })
      .eq('id', id)

    if (!err) {
      const card = cards.value.find((c) => c.id === id)
      if (card) card.status = status
    }
  }

  /** Case-insensitive duplicate check */
  function isDuplicate(word: string): boolean {
    const lower = word.toLowerCase()
    return cards.value.some((c) => c.word.toLowerCase() === lower)
  }

  /** Clear local state on logout */
  function reset() {
    cards.value = []
    error.value = null
  }

  return {
    cards,
    loading,
    error,
    totalCount,
    masteredCount,
    reviewCount,
    reviewCards,
    fetchCards,
    addCard,
    deleteCard,
    setStatus,
    isDuplicate,
    reset,
  }
})
