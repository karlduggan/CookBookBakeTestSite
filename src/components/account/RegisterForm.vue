<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- First Name -->
    <div>
      <label for="firstName" class="block text-sm font-semibold text-text-primary mb-2">
        First Name
      </label>
      <input
        v-model="form.firstName"
        type="text"
        id="firstName"
        placeholder="John"
        class="w-full px-4 py-3 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- Last Name -->
    <div>
      <label for="lastName" class="block text-sm font-semibold text-text-primary mb-2">
        Last Name
      </label>
      <input
        v-model="form.lastName"
        type="text"
        id="lastName"
        placeholder="Doe"
        class="w-full px-4 py-3 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

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
      <p class="text-xs text-text-secondary mt-2">
        Minimum 8 characters, uppercase, lowercase, and number required
      </p>
    </div>

    <!-- Confirm Password -->
    <div>
      <label for="confirmPassword" class="block text-sm font-semibold text-text-primary mb-2">
        Confirm Password
      </label>
      <input
        v-model="form.confirmPassword"
        type="password"
        id="confirmPassword"
        placeholder="••••••••"
        class="w-full px-4 py-3 bg-white border border-text-muted rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal transition-colors"
        required
      />
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400">
      {{ error }}
    </div>

    <!-- Terms Agreement -->
    <label class="flex items-start cursor-pointer">
      <input
        v-model="form.agreedToTerms"
        type="checkbox"
        class="mt-1 w-4 h-4 rounded border-text-muted bg-white"
        required
      />
      <span class="ml-3 text-sm text-text-secondary">
        I agree to the
        <a href="#" class="text-accent-teal hover:text-accent-teal-dark">Terms of Service</a>
        and
        <a href="#" class="text-accent-teal hover:text-accent-teal-dark">Privacy Policy</a>
      </span>
    </label>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="isLoading" class="inline-block mr-2">Creating Account...</span>
      <span v-else>Sign Up</span>
    </button>

    <!-- Login Link -->
    <div class="text-center">
      <p class="text-text-secondary">
        Already have an account?
        <a href="/account/login" class="text-accent-teal hover:text-accent-blue font-semibold">
          Sign in
        </a>
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
});

const error = ref<string | null>(null);
const isLoading = ref(false);

const handleSubmit = async () => {
  // Validate form
  if (!form.value.firstName.trim()) {
    error.value = 'First name is required';
    return;
  }

  if (!form.value.lastName.trim()) {
    error.value = 'Last name is required';
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  if (!form.value.agreedToTerms) {
    error.value = 'You must agree to the terms and conditions';
    return;
  }

  error.value = null;
  isLoading.value = true;

  try {
    // Lazy load store only when needed
    const { useAuthStore } = await import('../../stores/auth');
    const auth = useAuthStore();

    const success = await auth.register(
      form.value.email,
      form.value.password,
      form.value.firstName,
      form.value.lastName
    );

    if (success) {
      // Redirect to account dashboard
      window.location.href = '/account';
    } else {
      error.value = auth.error || 'Registration failed';
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
