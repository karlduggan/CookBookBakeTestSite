<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- Sidebar Navigation -->
    <div class="lg:col-span-1">
      <div class="bg-white rounded-lg p-6 border border-text-muted sticky top-24 shadow-md">
        <!-- User Info -->
        <div v-if="auth.user" class="mb-6 pb-6 border-b border-text-muted">
          <p class="text-sm text-text-secondary mb-1">Signed in as</p>
          <p class="font-bold text-text-primary">{{ auth.user.firstName }} {{ auth.user.lastName }}</p>
          <p class="text-sm text-text-secondary">{{ auth.user.email }}</p>
        </div>

        <!-- Loading State -->
        <div v-else class="mb-6 pb-6 border-b border-text-muted">
          <p class="text-text-secondary">Loading...</p>
        </div>

        <!-- Navigation Menu -->
        <nav class="space-y-2">
          <button
            @click="currentTab = 'profile'"
            :class="[
              'w-full text-left px-4 py-2 rounded-lg transition-colors',
              currentTab === 'profile'
                ? 'bg-accent-teal text-white font-bold'
                : 'text-text-secondary hover:bg-primary-light-alt',
            ]"
          >
            👤 Profile
          </button>

          <button
            @click="currentTab = 'orders'"
            :class="[
              'w-full text-left px-4 py-2 rounded-lg transition-colors',
              currentTab === 'orders'
                ? 'bg-accent-teal text-white font-bold'
                : 'text-text-secondary hover:bg-primary-light-alt',
            ]"
          >
            📦 Orders
          </button>

          <button
            @click="currentTab = 'addresses'"
            :class="[
              'w-full text-left px-4 py-2 rounded-lg transition-colors',
              currentTab === 'addresses'
                ? 'bg-accent-teal text-white font-bold'
                : 'text-text-secondary hover:bg-primary-light-alt',
            ]"
          >
            📍 Addresses
          </button>

          <button
            @click="currentTab = 'settings'"
            :class="[
              'w-full text-left px-4 py-2 rounded-lg transition-colors',
              currentTab === 'settings'
                ? 'bg-accent-teal text-white font-bold'
                : 'text-text-secondary hover:bg-primary-light-alt',
            ]"
          >
            ⚙️ Settings
          </button>
        </nav>

        <!-- Logout Button -->
        <button
          @click="handleLogout"
          class="w-full mt-6 px-4 py-2 bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30 rounded-lg transition-colors font-semibold"
        >
          Sign Out
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="lg:col-span-3">
      <!-- Profile Tab -->
      <div v-if="currentTab === 'profile'" class="bg-white rounded-lg p-8 border border-text-muted shadow-md">
        <h2 class="text-2xl font-bold text-accent-teal mb-6">Profile Information</h2>

        <div v-if="auth.user" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-text-primary mb-2">First Name</label>
              <input
                type="text"
                :value="auth.user.firstName"
                disabled
                class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-secondary"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-text-primary mb-2">Last Name</label>
              <input
                type="text"
                :value="auth.user.lastName"
                disabled
                class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-secondary"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-primary mb-2">Email</label>
            <input
              type="email"
              :value="auth.user.email"
              disabled
              class="w-full px-4 py-2 bg-primary-light-alt border border-text-muted rounded-lg text-text-secondary"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-primary mb-2">Member Since</label>
            <p class="text-text-secondary">
              {{ new Date().toLocaleDateString() }}
            </p>
          </div>

          <button
            @click="currentTab = 'settings'"
            class="btn-primary py-2 px-4"
          >
            Edit Settings
          </button>
        </div>
      </div>

      <!-- Orders Tab -->
      <div v-if="currentTab === 'orders'" class="bg-white rounded-lg p-8 border border-text-muted shadow-md">
        <h2 class="text-2xl font-bold text-accent-teal mb-6">Order History</h2>

        <div v-if="isLoadingOrders" class="text-center py-8">
          <p class="text-text-secondary">Loading orders...</p>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-8">
          <p class="text-text-secondary mb-4">No orders yet</p>
          <a href="/shop" class="btn-primary py-2 px-4 inline-block">Start Shopping</a>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="border border-text-muted rounded-lg p-4 hover:border-accent-teal transition-colors"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-text-primary">Order #{{ order.orderNumber }}</p>
                <p class="text-sm text-text-secondary">{{ formatDate(order.createdAt) }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-accent-teal">£{{ order.totalAmount.toFixed(2) }}</p>
                <p
                  :class="[
                    'text-sm font-semibold',
                    order.status === 'delivered' ? 'text-green-400' : 'text-yellow-500',
                  ]"
                >
                  {{ formatStatus(order.status) }}
                </p>
              </div>
            </div>

            <p class="text-sm text-text-secondary mt-2">{{ order.itemCount }} item(s)</p>
          </div>
        </div>
      </div>

      <!-- Addresses Tab -->
      <div v-if="currentTab === 'addresses'" class="bg-white rounded-lg p-8 border border-text-muted shadow-md">
        <h2 class="text-2xl font-bold text-accent-teal mb-6">Delivery Addresses</h2>

        <div v-if="isLoadingAddresses" class="text-center py-8">
          <p class="text-text-secondary">Loading addresses...</p>
        </div>

        <div v-else-if="addresses.length === 0" class="text-center py-8">
          <p class="text-text-secondary mb-4">No saved addresses</p>
          <button @click="showAddAddressForm = true" class="btn-primary py-2 px-4">Add Address</button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="address in addresses"
            :key="address.id"
            class="border border-text-muted rounded-lg p-4"
          >
            <p class="font-bold text-text-primary">{{ address.address_line1 }}</p>
            <p v-if="address.address_line2" class="text-text-secondary">{{ address.address_line2 }}</p>
            <p class="text-text-secondary">{{ address.city }}, {{ address.postcode }}</p>
            <p class="text-sm text-text-secondary">{{ address.country }}</p>

            <div class="mt-4 flex gap-2">
              <button class="text-sm text-accent-teal hover:text-accent-teal-dark">Edit</button>
              <button @click="deleteAddress(address.id)" class="text-sm text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>

          <button @click="showAddAddressForm = true" class="btn-secondary py-2 px-4 w-full mt-6">
            Add Another Address
          </button>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="currentTab === 'settings'" class="bg-white rounded-lg p-8 border border-text-muted shadow-md">
        <h2 class="text-2xl font-bold text-accent-teal mb-6">Account Settings</h2>

        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-bold text-text-primary mb-4">Change Password</h3>
            <p class="text-text-secondary mb-4">Password changes coming soon</p>
          </div>

          <div class="border-t border-text-muted pt-6">
            <h3 class="text-lg font-bold text-text-primary mb-4">Email Notifications</h3>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" checked class="w-4 h-4 rounded border-text-muted bg-white" />
              <span class="ml-3 text-text-secondary">Order updates</span>
            </label>
          </div>

          <div class="border-t border-text-muted pt-6">
            <h3 class="text-lg font-bold text-text-primary mb-4">Danger Zone</h3>
            <button
              class="px-4 py-2 bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30 rounded-lg transition-colors font-semibold"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface Address {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  country: string;
}

