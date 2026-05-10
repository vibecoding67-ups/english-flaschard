<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDeckStore } from '@/stores/deckStore'

const emit = defineEmits<{
  submitted: []
}>()

const deckStore = useDeckStore()

// Form fields
const form = reactive({
  word: '',
  meaning: '',
  example: '',
})

// Validation errors per field
const errors = reactive({
  word: '',
  meaning: '',
  example: '',
})

// Duplicate confirmation dialog state
const showDuplicateDialog = ref(false)
const pendingWord = ref('')

function validateFields(): boolean {
  let valid = true

  errors.word = form.word.trim() ? '' : 'Kata bahasa Inggris wajib diisi'
  errors.meaning = form.meaning.trim() ? '' : 'Arti bahasa Indonesia wajib diisi'
  errors.example = form.example.trim() ? '' : 'Contoh kalimat wajib diisi'

  if (errors.word || errors.meaning || errors.example) {
    valid = false
  }

  return valid
}

function handleSubmit() {
  if (!validateFields()) return

  const result = deckStore.addCard({
    word: form.word,
    meaning: form.meaning,
    example: form.example,
  })

  if (result.success) {
    resetForm()
    emit('submitted')
    return
  }

  if (result.error === 'duplicate_pending') {
    pendingWord.value = form.word.trim()
    showDuplicateDialog.value = true
    return
  }

  // validation error (shouldn't reach here since we validate above, but handle gracefully)
  if (result.error === 'validation') {
    errors.word = errors.word || 'Periksa kembali isian form'
  }
}

function confirmDuplicate() {
  showDuplicateDialog.value = false

  // Force-add by temporarily removing the existing duplicate and re-adding
  // The store returns duplicate_pending; we handle it by calling addCard with
  // a slightly different approach: delete the old one and add the new one,
  // OR we can use the store's internal mechanism.
  // Since the store doesn't have a "force" flag, we delete the existing card
  // with the same word and then add the new one.
  const existingCard = deckStore.cards.find(
    (c) => c.word.toLowerCase() === pendingWord.value.toLowerCase(),
  )
  if (existingCard) {
    deckStore.deleteCard(existingCard.id)
  }

  const result = deckStore.addCard({
    word: form.word,
    meaning: form.meaning,
    example: form.example,
  })

  if (result.success) {
    resetForm()
    emit('submitted')
  }
}

function cancelDuplicate() {
  showDuplicateDialog.value = false
  pendingWord.value = ''
}

function resetForm() {
  form.word = ''
  form.meaning = ''
  form.example = ''
  errors.word = ''
  errors.meaning = ''
  errors.example = ''
}
</script>

<template>
  <div class="add-form-wrapper">
    <form class="add-form" novalidate @submit.prevent="handleSubmit">
      <!-- Word field -->
      <div class="form-group" :class="{ 'form-group--error': errors.word }">
        <label for="field-word" class="form-label">
          Kata (Bahasa Inggris) <span class="required" aria-hidden="true">*</span>
        </label>
        <input
          id="field-word"
          v-model="form.word"
          type="text"
          class="form-input"
          placeholder="Contoh: serendipity"
          autocomplete="off"
          :aria-describedby="errors.word ? 'error-word' : undefined"
          :aria-invalid="!!errors.word"
        />
        <p v-if="errors.word" id="error-word" class="form-error" role="alert">
          {{ errors.word }}
        </p>
      </div>

      <!-- Meaning field -->
      <div class="form-group" :class="{ 'form-group--error': errors.meaning }">
        <label for="field-meaning" class="form-label">
          Arti (Bahasa Indonesia) <span class="required" aria-hidden="true">*</span>
        </label>
        <input
          id="field-meaning"
          v-model="form.meaning"
          type="text"
          class="form-input"
          placeholder="Contoh: keberuntungan yang tidak terduga"
          autocomplete="off"
          :aria-describedby="errors.meaning ? 'error-meaning' : undefined"
          :aria-invalid="!!errors.meaning"
        />
        <p v-if="errors.meaning" id="error-meaning" class="form-error" role="alert">
          {{ errors.meaning }}
        </p>
      </div>

      <!-- Example field -->
      <div class="form-group" :class="{ 'form-group--error': errors.example }">
        <label for="field-example" class="form-label">
          Contoh Kalimat <span class="required" aria-hidden="true">*</span>
        </label>
        <textarea
          id="field-example"
          v-model="form.example"
          class="form-input form-textarea"
          placeholder="Contoh: Finding that old photo was pure serendipity."
          rows="3"
          :aria-describedby="errors.example ? 'error-example' : undefined"
          :aria-invalid="!!errors.example"
        />
        <p v-if="errors.example" id="error-example" class="form-error" role="alert">
          {{ errors.example }}
        </p>
      </div>

      <button type="submit" class="btn-submit">
        ➕ Tambah Flashcard
      </button>
    </form>

    <!-- Duplicate confirmation dialog -->
    <Teleport to="body">
      <div
        v-if="showDuplicateDialog"
        class="dialog-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-desc"
        @click.self="cancelDuplicate"
      >
        <div class="dialog">
          <h2 id="dialog-title" class="dialog-title">⚠️ Kata Sudah Ada</h2>
          <p id="dialog-desc" class="dialog-desc">
            Kata <strong>"{{ pendingWord }}"</strong> sudah ada di deck kamu.
            Apakah kamu ingin mengganti data yang lama dengan yang baru?
          </p>
          <div class="dialog-actions">
            <button type="button" class="btn-dialog btn-dialog--cancel" @click="cancelDuplicate">
              Batal
            </button>
            <button type="button" class="btn-dialog btn-dialog--confirm" @click="confirmDuplicate">
              Ya, Ganti
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.add-form-wrapper {
  width: 100%;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

/* Form group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #cdd6f4;
}

.required {
  color: #f38ba8;
}

.form-input {
  background-color: #181825;
  border: 1px solid #45475a;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.95rem;
  color: #cdd6f4;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #6c7086;
}

.form-input:focus {
  outline: none;
  border-color: #cba6f7;
  box-shadow: 0 0 0 3px rgba(203, 166, 247, 0.15);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group--error .form-input {
  border-color: #f38ba8;
}

.form-error {
  font-size: 0.8rem;
  color: #f38ba8;
  margin: 0;
}

/* Submit button */
.btn-submit {
  padding: 0.7rem 1.5rem;
  background-color: #cba6f7;
  color: #1e1e2e;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
  align-self: flex-start;
}

.btn-submit:hover {
  opacity: 0.88;
}

.btn-submit:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.dialog {
  background-color: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 14px;
  padding: 1.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f9e2af;
  margin: 0 0 0.75rem;
}

.dialog-desc {
  font-size: 0.92rem;
  color: #cdd6f4;
  line-height: 1.5;
  margin: 0 0 1.25rem;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-dialog {
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 0.15s ease;
}

.btn-dialog:hover {
  opacity: 0.85;
}

.btn-dialog:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 2px;
}

.btn-dialog--cancel {
  background-color: #313244;
  color: #cdd6f4;
  border-color: #45475a;
}

.btn-dialog--confirm {
  background-color: #f9e2af;
  color: #1e1e2e;
}
</style>
