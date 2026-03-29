import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverImageUrl?: string;
  stockAvailable: number;
}

export interface CartStore {
  items: CartItem[];
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([]);

  // Initialize items (Pinia plugin will hydrate from localStorage)
  // Note: localStorage loading is now handled by entry.client.ts plugin

  // Getters
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  const shipping = computed(() => {
    // Free shipping on orders over £30
    return subtotal.value >= 30 ? 0 : 5.99;
  });

  const tax = computed(() => {
    // UK VAT is 20%
    return (subtotal.value + shipping.value) * 0.2;
  });

  const total = computed(() => {
    return subtotal.value + shipping.value + tax.value;
  });

  // Actions
  const addItem = (book: CartItem) => {
    const existing = items.value.find((item) => item.bookId === book.bookId);

    if (existing) {
      // Increase quantity but respect stock limit
      existing.quantity = Math.min(existing.quantity + 1, book.stockAvailable);
      console.log('[Cart] Updated item quantity:', book.title, 'qty:', existing.quantity);
    } else {
      // Add new item
      items.value.push({
        ...book,
        quantity: 1,
      });
      console.log('[Cart] Added item:', book.title, 'items now:', items.value.length);
    }

    persist();
  };

  const removeItem = (bookId: string) => {
    const removed = items.value.find((item) => item.bookId === bookId);
    if (removed) {
      console.log('[Cart] Removed item:', removed.title, 'items remaining:', items.value.length - 1);
    }
    items.value = items.value.filter((item) => item.bookId !== bookId);
    persist();
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    const item = items.value.find((item) => item.bookId === bookId);

    if (!item) return;

    // Validate quantity
    if (quantity < 1) {
      removeItem(bookId);
      return;
    }

    const oldQty = item.quantity;
    if (quantity > item.stockAvailable) {
      item.quantity = item.stockAvailable;
    } else {
      item.quantity = quantity;
    }

    console.log('[Cart] Updated quantity for', item.title, 'from', oldQty, 'to', item.quantity);
    persist();
  };

  const clear = () => {
    items.value = [];
    persist();
  };

  const persist = () => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('cart', JSON.stringify(items.value));
      } catch (e) {
        console.error('[Cart Store] Failed to persist:', e);
      }
    }
  };

  const hydrate = () => {
    if (typeof window !== 'undefined' && localStorage) {
      try {
        const saved = localStorage.getItem('cart');
        if (saved) {
          const data = JSON.parse(saved);
          if (Array.isArray(data)) {
            items.value = data;
            console.log('[Cart Store] Hydrated from localStorage, items:', data.length);
          }
        }
      } catch (e) {
        console.error('[Cart Store] Failed to hydrate:', e);
      }
    }
  };

  const isInCart = (bookId: string) => {
    return items.value.some((item) => item.bookId === bookId);
  };

  return {
    // State
    items,

    // Getters
    itemCount,
    subtotal,
    shipping,
    tax,
    total,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clear,
    persist,
    hydrate,
    isInCart,
  };
});
