# Cook Book Bake - Backend Setup Guide

Complete guide for connecting Supabase (database) and Stripe (payments)

---

## Part 1: Supabase Setup (Database)

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start Your Project"
3. Sign up with email or GitHub
4. Create new organization (e.g., "Cook Book Bake")
5. Create new project:
   - Name: `cookbookbake`
   - Database Password: Create secure password (save it!)
   - Region: Choose closest to you (e.g., EU for UK)
   - Click "Create new project"

⏳ Wait 2-3 minutes for project to initialize...

### Step 2: Get Your Credentials

1. Once project is ready, click on your project
2. Go to **Settings** (bottom left)
3. Click **API**
4. Copy these values and save them somewhere safe:
   ```
   Project URL:        https://xxxxx.supabase.co
   anon public key:    eyJhbG...
   service_role key:   eyJhbG... (has more permissions)
   ```

5. These become your environment variables:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_KEY` = service_role key

---

### Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste this SQL script:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  cover_image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  bestseller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10, 2),
  shipping DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  total DECIMAL(10, 2),
  payment_status VARCHAR(50),
  stripe_session_id VARCHAR(255),
  shipping_name VARCHAR(255),
  shipping_email VARCHAR(255),
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city VARCHAR(100),
  shipping_postcode VARCHAR(20),
  shipping_country VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id),
  title VARCHAR(255),
  author VARCHAR(255),
  price DECIMAL(10, 2),
  quantity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table (for saved delivery addresses)
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  postcode VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_featured ON books(featured);
CREATE INDEX idx_books_bestseller ON books(bestseller);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Create admin user (change email/password!)
INSERT INTO users (email, password_hash, first_name, last_name, is_admin)
VALUES (
  'admin@cookbookbake.co.uk',
  '$2a$10$SlowHashTakesTime',  -- Will be hashed when user registers
  'Admin',
  'User',
  true
)
ON CONFLICT DO NOTHING;
```

4. Click **Run** button (green play icon)
5. Should see "Success" message

### Step 4: Add Test Categories

Still in SQL Editor, create a new query:

```sql
-- Insert sample categories
INSERT INTO categories (name, slug, description)
VALUES
  ('Baking', 'baking', 'Bread, pastries, cakes and cookies'),
  ('Vegetarian', 'vegetarian', 'Plant-based recipes and cooking'),
  ('International', 'international', 'Cuisine from around the world'),
  ('Quick Meals', 'quick-meals', 'Fast recipes for busy weeknights'),
  ('Techniques', 'techniques', 'Cooking methods and skills'),
  ('Desserts', 'desserts', 'Sweet treats and confectionery')
ON CONFLICT (slug) DO NOTHING;
```

Click **Run**

---

## Part 2: Stripe Setup (Payments)

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click **Sign Up**
3. Fill in your details
4. Create account

### Step 2: Get Stripe Keys

1. In Stripe dashboard, go to **Developers** (left menu)
2. Click **API Keys**
3. You'll see two keys:

```
Publishable key:  pk_test_xxxxx...
Secret key:       sk_test_xxxxx...
```

⚠️ **Important**: These are TEST keys (with `test_` prefix)
- Use these for development/testing
- Don't charge real money with test cards
- Switch to LIVE keys when going to production

### Step 3: Test with Stripe

Use these test card numbers:

| Card Number | Status | CVC | Date |
|---|---|---|---|
| `4242 4242 4242 4242` | ✅ Success | Any 3 digits | Any future date |
| `4000 0000 0000 0002` | ❌ Declined | Any 3 digits | Any future date |
| `4000 0025 0000 3155` | ⚠️ Requires auth | Any 3 digits | Any future date |

For all test cards use:
- Expiry: `12/25` (or any future date)
- CVC: `123` (or any 3 digits)
- Zip: Any 5 digits

---

## Part 3: Environment Variables

### Step 1: Create Local `.env` File

In your project root (`/Users/cellsoftware/Documents/cookbookbake/`):

```bash
# Create file
touch .env.local
```

### Step 2: Add All Variables

Edit `.env.local` and add:

```env
# ==================
# SUPABASE (Database)
# ==================
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=eyJhbG...

# ==================
# STRIPE (Payments)
# ==================
PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx...
STRIPE_SECRET_KEY=sk_test_xxxxx...

# ==================
# JWT (Authentication)
# ==================
JWT_SECRET=your-super-secret-random-string-min-32-chars-1234567890

# ==================
# API Configuration
# ==================
PUBLIC_API_URL=http://localhost:3000

# ==================
# Email (Optional)
# ==================
SENDGRID_API_KEY=optional_for_emails
SMTP_HOST=optional
SMTP_PORT=optional
```

### Step 3: Generate JWT Secret

You need a random secret string. Run this in terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste into `JWT_SECRET=` in `.env.local`

---

## Part 4: Deploy to Netlify with Backend

### Step 1: Push to GitHub

```bash
cd /Users/cellsoftware/Documents/cookbookbake

git add .env.local
git add netlify/
git commit -m "Add backend setup and environment config"
git push origin main
```

