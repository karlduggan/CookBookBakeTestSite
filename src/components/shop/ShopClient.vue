<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- Sidebar - Filters -->
    <div class="lg:col-span-1">
      <div class="sticky top-24 bg-white rounded-lg p-6 border border-text-muted shadow-md">
        <BookFilters
          @update:category="handleCategoryChange"
          @update:price="handlePriceChange"
          @update:inStock="handleInStockChange"
          @update:featured="handleFeaturedChange"
          @update:bestseller="handleBestsellerChange"
        />
      </div>
    </div>

    <!-- Main Content - Books Grid -->
    <div class="lg:col-span-3">
      <!-- Search Bar -->
      <div class="mb-8">
        <SearchBar @search="handleSearch" />
      </div>

      <!-- Results Info -->
      <div class="mb-6 flex items-center justify-between">
        <p class="text-text-secondary">
          Showing <span class="text-accent-teal font-bold">{{ displayedCount }}</span> of <span class="text-accent-teal font-bold">{{ totalItems }}</span> results
        </p>

        <!-- Sort Dropdown -->
        <select
          v-model="sortBy"
          @change="handleSort"
          class="px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary focus:outline-none focus:border-accent-teal transition-colors shadow-sm"
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-text-secondary mb-4">Loading books...</p>
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-accent-teal" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>

      <!-- Books Grid -->
      <div v-if="!isLoading && displayedBooks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <BookCard v-for="book in displayedBooks" :key="book.id" :book="book" />
      </div>

      <!-- No Results -->
      <div v-if="!isLoading && displayedBooks.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747m0-13c5.5 0 10 4.745 10 10.747s-4.5 10.747-10 10.747m0-13v13m0-13C6.5 6.253 2 10.998 2 17"
          ></path>
        </svg>
        <p class="text-text-secondary text-lg mb-4">No books found matching your criteria.</p>
        <button @click="clearAllFilters" class="btn-primary inline-block">Clear Filters</button>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && displayedBooks.length > 0 && totalPages > 1" class="flex justify-center items-center gap-4">
        <button
          v-if="currentPage > 1"
          @click="goToPage(currentPage - 1)"
          class="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-teal-dark transition-colors"
        >
          Previous
        </button>

        <div class="flex gap-2">
          <button
            v-for="page in pageNumbers"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              page === currentPage
                ? 'bg-accent-teal text-white font-bold'
                : 'bg-primary-light-alt border border-text-muted text-text-secondary hover:border-accent-teal',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          v-if="currentPage < totalPages"
          @click="goToPage(currentPage + 1)"
          class="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-teal-dark transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SearchBar from './SearchBar.vue';
import BookFilters from './BookFilters.vue';
import BookCard from './BookCard.vue';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock_quantity: number;
  cover_image_url?: string;
  featured: boolean;
  bestseller: boolean;
  categories?: { id: string; name: string; slug: string };
}

interface PaginationData {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const books = ref<Book[]>([]);
const isLoading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const totalPages = ref(1);
const totalItems = ref(0);
const sortBy = ref('relevance');

const filters = ref({
  category: '',
  search: '',
  priceRange: 'all',
  inStockOnly: false,
  featured: false,
  bestseller: false,
});

const displayedCount = computed(() => Math.min(books.value.length, itemsPerPage.value));

const displayedBooks = computed(() => {
  let result = [...books.value];

  // Apply sorting
  switch (sortBy.value) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
      // Would need created_at field for this
      break;
    case 'relevance':
    default:
      // Keep original order from API
      break;
  }

  return result;
});

const pageNumbers = computed(() => {
  const numbers = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    numbers.push(i);
  }

  return numbers;
});

const loadBooks = async (page: number = 1) => {
  isLoading.value = true;

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: itemsPerPage.value.toString(),
    });

    if (filters.value.search) {
      params.append('search', filters.value.search);
    }

    if (filters.value.category) {
      params.append('category', filters.value.category);
    }

    if (filters.value.featured) {
      params.append('featured', 'true');
    }

    if (filters.value.bestseller) {
      params.append('bestseller', 'true');
    }

    const response = await fetch(`/api/books?${params}`);
    const data = await response.json();

    if (data.success) {
      let resultBooks = data.data.books;
      currentPage.value = data.data.pagination.page;
      totalPages.value = data.data.pagination.totalPages;
      totalItems.value = data.data.pagination.total;

      // Filter by price range client-side
      if (filters.value.priceRange !== 'all') {
        const [min, max] = filters.value.priceRange.split('-').map(Number);
        resultBooks = resultBooks.filter((book: Book) => book.price >= min && book.price <= max);
      }

      // Filter by stock client-side
      if (filters.value.inStockOnly) {
        resultBooks = resultBooks.filter((book: Book) => book.stock_quantity > 0);
      }

      books.value = resultBooks;

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Failed to load books:', error);
  } finally {
    isLoading.value = false;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
  loadBooks(page);
};

const handleSearch = (query: string) => {
  filters.value.search = query;
  currentPage.value = 1;
  loadBooks();
};

const handleCategoryChange = (slug: string) => {
  filters.value.category = slug;
  currentPage.value = 1;
  loadBooks();
};

const handlePriceChange = (range: string) => {
  filters.value.priceRange = range;
  currentPage.value = 1;
  loadBooks();
};

const handleInStockChange = (value: boolean) => {
  filters.value.inStockOnly = value;
  currentPage.value = 1;
  loadBooks();
};

const handleFeaturedChange = (value: boolean) => {
  filters.value.featured = value;
  currentPage.value = 1;
  loadBooks();
};

const handleBestsellerChange = (value: boolean) => {
  filters.value.bestseller = value;
  currentPage.value = 1;
  loadBooks();
};

const handleSort = () => {
  // Sorting is handled by computed property
};

const clearAllFilters = () => {
  filters.value = {
    category: '',
    search: '',
    priceRange: 'all',
    inStockOnly: false,
    featured: false,
    bestseller: false,
  };
  sortBy.value = 'relevance';
  currentPage.value = 1;
  loadBooks();
};

onMounted(() => {
  loadBooks();
});
</script>

<style scoped>
/* Component styles */
</style>
