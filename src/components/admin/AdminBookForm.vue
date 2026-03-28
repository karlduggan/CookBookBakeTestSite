<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-semibold text-text-primary mb-2">Title *</label>
      <input
        v-model="form.title"
        type="text"
        id="title"
        placeholder="Book Title"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- Author -->
    <div>
      <label for="author" class="block text-sm font-semibold text-text-primary mb-2">Author *</label>
      <input
        v-model="form.author"
        type="text"
        id="author"
        placeholder="Author Name"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- ISBN -->
    <div>
      <label for="isbn" class="block text-sm font-semibold text-text-primary mb-2">ISBN *</label>
      <input
        v-model="form.isbn"
        type="text"
        id="isbn"
        placeholder="978-1-234567-89-0"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- Price and Stock -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Price -->
      <div>
        <label for="price" class="block text-sm font-semibold text-text-primary mb-2">Price (£) *</label>
        <input
          v-model.number="form.price"
          type="number"
          id="price"
          placeholder="19.99"
          step="0.01"
          min="0"
          class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
          required
        />
      </div>

      <!-- Stock -->
      <div>
        <label for="stock" class="block text-sm font-semibold text-text-primary mb-2">Stock Quantity *</label>
        <input
          v-model.number="form.stock_quantity"
          type="number"
          id="stock"
          placeholder="10"
          min="0"
          class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
          required
        />
      </div>
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-semibold text-text-primary mb-2">Description</label>
      <textarea
        v-model="form.description"
        id="description"
        placeholder="Book description..."
        rows="3"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
      ></textarea>
    </div>

    <!-- Cover Image URL -->
    <div>
      <label for="cover" class="block text-sm font-semibold text-text-primary mb-2">Cover Image URL</label>
      <input
        v-model="form.cover_image_url"
        type="url"
        id="cover"
        placeholder="https://example.com/cover.jpg"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
      />
    </div>

    <!-- Featured and Bestseller -->
    <div class="grid grid-cols-2 gap-4">
      <label class="flex items-center cursor-pointer">
        <input
          v-model="form.featured"
          type="checkbox"
          class="w-4 h-4 rounded border-text-muted bg-primary-light-alt"
        />
        <span class="ml-3 text-sm text-text-secondary">Featured Book</span>
      </label>

      <label class="flex items-center cursor-pointer">
        <input
          v-model="form.bestseller"
          type="checkbox"
          class="w-4 h-4 rounded border-text-muted bg-primary-light-alt"
        />
        <span class="ml-3 text-sm text-text-secondary">Bestseller</span>
      </label>
    </div>

    <!-- Error Message -->
    <div v-if="formError" class="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
      {{ formError }}
    </div>

    <!-- Buttons -->
    <div class="flex gap-3 justify-end pt-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn-secondary px-6 py-2"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">Saving...</span>
        <span v-else>{{ book ? 'Update Book' : 'Add Book' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  cover_image_url: string | null;
  featured: boolean;
  bestseller: boolean;
}

interface Props {
  book: any | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [data: BookFormData];
  cancel: [];
}>();

const form = reactive<BookFormData>({
  title: '',
  author: '',
  isbn: '',
  description: null,
  price: 0,
  stock_quantity: 0,
  cover_image_url: null,
  featured: false,
  bestseller: false,
});

const formError = ref<string | null>(null);
const isSubmitting = ref(false);

const handleSubmit = async () => {
  formError.value = null;

  // Validation
  if (!form.title || !form.author || !form.isbn || form.price < 0 || form.stock_quantity < 0) {
    formError.value = 'Please fill in all required fields correctly';
    return;
  }

  isSubmitting.value = true;
  emit('submit', form);
  isSubmitting.value = false;
};

onMounted(() => {
  if (props.book) {
    form.title = props.book.title;
    form.author = props.book.author;
    form.isbn = props.book.isbn;
    form.description = props.book.description || null;
    form.price = props.book.price;
    form.stock_quantity = props.book.stock_quantity;
    form.cover_image_url = props.book.cover_image_url || null;
    form.featured = props.book.featured || false;
    form.bestseller = props.book.bestseller || false;
  }
});
</script>
