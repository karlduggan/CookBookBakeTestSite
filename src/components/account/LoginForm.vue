<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Email Input -->
    <div>
      <label for="email" class="block text-sm font-semibold text-text-primary mb-2">
        Email Address
      </label>
      <input
        v-model="form.email"
        type="email"
        id="email"
        placeholder="you@example.com"
        class="w-full px-4 py-3 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- Password Input -->
    <div>
      <label for="password" class="block text-sm font-semibold text-text-primary mb-2">
        Password
      </label>
      <input
        v-model="form.password"
        type="password"
        id="password"
        placeholder="••••••••"
        class="w-full px-4 py-3 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
      <a href="/account/reset-password" class="text-sm text-accent-teal hover:text-accent-teal-dark mt-2 inline-block">
        Forgot password?
      </a>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
      {{ error }}
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="isLoading" class="inline-block mr-2">Loading...</span>
      <span v-else>Sign In</span>
    </button>

    <!-- Register Link -->
    <div class="text-center">
      <p class="text-text-secondary">
        Don't have an account?
        <a href="/account/register" class="text-accent-teal hover:text-accent-teal-dark font-semibold">
          Sign up
        </a>
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const form = ref({
  email: '',
  password: '',
});

const error = ref<string | null>(null);
const isLoading = ref(false);

const handleSubmit = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    // Lazy load store only when needed
    const { useAuthStore } = await import('../../stores/auth');
    const auth = useAuthStore();

    const success = await auth.login(form.value.email, form.value.password);

    if (success) {
      // Redirect to account dashboard
      window.location.href = '/account';
    } else {
      error.value = auth.error || 'Login failed';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Component styles */
</style>
