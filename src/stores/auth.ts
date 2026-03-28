import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAdmin = computed(() => user.value?.isAdmin || false);

  const fullName = computed(() => {
    if (!user.value) return '';
    return `${user.value.firstName} ${user.value.lastName}`.trim();
  });

  // Actions
  const checkAuth = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch('/api/user/profile');

      if (response.ok) {
        user.value = await response.json();
        isAuthenticated.value = true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Send cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      await checkAuth();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      error.value = message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      error.value = message;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      user.value = null;
      isAuthenticated.value = false;
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear local state even if logout fails
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Getters
    isAdmin,
    fullName,

    // Actions
    checkAuth,
    login,
    register,
    logout,
    clearError,
  };
});