let auth: any = null;
const currentTab = ref('profile');
const orders = ref<Order[]>([]);
const addresses = ref<Address[]>([]);
const isLoadingOrders = ref(false);
const isLoadingAddresses = ref(false);
const showAddAddressForm = ref(false);

const handleLogout = async () => {
  if (!auth) return;
  await auth.logout();
  window.location.href = '/account/login';
};

const loadOrders = async () => {
  isLoadingOrders.value = true;
  try {
    const response = await fetch('/api/user/orders', {
      credentials: 'include',
    });
    const data = await response.json();

    if (data.success) {
      orders.value = data.data.orders;
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
  } finally {
    isLoadingOrders.value = false;
  }
};

const loadAddresses = async () => {
  isLoadingAddresses.value = true;
  try {
    const response = await fetch('/api/user/addresses', {
      credentials: 'include',
    });
    const data = await response.json();

    if (data.success) {
      addresses.value = data.data.addresses;
    }
  } catch (error) {
    console.error('Failed to load addresses:', error);
  } finally {
    isLoadingAddresses.value = false;
  }
};

const deleteAddress = async (addressId: string) => {
  if (!confirm('Are you sure you want to delete this address?')) return;

  try {
    const response = await fetch(`/api/user/addresses?id=${addressId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      await loadAddresses();
    }
  } catch (error) {
    console.error('Failed to delete address:', error);
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending Payment',
    payment_received: 'Processing',
    dispatched: 'Dispatched',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

onMounted(async () => {
  // Lazy load auth store on mount
  if (!auth) {
    const { useAuthStore } = await import('../../stores/auth');
    auth = useAuthStore();
  }

  await auth.checkAuth();

  if (!auth.isAuthenticated) {
    window.location.href = '/account/login';
    return;
  }

  // Load data for tabs when they're accessed
  loadOrders();
  loadAddresses();
});
</script>

<style scoped>
/* Component styles */
</style>
