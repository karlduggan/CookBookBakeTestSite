# Cook Book Bake - Testing Guide

## Quick Start Testing Checklist

### Prerequisites
- Dev server running: `npm run dev`
- Access: http://192.168.1.173:3000/
- Browser DevTools open (F12) for console errors

---

## Phase 1: Test Light Theme (5 minutes)

### Visual Verification
- [ ] **Home Page** (`/`)
  - Background is light blue gradient
  - Cards are white with shadows
  - Text is dark blue-gray (not white)
  - Teal accents on buttons/links

- [ ] **Responsive Design**
  - Open DevTools (F12)
  - Toggle device toolbar (mobile view)
  - Check tablet view (768px)
  - Check desktop view (1200px+)

### Color Checklist
- [ ] Light blue backgrounds: `#B8E0E8`
- [ ] White cards: `#FFFFFF` with shadows
- [ ] Teal buttons: `#1B9AAA`
- [ ] Coral badges: `#FF8B6A` (featured items)
- [ ] Dark text: `#1A3A42`

---

## Phase 2: Test Shop/Listing (10 minutes)

### Browse Shop
1. Click "Shop" in navigation
2. **Verify:**
   - [ ] Page loads without errors (check console)
   - [ ] Light theme applied (white cards)
   - [ ] Books display in grid (2-4 columns based on screen size)
   - [ ] Each book shows:
     - [ ] Cover image (or placeholder)
     - [ ] Title & author
     - [ ] Category
     - [ ] Price (in pounds)
     - [ ] Stock status
     - [ ] Featured badge (coral) or Bestseller badge (blue)

### Test Filters
1. **Category Filter**
   - [ ] Click "All Categories" - shows all books
   - [ ] Select a category - filters books
   - [ ] Books update instantly

2. **Price Range Filter**
   - [ ] Select "Under £20"
   - [ ] Select "£20 - £40"
   - [ ] Select "£40+"
   - [ ] Books filter correctly

3. **Availability Filter**
   - [ ] "In Stock Only" checkbox works
   - [ ] Hides out-of-stock items when checked

4. **Special Filters**
   - [ ] "Featured Only" shows coral badge items
   - [ ] "Bestsellers Only" shows blue badge items
   - [ ] "Clear All Filters" resets everything

### Test Search
1. Type in search bar: "cooking"
2. [ ] Suggestions appear below
3. [ ] Click a suggestion or press Enter
4. [ ] Results filter by search query
5. [ ] "Clear" button empties search

### Test Sorting
1. Click sort dropdown
2. [ ] "Sort by Relevance" (default)
3. [ ] "Newest First"
4. [ ] "Price: Low to High"
5. [ ] "Price: High to Low"
6. [ ] "Title A-Z"
7. Books reorder with each selection

### Test Pagination
1. Scroll to bottom of page
2. [ ] See page numbers (if >12 books)
3. [ ] Click page number - books change
4. [ ] Click "Previous"/"Next" buttons work
5. [ ] Current page highlighted

---

## Phase 3: Test Admin Upload (15 minutes)

### Access Admin Dashboard
1. Navigate to: `http://192.168.1.173:3000/admin`
2. **Verify:**
   - [ ] Page loads (no redirect to login)
   - [ ] Light theme applied
   - [ ] Sidebar visible with navigation
   - [ ] Dashboard shows welcome/stats

### Upload a Book
1. Click "Books" in admin sidebar
2. Look for "Add New Book" or similar button
3. **Fill form with test data:**
   ```
   Title: "The Art of Pasta Making"
   Author: "Marco Rossi"
   ISBN: "978-1234567890"
   Price: "24.99"
   Stock: "50"
   Category: (Select any category or create new)
   Description: "Learn authentic Italian pasta techniques"
   Featured: Check this box
   Cover Image: Upload a test image (JPG/PNG)
   ```
4. [ ] Click "Save" or "Create"
5. [ ] Success message appears
6. [ ] Book appears in the books list
7. [ ] Book can be edited
8. [ ] Book can be deleted (test with caution)

### Upload Another Book (without featured)
1. Repeat upload process with:
   ```
   Title: "Quick Weeknight Dinners"
   Author: "Sarah Chen"
   ISBN: "978-0987654321"
   Price: "18.99"
   Stock: "75"
   Featured: Leave unchecked
   Bestseller: Check this (if option available)
   ```
2. [ ] Verify it appears in books list
3. [ ] Shows blue badge (not coral)

---

## Phase 4: Test Product Listing Updates (5 minutes)

