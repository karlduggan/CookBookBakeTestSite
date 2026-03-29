import { createPinia } from 'pinia';

export default (app) => {
  const pinia = createPinia();

  // Add a plugin to persist cart store to localStorage
  pinia.use(({ store }) => {
    if (store.$id === 'cart') {
      // Hydrate from localStorage on init (if in browser)
      if (typeof window !== 'undefined' && localStorage) {
        try {
          const saved = localStorage.getItem('cart');
          if (saved) {
            const data = JSON.parse(saved);
            if (data && Array.isArray(data)) {
              store.$patch({ items: data });
              console.log('[Pinia Plugin] Restored cart from localStorage, items:', data.length);
            }
          }
        } catch (e) {
          console.error('[Pinia Plugin] Failed to restore cart from localStorage:', e);
        }
      }

      // Subscribe to changes and persist to localStorage
      store.$subscribe(
        (mutation, state) => {
          if (typeof window !== 'undefined' && localStorage) {
            try {
              localStorage.setItem('cart', JSON.stringify(state.items));
              console.log('[Pinia Plugin] Persisted cart to localStorage, items:', state.items.length);
            } catch (e) {
              console.error('[Pinia Plugin] Failed to persist cart:', e);
            }
          }
        },
        { detached: true }
      );
    }
  });

  app.use(pinia);
};
