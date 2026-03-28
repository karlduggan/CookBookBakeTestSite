<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Cart Validation -->
    <div v-if="!hasItems" class="p-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg text-yellow-400">
      Your cart is empty. <a href="/shop" class="underline">Continue shopping</a>
    </div>

    <!-- Shipping Information -->
    <fieldset>
      <legend class="text-lg font-bold text-accent-teal mb-4">Shipping Address</legend>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Full Name -->
        <div>
          <label for="name" class="block text-sm font-semibold text-text-primary mb-2">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            id="name"
            placeholder="John Doe"
            class="w-full px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
            required
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-semibold text-text-primary mb-2">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            placeholder="john@example.com"
            class="w-full px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
            required
          />
        </div>

        <!-- Address Line 1 -->
        <div class="md:col-span-2">
          <label for="address1" class="block text-sm font-semibold text-text-primary mb-2">Address</label>
          <input
            v-model="form.addressLine1"
            type="text"
            id="address1"
            placeholder="123 Main Street"
            class="w-full px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
            required
          />
        </div>

        <!-- Address Line 2 -->
        <div class="md:col-span-2">
          <label for="address2" class="block text-sm font-semibold text-text-primary mb-2">Apartment, suite, etc. (optional)</label>
          <input
            v-model="form.addressLine2"
            type="text"
            id="address2"
            placeholder="Apt 4B"
            class="w-full px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>

        <!-- City -->
        <div>
          <label for="city" class="block text-sm font-semibold text-text-primary mb-2">City</label>
          <input
            v-model="form.city"
            type="text"
            id="city"
            placeholder="Hove"
            class="w-full px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
            required
          />
        </div>

        <!-- Postcode -->
        <div>
          <label for="postcode" class="block text-sm font-semibold text-text-primary mb-2">Postcode</label>
          <input
            v-model="form.postcode"
            type="text"
            id="postcode"
            placeholder="BN3 2WB"
            class="w-full px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
            required
          />
        </div>

        <!-- Country -->
        <div class="md:col-span-2">
          <label for="country" class="block text-sm font-semibold text-text-primary mb-2">Country</label>
          <input
            v-model="form.country"
            type="text"
            id="country"
            placeholder="United Kingdom"
            class="w-full px-4 py-2 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
            required
          />
        </div>
      </div>
    </fieldset>

    <!-- Terms Agreement -->
    <label class="flex items-start cursor-pointer">
      <input
        v-model="form.agreeToTerms"
        type="checkbox"
        class="mt-1 w-4 h-4 rounded border-text-muted bg-white"
        required
      />
      <span class="ml-3 text-sm text-text-secondary">
        I agree to the
        <a href="#" class="text-accent-teal hover:text-accent-teal-dark">Terms and Conditions</a>
        and
        <a href="#" class="text-accent-teal hover:text-accent-teal-dark">Privacy Policy</a>
      </span>
    </label>

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
      {{ error }}
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading || !hasItems"
      class="w-full btn-primary py-3 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="isLoading">Processing...</span>
      <span v-else>Proceed to Payment</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';

const form = ref({
  name: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
  agreeToTerms: false,
});

const error = ref<string | null>(null);
const isLoading = ref(false);

let cart: any = null;
let auth: any = null;

const hasItems = computed(() => cart?.items?.length > 0);

const handleSubmit = async () => {
  error.value = null;

  if (!hasItems.value) {
    error.value = 'Your cart is empty';
    return;
  }

  if (!form.value.agreeToTerms) {
    error.value = 'You must agree to the terms and conditions';
    return;
  }

  isLoading.value = true;

  try {
    // Prepare checkout data
    const checkoutData = {
      items: cart.items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      })),
      shippingDetails: {
        name: form.value.name,
        email: form.value.email,
        addressLine1: form.value.addressLine1,
        addressLine2: form.value.addressLine2,
        city: form.value.city,
        postcode: form.value.postcode,
        country: form.value.country,
      },
    };

    // Create checkout session
    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
      credentials: 'include',
    });

    const data = await response.json();

    if (!data.success) {
      error.value = data.error || 'Failed to create checkout session';
      return;
    }

    // Redirect to Stripe Checkout
    if (data.data.sessionUrl) {
      window.location.href = data.data.sessionUrl;
    } else {
      error.value = 'No checkout URL returned';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  // Lazy load stores on mount
  if (!cart || !auth) {
    const { useCartStore } = await import('../../stores/cart');
    const { useAuthStore } = await import('../../stores/auth');
    cart = useCartStore();
    auth = useAuthStore();
  }

  // Pre-fill email if user is logged in
  if (auth.user) {
    form.value.email = auth.user.email;
    form.value.name = `${auth.user.firstName} ${auth.user.lastName}`;
  }

  // Update order summary
  if (window.updateOrderSummary) {
    window.updateOrderSummary({
      items: cart.items,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      tax: cart.tax,
      total: cart.total,
    });
  }
});
</script>

<style scoped>
/* Component styles */
</style>
