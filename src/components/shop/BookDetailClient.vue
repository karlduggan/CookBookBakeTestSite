<template>
  <div class="mt-6 space-y-3">
    <!-- Error message -->
    <div v-if="error" class="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Add/Remove Button -->
    <button
      v-if="inStock"
      type="button"
      @click="toggleCart"
      :disabled="isLoading || !cart"
      :class="{
        'w-full py-3 px-4 text-lg font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed': true,
        'btn-primary hover:opacity-90': !isInCart,
        'bg-red-600 hover:bg-red-700 text-white': isInCart,
      }"
    >
      {{ isLoading ? (isInCart ? 'Removing...' : 'Adding...') : (isInCart ? '✕ Remove from Cart' : '+ Add to Cart') }}
    </button>

    <!-- Out of Stock -->
    <button
      v-else
      type="button"
      disabled
      class="w-full py-3 px-4 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50 font-bold"
    >
      Out of Stock
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCart } from '../../composables/useCart';

interface Props {
  bookId: string;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
  stockQuantity: number;
  inStock: boolean;
}

const props = defineProps<Props>();
const error = ref<string | null>(null);
const isLoading = ref(false);

// Initialize store safely
const cart = useCart();

// Computed property for checking if in cart
const isInCart = computed(() => {
  if (!cart) return false;
  return cart.isInCart(props.bookId);
});

// Toggle add/remove from cart
const toggleCart = () => {
  if (isLoading.value || !cart) return;

  isLoading.value = true;
  error.value = null;

  try {
    if (isInCart.value) {
      cart.removeItem(props.bookId);
    } else {
      cart.addItem({
        bookId: props.bookId,
        title: props.title,
        author: props.author,
        price: props.price,
        quantity: 1,
        coverImageUrl: props.coverImageUrl,
        stockAvailable: props.stockQuantity,
      });
    }

    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update cart';
    console.error('[BookDetailClient] Error:', e);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Ensure proper spacing and sizing */
button {
  min-height: 44px;
}
</style>
