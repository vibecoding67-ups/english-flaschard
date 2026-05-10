<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <span class="not-found-emoji" aria-hidden="true">🔍</span>
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">Halaman Tidak Ditemukan</h2>
      <p class="not-found-desc">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <button
        type="button"
        class="btn-home"
        @click="router.push('/')"
      >
        🏠 Kembali ke Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem 1rem;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  max-width: 400px;
}

.not-found-emoji {
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.not-found-code {
  font-size: 5rem;
  font-weight: 900;
  color: #cba6f7;
  margin: 0;
  line-height: 1;
}

.not-found-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
}

.not-found-desc {
  font-size: 0.92rem;
  color: #a6adc8;
  margin: 0;
  line-height: 1.5;
}

.btn-home {
  margin-top: 0.75rem;
  padding: 0.7rem 1.75rem;
  background-color: #cba6f7;
  color: #1e1e2e;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;
}

.btn-home:hover {
  opacity: 0.88;
}

.btn-home:active {
  transform: scale(0.97);
}

.btn-home:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}
</style>
