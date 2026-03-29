<template>
  <div class="border-t border-text-muted pt-4">
    <!-- Subtotal -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Subtotal:</span>
      <span class="text-text-primary font-semibold">£{{ subtotal }}</span>
    </div>

    <!-- Shipping -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Shipping:</span>
      <span class="text-text-primary font-semibold">£{{ shipping }}</span>
    </div>

    <!-- Tax -->
    <div class="flex justify-between mb-4">
      <span class="text-text-secondary">Tax (20%):</span>
      <span class="text-text-primary font-semibold">£{{ tax }}</span>
    </div>

    <!-- Total -->
    <div class="flex justify-between border-t border-text-muted pt-4 text-lg">
      <span class="font-bold text-text-primary">Total:</span>
      <span class="font-bold text-accent-teal">£{{ total }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';

const cart = useCartStore();

// Create computed properties that depend on items length to force reactivity
const subtotal = computed(() => {
  return cart.subtotal.toFixed(2);
});

const shipping = computed(() => {
  return cart.shipping.toFixed(2);
});

const tax = computed(() => {
  return cart.tax.toFixed(2);
});

const total = computed(() => {
  return cart.total.toFixed(2);
});

// Ensure store subscription is set up
onMounted(() => {
  console.log('[OrderTotals] Mounted, items:', cart.items.length);

  // Subscribe to all store changes
  const unsubscribe = cart.$subscribe((mutation, state) => {
    console.log('[OrderTotals] Store mutated, items count:', state.items.length, 'subtotal:', state.subtotal);
  });

  return () => {
    unsubscribe();
  };
});
</script>

<style scoped>
/* Component styles */
</style>
