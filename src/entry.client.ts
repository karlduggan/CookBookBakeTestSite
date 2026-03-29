import { createPinia } from 'pinia';

export default (app) => {
  const pinia = createPinia();

  // Add a plugin to persist cart store to localStorage
  pinia.use(({ store }) => {
    if (store.$id === 'cart') {
      // Hydrate from localStorage on init
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          store.$patch({ items: data });
          console.log('[Pinia Plugin] Restored cart from localStorage:', data);
        } catch (e) {
          console.error('[Pinia Plugin] Failed to restore cart:', e);
        }
      }

      // Subscribe to changes and persist to localStorage
      store.$subscribe(
        (mutation, state) => {
          localStorage.setItem('cart', JSON.stringify(state.items));
          console.log('[Pinia Plugin] Persisted cart to localStorage, items:', state.items.length);
        },
        { detached: true }
      );
    }
  });

  app.use(pinia);
};
