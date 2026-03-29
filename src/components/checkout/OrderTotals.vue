<template>
  <div class="border-t border-text-muted pt-4">
    <!-- Subtotal -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Subtotal:</span>
      <span class="text-text-primary font-semibold" :key="`subtotal-${renderKey}`">£{{ cart.subtotal.toFixed(2) }}</span>
    </div>

    <!-- Shipping -->
    <div class="flex justify-between mb-2">
      <span class="text-text-secondary">Shipping:</span>
      <span class="text-text-primary font-semibold" :key="`shipping-${renderKey}`">£{{ cart.shipping.toFixed(2) }}</span>
    </div>

    <!-- Tax -->
    <div class="flex justify-between mb-4">
      <span class="text-text-secondary">Tax (20%):</span>
      <span class="text-text-primary font-semibold" :key="`tax-${renderKey}`">£{{ cart.tax.toFixed(2) }}</span>
    </div>

    <!-- Total -->
    <div class="flex justify-between border-t border-text-muted pt-4 text-lg">
      <span class="font-bold text-text-primary">Total:</span>
      <span class="font-bold text-accent-teal" :key="`total-${renderKey}`">£{{ cart.total.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';

const cart = useCartStore();
const renderKey = ref(0);

// Force re-render by updating key
const forceUpdate = () => {
  renderKey.value++;
};

// Set up reactivity after mount
onMounted(() => {
  // Listen for cart updates from other components
  const handleCartUpdate = () => {
    forceUpdate();
  };

  window.addEventListener('cart-updated', handleCartUpdate);

  return () => {
    window.removeEventListener('cart-updated', handleCartUpdate);
  };
});
</script>

<style scoped>
/* Component styles */
</style>
