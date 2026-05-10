<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  message: string
  type: 'success' | 'warning' | 'error'
}>()

const emit = defineEmits<{
  close: []
}>()

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(() => {
    emit('close')
  }, 4000)
})

onUnmounted(() => {
  if (timer !== null) {
    clearTimeout(timer)
  }
})

const iconMap: Record<typeof props.type, string> = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
}
</script>

<template>
  <div
    class="toast"
    :class="`toast--${type}`"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <span class="toast-icon" aria-hidden="true">{{ iconMap[type] }}</span>
    <span class="toast-message">{{ message }}</span>
    <button
      class="toast-close"
      type="button"
      aria-label="Tutup notifikasi"
      @click="emit('close')"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border-left: 4px solid transparent;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  min-width: 280px;
  max-width: 420px;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slide-in 0.25s ease;
}

.toast--success {
  background-color: #1e3a2f;
  border-left-color: #a6e3a1;
  color: #a6e3a1;
}

.toast--warning {
  background-color: #3a2e1e;
  border-left-color: #f9e2af;
  color: #f9e2af;
}

.toast--error {
  background-color: #3a1e1e;
  border-left-color: #f38ba8;
  color: #f38ba8;
}

.toast-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem 0.3rem;
  border-radius: 4px;
  opacity: 0.7;
  color: inherit;
  flex-shrink: 0;
  transition: opacity 0.15s ease;
}

.toast-close:hover {
  opacity: 1;
}

.toast-close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
