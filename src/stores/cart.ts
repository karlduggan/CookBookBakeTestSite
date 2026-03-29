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

  // Load from localStorage on init
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        items.value = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }

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
    } else {
      // Add new item
      items.value.push({
        ...book,
        quantity: 1,
      });
    }

    persist();
  };

  const removeItem = (bookId: string) => {
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

    if (quantity > item.stockAvailable) {
      item.quantity = item.stockAvailable;
    } else {
      item.quantity = quantity;
    }

    persist();
  };

  const clear = () => {
    items.value = [];
    persist();
  };

  const persist = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items.value));
    }
  };

  const hydrate = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          items.value = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to hydrate cart:', e);
        }
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
