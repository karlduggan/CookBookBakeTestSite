<template>
  <div class="mt-6 space-y-2">
    <button
      v-if="inStock"
      @click="handleAddToCart"
      class="w-full btn-primary py-3 text-lg font-bold"
    >
      Add to Cart
    </button>
    <button v-else disabled class="w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50 font-bold">
      Out of Stock
    </button>

    <!-- Add to Wishlist (stub) -->
    <button
      class="w-full py-3 border border-accent-teal text-accent-teal rounded-lg hover:bg-primary-light-alt transition-colors font-semibold"
    >
      ♡ Save to Wishlist
    </button>
  </div>
</template>

<script setup lang="ts">
interface BookDetailClientProps {
  bookId: string;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
  stockQuantity: number;
  inStock: boolean;
}

const props = defineProps<BookDetailClientProps>();

const handleAddToCart = async () => {
  // Lazy load store only when needed
  const { useCartStore } = await import('../../stores/cart');
  const cart = useCartStore();

  cart.addItem({
    bookId: props.bookId,
    title: props.title,
    author: props.author,
    price: props.price,
    quantity: 1,
    coverImageUrl: props.coverImageUrl,
    stockAvailable: props.stockQuantity,
  });

  // Show feedback
  alert(`"${props.title}" added to cart!`);
};
</script>

<style scoped>
/* Component styles */
</style>
