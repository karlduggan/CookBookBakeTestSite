<template>
  <aside class="w-64 bg-white border-r border-text-muted h-screen overflow-y-auto shadow-md">
    <!-- Header -->
    <div class="p-6 border-b border-text-muted">
      <h1 class="text-2xl font-bold text-accent-teal">CBB Admin</h1>
      <p class="text-sm text-text-secondary mt-2">{{ userEmail }}</p>
    </div>

    <!-- Navigation Menu -->
    <nav class="p-4 space-y-2">
      <!-- Dashboard -->
      <a
        href="/admin"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
        :class="isActive('/admin') ? 'bg-primary-light-alt text-accent-teal' : 'text-text-secondary hover:bg-primary-light-alt'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4"></path>
        </svg>
        <span>Dashboard</span>
      </a>

      <!-- Books -->
      <a
        href="/admin/books"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
        :class="isActive('/admin/books') ? 'bg-primary-light-alt text-accent-teal' : 'text-text-secondary hover:bg-primary-light-alt'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path>
        </svg>
        <span>Books</span>
      </a>

      <!-- Orders -->
      <a
        href="/admin/orders"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
        :class="isActive('/admin/orders') ? 'bg-primary-light-alt text-accent-teal' : 'text-text-secondary hover:bg-primary-light-alt'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
        <span>Orders</span>
      </a>

      <!-- Categories -->
      <a
        href="/admin/categories"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
        :class="isActive('/admin/categories') ? 'bg-primary-light-alt text-accent-teal' : 'text-text-secondary hover:bg-primary-light-alt'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
        </svg>
        <span>Categories</span>
      </a>
    </nav>

    <!-- Divider -->
    <div class="my-4 border-t border-text-muted"></div>

    <!-- Account Section -->
    <nav class="p-4 space-y-2">
      <!-- Back to Shop -->
      <a
        href="/shop"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-primary-light-alt transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 110-18 9 9 0 010 18z"></path>
        </svg>
        <span>Shop</span>
      </a>

      <!-- Logout -->
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-primary-light-alt transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
        <span>Logout</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const userEmail = ref<string>('');
const currentPath = ref<string>(window.location.pathname);

const isActive = (path: string) => {
  return currentPath.value === path || currentPath.value.startsWith(path + '/');
};

const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      window.location.href = '/account/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error logging out');
  }
};

onMounted(async () => {
  try {
    const response = await fetch('/api/user/profile', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        userEmail.value = data.data.email;
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
});
</script>

<style scoped>
aside {
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
}
</style>
