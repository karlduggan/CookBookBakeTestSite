<template>
  <div class="space-y-6">
    <!-- Category Filter -->
    <div>
      <h3 class="text-lg font-bold text-accent-teal mb-4">Categories</h3>
      <div v-if="isLoadingCategories" class="text-text-secondary text-sm">
        Loading categories...
      </div>
      <div v-else class="space-y-2">
        <label class="flex items-center cursor-pointer hover:text-accent-teal transition-colors">
          <input
            type="checkbox"
            :checked="!selectedCategory"
            @change="selectCategory('')"
            class="w-4 h-4 rounded border-text-muted bg-white"
          />
          <span class="ml-3 text-text-secondary">All Categories</span>
        </label>
        <label
          v-for="cat in categories"
          :key="cat.id"
          class="flex items-center cursor-pointer hover:text-accent-teal transition-colors"
        >
          <input
            type="checkbox"
            :checked="selectedCategory === cat.slug"
            @change="selectCategory(cat.slug)"
            class="w-4 h-4 rounded border-text-muted bg-white"
          />
          <span class="ml-3 text-text-secondary">{{ cat.name }}</span>
        </label>
      </div>
    </div>

    <!-- Price Range Filter -->
    <div>
      <h3 class="text-lg font-bold text-accent-teal mb-4">Price Range</h3>
      <div class="space-y-3">
        <label class="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            value="all"
            :checked="priceRange === 'all'"
            @change="selectPriceRange('all')"
            class="w-4 h-4 rounded-full"
          />
          <span class="ml-3 text-text-secondary">All Prices</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            value="0-20"
            :checked="priceRange === '0-20'"
            @change="selectPriceRange('0-20')"
            class="w-4 h-4 rounded-full"
          />
          <span class="ml-3 text-text-secondary">Under £20</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            value="20-40"
            :checked="priceRange === '20-40'"
            @change="selectPriceRange('20-40')"
            class="w-4 h-4 rounded-full"
          />
          <span class="ml-3 text-text-secondary">£20 - £40</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input
            type="radio"
            name="price"
            value="40-100"
            :checked="priceRange === '40-100'"
            @change="selectPriceRange('40-100')"
            class="w-4 h-4 rounded-full"
          />
          <span class="ml-3 text-text-secondary">£40+</span>
        </label>
      </div>
    </div>

    <!-- Availability Filter -->
    <div>
      <h3 class="text-lg font-bold text-accent-teal mb-4">Availability</h3>
      <div class="space-y-2">
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="showInStockOnly"
            @change="toggleInStock"
            class="w-4 h-4 rounded border-text-muted bg-white"
          />
          <span class="ml-3 text-text-secondary">In Stock Only</span>
        </label>
      </div>
    </div>

    <!-- Featured/Bestseller -->
    <div>
      <h3 class="text-lg font-bold text-accent-teal mb-4">Special</h3>
      <div class="space-y-2">
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="showFeatured"
            @change="toggleFeatured"
            class="w-4 h-4 rounded border-text-muted bg-white"
          />
          <span class="ml-3 text-text-secondary">Featured Only</span>
        </label>
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="showBestseller"
            @change="toggleBestseller"
            class="w-4 h-4 rounded border-text-muted bg-white"
          />
          <span class="ml-3 text-text-secondary">Bestsellers Only</span>
        </label>
      </div>
    </div>

    <!-- Clear Filters -->
    <button
      @click="clearFilters"
      class="w-full px-4 py-2 border border-accent-teal text-accent-teal hover:bg-primary-light-alt transition-colors rounded-lg font-semibold"
    >
      Clear All Filters
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

const emit = defineEmits<{
  'update:category': [slug: string];
  'update:price': [range: string];
  'update:inStock': [value: boolean];
  'update:featured': [value: boolean];
  'update:bestseller': [value: boolean];
}>();

const categories = ref<Category[]>([]);
const isLoadingCategories = ref(true);
const selectedCategory = ref('');
const priceRange = ref('all');
const showInStockOnly = ref(false);
const showFeatured = ref(false);
const showBestseller = ref(false);

onMounted(async () => {
  try {
    const response = await fetch('/api/categories');
    const data = await response.json();

    if (data.success) {
      categories.value = data.data.categories;
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  } finally {
    isLoadingCategories.value = false;
  }
});

const selectCategory = (slug: string) => {
  selectedCategory.value = slug;
  emit('update:category', slug);
};

const selectPriceRange = (range: string) => {
  priceRange.value = range;
  emit('update:price', range);
};

const toggleInStock = () => {
  showInStockOnly.value = !showInStockOnly.value;
  emit('update:inStock', showInStockOnly.value);
};

const toggleFeatured = () => {
  showFeatured.value = !showFeatured.value;
  emit('update:featured', showFeatured.value);
};

const toggleBestseller = () => {
  showBestseller.value = !showBestseller.value;
  emit('update:bestseller', showBestseller.value);
};

const clearFilters = () => {
  selectedCategory.value = '';
  priceRange.value = 'all';
  showInStockOnly.value = false;
  showFeatured.value = false;
  showBestseller.value = false;

  emit('update:category', '');
  emit('update:price', 'all');
  emit('update:inStock', false);
  emit('update:featured', false);
  emit('update:bestseller', false);
};
</script>

<style scoped>
/* Component styles */
</style>
