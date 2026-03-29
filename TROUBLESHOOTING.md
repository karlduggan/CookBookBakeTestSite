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
- **Fix cart counter updates using localStorage and window events**: Fixed real-time counter updates

