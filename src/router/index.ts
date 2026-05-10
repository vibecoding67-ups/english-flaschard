import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/cards',
      name: 'cards',
      component: () => import('@/views/CardsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('@/views/QuizView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/add',
      name: 'add',
      component: () => import('@/views/AddView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// Navigation guard — redirect ke /auth kalau belum login
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Kalau ada access_token di URL hash, biarkan Supabase proses dulu
  // lalu redirect ke dashboard setelah session terbentuk
  const hash = window.location.hash
  if (hash.includes('access_token=')) {
    // Tunggu sebentar biar Supabase selesai proses token
    await new Promise(resolve => setTimeout(resolve, 500))
    await authStore.init()
    if (authStore.isLoggedIn) {
      // Bersihkan token dari URL lalu ke dashboard
      window.history.replaceState(null, '', window.location.pathname)
      return { name: 'dashboard' }
    }
  }

  // Tunggu sampai auth selesai init
  if (authStore.loading) {
    await authStore.init()
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'auth' }
  }

  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
