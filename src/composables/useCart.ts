import { useCartStore } from '../stores/cart';

/**
 * Safe composable to get the cart store
 * Handles the case where Pinia might not be fully initialized
 */
export function useCart() {
  try {
    const cart = useCartStore();
    return cart;
  } catch (error) {
    console.error('[useCart] Error accessing cart store:', error);
    console.warn('[useCart] Pinia might not be initialized. Attempting to initialize manually...');

    // Fallback: try to access store again after a micro-task
    // This gives Pinia time to initialize
    if (typeof window !== 'undefined') {
      try {
        // Force synchronous access - if Pinia is available, this will work
        const cart = useCartStore();
        console.log('[useCart] Successfully accessed cart store on retry');
        return cart;
      } catch (retryError) {
        console.error('[useCart] Retry failed:', retryError);
        throw new Error('Cart store not available. Please refresh the page.');
      }
    }

    throw error;
  }
}
