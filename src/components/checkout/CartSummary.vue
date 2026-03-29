<template>
  <div class="space-y-4">
    <!-- Empty cart message -->
    <div v-if="!cart || cart.items.length === 0" class="text-text-secondary text-center py-8">
      Your cart is empty
    </div>

    <!-- Cart items -->
    <div v-else class="space-y-4">
      <div v-for="item in cart.items" :key="item.bookId" class="flex gap-4 pb-4 border-b border-text-muted last:border-b-0">
        <!-- Item Info -->
        <div class="flex-1">
          <h4 class="font-semibold text-text-primary">{{ item.title }}</h4>
          <p class="text-sm text-text-secondary">{{ item.author }}</p>
          <p class="text-sm font-semibold text-accent-teal mt-1">£{{ item.price.toFixed(2) }} each</p>
        </div>

        <!-- Quantity Controls -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="cart.updateQuantity(item.bookId, item.quantity - 1)"
            class="px-2 py-1 bg-primary-darkAlt text-text-primary rounded hover:bg-primary-dark cursor-pointer transition-colors"
          >
            −
          </button>
          <span class="w-6 text-center font-semibold">{{ item.quantity }}</span>
          <button
            type="button"
            @click="cart.updateQuantity(item.bookId, item.quantity + 1)"
            :disabled="item.quantity >= item.stockAvailable"
            class="px-2 py-1 bg-primary-darkAlt text-text-primary rounded hover:bg-primary-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>

        <!-- Total for item -->
        <div class="text-right">
          <p class="font-semibold text-text-primary">£{{ (item.price * item.quantity).toFixed(2) }}</p>
        </div>

        <!-- Remove -->
        <button
          type="button"
          @click="cart.removeItem(item.bookId)"
          class="px-3 py-1 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded text-sm font-semibold cursor-pointer transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';

let cart: any = null;

onMounted(() => {
  cart = useCartStore();
});
</script>

<style scoped>
button {
  min-height: 36px;
}
</style>
