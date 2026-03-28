# Cook Book Bake - Testing Checklist

## 🧪 Pre-Launch Testing

### User Authentication & Accounts
- [ ] User can register with valid email and password
- [ ] User cannot register with existing email
- [ ] Password strength requirements enforced (8+ chars, uppercase, lowercase, number)
- [ ] User can login with correct credentials
- [ ] User gets error message for invalid credentials
- [ ] User can view their profile
- [ ] User can update their profile (name)
- [ ] User can logout
- [ ] Session persists across page refreshes
- [ ] User cannot access admin pages without admin role

### Shopping & Cart
- [ ] Browse all books on shop page
- [ ] Filter books by category
- [ ] Search books by title/author
- [ ] Pagination works correctly
- [ ] View individual book details
- [ ] Featured/Bestseller badges display correctly
- [ ] Add book to cart
- [ ] Cart updates item count in header
- [ ] Cart persists across page refreshes
- [ ] Update cart item quantity
- [ ] Remove item from cart
- [ ] Clear entire cart
- [ ] Cart totals calculate correctly (subtotal, shipping, tax)
- [ ] Free shipping applies for orders over £30
- [ ] Tax calculation is correct (20% VAT)

### Checkout & Payment
- [ ] Checkout form requires all fields
- [ ] Form validation works (email format, postcode format, etc.)
- [ ] User email pre-fills if logged in
- [ ] User name pre-fills if logged in
- [ ] Can proceed to Stripe Checkout
- [ ] Stripe Checkout Session created successfully
- [ ] Test payment with Stripe test card (4242 4242 4242 4242)
- [ ] Payment successfully completes
- [ ] User redirected to success page after payment
- [ ] Success page displays order confirmation
- [ ] Success page shows correct order number and amount
- [ ] Success page shows shipping address
- [ ] Order appears in user account order history
- [ ] Order status is "pending" or "processing"
- [ ] Stock reduced for purchased items
- [ ] Cancelling payment redirects to cancel page
- [ ] Items remain in cart after cancellation

### Order Management
- [ ] User can view order history
- [ ] Order history shows correct order details
- [ ] Admin can view all orders
- [ ] Admin can filter orders by status
- [ ] Admin can update order status
- [ ] Order status options are: pending, processing, dispatched, delivered, cancelled

### Book Management (Admin)
- [ ] Admin can see all books in list
- [ ] Admin can add new book
- [ ] Admin can edit existing book
- [ ] Admin can delete book
- [ ] Book price validation (non-negative)
- [ ] Stock quantity validation (non-negative)
- [ ] Featured/Bestseller flags work correctly
- [ ] ISBN format validation

### Category Management (Admin)
- [ ] Admin can see all categories
- [ ] Admin can add new category
- [ ] Admin can edit category
- [ ] Admin can delete category (if no books in it)
- [ ] Cannot delete category with associated books
- [ ] Display order affects shop category filter

### Admin Dashboard
- [ ] Dashboard displays correct metrics
- [ ] Total orders count is accurate
- [ ] Total revenue calculation is correct
- [ ] Average order value calculation is correct
- [ ] Customer count is accurate
- [ ] Order status breakdown shows correct percentages
- [ ] Recent orders displayed in correct order (newest first)

### Responsive Design
- [ ] Layout works on mobile (375px width)
- [ ] Layout works on tablet (768px width)
- [ ] Layout works on desktop (1200px+ width)
- [ ] Navigation menu accessible on mobile
- [ ] Forms are properly sized on mobile (min 44px tap targets)
- [ ] Images scale properly on all devices
- [ ] Tables scroll horizontally on mobile
- [ ] Modals are responsive

### Performance
- [ ] Page load time < 3 seconds on 4G
- [ ] Lighthouse score > 85
- [ ] Core Web Vitals acceptable
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Images load efficiently
- [ ] No console errors
- [ ] No unhandled promise rejections

### Accessibility
- [ ] All interactive elements keyboard accessible (Tab key)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standard
- [ ] Form labels associated with inputs
- [ ] Alt text on all images
- [ ] Page title is descriptive
- [ ] Navigation landmarks present (nav, main, footer)
- [ ] Error messages descriptive and linked to fields
- [ ] Respects prefers-reduced-motion setting

### Security
- [ ] JWT tokens stored in httpOnly cookies
- [ ] No sensitive data in localStorage
- [ ] Password hashing verified (not plain text)
- [ ] API endpoints require authentication where needed
- [ ] Admin endpoints check isAdmin flag
- [ ] Stripe webhook signature verified
- [ ] No SQL injection vulnerabilities (parameterized queries)
- [ ] No XSS vulnerabilities (HTML escaped)
- [ ] CORS headers configured correctly

### Error Handling
- [ ] Graceful error messages for failed API calls
- [ ] User sees specific error for each failure type
- [ ] Cart validates stock before checkout
- [ ] Out of stock items prevent purchase
- [ ] Network errors handled gracefully
- [ ] 404 pages for missing resources
- [ ] 500 error page for server errors
- [ ] Loading states show while fetching data
- [ ] No unhandled errors in console

### Email
- [ ] Order confirmation email sent to customer
- [ ] Email contains order details
- [ ] Email contains shipping address
- [ ] Email has contact information
- [ ] Email is styled and readable
- [ ] Registration verification email (if implemented)
- [ ] Password reset email (if implemented)

### Browser Compatibility
- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works in Edge (latest)
- [ ] No critical errors in any browser

### Edge Cases
- [ ] Cannot add out-of-stock items to cart
- [ ] Stock quantity prevents overbooking
- [ ] Cannot process payment with empty cart
- [ ] Cannot access admin pages as non-admin
- [ ] Session expires correctly
- [ ] Duplicate orders prevented (idempotency)
- [ ] Concurrent purchases don't cause race conditions
- [ ] Very large order amounts handled correctly
- [ ] Very long text in fields handled correctly

## 📱 Mobile-Specific Testing
- [ ] Touch interactions work smoothly
- [ ] No horizontal scroll needed (except data tables)
- [ ] Buttons/links are at least 44x44px
- [ ] Font size is readable (min 16px on input)
- [ ] Mobile menu works
- [ ] Mobile modals are fullscreen or properly sized
- [ ] Double-tap zoom works properly
- [ ] Portrait and landscape orientations work

## 🔍 Test Data
- Test user account: test@example.com / TestPassword123
- Test admin account: admin@example.com / AdminPassword123
- Test book ISBN: 978-0-123456-78-9
- Test payment card: 4242 4242 4242 4242 (Stripe test)

## 📊 Metrics to Monitor
- [ ] Page load times (target: < 3s)
- [ ] Lighthouse score (target: > 85)
- [ ] Error rate (target: < 0.5%)
- [ ] User session duration
- [ ] Conversion rate (cart → payment)
- [ ] Return visitor percentage

## 🚀 Launch Readiness
- [ ] All tests passed
- [ ] No critical bugs remaining
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Security audit completed
- [ ] DNS configured
- [ ] SSL certificate installed
- [ ] Monitoring/logging active
- [ ] Backup strategy in place
- [ ] Support documentation ready
