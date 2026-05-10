<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AddForm from '@/components/AddForm.vue'
import ToastNotification from '@/components/ToastNotification.vue'

const router = useRouter()

const showToast = ref(false)

function handleSubmitted() {
  showToast.value = true
  setTimeout(() => {
    router.push('/cards')
  }, 1500)
}
</script>

<template>
  <div class="add-view">
    <!-- Toast notification -->
    <Teleport to="body">
      <div v-if="showToast" class="toast-container">
        <ToastNotification
          message="✅ Flashcard berhasil ditambahkan!"
          type="success"
          @close="showToast = false"
        />
      </div>
    </Teleport>

    <!-- Page header -->
    <header class="add-header">
      <h1 class="add-title">Tambah Kata Baru</h1>
      <p class="add-desc">
        Tambahkan kosakata bahasa Inggris beserta artinya ke dalam koleksimu.
      </p>
    </header>

    <!-- Form -->
    <div class="add-form-container">
      <AddForm @submitted="handleSubmitted" />
    </div>
  </div>
</template>

<style scoped>
.add-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
  max-width: 560px;
  margin: 0 auto;
}

/* Header */
.add-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.add-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #cdd6f4;
  margin: 0;
}

.add-desc {
  font-size: 0.9rem;
  color: #a6adc8;
  margin: 0;
  line-height: 1.5;
}

/* Form container */
.add-form-container {
  background-color: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 14px;
  padding: 1.5rem;
}

/* Toast container */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}
</style>
