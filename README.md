# Cook Book Bake - Online Bookshop

A modern, full-featured e-commerce platform for an independent bookstore, built with Astro, Vue 3, and serverless architecture.

## 🎯 Project Overview

Cook Book Bake is a complete online bookshop solution featuring:

- **Customer features**: Browse books, search, filter by category, add to cart, secure checkout
- **User accounts**: Registration, login, order history, saved addresses
- **Payment processing**: Stripe Checkout integration with webhook handling
- **Admin panel**: Book management, order management, sales analytics
- **Dark theme**: Professional dark UI with teal and blue accents
- **Responsive design**: Mobile-first, works on all devices
- **Performance optimized**: Fast page loads, lazy loading, caching

## 🏗️ Architecture

```
Frontend (Astro + Vue 3)
├── Static pages (SSG)
├── Server-rendered pages (SSR)
├── Vue interactive components
└── Pinia state management
         ↓
Netlify Functions (Serverless APIs)
├── Authentication
├── Product catalog
├── Shopping cart
├── Payment processing
└── Admin operations
         ↓
Supabase (PostgreSQL Database)
├── Users
├── Books
├── Orders
├── Categories
└── Addresses
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Netlify account

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env.local`

3. Set up the database:
```bash
psql -U postgres -h your-db-host -f database/schema.sql
```

4. Start the development server:
```bash
npm run dev
```

## 📚 Documentation

- [PROGRESS.md](./PROGRESS.md) - Implementation progress
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Testing guidelines
- [database/schema.sql](./database/schema.sql) - Database schema

## 🔧 Environment Variables

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## 🚀 Deployment

Build and deploy to Netlify:
```bash
npm run build
```

## 📝 License

Proprietary software for Cook Book Bake.

---

**Version**: 1.0.0 | **Status**: Production Ready
# CookBookBakeTestSite
