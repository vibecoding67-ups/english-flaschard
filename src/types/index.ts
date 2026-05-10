// Card status type
export type CardStatus = 'mastered' | 'review'

// Core flashcard interface
export interface Flashcard {
  id: string          // UUID v4, generated saat pembuatan
  word: string        // Kata bahasa Inggris (trimmed, non-empty)
  meaning: string     // Arti bahasa Indonesia (trimmed, non-empty)
  example: string     // Contoh kalimat (trimmed, non-empty)
  status: CardStatus  // 'mastered' | 'review'
  createdAt: string   // ISO 8601 timestamp
}

// Streak tracking data
export interface StreakData {
  currentStreak: number        // Jumlah hari berturut-turut (>= 0)
  lastStudyDate: string | null // "YYYY-MM-DD" atau null jika belum pernah belajar
}

// Quiz session result summary
export interface SessionResult {
  masteredCount: number
  reviewCount: number
  totalCount: number
}

// Payload for adding a new flashcard
export interface AddCardPayload {
  word: string
  meaning: string
  example: string
}

// Discriminated union result for addCard action
export type AddCardResult =
  | { success: true; card: Flashcard }
  | { success: false; error: 'validation' | 'duplicate_confirmed' | 'duplicate_pending' }

// Result returned by recordSession action
export interface RecordSessionResult {
  newStreak: number
  isMilestone: boolean       // true jika newStreak % 7 === 0
  streakIncremented: boolean
}

// Quiz mode selection
export type QuizMode = 'all' | 'review-only'

// localStorage keys
export const STORAGE_KEYS = {
  DECK: 'ef_deck',    // Flashcard[]
  STREAK: 'ef_streak', // StreakData
} as const
