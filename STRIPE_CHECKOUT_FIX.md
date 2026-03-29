# Stripe Checkout - Complete Fix Documentation

## Problem
The "Proceed to Payment" button was not working. When clicked, it would send a POST request to `/api/checkout/create-session` but the API received an empty request body, causing a 500 error: "Unexpected end of JSON input".

## Root Causes & Solutions

### Issue 1: API Route Not Marked as Dynamic
**Problem**: Astro's hybrid output mode requires API routes to be explicitly marked as dynamic with `export const prerender = false;`

**Solution**: Add this to `/src/pages/api/checkout/create-session.js` at the TOP of the file:
```javascript
export const prerender = false;

export async function POST(context) {
  // ... rest of code
}
```

**Why**: Without this, Astro treats the route as prerendered/static, which prevents the request context from being properly passed to the handler, resulting in empty request bodies.

### Issue 2: Vue Hydration Mismatch
**Problem**: Server-rendered HTML didn't match client-rendered HTML, breaking Vue event handlers.

**Solutions Applied**:
1. Changed button from `type="submit"` to `type="button"` with `@click` handler
2. Added `isMounted` guard to only render form content on client
3. Removed debug lines that showed reactive data (which differs between server and client)

### Issue 3: Form Not Actually Submitting
**Problem**: Even though the disabled binding showed `false`, the button still had the `disabled` attribute in HTML.

**Solution**: Changed from using the `:disabled` binding to using inline styles for visual feedback:
```vue
<!-- Before (caused hydration issues) -->
<button type="submit" :disabled="isLoading || !hasItems">

<!-- After (works properly) -->
<button type="button" @click="handleSubmit"
  :style="{ opacity: (isLoading || !hasItems) ? 0.5 : 1 }">
```

## Testing Checklist

Before deploying Stripe checkout, verify:

- [ ] API route has `export const prerender = false;` at top
- [ ] Checkout page has `export const prerender = false;` at top
- [ ] Cart has items before going to checkout
- [ ] All form fields are filled (Name, Email, Address, City, Postcode, Country)
- [ ] Terms checkbox is checked
- [ ] Click "Proceed to Payment" button
- [ ] **Server console** shows: `[create-session] Checkout request received`
- [ ] **Server console** shows: `[create-session] Raw body: {...}` (not empty!)
- [ ] Redirects to Stripe checkout page
- [ ] Can complete test payment with test card: `4242 4242 4242 4242`

## Environment Variables Required

Make sure `.env.local` has:
```
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=your-secret-key
PUBLIC_SITE_URL=http://localhost:3000
```

## Key Files Modified

1. **`src/pages/api/checkout/create-session.js`**
   - Added `export const prerender = false;`
   - Added request body logging for debugging

2. **`src/components/checkout/CheckoutForm.vue`**
   - Changed button to use click handler instead of form submit
   - Added `isMounted` guard to prevent hydration mismatch
   - Uses real checkout data from cart

3. **`src/components/checkout/OrderSummary.vue`**
   - Dispatches `cart-updated` event when items removed/quantity changed
   - Allows CheckoutForm to detect cart changes

4. **`src/lib/api-utils/auth.js`**
   - Uses lazy `getJWTSecret()` function
   - Falls back to dev secret if JWT_SECRET not found

## Debugging Steps If It Breaks Again

1. **Check server console for errors**
   ```
   npm run dev
   # Look for any error messages when clicking button
   ```

2. **Verify API route is dynamic**
   - Check `/src/pages/api/checkout/create-session.js` has `export const prerender = false;` at top

3. **Verify checkout page is dynamic**
   - Check `/src/pages/checkout/index.astro` has `export const prerender = false;` at top

4. **Check request body is being sent**
   - Add logging to API route:
     ```javascript
     const bodyText = await context.request.text();
     console.log('[DEBUG] Raw body:', bodyText);
     ```
   - Server console should show the JSON body, not empty string

5. **Check for hydration mismatches**
   - Open browser console (F12)
   - Look for "Hydration completed but contains mismatches"
   - If found, check for reactive data being displayed in template

6. **Verify cart has items**
   - Make sure at least 1 item is in cart before checkout
   - Check localStorage: `localStorage.getItem('cart')` in browser console

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Button doesn't respond to clicks | Hydration mismatch | Remove debug output, use `isMounted` guard |
| "Request body is empty" error | API not marked as dynamic | Add `export const prerender = false;` to API route |
| "Unexpected token" JSON error | Malformed or missing request body | Check form validation, verify all fields filled |
| "Cart is empty" message | Cart not loading from localStorage | Call `cart.hydrate()` in `onMounted()` |
| 500 error on checkout | JWT_SECRET missing | Add `JWT_SECRET=xxx` to `.env.local` |

## Success Indicators

When checkout is working correctly:
- ✅ Button responds to clicks
- ✅ Browser console shows: `[CHECKOUT] Sending checkout request with X items`
- ✅ Server console shows: `[create-session] Checkout request received`
- ✅ Server console shows: `[create-session] Raw body: {...}` with actual data
- ✅ Redirects to Stripe checkout page
- ✅ Can enter test card and complete payment

## Production Checklist

Before going to production:
- [ ] Change `STRIPE_SECRET_KEY` to production key (starts with `sk_live_`)
- [ ] Update `PUBLIC_SITE_URL` to production domain
- [ ] Set proper `JWT_SECRET` (not the dev fallback)
- [ ] Set up Stripe webhooks to handle payment confirmations
- [ ] Create success/cancelled page handlers
- [ ] Test with real Stripe test cards
- [ ] Enable HTTPS (required by Stripe)
