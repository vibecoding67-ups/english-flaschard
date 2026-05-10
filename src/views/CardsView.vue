<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDeckStore } from '@/stores/deckStore'
import FlashcardItem from '@/components/FlashcardItem.vue'
import type { CardStatus } from '@/types/index'

const router = useRouter()
const deckStore = useDeckStore()

type FilterStatus = 'all' | 'mastered' | 'review'
const filterStatus = ref<FilterStatus>('all')

const filteredCards = computed(() => {
  if (filterStatus.value === 'all') return deckStore.cards
  return deckStore.cards.filter((c) => c.status === filterStatus.value)
})

function handleDelete(id: string) {
  deckStore.deleteCard(id)
}

function handleStatusChange(payload: { id: string; status: CardStatus }) {
  deckStore.setStatus(payload.id, payload.status)
}
</script>

<template>
  <div class="cards-view">
    <!-- Header -->
    <header class="cards-header">
      <div class="cards-title-row">
        <h1 class="cards-title">Daftar Flashcard</h1>
        <span class="cards-count" aria-live="polite">
          {{ filteredCards.length }} kartu
        </span>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs" role="tablist" aria-label="Filter status kartu">
        <button
          type="button"
          role="tab"
          class="filter-tab"
          :class="{ 'filter-tab--active': filterStatus === 'all' }"
          :aria-selected="filterStatus === 'all'"
          @click="filterStatus = 'all'"
        >
          Semua ({{ deckStore.totalCount }})
        </button>
        <button
          type="button"
          role="tab"
          class="filter-tab filter-tab--mastered"
          :class="{ 'filter-tab--active': filterStatus === 'mastered' }"
          :aria-selected="filterStatus === 'mastered'"
          @click="filterStatus = 'mastered'"
        >
          Hafal ({{ deckStore.masteredCount }})
        </button>
        <button
          type="button"
          role="tab"
          class="filter-tab filter-tab--review"
          :class="{ 'filter-tab--active': filterStatus === 'review' }"
          :aria-selected="filterStatus === 'review'"
          @click="filterStatus = 'review'"
        >
          Perlu Diulang ({{ deckStore.reviewCount }})
        </button>
      </div>
    </header>

    <!-- Empty state: no cards at all -->
    <div v-if="deckStore.totalCount === 0" class="empty-state">
      <span class="empty-icon" aria-hidden="true">📭</span>
      <h2 class="empty-title">Belum ada flashcard</h2>
      <p class="empty-desc">Mulai tambahkan kata baru untuk membangun koleksimu.</p>
      <button type="button" class="btn-add" @click="router.push('/add')">
        ➕ Tambah Kata Pertama
      </button>
    </div>

    <!-- Empty state: filter yields no results -->
    <div v-else-if="filteredCards.length === 0" class="empty-state">
      <span class="empty-icon" aria-hidden="true">🔍</span>
      <h2 class="empty-title">Tidak ada kartu dengan filter ini</h2>
      <p class="empty-desc">Coba pilih filter yang berbeda.</p>
    </div>

    <!-- Card list -->
    <ul v-else class="cards-list" aria-label="Daftar flashcard">
      <li v-for="card in filteredCards" :key="card.id" class="cards-list-item">
        <FlashcardItem
          :card="card"
          @delete="handleDelete(card.id)"
          @status-change="handleStatusChange"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.cards-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem 1rem;
  max-width: 720px;
  margin: 0 auto;
}

/* Header */
.cards-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cards-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.cards-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #cdd6f4;
  margin: 0;
}

.cards-count {
  font-size: 0.85rem;
  color: #a6adc8;
  font-weight: 500;
}

/* Filter tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1px solid #45475a;
  background-color: #1e1e2e;
  color: #a6adc8;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.filter-tab:hover {
  border-color: #cba6f7;
  color: #cdd6f4;
}

.filter-tab:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 2px;
}

.filter-tab--active {
  background-color: #313244;
  color: #cdd6f4;
  border-color: #cba6f7;
}

.filter-tab--mastered.filter-tab--active {
  background-color: #1a2e22;
  color: #a6e3a1;
  border-color: #a6e3a1;
}

.filter-tab--review.filter-tab--active {
  background-color: #2e221a;
  color: #fab387;
  border-color: #fab387;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  line-height: 1;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
}

.empty-desc {
  font-size: 0.9rem;
  color: #a6adc8;
  margin: 0;
}

.btn-add {
  margin-top: 0.5rem;
  padding: 0.65rem 1.5rem;
  background-color: #cba6f7;
  color: #1e1e2e;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.btn-add:hover {
  opacity: 0.88;
}

.btn-add:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 3px;
}

/* Card list */
.cards-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cards-list-item {
  display: contents;
}
</style>
