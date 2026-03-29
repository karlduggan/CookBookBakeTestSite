<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Cart Validation -->
    <div v-if="!hasItems" class="p-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg text-yellow-400">
      Your cart is empty. <a href="/shop" class="underline">Continue shopping</a>
    </div>

    <!-- Debug: Show cart items count -->
    <div v-if="cart.items.length > 0" class="p-3 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg text-blue-400 text-sm">
      Cart has {{ cart.items.length }} item(s) - Total: £{{ cart.total.toFixed(2) }}
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useCart } from '../../composables/useCart';
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

const cart = useCart();
let auth: any = null;

// Track cart items to force reactivity when cart updates
const cartItemsLength = ref(cart.items.length);

const hasItems = computed(() => {
  const itemCount = cartItemsLength.value;
  console.log('[CheckoutForm] hasItems computed, items:', itemCount);
  return itemCount > 0;
});

// Watch cart items for changes (for cross-island reactivity)
watch(
  () => cart.items.length,
  (newLength) => {
    console.log('[CheckoutForm] Detected cart items change:', newLength);
    cartItemsLength.value = newLength;
  },
  { immediate: true }
);

const handleSubmit = async () => {
  console.log('[CHECKOUT] Button clicked! handleSubmit called');
  error.value = null;

  if (!hasItems.value) {
    error.value = 'Your cart is empty';
    console.log('[CHECKOUT] Error: cart is empty');
    return;
  }

  if (!form.value.agreeToTerms) {
    error.value = 'You must agree to the terms and conditions';
    console.log('[CHECKOUT] Error: must agree to terms');
    return;
  }

  isLoading.value = true;
  console.log('[CHECKOUT] Starting checkout with', cart.items.length, 'items');

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

    console.log('[CHECKOUT] Sending request to /api/checkout/create-session');

    // Create checkout session
    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
      credentials: 'include',
    });

    console.log('[CHECKOUT] API response status:', response.status);

    const data = await response.json();
    console.log('[CHECKOUT] API response:', data);

    if (!response.ok || !data.success) {
      error.value = data.error || `Error: ${response.status}`;
      console.error('[CHECKOUT] ERROR:', error.value);
      return;
    }

    if (data.data?.sessionUrl) {
      console.log('[CHECKOUT] Redirecting to Stripe checkout');
      window.location.href = data.data.sessionUrl;
    } else {
      error.value = 'No checkout URL from server';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error occurred';
    console.error('[CHECKOUT] EXCEPTION:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    // Check what's in localStorage FIRST
    let localStorageCart = null;
    if (typeof window !== 'undefined' && localStorage) {
      localStorageCart = localStorage.getItem('cart');
      console.log('[CheckoutForm] localStorage.getItem("cart"):', localStorageCart);
      if (localStorageCart) {
        try {
          const parsed = JSON.parse(localStorageCart);
          console.log('[CheckoutForm] Parsed localStorage cart:', parsed);
          console.log('[CheckoutForm] Cart item count in localStorage:', parsed.length);
        } catch (e) {
          console.error('[CheckoutForm] Failed to parse localStorage cart:', e);
        }
      } else {
        console.warn('[CheckoutForm] localStorage cart is empty or null');
      }
    }

    // Force hydrate cart from localStorage
    console.log('[CheckoutForm] Calling cart.hydrate()...');
    if (cart && cart.hydrate) {
      cart.hydrate();
      console.log('[CheckoutForm] Hydrate completed');
    }

    console.log('[CheckoutForm] Mounted');
    console.log('[CheckoutForm] Cart items from store:', cart?.items?.length || 0);
    console.log('[CheckoutForm] Cart items:', cart?.items);
    console.log('[CheckoutForm] Cart total:', cart?.total);
    console.log('[CheckoutForm] hasItems computed value:', hasItems.value);
    console.log('[CheckoutForm] Component fully mounted - button should be clickable');

    // Check form validity after DOM is ready
    await nextTick();
    const formElement = document.querySelector('form');
    if (formElement) {
      console.log('[CheckoutForm] Form element found');
      console.log('[CheckoutForm] Form.checkValidity():', formElement.checkValidity());

      // Check all input fields
      const inputs = formElement.querySelectorAll('input, select, textarea');
      inputs.forEach((input: any, index: number) => {
        console.log(`[CheckoutForm] Input ${index} (${input.name || input.type}):`, {
          value: input.value,
          required: input.required,
          valid: input.validity.valid,
          validity: input.validity
        });
      });
    }
  } catch (e) {
    console.error('[CheckoutForm] Error during mount:', e);
  }

  // Listen for cart updates from OrderSummary
  if (typeof window !== 'undefined') {
    const handleCartUpdate = () => {
      console.log('[CheckoutForm] Cart updated event received, re-hydrating');
      if (cart && cart.hydrate) {
        cart.hydrate();
      }
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    console.log('[CheckoutForm] Listening for cart-updated events');

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }

  // Lazy load auth store on mount
  if (!auth) {
    const { useAuthStore } = await import('../../stores/auth');
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
