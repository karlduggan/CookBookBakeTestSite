<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-accent-teal mb-2">Admin Dashboard</h1>
      <p class="text-text-secondary">Welcome to Cook Book Bake Admin Panel</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-text-secondary mb-4">Loading analytics...</p>
      <div class="inline-block animate-spin">
        <svg class="w-8 h-8 text-accent-teal" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
      {{ error }}
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <!-- Total Orders -->
        <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
          <p class="text-text-secondary text-sm mb-2">Total Orders</p>
          <p class="text-3xl font-bold text-accent-teal">{{ analytics?.summary.totalOrders || 0 }}</p>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
          <p class="text-text-secondary text-sm mb-2">Total Revenue</p>
          <p class="text-3xl font-bold text-accent-teal">£{{ (analytics?.summary.totalRevenue || 0).toFixed(2) }}</p>
        </div>

        <!-- Average Order Value -->
        <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
          <p class="text-text-secondary text-sm mb-2">Avg Order Value</p>
          <p class="text-3xl font-bold text-accent-teal">£{{ (analytics?.summary.averageOrderValue || 0).toFixed(2) }}</p>
        </div>

        <!-- Total Customers -->
        <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
          <p class="text-text-secondary text-sm mb-2">Total Customers</p>
          <p class="text-3xl font-bold text-accent-teal">{{ analytics?.summary.totalCustomers || 0 }}</p>
        </div>

        <!-- Total Books -->
        <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
          <p class="text-text-secondary text-sm mb-2">Total Books</p>
          <p class="text-3xl font-bold text-accent-teal">{{ analytics?.summary.totalBooks || 0 }}</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Order Status Breakdown -->
        <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
          <h2 class="text-xl font-bold text-accent-teal mb-6">Order Status Breakdown</h2>
          <div class="space-y-4">
            <div v-for="(count, status) in analytics?.orderStatus" :key="status" class="flex items-center justify-between">
              <span class="text-text-secondary capitalize">{{ status }}</span>
              <div class="flex items-center gap-3">
                <div class="w-32 bg-primary-light-alt rounded-full h-2">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-accent-teal to-accent-blue"
                    :style="{ width: getStatusPercentage(count) + '%' }"
                  ></div>
                </div>
                <span class="text-text-primary font-semibold w-8 text-right">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
          <h2 class="text-xl font-bold text-accent-teal mb-6">Quick Actions</h2>
          <div class="space-y-3">
            <a href="/admin/books" class="block p-4 bg-primary-light-alt rounded-lg hover:border-accent-teal border border-text-muted transition-colors">
              <p class="text-accent-teal font-semibold">Manage Books</p>
              <p class="text-sm text-text-secondary">Add, edit, or delete books from the inventory</p>
            </a>
            <a href="/admin/orders" class="block p-4 bg-primary-light-alt rounded-lg hover:border-accent-teal border border-text-muted transition-colors">
              <p class="text-accent-teal font-semibold">View Orders</p>
              <p class="text-sm text-text-secondary">Manage customer orders and update status</p>
            </a>
            <a href="/admin/categories" class="block p-4 bg-primary-light-alt rounded-lg hover:border-accent-teal border border-text-muted transition-colors">
              <p class="text-accent-teal font-semibold">Manage Categories</p>
              <p class="text-sm text-text-secondary">Organize books into categories</p>
            </a>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-lg p-6 border border-text-muted shadow-md">
        <h2 class="text-xl font-bold text-accent-teal mb-6">Recent Orders</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-text-muted">
              <tr>
                <th class="text-left py-3 px-4 text-text-secondary font-semibold">Order ID</th>
                <th class="text-left py-3 px-4 text-text-secondary font-semibold">Amount</th>
                <th class="text-left py-3 px-4 text-text-secondary font-semibold">Status</th>
                <th class="text-left py-3 px-4 text-text-secondary font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in analytics?.recentOrders" :key="order.id" class="border-b border-text-muted hover:bg-primary-light-alt transition-colors">
                <td class="py-3 px-4">
                  <a href="/admin/orders" class="text-accent-teal hover:text-accent-teal-dark">{{ order.order_number }}</a>
                </td>
                <td class="py-3 px-4 text-text-primary font-semibold">£{{ order.total_amount.toFixed(2) }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="getStatusColor(order.status)"
                  >
                    {{ formatStatus(order.status) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-text-secondary">{{ formatDate(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Analytics {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalBooks: number;
    averageOrderValue: number;
  };
  orderStatus: Record<string, number>;
  topBooks: any[];
  recentOrders: any[];
}

const analytics = ref<Analytics | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const getStatusPercentage = (count: number) => {
  if (!analytics.value) return 0;
  const total = Object.values(analytics.value.orderStatus).reduce((sum, c) => sum + c, 0);
  return total === 0 ? 0 : Math.round((count / total) * 100);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500 bg-opacity-20 text-yellow-400',
    processing: 'bg-blue-500 bg-opacity-20 text-blue-400',
    dispatched: 'bg-blue-500 bg-opacity-20 text-blue-400',
    delivered: 'bg-green-500 bg-opacity-20 text-green-400',
    cancelled: 'bg-red-500 bg-opacity-20 text-red-400',
  };
  return colors[status] || 'bg-text-muted bg-opacity-20 text-text-secondary';
};

const formatStatus = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

onMounted(async () => {
  try {
    const response = await fetch('/api/admin/analytics', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    const data = await response.json();
    if (data.success) {
      analytics.value = data.data;
    } else {
      error.value = data.error || 'Failed to load analytics';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
});
</script>
