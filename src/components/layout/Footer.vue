<template>
  <footer class="bg-white border-t border-text-muted mt-12 shadow-md">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Store Info -->
        <div>
          <h3 class="text-lg font-bold text-accent-teal mb-4">Cook Book Bake</h3>
          <p class="text-text-secondary text-sm mb-4">
            Brighton & Hove's Independent Specialist Cookbook Shop & Demonstration Kitchen
          </p>
          <div class="space-y-2 text-sm text-text-secondary">
            <p>
              <strong>Address:</strong><br>
              7 Victoria Terrace<br>
              Hove, BN3 2WB
            </p>
            <p>
              <strong>Phone:</strong><br>
              01273 779520
            </p>
            <p>
              <strong>Hours:</strong><br>
              Wed–Sun: 10am–6pm<br>
              Mon–Tue: Closed
            </p>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-bold text-accent-teal mb-4">Shop</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="/shop" class="text-text-secondary hover:text-accent-teal transition-colors">
                All Books
              </a>
            </li>
            <li>
              <a href="/shop?featured=true" class="text-text-secondary hover:text-accent-teal transition-colors">
                Featured
              </a>
            </li>
            <li>
              <a href="/shop?bestseller=true" class="text-text-secondary hover:text-accent-teal transition-colors">
                Bestsellers
              </a>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h4 class="text-lg font-bold text-accent-teal mb-4">Customer Service</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="/account/orders" class="text-text-secondary hover:text-accent-teal transition-colors">
                Order History
              </a>
            </li>
            <li>
              <a href="/account" class="text-text-secondary hover:text-accent-teal transition-colors">
                My Account
              </a>
            </li>
            <li>
              <a href="#" class="text-text-secondary hover:text-accent-teal transition-colors">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" class="text-text-secondary hover:text-accent-teal transition-colors">
                Returns Policy
              </a>
            </li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="text-lg font-bold text-accent-teal mb-4">Newsletter</h4>
          <p class="text-text-secondary text-sm mb-4">
            Subscribe to get updates on new cookbook releases and special offers.
          </p>
          <form @submit.prevent="handleNewsletter" class="space-y-2">
            <input
              v-model="email"
              type="email"
              placeholder="Your email"
              class="w-full px-4 py-2 bg-white text-text-primary border border-text-muted rounded"
              required
            />
            <button type="submit" class="btn-primary w-full text-center">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <!-- Social Links -->
      <div class="mt-8 pt-8 border-t border-text-muted">
        <div class="flex items-center justify-between">
          <p class="text-text-secondary text-sm">
            © 2024 Cook Book Bake. All rights reserved.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-text-secondary hover:text-accent-teal transition-colors" aria-label="Facebook">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.29 20v-7.75H5.5V8.5h2.79V6.41c0-2.76 1.69-4.27 4.16-4.27 1.18 0 2.2.09 2.49.13v2.88h-1.71c-1.34 0-1.6.64-1.6 1.57V8.5h3.2l-.42 3.75h-2.78V20" />
              </svg>
            </a>
            <a href="#" class="text-text-secondary hover:text-accent-teal transition-colors" aria-label="Instagram">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.72 10.24c0 1.34-.3 2.6-.83 3.74-.55 1.14-1.37 2.12-2.35 2.84-.98.72-2.1 1.16-3.33 1.29-1.23.13-2.48-.08-3.59-.6-1.11-.52-2.04-1.32-2.71-2.3-.67-.98-1.09-2.13-1.22-3.35-.13-1.22.08-2.47.6-3.58.52-1.11 1.32-2.04 2.3-2.71.98-.67 2.13-1.09 3.35-1.22 1.22-.13 2.47.08 3.58.6 1.11.52 2.04 1.32 2.71 2.3.67.98 1.09 2.13 1.22 3.35.13 1.22-.08 2.47-.6 3.58z" />
              </svg>
            </a>
            <a href="#" class="text-text-secondary hover:text-accent-teal transition-colors" aria-label="Twitter">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M19 3.795c-.705.305-1.46.51-2.252.602.81-.487 1.414-1.26 1.703-2.18-.758.453-1.596.743-2.487.91-.715-.762-1.73-1.24-2.855-1.24-2.159 0-3.905 1.746-3.905 3.905 0 .306.036.604.105.889C6.328 6.61 3.816 5.252 2.15 3.1c-.336.577-.527 1.25-.527 1.97 0 1.356.691 2.551 1.74 3.252-.642-.02-1.245-.196-1.77-.49v.049c0 1.891 1.345 3.465 3.125 3.824-.327.09-.672.137-1.026.137-.251 0-.494-.024-.732-.068.495 1.545 1.931 2.671 3.625 2.703-1.336 1.044-3.017 1.666-4.844 1.666-.314 0-.625-.018-.931-.055 1.743 1.117 3.814 1.767 6.04 1.767 7.247 0 11.195-6.002 11.195-11.195 0-.171-.004-.34-.012-.508.769-.555 1.434-1.25 1.96-2.043z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');

const handleNewsletter = () => {
  // Stub: In production, this would send to an email service
  console.log('Newsletter subscription:', email.value);
  email.value = '';
};
</script>

<style scoped>
/* Component styles can be added here if needed */
</style>
