<template>
  <a
    :href="`/shop/${encodeURIComponent(book.title.toLowerCase().replace(/\\s+/g, '-'))}`"
    class="block bg-white rounded-lg overflow-hidden border border-text-muted hover:border-accent-teal transition-all hover:shadow-lg shadow-md cursor-pointer group"
  >
    <!-- Image container -->
    <div class="relative aspect-[2/3] bg-primary-light-alt overflow-hidden">
      <img
        v-if="book.cover_image_url"
        :src="book.cover_image_url"
        :alt="book.title"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-text-muted">
        <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
      </div>

      <!-- Badges -->
      <div class="absolute top-2 right-2 space-y-2">
        <span v-if="book.featured" class="block bg-accent-coral text-white text-xs font-bold px-2 py-1 rounded">
          Featured
        </span>
        <span v-if="book.bestseller" class="block bg-accent-blue text-white text-xs font-bold px-2 py-1 rounded">
          Bestseller
        </span>
      </div>

      <!-- Stock status -->
      <div v-if="book.stock_quantity === 0" class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
        <span class="text-white font-bold text-lg">Out of Stock</span>
      </div>

      <!-- Add to cart button (hover) -->
      <button
        v-if="book.stock_quantity > 0"
        @click.prevent="addToCart"
        type="button"
        class="absolute bottom-0 left-0 right-0 bg-accent-teal text-white py-3 font-bold hover:bg-accent-teal-dark transition-colors transform translate-y-full group-hover:translate-y-0 z-10"
      >
        Add to Cart
      </button>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-2">
      <!-- Title and Author -->
      <div>
        <h3 class="font-bold text-text-primary line-clamp-2 mb-1">
          {{ book.title }}
        </h3>
        <p class="text-sm text-text-secondary">by {{ book.author }}</p>
      </div>

      <!-- Category -->
      <div v-if="book.categories" class="text-xs text-accent-teal">
        {{ book.categories.name }}
      </div>

      <!-- Price -->
      <div class="pt-2 border-t border-text-muted">
        <p class="text-2xl font-bold text-accent-teal">£{{ book.price.toFixed(2) }}</p>
      </div>

      <!-- Stock status -->
      <div class="text-xs">
        <span v-if="book.stock_quantity > 5" class="text-accent-teal">In Stock</span>
        <span v-else-if="book.stock_quantity > 0" class="text-yellow-500">Low Stock ({{ book.stock_quantity }})</span>
        <span v-else class="text-red-500">Out of Stock</span>
      </div>

    </div>
  </a>
</template>

<script setup lang="ts">
import { useCart } from '../../composables/useCart';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    isbn?: string;
    description?: string;
    stock_quantity: number;
    cover_image_url?: string;
    featured: boolean;
    bestseller: boolean;
    categories?: Category;
  };
}

const props = defineProps<BookCardProps>();

const addToCart = () => {
  const cart = useCart();

  if (!props.book) return;

  try {
    cart.addItem({
      bookId: props.book.id,
      title: props.book.title,
      author: props.book.author,
      price: props.book.price,
      quantity: 1,
      coverImageUrl: props.book.cover_image_url,
      stockAvailable: props.book.stock_quantity,
    });

    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
      console.log('[BookCard] Item added to cart, dispatching update event');
    }
  } catch (e) {
    console.error('[BookCard] Error adding to cart:', e);
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
