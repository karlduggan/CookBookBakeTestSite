<template>
  <div class="w-full">
    <form @submit.prevent="handleSearch" class="space-y-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title, author, or keyword..."
          class="w-full px-4 py-3 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors shadow-sm"
          @input="debounceSearch"
        />
        <button
          type="submit"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-accent-teal hover:text-accent-teal-dark transition-colors"
          aria-label="Search"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Quick search suggestions -->
      <div v-if="showSuggestions && searchQuery.length > 0" class="bg-white border border-text-muted rounded-lg overflow-hidden max-h-64 overflow-y-auto shadow-md">
        <div v-if="suggestions.length === 0" class="p-4 text-text-secondary text-sm">
          No results found for "{{ searchQuery }}"
        </div>
        <div v-else class="divide-y divide-text-muted">
          <button
            v-for="suggestion in suggestions.slice(0, 5)"
            :key="suggestion.id"
            @click="selectSuggestion(suggestion)"
            class="w-full text-left px-4 py-3 hover:bg-primary-light-alt transition-colors text-sm"
          >
            <div class="font-semibold text-text-primary">{{ suggestion.title }}</div>
            <div class="text-text-secondary">by {{ suggestion.author }}</div>
          </button>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          v-if="searchQuery"
          type="button"
          @click="clearSearch"
          class="px-4 py-2 text-accent-teal hover:text-accent-teal-dark transition-colors text-sm font-semibold"
        >
          Clear
        </button>
        <button
          type="submit"
          class="flex-1 px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal-dark transition-colors font-semibold shadow-md"
        >
          Search
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Book {
  id: string;
  title: string;
  author: string;
}

const emit = defineEmits<{
  search: [query: string];
}>();

const searchQuery = ref('');
const suggestions = ref<Book[]>([]);
const showSuggestions = ref(false);
let debounceTimer: NodeJS.Timeout | null = null;

const debounceSearch = async () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  if (searchQuery.value.length === 0) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      const response = await fetch(`/api/books?search=${encodeURIComponent(searchQuery.value)}&limit=5`);
      const data = await response.json();

      if (data.success) {
        suggestions.value = data.data.books;
        showSuggestions.value = true;
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, 300);
};

const handleSearch = () => {
  showSuggestions.value = false;
  emit('search', searchQuery.value);
};

const selectSuggestion = (book: Book) => {
  searchQuery.value = book.title;
  showSuggestions.value = false;
  handleSearch();
};

const clearSearch = () => {
  searchQuery.value = '';
  suggestions.value = [];
  showSuggestions.value = false;
  emit('search', '');
};
</script>

<style scoped>
/* Component styles */
</style>
