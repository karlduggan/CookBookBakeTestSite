<template>
  <div class="space-y-4">
    <!-- Empty cart message -->
    <div v-if="cart.items.length === 0" class="text-text-secondary text-center py-8">
      Your cart is empty
    </div>

    <!-- Cart items -->
    <div v-else class="space-y-4">
      <div v-for="item in cart.items" :key="item.bookId" class="pb-4 border-b border-text-muted last:border-b-0">
        <!-- Item Info Row -->
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1 pr-4">
            <h4 class="font-semibold text-text-primary">{{ item.title }}</h4>
            <p class="text-sm text-text-secondary">{{ item.author }}</p>
          </div>
          <div class="text-right whitespace-nowrap">
            <p class="font-semibold text-text-primary">£{{ (item.price * item.quantity).toFixed(2) }}</p>
            <p class="text-xs text-text-secondary">£{{ item.price.toFixed(2) }} each</p>
          </div>
        </div>

        <!-- Controls Row -->
        <div class="flex items-center justify-between gap-3">
          <!-- Quantity Controls -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="handleQuantityChange(item.bookId, item.quantity - 1)"
              class="px-2 py-1 bg-primary-darkAlt text-text-primary rounded hover:bg-primary-dark cursor-pointer transition-colors"
              title="Decrease quantity"
            >
              −
            </button>
            <span class="w-6 text-center font-semibold">{{ item.quantity }}</span>
            <button
              type="button"
              @click="handleQuantityChange(item.bookId, item.quantity + 1)"
              :disabled="item.quantity >= item.stockAvailable"
              class="px-2 py-1 bg-primary-darkAlt text-text-primary rounded hover:bg-primary-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Increase quantity"
            >
              +
            </button>
          </div>

          <!-- Remove Button -->
          <button
            type="button"
            @click="handleRemoveItem(item.bookId)"
            class="px-3 py-1 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '../../composables/useCart';

const cart = useCart();

// Handle quantity changes and dispatch event
const handleQuantityChange = (bookId: string, newQuantity: number) => {
  cart.updateQuantity(bookId, newQuantity);
  dispatchCartUpdate();
};

// Handle item removal and dispatch event
const handleRemoveItem = (bookId: string) => {
  cart.removeItem(bookId);
  dispatchCartUpdate();
};

// Dispatch custom event to notify other components
const dispatchCartUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'));
  }
};
</script>

<style scoped>
button {
  min-height: 36px;
}
</style>
