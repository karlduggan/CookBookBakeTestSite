# Cook Book Bake - Troubleshooting & Fix Documentation

## Cart Counter Not Updating in Real-Time

### Problem
When clicking "Add to Cart" on a product page, the item was added to the cart but the counter badge in the navigation bar wouldn't update until the page was refreshed.

### Root Cause
Astro's SSR + hydration model creates separate Vue component instances on the server and client. The NavigationBar and BookDetailClient components, while both having `client:load` directives, were not properly sharing the same Pinia store instance. This caused store updates in BookDetailClient to not reactively update the NavigationBar counter.

### Solution
Implemented a **hybrid approach combining Pinia + localStorage + window events**:

1. **NavigationBar** (`src/components/layout/NavigationBar.vue`):
   - Reads cart count directly from localStorage on `onMounted`
   - Listens for custom 'cart-updated' window event
   - Updates counter by reading cart data from localStorage instead of relying on Pinia reactivity alone

2. **BookDetailClient** (`src/components/shop/BookDetailClient.vue`):
   - After modifying the cart (add/remove), dispatches a custom `cart-updated` event
   - This event is captured by NavigationBar to trigger a counter refresh

### Code References
- **NavigationBar counter update**: Uses `localStorage.getItem('cart')` and window event listener
- **BookDetailClient cart modification**: Dispatches `window.dispatchEvent(new Event('cart-updated'))` after cart changes
- **Cart Store**: `src/stores/cart.ts` - Persists to localStorage via `persist()` action

### Why This Works
- localStorage is the source of truth for cart data (persisted across page loads)
- Window events provide cross-component communication without requiring shared Pinia instances
- This approach is resilient to Astro's hydration model and component isolation

### If It Breaks Again
1. Check browser console for errors related to 'cart-updated' event
2. Verify localStorage contains cart data: `localStorage.getItem('cart')`
3. Check that both components are being hydrated: look for `client:load` directives
4. Ensure `onMounted` hooks are executing by adding console.log statements

---

## PDP Page Not Loading / "Add to Cart" Button Missing

### Problem
Product detail pages (PDP) were throwing 500 errors and the "Add to Cart" button wasn't rendering.

### Root Cause #1: Environment Variables Not Accessible in Server Code
The API route (`src/pages/api/book/[id].js`) was using `process.env.SUPABASE_URL` and `process.env.SUPABASE_ANON_KEY`, but Astro's server-side code requires `import.meta.env` instead.

**Fix**: Changed `src/lib/api-utils/supabase.js` from:
```javascript
const supabaseUrl = process.env.SUPABASE_URL;
```
to:
```javascript
const supabaseUrl = import.meta.env.SUPABASE_URL;
```

### Root Cause #2: Missing `isInCart` Method
BookDetailClient was calling `cart.isInCart(props.bookId)` but the method didn't exist on the cart store, causing a JavaScript error during component rendering.

**Fix**: Added `isInCart` method to `src/stores/cart.ts`:
```typescript
const isInCart = (bookId: string) => {
  return items.value.some((item) => item.bookId === bookId);
};
```

### Code References
- **Supabase client**: `src/lib/api-utils/supabase.js` (use `import.meta.env`, not `process.env`)
- **Cart store methods**: `src/stores/cart.ts` - ensure all methods used by components are exported

### If It Breaks Again
1. Check dev server logs for "Missing Supabase environment variables" errors
2. Verify environment variables are in `.env.local`
3. Check browser console for errors in BookDetailClient component
4. Ensure cart store exports all methods used by components

---

## Book Cover Images Not Loading / Broken Image URLs

### Problem
PDPs were trying to load placeholder images from `https://via.placeholder.com/...` which failed with `net::ERR_NAME_NOT_RESOLVED`.

### Root Cause
The database seed data didn't include `cover_image_url` values for books. When books were manually added with broken placeholder URLs, they wouldn't load.

### Solution
Updated `database/seed.sql` to include working Unsplash image URLs for all books. Created a `reseed.js` script to reset the database and reload books with proper images.

### Code References
- **Seed data**: `database/seed.sql` - contains 10 books with Unsplash image URLs
- **Reseed script**: Was temporary (`reseed.js`), but documented here for future use

