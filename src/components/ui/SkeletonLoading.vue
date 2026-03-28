<template>
  <!-- Book Card Skeleton -->
  <div v-if="type === 'book-card'" class="bg-white rounded-lg overflow-hidden border border-text-muted p-4 animate-pulse shadow-md">
    <div class="aspect-video bg-primary-light-alt rounded mb-4"></div>
    <div class="space-y-3">
      <div class="h-4 bg-primary-light-alt rounded w-3/4"></div>
      <div class="h-3 bg-primary-light-alt rounded w-1/2"></div>
      <div class="h-3 bg-primary-light-alt rounded w-full"></div>
      <div class="flex gap-2 pt-2">
        <div class="h-3 bg-primary-light-alt rounded flex-1"></div>
        <div class="h-3 bg-primary-light-alt rounded flex-1"></div>
      </div>
    </div>
  </div>

  <!-- Book Grid Skeleton -->
  <div v-else-if="type === 'book-grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="i in 8" :key="i" class="bg-white rounded-lg overflow-hidden border border-text-muted p-4 animate-pulse shadow-md">
      <div class="aspect-video bg-primary-light-alt rounded mb-4"></div>
      <div class="space-y-3">
        <div class="h-4 bg-primary-light-alt rounded w-3/4"></div>
        <div class="h-3 bg-primary-light-alt rounded w-1/2"></div>
        <div class="h-3 bg-primary-light-alt rounded w-full"></div>
        <div class="flex gap-2 pt-2">
          <div class="h-3 bg-primary-light-alt rounded flex-1"></div>
          <div class="h-3 bg-primary-light-alt rounded flex-1"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Table Row Skeleton -->
  <tr v-else-if="type === 'table-row'" class="border-b border-text-muted">
    <td class="py-3 px-4">
      <div class="h-4 bg-primary-light-alt rounded w-3/4 animate-pulse"></div>
    </td>
    <td class="py-3 px-4">
      <div class="h-4 bg-primary-light-alt rounded w-1/2 animate-pulse"></div>
    </td>
    <td class="py-3 px-4">
      <div class="h-4 bg-primary-light-alt rounded w-2/3 animate-pulse"></div>
    </td>
    <td class="py-3 px-4">
      <div class="h-4 bg-primary-light-alt rounded w-1/4 animate-pulse"></div>
    </td>
  </tr>

  <!-- Text Block Skeleton -->
  <div v-else-if="type === 'text-block'" class="space-y-3">
    <div class="h-4 bg-primary-light-alt rounded w-full animate-pulse"></div>
    <div class="h-4 bg-primary-light-alt rounded w-5/6 animate-pulse"></div>
    <div class="h-4 bg-primary-light-alt rounded w-4/6 animate-pulse"></div>
  </div>

  <!-- Page Header Skeleton -->
  <div v-else-if="type === 'page-header'" class="space-y-3 animate-pulse">
    <div class="h-8 bg-primary-light-alt rounded w-1/2"></div>
    <div class="h-4 bg-primary-light-alt rounded w-2/3"></div>
  </div>

  <!-- Form Input Skeleton -->
  <div v-else-if="type === 'form-input'" class="space-y-2">
    <div class="h-4 bg-primary-light-alt rounded w-1/4 animate-pulse"></div>
    <div class="h-10 bg-primary-light-alt rounded animate-pulse"></div>
  </div>

  <!-- Generic Box Skeleton -->
  <div v-else class="bg-white rounded-lg p-6 animate-pulse shadow-md">
    <div class="space-y-4">
      <div class="h-4 bg-primary-light-alt rounded w-1/3"></div>
      <div class="h-4 bg-primary-light-alt rounded w-full"></div>
      <div class="h-4 bg-primary-light-alt rounded w-4/5"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'book-card' | 'book-grid' | 'table-row' | 'text-block' | 'page-header' | 'form-input' | 'box';
}

defineProps<Props>();
</script>
