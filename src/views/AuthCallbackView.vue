<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  let resolved = false

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (resolved) return

    // Abaikan INITIAL_SESSION — tunggu event yang lebih spesifik
    if (event === 'INITIAL_SESSION') return

    resolved = true
    subscription.unsubscribe()

    if (session) {
      authStore.user = session.user
      authStore.session = session
      router.replace('/')
    } else {
      router.replace('/auth')
    }
  })

  // Timeout fallback 8 detik
  setTimeout(async () => {
    if (resolved) return
    resolved = true
    subscription.unsubscribe()

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      authStore.user = data.session.user
      authStore.session = data.session
      router.replace('/')
    } else {
      router.replace('/auth')
    }
  }, 8000)
})
</script>

<template>
  <div class="callback-page">
    <div class="callback-content">
      <span class="spinner" aria-hidden="true">⏳</span>
      <p>Memproses login...</p>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #181825;
}

.callback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #cdd6f4;
  font-size: 1rem;
}

.spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
