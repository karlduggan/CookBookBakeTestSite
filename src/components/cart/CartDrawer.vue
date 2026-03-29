<template>
  <div v-if="isOpen" class="fixed inset-0 z-40">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black bg-opacity-25"
      @click="close"
    ></div>

    <!-- Drawer -->
    <div class="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-text-muted">
        <h2 class="text-2xl font-bold text-accent-teal">Shopping Cart</h2>
        <button
          @click="close"
          class="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close cart"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Items -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div v-if="cart.items.length === 0" class="text-center py-12">
          <p class="text-text-secondary mb-4">Your cart is empty</p>
          <a
            href="/shop"
            class="btn-primary inline-block"
            @click="close"
          >
            Continue Shopping
          </a>
        </div>

        <div v-for="item in cart.items" :key="item.bookId" class="border border-text-muted rounded-lg p-4 bg-primary-light-alt">
          <div class="flex gap-4">
            <!-- Cover image -->
            <div v-if="item.coverImageUrl" class="flex-shrink-0 w-16 h-24">
              <img
                :src="item.coverImageUrl"
                :alt="item.title"
                class="w-full h-full object-cover rounded"
              />
            </div>

            <!-- Item details -->
            <div class="flex-1">
              <h3 class="font-bold text-text-primary mb-1">{{ item.title }}</h3>
              <p class="text-sm text-text-secondary mb-2">{{ item.author }}</p>
              <p class="text-accent-teal font-bold mb-3">£{{ item.price.toFixed(2) }}</p>

              <!-- Quantity controls -->
              <div class="flex items-center gap-2 mb-3">
                <button
                  @click="cart.updateQuantity(item.bookId, item.quantity - 1)"
                  class="px-2 py-1 bg-white border border-text-muted hover:bg-accent-teal hover:text-white transition-colors rounded"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span class="w-8 text-center font-semibold">{{ item.quantity }}</span>
                <button
                  @click="cart.updateQuantity(item.bookId, item.quantity + 1)"
                  :disabled="item.quantity >= item.stockAvailable"
                  class="px-2 py-1 bg-white border border-text-muted hover:bg-accent-teal hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <!-- Remove button -->
              <button
                @click="cart.removeItem(item.bookId)"
                class="text-sm text-accent-teal hover:text-accent-teal-dark transition-colors font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with summary and checkout -->
      <div class="border-t border-text-muted p-6 space-y-4">
        <!-- Summary -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>£{{ cart.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Shipping:</span>
            <span v-if="cart.shipping === 0" class="text-accent-teal">Free</span>
            <span v-else>£{{ cart.shipping.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tax (20%):</span>
            <span>£{{ cart.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold text-accent-teal border-t border-text-muted pt-2">
            <span>Total:</span>
            <span>£{{ cart.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="space-y-2">
          <a
            href="/checkout"
            class="btn-primary block text-center w-full"
            @click="close"
          >
            Checkout
          </a>
          <button
            @click="close"
            class="btn-ghost w-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { useCart } from '../../composables/useCart';

const cart = useCart();
const isOpen = inject('cartOpen', false) as any;

const close = () => {
  isOpen.value = false;
};
</script>

<style scoped>
/* Smooth drawer animation */
</style>
