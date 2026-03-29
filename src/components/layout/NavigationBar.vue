<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-text-muted shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <a href="/" class="text-2xl font-bold text-accent-teal hover:text-accent-teal-dark transition-colors">
            Cook Book Bake
          </a>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <a href="/shop" class="text-text-primary hover:text-accent-teal transition-colors">
            Shop
          </a>
          <a href="/account" class="text-text-primary hover:text-accent-teal transition-colors">
            Account
          </a>
        </div>

        <!-- Right side icons -->
        <div class="flex items-center space-x-4">
          <!-- Search button (stub) -->
          <button class="p-2 hover:text-accent-teal transition-colors" aria-label="Search">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Cart button -->
          <button
            @click="toggleCart"
            class="p-2 hover:text-accent-teal transition-colors relative"
            aria-label="Shopping cart"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1h7.586a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM5 16a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cartCount > 0" class="absolute top-0 right-0 text-xs bg-accent-coral text-white rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {{ cartCount }}
            </span>
          </button>

          <!-- Mobile menu button -->
          <button
            @click="toggleMenu"
            class="md:hidden p-2 hover:text-accent-teal transition-colors"
            aria-label="Toggle menu"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="md:hidden pb-4 border-t border-text-muted">
        <a href="/shop" class="block px-4 py-2 text-text-secondary hover:text-accent-teal transition-colors">
          Shop
        </a>
        <a href="/account" class="block px-4 py-2 text-text-secondary hover:text-accent-teal transition-colors">
          Account
        </a>
        <div class="px-4 py-2">
          <button class="btn-primary w-full text-center">Login</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';

const isMenuOpen = ref(false);
const cartStore = useCartStore();
const cartCount = ref(0);

// Update cart count
const updateCartCount = () => {
  if (typeof window !== 'undefined' && localStorage) {
    try {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const items = JSON.parse(cart);
        cartCount.value = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      } else {
        cartCount.value = 0;
      }
    } catch (e) {
      cartCount.value = 0;
    }
  }
};

// Set up reactivity after mount
onMounted(() => {
  updateCartCount();

  // Listen for cart updates from other components
  window.addEventListener('cart-updated', updateCartCount);

  // Also subscribe to store changes
  cartStore.$subscribe(() => {
    updateCartCount();
  });

  return () => {
    window.removeEventListener('cart-updated', updateCartCount);
  };
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleCart = () => {
  window.location.href = '/checkout';
};
</script>

<style scoped>
/* Component styles can be added here if needed */
</style>
