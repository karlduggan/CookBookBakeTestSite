<template>
  <div class="space-y-6">
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-accent-teal mb-2">Manage Books</h1>
        <p class="text-text-secondary">Add, edit, or delete books from inventory</p>
      </div>
      <button
        @click="showAddForm = !showAddForm"
        class="btn-primary px-6 py-3 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add Book
      </button>
    </div>

    <!-- Add Book Form -->
    <div v-if="showAddForm" class="bg-white rounded-lg p-6 border border-accent-teal">
      <h2 class="text-xl font-bold text-accent-teal mb-6">Add New Book</h2>
      <AdminBookForm :book="null" @submit="handleAddBook" @cancel="showAddForm = false" />
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

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
      {{ error }}
    </div>

    <!-- Books Table -->
    <div v-if="!isLoading && books.length > 0" class="bg-white rounded-lg p-6 border border-text-muted shadow-md overflow-x-auto">
      <table class="w-full">
        <thead class="border-b border-text-muted">
          <tr>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Title</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Author</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">ISBN</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Price</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Stock</th>
            <th class="text-center py-3 px-4 text-text-secondary font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id" class="border-b border-text-muted hover:bg-primary-light-alt transition-colors">
            <td class="py-3 px-4 text-text-primary font-semibold">{{ book.title }}</td>
            <td class="py-3 px-4 text-text-secondary">{{ book.author }}</td>
            <td class="py-3 px-4 text-text-secondary">{{ book.isbn }}</td>
            <td class="py-3 px-4 text-text-primary">£{{ book.price.toFixed(2) }}</td>
            <td class="py-3 px-4">
              <span class="px-3 py-1 rounded bg-primary-light-alt text-accent-teal text-sm font-semibold">
                {{ book.stock_quantity }}
              </span>
            </td>
            <td class="py-3 px-4 text-center space-x-2">
              <button
                @click="editingBook = book"
                class="text-accent-teal hover:text-accent-teal-dark transition-colors"
                title="Edit"
              >
                <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click="handleDeleteBook(book.id)"
                class="text-red-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Book Modal -->
    <div v-if="editingBook" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-8 border border-accent-teal max-w-2xl w-full max-h-96 overflow-y-auto">
        <h2 class="text-2xl font-bold text-accent-teal mb-6">Edit Book</h2>
        <AdminBookForm :book="editingBook" @submit="handleUpdateBook" @cancel="editingBook = null" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && books.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path>
      </svg>
      <h3 class="text-xl font-bold text-text-primary mb-2">No books found</h3>
      <p class="text-text-secondary mb-6">Start by adding your first book to the inventory</p>
      <button @click="showAddForm = !showAddForm" class="btn-primary px-6 py-3">Add Your First Book</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminBookForm from './AdminBookForm.vue';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock_quantity: number;
  created_at: string;
}

const books = ref<Book[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showAddForm = ref(false);
const editingBook = ref<Book | null>(null);

const fetchBooks = async () => {
  try {
    isLoading.value = true;
    const response = await fetch('/api/admin/books', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    if (data.success) {
      books.value = data.data;
    } else {
      error.value = data.error || 'Failed to load books';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};

const handleAddBook = async (formData: any) => {
  try {
    const response = await fetch('/api/admin/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      await fetchBooks();
      showAddForm.value = false;
      error.value = null;
    } else {
      error.value = data.error || 'Failed to add book';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

const handleUpdateBook = async (formData: any) => {
  if (!editingBook.value) return;

  try {
    const response = await fetch(`/api/admin/books?id=${editingBook.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      await fetchBooks();
      editingBook.value = null;
      error.value = null;
    } else {
      error.value = data.error || 'Failed to update book';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

const handleDeleteBook = async (bookId: string) => {
  if (!confirm('Are you sure you want to delete this book?')) return;

  try {
    const response = await fetch(`/api/admin/books?id=${bookId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      await fetchBooks();
      error.value = null;
    } else {
      error.value = data.error || 'Failed to delete book';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

onMounted(fetchBooks);
</script>
