<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-semibold text-text-primary mb-2">Category Name *</label>
      <input
        v-model="form.name"
        type="text"
        id="name"
        placeholder="e.g., Baking Recipes"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- Slug -->
    <div>
      <label for="slug" class="block text-sm font-semibold text-text-primary mb-2">Slug (URL-friendly) *</label>
      <input
        v-model="form.slug"
        type="text"
        id="slug"
        placeholder="e.g., baking-recipes"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-semibold text-text-primary mb-2">Description</label>
      <textarea
        v-model="form.description"
        id="description"
        placeholder="Category description..."
        rows="3"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
      ></textarea>
    </div>

    <!-- Display Order -->
    <div>
      <label for="order" class="block text-sm font-semibold text-text-primary mb-2">Display Order</label>
      <input
        v-model.number="form.display_order"
        type="number"
        id="order"
        placeholder="999"
        min="0"
        class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
      />
      <p class="text-xs text-text-secondary mt-1">Lower numbers appear first</p>
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
        <span v-else>{{ category ? 'Update Category' : 'Add Category' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

interface Props {
  category: any | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submit: [data: CategoryFormData];
  cancel: [];
}>();

const form = reactive<CategoryFormData>({
  name: '',
  slug: '',
  description: null,
  display_order: 999,
});

const formError = ref<string | null>(null);
const isSubmitting = ref(false);

const handleSubmit = async () => {
  formError.value = null;

  // Validation
  if (!form.name || !form.slug) {
    formError.value = 'Please fill in all required fields';
    return;
  }

  isSubmitting.value = true;
  emit('submit', form);
  isSubmitting.value = false;
};

onMounted(() => {
  if (props.category) {
    form.name = props.category.name;
    form.slug = props.category.slug;
    form.description = props.category.description || null;
    form.display_order = props.category.display_order;
  }
});
</script>