### Refresh Shop Page
1. Go back to `/shop`
2. [ ] Your newly uploaded books appear
3. [ ] Featured book shows coral badge
4. [ ] Correct prices displayed
5. [ ] Stock quantity accurate
6. [ ] Category filter includes new category

### Test Book Detail Page
1. Click "View Details" on one of your test books
2. **Verify:**
   - [ ] Page loads
   - [ ] Book image displays
   - [ ] Full details shown (title, author, price, description)
   - [ ] Stock status shows correct quantity
   - [ ] "Add to Cart" button visible (if in stock)

---

## Phase 5: Test Cart Functionality (10 minutes)

### Add to Cart
1. On book detail page, click "Add to Cart"
2. [ ] Success message appears
3. [ ] Cart icon in nav shows item count (badge with number)
4. [ ] Can add same book multiple times (quantity increases)

### Add Multiple Books
1. Go back to shop (`/shop`)
2. Add 2-3 different books to cart
3. [ ] Cart badge updates with total count
4. [ ] Click cart icon in navbar

### View Cart Drawer
1. Click cart icon in top-right navigation
2. **Verify cart drawer shows:**
   - [ ] White background with shadow
   - [ ] All items you added
   - [ ] Each item shows: image, title, price, quantity
   - [ ] Quantity controls (- and + buttons)
   - [ ] Remove button for each item
   - [ ] Subtotal, Shipping, Tax, Total calculations
   - [ ] "Checkout" button
   - [ ] "Continue Shopping" button

### Modify Cart
1. Click "+" to increase quantity of an item
2. [ ] Quantity updates
3. [ ] Total recalculates
4. Click "-" to decrease
5. [ ] Quantity decreases (can go to 1)
6. Click "Remove" on an item
7. [ ] Item disappears
8. [ ] Total updates

---

## Phase 6: Test Checkout Flow (15 minutes)

### Start Checkout
1. With items in cart, click "Checkout"
2. Redirects to: `/checkout`
3. **Verify form displays:**
   - [ ] Full Name input (white)
   - [ ] Email input (white)
   - [ ] Address inputs (white)
   - [ ] City, Postcode, Country
   - [ ] Terms agreement checkbox
   - [ ] "Proceed to Payment" button

### Fill Checkout Form
```
Full Name: John Doe
Email: john@example.com
Address: 123 Main Street
City: Hove
Postcode: BN3 2WB
Country: United Kingdom
```

1. [ ] Check "I agree to Terms and Conditions"
2. [ ] Click "Proceed to Payment"
3. [ ] Form validates (errors for empty fields if try to submit blank)

### Test Validation
1. Leave "Full Name" blank
2. [ ] Try to submit
3. [ ] Error message appears
4. Fill in name and retry
5. [ ] Continues to next step (or Stripe checkout)

### Complete Checkout (Test/Mock)
- **Note:** If Stripe is not configured:
  - [ ] Checkout session created (check network tab)
  - [ ] Success page shows or error handling works

- **If Stripe configured:**
  - [ ] Redirects to Stripe checkout
  - [ ] Test card: `4242 4242 4242 4242`
  - [ ] Exp: `12/25`, CVC: `123`
  - [ ] Redirects to success page after payment

---

## Phase 7: Test Success Page (5 minutes)

### Order Confirmation
If checkout successful, you should see `/checkout/success`

**Verify:**
- [ ] ✓ Success icon
- [ ] "Order Confirmed!" heading
- [ ] Order number displayed
- [ ] Email confirmation info
- [ ] Shipping address shown
- [ ] Order total displayed
- [ ] "What's Next?" section with steps
- [ ] "View My Orders" button
- [ ] "Continue Shopping" button

---

## Phase 8: Test Account Pages (10 minutes)

### Registration
1. Navigate to: `/account/register`
2. **Fill form:**
   ```
   First Name: John
   Last Name: Doe
   Email: john@example.com
   Password: Test123!@
   Confirm: Test123!@
   Check: Terms agreement
   ```
3. [ ] Form validates
4. [ ] Success or redirects to login
5. [ ] Check for error messages

### Login
1. Navigate to: `/account/login`
2. **Fill form:**
   ```
   Email: john@example.com
   Password: Test123!@
   ```
3. [ ] Click "Sign In"
4. [ ] Redirects to account dashboard (`/account`)
5. [ ] Shows welcome message with name

### Account Dashboard
On `/account`, verify tabs:

**Profile Tab:**
- [ ] Shows user name, email
- [ ] Display is read-only (grayed out)
- [ ] Edit Settings button

