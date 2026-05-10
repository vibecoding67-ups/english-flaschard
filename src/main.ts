import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router/index'
import { useAuthStore } from '@/stores/authStore'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth state sebelum mount
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
})
