import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)

  // Initialize — cek session yang sudah ada
  async function init() {
    loading.value = true

    // Handle OAuth callback — Supabase menyimpan token di URL hash
    // Ini dipanggil otomatis oleh getSession() tapi kita perlu pastikan
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
    loading.value = false

    // Listen untuk perubahan auth state (termasuk setelah OAuth callback)
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    session.value = data.session
    return data
  }

  async function signInWithGoogle() {
    const baseUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    session.value = null
  }

  return {
    user,
    session,
    loading,
    isLoggedIn,
    init,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }
})
