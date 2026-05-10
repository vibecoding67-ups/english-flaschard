import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { RecordSessionResult } from '@/types/index'

export const useStreakStore = defineStore('streak', () => {
  const currentStreak = ref<number>(0)
  const lastStudyDate = ref<string | null>(null)

  const isStreakMilestone = computed(
    () => currentStreak.value % 7 === 0 && currentStreak.value > 0,
  )

  function getTodayString(): string {
    return new Date().toISOString().slice(0, 10)
  }

  /** Load streak data for current user from Supabase */
  async function fetchStreak() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', authStore.user.id)
      .maybeSingle()

    if (data) {
      currentStreak.value = data.current_streak
      lastStudyDate.value = data.last_study_date ?? null
    }

    // Check and reset streak if needed
    checkAndResetStreak()
  }

  /** Check if streak should be reset (called on app load) */
  function checkAndResetStreak(today?: string) {
    if (!lastStudyDate.value) return

    const todayStr = today ?? getTodayString()
    const todayDate = new Date(todayStr)
    const lastDate = new Date(lastStudyDate.value)
    const msPerDay = 1000 * 60 * 60 * 24
    const diff = Math.round((todayDate.getTime() - lastDate.getTime()) / msPerDay)

    if (diff > 1) {
      currentStreak.value = 0
      persistStreak()
    }
  }

  /** Record a completed quiz session */
  async function recordSession(today?: string): Promise<RecordSessionResult> {
    const todayStr = today ?? getTodayString()

    if (lastStudyDate.value === todayStr) {
      return { newStreak: currentStreak.value, isMilestone: false, streakIncremented: false }
    }

    currentStreak.value += 1
    lastStudyDate.value = todayStr

    await persistStreak()

    const newStreak = currentStreak.value
    return {
      newStreak,
      isMilestone: newStreak % 7 === 0,
      streakIncremented: true,
    }
  }

  /** Save streak to Supabase (upsert) */
  async function persistStreak() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    await supabase
      .from('streaks')
      .upsert({
        user_id: authStore.user.id,
        current_streak: currentStreak.value,
        last_study_date: lastStudyDate.value,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
  }

  /** Clear local state on logout */
  function reset() {
    currentStreak.value = 0
    lastStudyDate.value = null
  }

  return {
    currentStreak,
    lastStudyDate,
    isStreakMilestone,
    fetchStreak,
    checkAndResetStreak,
    recordSession,
    reset,
    getTodayString,
  }
})
