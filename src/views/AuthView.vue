<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

type AuthMode = 'login' | 'register'
const mode = ref<AuthMode>('login')

const form = reactive({ email: '', password: '' })
const errorMsg = ref('')
const successMsg = ref('')
const submitting = ref(false)
const googleLoading = ref(false)

async function handleGoogleLogin() {
  googleLoading.value = true
  errorMsg.value = ''
  try {
    await authStore.signInWithGoogle()
    // Supabase akan redirect ke Google, tidak perlu push router
  } catch (err: unknown) {
    if (err instanceof Error) errorMsg.value = err.message
    googleLoading.value = false
  }
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMsg.value = ''
  successMsg.value = ''
}

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.email.trim() || !form.password.trim()) {
    errorMsg.value = 'Email dan password wajib diisi.'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = 'Password minimal 6 karakter.'
    return
  }

  submitting.value = true

  try {
    if (mode.value === 'login') {
      await authStore.signIn(form.email.trim(), form.password)
      router.push('/')
    } else {
      await authStore.signUp(form.email.trim(), form.password)
      successMsg.value = 'Akun berhasil dibuat! Cek email kamu untuk konfirmasi, lalu login.'
      mode.value = 'login'
      form.password = ''
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Terjemahkan pesan error Supabase ke bahasa Indonesia
      const msg = err.message.toLowerCase()
      if (msg.includes('invalid login credentials')) {
        errorMsg.value = 'Email atau password salah.'
      } else if (msg.includes('user already registered')) {
        errorMsg.value = 'Email ini sudah terdaftar. Silakan login.'
      } else if (msg.includes('email not confirmed')) {
        errorMsg.value = 'Email belum dikonfirmasi. Cek inbox kamu.'
      } else {
        errorMsg.value = err.message
      }
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Logo / Brand -->
      <div class="auth-brand">
        <span class="brand-icon" aria-hidden="true">🗂️</span>
        <h1 class="brand-name">English Flashcard</h1>
        <p class="brand-tagline">Belajar kosakata bahasa Inggris setiap hari</p>
      </div>

      <!-- Tab toggle -->
      <div class="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="auth-tab"
          :class="{ 'auth-tab--active': mode === 'login' }"
          :aria-selected="mode === 'login'"
          @click="mode = 'login'; errorMsg = ''; successMsg = ''"
        >
          Masuk
        </button>
        <button
          type="button"
          role="tab"
          class="auth-tab"
          :class="{ 'auth-tab--active': mode === 'register' }"
          :aria-selected="mode === 'register'"
          @click="mode = 'register'; errorMsg = ''; successMsg = ''"
        >
          Daftar
        </button>
      </div>

      <!-- Form -->
      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="auth-email" class="form-label">Email</label>
          <input
            id="auth-email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="kamu@email.com"
            autocomplete="email"
            :disabled="submitting"
            required
          />
        </div>

        <div class="form-group">
          <label for="auth-password" class="form-label">Password</label>
          <input
            id="auth-password"
            v-model="form.password"
            type="password"
            class="form-input"
            :placeholder="mode === 'register' ? 'Minimal 6 karakter' : 'Password kamu'"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            :disabled="submitting"
            required
          />
        </div>

        <!-- Error message -->
        <p v-if="errorMsg" class="msg msg--error" role="alert">
          ❌ {{ errorMsg }}
        </p>

        <!-- Success message -->
        <p v-if="successMsg" class="msg msg--success" role="status">
          ✅ {{ successMsg }}
        </p>

        <button
          type="submit"
          class="btn-submit"
          :disabled="submitting"
        >
          <span v-if="submitting">⏳ Memproses...</span>
          <span v-else-if="mode === 'login'">Masuk →</span>
          <span v-else>Buat Akun →</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="divider">
        <span class="divider-text">atau</span>
      </div>

      <!-- Google login -->
      <button
        type="button"
        class="btn-google"
        :disabled="googleLoading"
        @click="handleGoogleLogin"
      >
        <svg class="google-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>{{ googleLoading ? 'Mengarahkan...' : 'Lanjutkan dengan Google' }}</span>
      </button>

      <!-- Toggle link -->
      <p class="auth-toggle">
        {{ mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?' }}
        <button type="button" class="toggle-link" @click="toggleMode">
          {{ mode === 'login' ? 'Daftar sekarang' : 'Masuk' }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: #181825;
}

.auth-card {
  background-color: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Brand */
.auth-brand {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.brand-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.brand-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: #cba6f7;
  margin: 0;
}

.brand-tagline {
  font-size: 0.85rem;
  color: #a6adc8;
  margin: 0;
}

/* Tabs */
.auth-tabs {
  display: flex;
  background-color: #181825;
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.auth-tab {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #a6adc8;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.auth-tab--active {
  background-color: #313244;
  color: #cdd6f4;
  font-weight: 600;
}

.auth-tab:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 2px;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #cdd6f4;
}

.form-input {
  background-color: #181825;
  border: 1px solid #45475a;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.95rem;
  color: #cdd6f4;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.form-input::placeholder {
  color: #6c7086;
}

.form-input:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 0 3px rgba(203, 166, 247, 0.15);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages */
.msg {
  font-size: 0.85rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  margin: 0;
}

.msg--error {
  background-color: #3a1e1e;
  color: #f38ba8;
  border: 1px solid #f38ba8;
}

.msg--success {
  background-color: #1e3a2f;
  color: #a6e3a1;
  border: 1px solid #a6e3a1;
}

/* Submit button */
.btn-submit {
  padding: 0.7rem;
  background-color: #cba6f7;
  color: #1e1e2e;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #313244;
}

.divider-text {
  font-size: 0.8rem;
  color: #6c7086;
  white-space: nowrap;
}

/* Google button */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.7rem;
  background-color: #181825;
  border: 1px solid #45475a;
  border-radius: 8px;
  color: #cdd6f4;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.btn-google:hover:not(:disabled) {
  border-color: #cba6f7;
  background-color: #1e1e2e;
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-google:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Toggle */
.auth-toggle {
  text-align: center;
  font-size: 0.85rem;
  color: #a6adc8;
  margin: 0;
}

.toggle-link {
  background: none;
  border: none;
  color: #cba6f7;
  font-size: inherit;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-family: inherit;
}

.toggle-link:hover {
  opacity: 0.8;
}
</style>
