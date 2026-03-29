<template>
  <div class="max-w-2xl mx-auto">
    <!-- Success Message -->
    <div class="text-center mb-12">
      <!-- Success Icon -->
      <div class="mb-6">
        <svg class="w-20 h-20 text-accent-teal mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>

      <h1 class="text-4xl font-bold text-accent-teal mb-2">Order Confirmed!</h1>
      <p class="text-xl text-text-secondary">Thank you for your purchase</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-text-secondary mb-4">Retrieving your order details...</p>
      <div class="inline-block animate-spin">
        <svg class="w-8 h-8 text-accent-teal" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Order Details -->
    <div v-else-if="orderDetails" class="space-y-6">
      <!-- Order Info Card -->
      <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
        <h2 class="text-lg font-bold text-accent-teal mb-4">Order Information</h2>

        <div class="space-y-4 text-sm">
          <div class="pb-4 border-b border-text-muted">
            <p class="text-text-secondary mb-1">Order Number</p>
            <p class="text-text-primary font-semibold break-all">{{ orderNumber }}</p>
          </div>

          <div class="pb-4 border-b border-text-muted">
            <p class="text-text-secondary mb-1">Email</p>
            <p class="text-text-primary font-semibold">{{ orderDetails.customerEmail }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-text-secondary mb-1">Payment Status</p>
              <p class="text-green-400 font-semibold">{{ formatStatus(orderDetails.paymentStatus) }}</p>
            </div>

            <div>
              <p class="text-text-secondary mb-1">Total Amount</p>
              <p class="text-accent-teal font-semibold">£{{ orderDetails.totalAmount.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Shipping Details Card -->
      <div v-if="orderDetails.metadata" class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
        <h2 class="text-lg font-bold text-accent-teal mb-4">Shipping Address</h2>

        <div class="text-sm text-text-secondary space-y-1">
          <p>{{ orderDetails.metadata.shippingName }}</p>
          <p>{{ orderDetails.metadata.shippingAddressLine1 }}</p>
          <p v-if="orderDetails.metadata.shippingAddressLine2">{{ orderDetails.metadata.shippingAddressLine2 }}</p>
          <p>{{ orderDetails.metadata.shippingCity }}, {{ orderDetails.metadata.shippingPostcode }}</p>
          <p>{{ orderDetails.metadata.shippingCountry }}</p>
        </div>
      </div>

      <!-- What's Next -->
      <div class="bg-white rounded-lg p-6 border border-accent-teal shadow-md">
        <h2 class="text-lg font-bold text-accent-teal mb-4">What's Next?</h2>

        <ol class="space-y-3 text-sm text-text-secondary">
          <li class="flex gap-3">
            <span class="text-accent-teal font-bold">1.</span>
            <span>You'll receive an order confirmation email shortly with your order details and tracking information.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-accent-teal font-bold">2.</span>
            <span>We'll prepare your order for dispatch and send you a shipping notification within 1-2 business days.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-accent-teal font-bold">3.</span>
            <span>Track your package using the tracking link provided in your shipping email.</span>
          </li>
          <li class="flex gap-3">
            <span class="text-accent-teal font-bold">4.</span>
            <span>Your books will arrive within 3-5 business days.</span>
          </li>
        </ol>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <a href="/account/orders" class="block btn-primary py-3 text-center font-semibold">
          View My Orders
        </a>
        <a href="/shop" class="block btn-secondary py-3 text-center font-semibold">
          Continue Shopping
        </a>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center">
      <p class="text-red-400 mb-4">{{ error || 'Unable to retrieve order details' }}</p>
      <a href="/shop" class="btn-primary py-2 px-4 inline-block">Back to Shop</a>
    </div>

    <!-- Contact Info -->
    <div class="mt-12 pt-8 border-t border-text-muted text-center">
      <p class="text-text-secondary text-sm">
        Have questions? Contact us at
        <a href="mailto:support@cookbookbake.co.uk" class="text-accent-teal hover:text-accent-teal-dark">
          support@cookbookbake.co.uk
        </a>
        or call 01273 779520
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';

interface OrderDetails {
  sessionId: string;
  paymentStatus: string;
  customerEmail: string;
  totalAmount: number;
  metadata: Record<string, any>;
}

const sessionId = ref<string>('');
const orderNumber = ref<string>('');
const orderDetails = ref<OrderDetails | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    paid: 'Payment Successful',
    unpaid: 'Payment Pending',
    no_payment_required: 'No Payment Required',
  };
  return statusMap[status] || status;
};

onMounted(async () => {
  try {
    // Get session ID from URL
    const params = new URLSearchParams(window.location.search);
    sessionId.value = params.get('session_id') || '';

    if (!sessionId.value) {
      error.value = 'No session ID provided';
      isLoading.value = false;
      return;
    }

    // Fetch session details
    const response = await fetch(`/api/checkout/session-details?session_id=${sessionId.value}`);
    const data = await response.json();

    if (data.success) {
      orderDetails.value = {
        sessionId: sessionId.value,
        ...data.data,
      };

      // Clear the cart immediately after successful payment
      try {
        const cart = useCartStore();
        cart.clear();
        console.log('[CheckoutSuccess] Cart cleared after successful payment');

        // Dispatch event to notify other components (like NavigationBar)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
          console.log('[CheckoutSuccess] Dispatched cart-updated event');
        }
      } catch (e) {
        console.warn('[CheckoutSuccess] Could not clear cart:', e);
      }

      // Save order to database and get custom order number
      try {
        console.log('[CheckoutSuccess] Calling save-order API for session:', sessionId.value);
        const saveOrderResponse = await fetch(`/api/checkout/save-order?session_id=${sessionId.value}`, {
          method: 'POST',
        });
        console.log('[CheckoutSuccess] Save-order response status:', saveOrderResponse.status);

        const saveOrderData = await saveOrderResponse.json();
        console.log('[CheckoutSuccess] Save-order response data:', saveOrderData);

        if (saveOrderData.success && saveOrderData.data?.orderNumber) {
          orderNumber.value = saveOrderData.data.orderNumber;
          console.log('[CheckoutSuccess] Order saved with number:', orderNumber.value);
        } else {
          console.warn('[CheckoutSuccess] Failed to save order. Response:', saveOrderData);
          orderNumber.value = sessionId.value;
        }
      } catch (e) {
        console.error('[CheckoutSuccess] Error saving order:', e);
        orderNumber.value = sessionId.value;
      }
    } else {
      error.value = data.error || 'Failed to retrieve order details';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Component styles */
</style>
