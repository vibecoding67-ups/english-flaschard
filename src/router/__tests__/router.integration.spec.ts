import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

// Create a fresh test router with the same routes as the main router
function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'dashboard',
        component: { template: '<div>Dashboard</div>' },
      },
      {
        path: '/cards',
        name: 'cards',
        component: { template: '<div>Cards</div>' },
      },
      {
        path: '/quiz',
        name: 'quiz',
        component: { template: '<div>Quiz</div>' },
      },
      {
        path: '/add',
        name: 'add',
        component: { template: '<div>Add</div>' },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: { template: '<div>Not Found</div>' },
      },
    ],
  })
}

describe('Router integration', () => {
  it('navigates to "/" and resolves to route name "dashboard"', async () => {
    const router = createTestRouter()
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('navigates to "/cards" and resolves to route name "cards"', async () => {
    const router = createTestRouter()
    await router.push('/cards')
    expect(router.currentRoute.value.name).toBe('cards')
  })

  it('navigates to "/quiz" and resolves to route name "quiz"', async () => {
    const router = createTestRouter()
    await router.push('/quiz')
    expect(router.currentRoute.value.name).toBe('quiz')
  })

  it('navigates to "/add" and resolves to route name "add"', async () => {
    const router = createTestRouter()
    await router.push('/add')
    expect(router.currentRoute.value.name).toBe('add')
  })

  it('navigates to "/unknown-path" and resolves to route name "not-found"', async () => {
    const router = createTestRouter()
    await router.push('/unknown-path')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
