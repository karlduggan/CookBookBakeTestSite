<template>
  <div v-if="!cart" class="border-t border-text-muted pt-4">
    <p class="text-text-secondary text-sm">Loading totals...</p>
  </div>
  <div v-else class="border-t border-text-muted pt-4">
    <!-- Subtotal -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Subtotal:</span>
      <span class="text-text-primary font-semibold">£{{ cart.subtotal.toFixed(2) }}</span>
    </div>

    <!-- Shipping -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Shipping:</span>
      <span class="text-text-primary font-semibold">£{{ cart.shipping.toFixed(2) }}</span>
    </div>

    <!-- Tax -->
    <div class="flex justify-between mb-4">
      <span class="text-text-secondary">Tax (20%):</span>
      <span class="text-text-primary font-semibold">£{{ cart.tax.toFixed(2) }}</span>
    </div>

    <!-- Total -->
    <div class="flex justify-between border-t border-text-muted pt-4 text-lg">
      <span class="font-bold text-text-primary">Total:</span>
      <span class="font-bold text-accent-teal">£{{ cart.total.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';

let cart: any = null;

onMounted(() => {
  try {
    cart = useCartStore();
  } catch (e) {
    console.error('[OrderTotals] Error initializing cart:', e);
  }
});
</script>

<style scoped>
/* Component styles */
</style>