### If It Breaks Again
1. Check that books in database have valid `cover_image_url` values
2. If adding new books, use real image URLs (Unsplash, Cloudinary, etc.)
3. Don't use `https://via.placeholder.com/` URLs - they don't resolve in all environments

---

## Order Summary Totals Not Updating on Checkout Page

### Problem
On the checkout page, when removing items from the cart or changing quantities, the order summary (subtotal, shipping, tax, total) wouldn't update. The CartSummary would update but the OrderTotals stayed the same.

### Root Cause
**Astro Vue island isolation**: CartSummary and OrderTotals were separate Vue components with `client:load` directives, meaning they were rendered as separate Vue islands with completely separate Vue instances and reactivity systems. Even though they both used the same Pinia store, changes in one component didn't trigger re-renders in the other because they had no shared Vue context.

The cart store's computed properties (subtotal, shipping, tax, total) were reactive within each component, but the components didn't know when to check for updates since they were isolated islands.

### Solution
**Consolidated both components into a single OrderSummary component** (`src/components/checkout/OrderSummary.vue`):

1. **Created unified component** that contains both:
   - Cart items display (previously CartSummary)
   - Order totals (previously OrderTotals)
   - Both quantity controls and remove buttons

2. **Updated checkout page** (`src/pages/checkout/index.astro`):
   - Removed separate `CartSummary client:load` and `OrderTotals client:load` imports
   - Replaced with single `OrderSummary client:load` component
   - Now renders as a single hydrated Vue instance

3. **How it works now**:
   - All state changes (add/remove/quantity updates) happen in the same Vue component
   - Vue's reactivity properly detects changes to `cart.items`
   - Computed properties for cart totals automatically recalculate
   - Template re-renders with updated values
   - Single 'cart-updated' event dispatch notifies NavigationBar of changes

### Code References
- **Unified component**: `src/components/checkout/OrderSummary.vue` - contains both CartSummary and OrderTotals
- **Checkout page**: `src/pages/checkout/index.astro` - uses `<OrderSummary client:load />`
- **No longer used**: Old `CartSummary.vue` and `OrderTotals.vue` are still in the codebase but not imported

### Why This Works
- **Single Vue instance**: Both cart items and totals are in the same component, sharing Vue's reactivity
- **Direct computed property access**: Component directly accesses `cart.subtotal`, `cart.shipping`, `cart.tax`, `cart.total`
- **Reactive chain**: When cart.items changes → computed properties recalculate → template re-renders
- **No cross-island communication needed**: Everything happens within one Vue component instance

### If It Breaks Again
1. Check that OrderSummary is being used in checkout page (not old CartSummary + OrderTotals)
2. Verify OrderSummary has `client:load` directive in checkout page
3. Ensure cart store computed properties are working: check `cart.subtotal`, `cart.tax`, `cart.total` in browser console
4. Add console.log in handleQuantityChange and handleRemoveItem to verify functions are being called
5. Check that cart.updateQuantity and cart.removeItem work correctly (they update cart.items array)

---

## Key Architecture Notes

### Pinia Store Initialization
- Global initialization via `src/entry.client.ts` loaded by Astro's Vue integration
- Configured in `astro.config.mjs`: `vue({ appEntrypoint: './src/entry.client.ts' })`
- This ensures Pinia is available to all Vue components on the client

### Astro + Vue Component Hydration
- Components with `client:load` are rendered on server (SSR) and re-rendered on client (hydration)
- SSR and hydration can create separate instances if not careful
- Use window events or shared storage (localStorage) for cross-component communication

### Cart Persistence
- Cart data stored in localStorage at key `'cart'`
- Persisted automatically by cart store via `persist()` action
- Loaded on app startup from localStorage via cart store initialization

---

## Commit History
- **Add cover images to book seed data**: Fixed broken placeholder images
- **Fix environment variables in Supabase client**: Fixed API route failures
- **Add isInCart method to cart store**: Fixed BookDetailClient rendering error
- **Fix cart counter updates using localStorage and window events**: Fixed real-time cart counter in navigation
- **Fix cart counter not updating when removing items from checkout page**: Added event dispatch in CartSummary
- **Fix order summary totals using computed properties/forced re-render patterns**: Attempted fixes for totals (didn't fully work)
- **Fix order summary totals by combining into single component**: Final successful fix - merged CartSummary and OrderTotals into unified OrderSummary component to share Vue instance

