<template>
  <div class="border-t border-text-muted pt-4">
    <!-- Subtotal -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Subtotal:</span>
      <span class="text-text-primary font-semibold">£{{ subtotal.toFixed(2) }}</span>
    </div>

    <!-- Shipping -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Shipping:</span>
      <span class="text-text-primary font-semibold">£{{ shipping.toFixed(2) }}</span>
    </div>

    <!-- Tax -->
    <div class="flex justify-between mb-4">
      <span class="text-text-secondary">Tax (20%):</span>
      <span class="text-text-primary font-semibold">£{{ tax.toFixed(2) }}</span>
    </div>

    <!-- Total -->
    <div class="flex justify-between border-t border-text-muted pt-4 text-lg">
      <span class="font-bold text-text-primary">Total:</span>
      <span class="font-bold text-accent-teal">£{{ total.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';

const cart = useCartStore();

// Use reactive refs for totals to ensure updates are detected
const subtotal = ref(0);
const shipping = ref(0);
const tax = ref(0);
const total = ref(0);

// Update all totals
const updateTotals = () => {
  subtotal.value = cart.subtotal;
  shipping.value = cart.shipping;
  tax.value = cart.tax;
  total.value = cart.total;
};

// Set up reactivity after mount
onMounted(() => {
  updateTotals();

  // Listen for cart updates from other components
  window.addEventListener('cart-updated', updateTotals);

  // Also subscribe to store changes
  cart.$subscribe(() => {
    updateTotals();
  });

  return () => {
    window.removeEventListener('cart-updated', updateTotals);
  };
});
</script>

<style scoped>
/* Component styles */
</style>
