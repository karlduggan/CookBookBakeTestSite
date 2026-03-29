import { useCartStore } from '../stores/cart';

/**
 * Safe composable to get the cart store
 * Ensures Pinia is initialized before accessing the store
 */
export function useCart() {
  try {
    const cart = useCartStore();
    return cart;
  } catch (error) {
    console.error('[useCart] Error accessing cart store:', error);
    throw new Error('Cart store not available. Please refresh the page.');
  }
}
