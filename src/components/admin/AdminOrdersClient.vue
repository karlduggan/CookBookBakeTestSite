<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-accent-teal mb-2">Manage Orders</h1>
      <p class="text-text-secondary">View and update customer orders</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg p-4 border border-text-muted shadow-md flex gap-4 flex-wrap">
      <div>
        <label class="block text-sm font-semibold text-text-primary mb-2">Filter by Status</label>
        <select
          v-model="filterStatus"
          @change="fetchOrders"
          class="px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-primary focus:outline-none focus:border-accent-teal"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-text-secondary mb-4">Loading orders...</p>
      <div class="inline-block animate-spin">
        <svg class="w-8 h-8 text-accent-teal" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
      {{ error }}
    </div>

    <!-- Orders Table -->
    <div v-if="!isLoading && orders.length > 0" class="bg-white rounded-lg p-6 border border-text-muted shadow-md overflow-x-auto">
      <table class="w-full">
        <thead class="border-b border-text-muted">
          <tr>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Order ID</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Customer</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Items</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Amount</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Status</th>
            <th class="text-left py-3 px-4 text-text-secondary font-semibold">Date</th>
            <th class="text-center py-3 px-4 text-text-secondary font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" class="border-b border-text-muted hover:bg-primary-light-alt transition-colors">
            <td class="py-3 px-4 text-accent-teal font-semibold">{{ order.order_number }}</td>
            <td class="py-3 px-4 text-text-secondary">{{ order.guest_email || 'User' }}</td>
            <td class="py-3 px-4 text-text-secondary">{{ order.order_items?.length || 0 }} items</td>
            <td class="py-3 px-4 text-text-primary font-semibold">£{{ order.total_amount.toFixed(2) }}</td>
            <td class="py-3 px-4">
              <select
                :value="order.status"
                @change="(e) => handleStatusChange(order.id, (e.target as HTMLSelectElement).value)"
                class="px-3 py-1 rounded text-sm font-semibold bg-primary-light-alt border border-text-muted text-text-primary focus:outline-none focus:border-accent-teal"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
            <td class="py-3 px-4 text-text-secondary">{{ formatDate(order.created_at) }}</td>
            <td class="py-3 px-4 text-center">
              <button
                @click="expandedOrder = expandedOrder === order.id ? null : order.id"
                class="text-accent-teal hover:text-accent-teal-dark transition-colors"
                :title="expandedOrder === order.id ? 'Collapse' : 'Expand'"
              >
                <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </td>
          </tr>
          <!-- Expanded Order Details -->
          <tr v-if="expandedOrder" v-for="order in orders.filter(o => o.id === expandedOrder)" :key="`detail-${order.id}`">
            <td colspan="7" class="py-4 px-4 bg-primary-light-alt">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-text-secondary mb-1">Shipping Address</p>
                    <p class="text-text-primary">{{ order.shippingName }}</p>
                    <p class="text-text-secondary text-sm">{{ order.shippingAddressLine1 }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-text-secondary mb-1">Payment ID</p>
                    <p class="text-text-primary font-mono text-sm break-all">{{ order.stripe_payment_intent_id }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-sm text-text-secondary mb-2">Order Items</p>
                  <ul class="space-y-1">
                    <li v-for="item in order.order_items" :key="item.id" class="text-text-primary text-sm">
                      Book ID: {{ item.book_id }} - Qty: {{ item.quantity }} @ £{{ item.price_at_purchase.toFixed(2) }}
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && orders.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
      </svg>
      <h3 class="text-xl font-bold text-text-primary mb-2">No orders found</h3>
      <p class="text-text-secondary">Orders will appear here once customers make purchases</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface OrderItem {
  id: string;
  book_id: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: string;
  order_number: string;
  guest_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  shippingName: string;
  shippingAddressLine1: string;
  stripe_payment_intent_id: string;
  order_items: OrderItem[];
}

const orders = ref<Order[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const filterStatus = ref<string>('');
const expandedOrder = ref<string | null>(null);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const fetchOrders = async () => {
  try {
    isLoading.value = true;
    const params = new URLSearchParams();
    if (filterStatus.value) {
      params.append('status', filterStatus.value);
    }

    const response = await fetch(`/api/admin/orders?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    if (data.success) {
      orders.value = data.data.orders;
    } else {
      error.value = data.error || 'Failed to load orders';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};

const handleStatusChange = async (orderId: string, newStatus: string) => {
  try {
    const response = await fetch(`/api/admin/orders?id=${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      await fetchOrders();
      error.value = null;
    } else {
      error.value = data.error || 'Failed to update order status';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

onMounted(fetchOrders);
</script>
