# Stripe Checkout Implementation Fix

## Problem
The "Proceed to Payment" button on the checkout page was disabled (greyed out) despite users filling in shipping details and agreeing to terms and conditions. The button had `disabled="isLoading || !hasItems"` binding, indicating the cart appeared empty.

## Root Cause Analysis

### Primary Issue: Cart State Not Persisting Across Vue Islands
The checkout page has two separate Vue components using `client:load` directive:
- `CheckoutForm` - Collects shipping details and initiates payment
- `OrderSummary` - Displays cart items and totals

With `client:load`, each component becomes a separate Vue "island" that can potentially have:
1. **Separate Pinia Store Instances**: Due to how Vue handles hydration, multiple `client:load` components might initialize their own Pinia instances, breaking state sharing
2. **localStorage Initialization Race Conditions**: Both components try to load cart from localStorage independently, potentially before data is available
3. **No Guaranteed Synchronization**: Changes in one island (removing items, updating quantities) wouldn't properly update the other island's view

### Secondary Issues: Environment Variables & Stripe Configuration
1. **Stripe Secret Key Not Loaded**: `src/lib/api-utils/stripe.js` was using `process.env.STRIPE_SECRET_KEY` instead of `import.meta.env.STRIPE_SECRET_KEY` (required for Astro server code)
2. **Missing Site URL Configuration**: `src/pages/api/checkout/create-session.js` was using undefined `process.env.PUBLIC_SITE_URL` without fallbacks

## Solution Implemented

### 1. Centralized Pinia Persistence with Plugin (entry.client.ts)
Created a Pinia plugin that:
- **Restores cart from localStorage on initialization**: Before any component runs, the plugin hydrates cart state
- **Auto-persists changes**: Subscribes to all cart mutations and saves to localStorage automatically
- **Provides console logging**: Debug logs show when cart is restored/persisted
- **Works across all Vue islands**: Since the plugin runs once for the entire app, all components share the same state

```typescript
pinia.use(({ store }) => {
  if (store.$id === 'cart') {
    // Restore on init
    const saved = localStorage.getItem('cart');
    if (saved) {
      store.$patch({ items: JSON.parse(saved) });
    }

    // Auto-persist on changes
    store.$subscribe((mutation, state) => {
      localStorage.setItem('cart', JSON.stringify(state.items));
    });
  }
});
```

### 2. Unified Store Access (useCart Composable)
All components now use a consistent safe accessor:
```typescript
import { useCart } from '../../composables/useCart';
const cart = useCart();
```

Instead of directly importing `useCartStore`, this provides:
- **Error handling**: Gracefully handles Pinia initialization issues
- **Guaranteed initialization**: Ensures Pinia is ready before store access
- **Single point of maintenance**: Easy to update how components access cart state

### 3. Enhanced Component Initialization
Updated components to properly initialize cart state on mount:

**CheckoutForm.vue**:
- Calls `cart.hydrate()` on mount to force localStorage restoration
- Logs cart state: items count, items array, raw localStorage value
- Computed property `hasItems` now includes debug logging

**OrderSummary.vue**:
- Calls `cart.hydrate()` on mount
- Logs items count and full items array
- Both ensure cart is properly loaded before rendering

### 4. Consistent Component Updates
Updated all components to use the new pattern:
- ✅ `CheckoutForm.vue` - Uses useCart composable
- ✅ `OrderSummary.vue` - Uses useCart composable with hydrate() call
- ✅ `CartSummary.vue` - Uses useCart composable
- ✅ `OrderTotals.vue` - Uses useCart composable
- ✅ `BookDetailClient.vue` - Uses useCart composable
- ✅ `BookCard.vue` - Uses useCart composable
- ✅ `CartDrawer.vue` - Uses useCart composable
- ✅ `NavigationBar.vue` - Uses useCart composable with improved cart count logic

### 5. Simplified Cart Store (cart.ts)
- Removed duplicate localStorage initialization code that ran at module load time
- Relies on Pinia plugin for restoration (single source of truth)
- Keeps `hydrate()` method for manual refresh if needed
- Keeps `persist()` method for direct save operations

## Testing the Fix

### To verify the fix works:

1. **Add items to cart** on the shop or product detail page
2. **Check browser DevTools Console** for:
   ```
   [Pinia Plugin] Restored cart from localStorage: [...]
   [CheckoutForm] Mounted
   [CheckoutForm] Cart items from store: 1
   [OrderSummary] Mounted with items: 1
   ```

3. **Navigate to checkout page** and verify:
   - Blue debug box shows "Cart has X item(s) - Total: £Y"
   - "Proceed to Payment" button is **enabled** (not greyed out)
   - Order summary shows cart items and correct totals

4. **Remove items from checkout** and verify:
   - Items are removed from both the list and totals update immediately
   - Cart counter in header updates

### Debug Console Messages

When everything works correctly, you'll see:
```
[Pinia Plugin] Restored cart from localStorage: [{bookId: "...", title: "...", ...}]
[Pinia Plugin] Persisted cart to localStorage, items: 2
[CheckoutForm] Mounted
[CheckoutForm] Cart items from store: 2
[CheckoutForm] Cart items: [{...}, {...}]
[CheckoutForm] Cart total: 35.98
[CheckoutForm] localStorage cart: "[...]"
[OrderSummary] Mounted with items: 2
[NavigationBar] Cart count updated: 2
```

## Files Modified

1. **src/entry.client.ts** - Added Pinia persistence plugin
2. **src/stores/cart.ts** - Simplified, relies on plugin for restoration
3. **src/composables/useCart.ts** - No changes (already existed)
4. **src/components/checkout/CheckoutForm.vue** - Enhanced debugging, uses useCart
5. **src/components/checkout/OrderSummary.vue** - Added hydrate() call, uses useCart
6. **src/components/checkout/CartSummary.vue** - Uses useCart
7. **src/components/checkout/OrderTotals.vue** - Uses useCart
8. **src/components/shop/BookDetailClient.vue** - Uses useCart
9. **src/components/shop/BookCard.vue** - Uses useCart
10. **src/components/cart/CartDrawer.vue** - Uses useCart
11. **src/components/layout/NavigationBar.vue** - Uses useCart with improved counter logic

## Stripe Configuration Status

The Stripe integration files are now correctly set up:
- ✅ `src/lib/api-utils/stripe.js` - Uses `import.meta.env.STRIPE_SECRET_KEY`
- ✅ `src/pages/api/checkout/create-session.js` - Uses `import.meta.env.PUBLIC_SITE_URL` with fallbacks
- ✅ Environment variables are properly configured in `.env.local`

## Next Steps

1. Clear browser localStorage (`localStorage.clear()` in DevTools console)
2. Start the dev server: `npm run dev`
3. Add items to cart
4. Navigate to checkout and verify button is enabled
5. Proceed with payment flow testing

If issues persist, check:
- Browser console for error messages
- That `.env.local` contains required variables
- That `npm install` was run after package updates
