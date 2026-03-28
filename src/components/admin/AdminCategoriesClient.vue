<template>
  <div class="space-y-6">
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-accent-teal mb-2">Manage Categories</h1>
        <p class="text-text-secondary">Organize books into categories</p>
      </div>
      <button
        @click="showAddForm = !showAddForm"
        class="btn-primary px-6 py-3 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add Category
      </button>
    </div>

    <!-- Add Category Form -->
    <div v-if="showAddForm" class="bg-white rounded-lg p-6 border border-accent-teal">
      <h2 class="text-xl font-bold text-accent-teal mb-6">Add New Category</h2>
      <AdminCategoryForm :category="null" @submit="handleAddCategory" @cancel="showAddForm = false" />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-text-secondary mb-4">Loading categories...</p>
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

    <!-- Categories Table -->
    <div v-if="!isLoading && categories.length > 0" class="bg-white rounded-lg p-6 border border-text-muted shadow-md overflow-x-auto">
      <table class="w-full">
        <thead class="border-b border-text-muted">
          <tr>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Name</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Slug</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Description</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Order</th>
            <th class="text-center py-3 px-4 text-text-secondary font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id" class="border-b border-text-muted hover:bg-primary-light-alt transition-colors">
            <td class="py-3 px-4 text-text-primary font-semibold">{{ category.name }}</td>
            <td class="py-3 px-4 text-text-secondary">{{ category.slug }}</td>
            <td class="py-3 px-4 text-text-secondary text-sm">{{ category.description || '-' }}</td>
            <td class="py-3 px-4 text-text-secondary">{{ category.display_order }}</td>
            <td class="py-3 px-4 text-center space-x-2">
              <button
                @click="editingCategory = category"
                class="text-accent-teal hover:text-accent-teal-dark transition-colors"
                title="Edit"
              >
                <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click="handleDeleteCategory(category.id)"
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

    <!-- Edit Category Modal -->
    <div v-if="editingCategory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-8 border border-accent-teal max-w-lg w-full">
        <h2 class="text-2xl font-bold text-accent-teal mb-6">Edit Category</h2>
        <AdminCategoryForm :category="editingCategory" @submit="handleUpdateCategory" @cancel="editingCategory = null" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && categories.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
      </svg>
      <h3 class="text-xl font-bold text-text-primary mb-2">No categories found</h3>
      <p class="text-text-secondary mb-6">Create your first category to organize books</p>
      <button @click="showAddForm = !showAddForm" class="btn-primary px-6 py-3">Add Your First Category</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminCategoryForm from './AdminCategoryForm.vue';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

const categories = ref<Category[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showAddForm = ref(false);
const editingCategory = ref<Category | null>(null);

const fetchCategories = async () => {
  try {
    isLoading.value = true;
    const response = await fetch('/api/admin/categories', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    if (data.success) {
      categories.value = data.data;
    } else {
      error.value = data.error || 'Failed to load categories';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};

const handleAddCategory = async (formData: any) => {
  try {
    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      await fetchCategories();
      showAddForm.value = false;
      error.value = null;
    } else {
      error.value = data.error || 'Failed to add category';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

const handleUpdateCategory = async (formData: any) => {
  if (!editingCategory.value) return;

  try {
    const response = await fetch(`/api/admin/categories?id=${editingCategory.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      await fetchCategories();
      editingCategory.value = null;
      error.value = null;
    } else {
      error.value = data.error || 'Failed to update category';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

const handleDeleteCategory = async (categoryId: string) => {
  if (!confirm('Are you sure you want to delete this category?')) return;

  try {
    const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      await fetchCategories();
      error.value = null;
    } else {
      error.value = data.error || 'Failed to delete category';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

onMounted(fetchCategories);
</script>