### Step 2: Add Environment Variables to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Select your site
3. Go to **Site Settings** → **Build & Deploy** → **Environment**
4. Click **Edit Variables**
5. Add each variable from your `.env.local`:

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbG...
SUPABASE_SERVICE_KEY = eyJhbG...
PUBLIC_STRIPE_PUBLIC_KEY = pk_test_xxxxx...
STRIPE_SECRET_KEY = sk_test_xxxxx...
JWT_SECRET = (your-generated-secret)
PUBLIC_API_URL = https://your-site.netlify.app
```

6. Click **Save**

### Step 3: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear build cache and deploy**

Netlify will rebuild with your environment variables.

---

## Part 5: Configure Stripe for Checkout

### Step 1: Set Up Webhook

Your app needs to listen for Stripe payment events.

In Stripe dashboard:
1. Go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Enter your endpoint URL:
   ```
   https://your-site-name.netlify.app/.netlify/functions/webhooks/stripe
   ```
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `charge.succeeded`
5. Click **Add Endpoint**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add to Netlify environment variables:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_xxxxx...
   ```

### Step 2: Set Success/Cancel URLs

These are handled in your code already (`/checkout/success` and `/checkout/cancelled`)

---

## Part 6: Test Everything Locally

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Test Database Connection

1. Go to http://localhost:3000/shop
2. Open browser console (F12)
3. Should see books loading (from Supabase)

If you see errors:
- Check `.env.local` has correct Supabase keys
- Verify Supabase tables were created

### Step 3: Test Admin Upload

1. Go to http://localhost:3000/admin
2. Click "Books"
3. Click "Add New Book"
4. Fill form:
   ```
   Title: Test Book
   Author: Test Author
   Price: 19.99
   Stock: 50
   Category: Select one
   ```
5. Click Save
6. Should see success message
7. Book appears in list

If errors:
- Check browser console for specific error
- Verify Supabase `books` table exists
- Verify admin routes work

### Step 4: Test Cart

1. Go to http://localhost:3000/shop
2. Click a book's "Add to Cart"
3. Should see notification
4. Cart icon shows count

If errors:
- Check that Pinia is initialized (should be fixed from earlier)
- Clear browser cache

### Step 5: Test Checkout

1. With items in cart, click cart icon
2. Click "Checkout"
3. Fill form with test details
4. Click "Proceed to Payment"
5. Should redirect to Stripe checkout (or test checkout)

If errors:
- Check `STRIPE_SECRET_KEY` in environment
- Verify checkout API endpoint exists
- Check browser network tab for API errors

---

## Part 7: Production Checklist

Before going live with real payments:

### Stripe Settings
- [ ] Switch from TEST keys to LIVE keys
- [ ] Set up webhook for production
- [ ] Configure email receipts
- [ ] Set up tax rates if needed
- [ ] Configure country restrictions

### Supabase Settings
- [ ] Enable Row Level Security (RLS) on tables
- [ ] Set up backups
- [ ] Enable SSL enforcement
- [ ] Monitor database usage

### Security
- [ ] Change admin email/password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS (Netlify does this automatically)
- [ ] Add rate limiting to APIs
- [ ] Enable CORS restrictions

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor Stripe for failed payments
- [ ] Set up database backups
- [ ] Monitor Netlify function logs

---

## Troubleshooting

### "Supabase environment variables missing"

**Error in browser:**
```
Missing Supabase environment variables
```

**Fix:**
1. Check `.env.local` has SUPABASE_URL and SUPABASE_ANON_KEY
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. If deploying: Check Netlify environment variables under Settings

### "Books not loading in shop"

**Error in console:**
```
Database error: ...
```

**Fix:**
1. Verify tables exist in Supabase SQL Editor
2. Verify API is running (check `/api/books` in network tab)
3. Check Supabase keys are correct

### "Stripe payment fails"

**Error message:**
```
Could not create Stripe session
```

**Fix:**
1. Verify `STRIPE_SECRET_KEY` is set
2. Use Stripe TEST key (starts with `pk_test_`)
3. Check Stripe test mode is enabled
4. Verify webhook signing secret is configured

### "Admin can't upload books"

**Error:**
```
Permission denied
```

**Fix:**
1. Verify you're logged in as admin
2. Check Supabase RLS policies (if enabled)
3. Verify `books` table exists
4. Check browser console for specific error

---

## API Endpoints Reference

Your backend has these API endpoints:

```
GET  /api/books              - List books (with filters)
GET  /api/categories         - List categories
POST /api/auth/register      - Register user
POST /api/auth/login         - Login user
POST /api/auth/logout        - Logout user
POST /api/checkout/create-session    - Create Stripe checkout
GET  /api/checkout/session-details   - Get order details
POST /api/admin/books        - Create/update books (admin)
DELETE /api/admin/books/:id  - Delete book (admin)
GET  /api/user/orders        - Get user's orders
GET  /api/user/profile       - Get user profile
POST /api/user/addresses     - Save address
```

---

## Next Steps

1. ✅ Set up Supabase account & database
2. ✅ Set up Stripe account & keys
3. ✅ Add environment variables (local + Netlify)
4. ✅ Test locally with `npm run dev`
5. ✅ Deploy to Netlify
6. ✅ Test on live site
7. ✅ Switch Stripe from TEST to LIVE when ready

---

**Questions?** Check the error in your browser console (F12) for detailed debugging info.