**Orders Tab:**
- [ ] Shows order history
- [ ] Displays test order from checkout
- [ ] Shows order number, date, total, status

**Addresses Tab:**
- [ ] Shows saved addresses
- [ ] Shows address from checkout
- [ ] Can add more addresses

**Settings Tab:**
- [ ] Change Password section
- [ ] Email notifications toggle
- [ ] Sign Out button

---

## Phase 9: Test Admin Orders (5 minutes)

### View Orders
1. Go to `/admin/orders`
2. **Verify:**
   - [ ] List of orders appears
   - [ ] Your test order shows
   - [ ] Shows: Order #, Date, Customer, Status, Total
   - [ ] Can click to view details
   - [ ] Status updates (if functionality exists)

---

## Phase 10: Test Responsive Design (5 minutes)

### Mobile (375px width)
1. Open DevTools
2. Toggle device toolbar
3. Select "iPhone SE" or similar
4. **Verify:**
   - [ ] Navigation hamburger menu appears
   - [ ] Click menu - opens mobile nav
   - [ ] All content readable
   - [ ] No horizontal scrolling
   - [ ] Buttons clickable (44px minimum height)
   - [ ] Forms stack vertically
   - [ ] Images scale properly

### Tablet (768px width)
- [ ] 2-column book grid
- [ ] Navigation shows partial menu
- [ ] All elements visible without scrolling (where appropriate)

### Desktop (1200px+)
- [ ] 3-4 column book grid
- [ ] Full navigation visible
- [ ] Sidebar sticky on admin pages
- [ ] Proper spacing throughout

---

## Console Error Checking

After each test phase, check browser console (F12):
- [ ] No red errors (except possibly network 404s which are OK)
- [ ] No orange warnings about deprecated code
- [ ] No Pinia errors about "getActivePinia"
- [ ] No Vue errors

**How to check:**
1. Press F12 (DevTools)
2. Click "Console" tab
3. Look for red text (errors)
4. Screenshot or note any errors found

---

## Performance Testing (Optional)

### Lighthouse Audit
1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Performance" + "Accessibility"
4. Click "Analyze page load"
5. **Target scores:**
   - Performance: >80
   - Accessibility: >90
   - Best Practices: >85

---

## Test Summary Checklist

### Critical Features (Must Work)
- [ ] Light theme displays correctly
- [ ] Shop lists books from database
- [ ] Filters work (category, price, availability)
- [ ] Search functionality works
- [ ] Add to cart works
- [ ] Cart shows correct totals
- [ ] Checkout form validates
- [ ] Account registration/login works
- [ ] Admin can upload books
- [ ] New books appear in shop

### Nice-to-Have Features (Should Work)
- [ ] Pagination works
- [ ] Sorting works
- [ ] Admin can edit/delete books
- [ ] Admin can view orders
- [ ] User can view order history
- [ ] Responsive design works on mobile

### Bug Tracking
If you find issues, note:
1. **Page URL:** Where did you find it?
2. **Steps to reproduce:** How do you make it happen again?
3. **Expected behavior:** What should happen?
4. **Actual behavior:** What actually happened?
5. **Browser & OS:** Firefox on Mac? Chrome on Windows?

---

## Next Steps After Testing

1. ✅ If all tests pass → Ready for user testing
2. ❌ If bugs found → Fix in order of severity
3. 🔐 Add authentication security hardening
4. 📊 Set up analytics tracking
5. 🔍 Configure SEO metadata
6. 💳 Finalize Stripe integration (if needed)
7. 📱 Test on real devices (not just DevTools)
8. 🚀 Prepare for production deployment

---

## Test Data to Use

### Books to Upload
1. **Featured Book**
   - Title: "The Art of Pasta Making"
   - Price: 24.99
   - Stock: 50
   - Featured: ✓

2. **Bestseller**
   - Title: "Quick Weeknight Dinners"
   - Price: 18.99
   - Stock: 75
   - Bestseller: ✓

3. **Budget Book**
   - Title: "Cooking on a Budget"
   - Price: 12.99
   - Stock: 100

4. **Premium Book**
   - Title: "Michelin Star Secrets"
   - Price: 45.99
   - Stock: 20

### User Accounts
1. **Test Customer**
   - Email: customer@test.com
   - Password: Test123!@
   - Name: John Doe

2. **Test Admin** (should exist)
   - Email: admin@test.com
   - Password: Admin123!@

---

**Good luck testing! Report any issues found.** 🚀
