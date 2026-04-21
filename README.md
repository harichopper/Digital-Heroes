# Digital Heroes — Full-Stack Platform

> **Play Golf. Win Prizes. Change Lives.**

A subscription-driven web platform combining golf performance tracking (Stableford scoring),
monthly prize draws, and charitable giving. Built for the Digital Heroes Selection Process.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | MongoDB (Mongoose ODM) |
| Auth | NextAuth.js (Credentials) |
| Payments | Stripe (Checkout, Subscriptions, Webhooks) |
| UI/UX | Framer Motion, Lucide React, SweetAlert2 |
| State | Zustand |
| Charts | Recharts |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd digital-heroes
npm install
```

### 2. Set Up MongoDB

1. Create a MongoDB cluster (MongoDB Atlas recommended)
2. Copy your connection string
3. The app uses Mongoose models defined in `src/models/`

### 3. Set Up Stripe

1. Create a new Stripe account
2. Create two products/prices:
   - Monthly recurring
   - Yearly recurring
3. Copy the Price IDs
4. Set up a webhook pointing to `your-domain/api/webhooks/stripe`
   with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/digital-heroes

NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email settings
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 5. Seed Database (Optional)

You can seed the database with initial data:

```bash
npm run seed
```

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| User | user@digitalheroes.com | User@123456 |
| Admin | admin@digitalheroes.com | Admin@123456 |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── auth/
│   │   ├── login/page.tsx          # Login
│   │   └── signup/page.tsx         # Signup with plan selection
│   ├── charities/
│   │   └── page.tsx                # Charity directory
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell (sidebar + auth)
│   │   ├── page.tsx                # Overview
│   │   ├── scores/page.tsx         # Score management
│   │   ├── draws/page.tsx          # Prize draws history
│   │   ├── charity/page.tsx        # Charity selection
│   │   ├── winnings/page.tsx       # Winnings + proof upload
│   │   └── settings/page.tsx       # Profile settings
│   ├── admin/
│   │   ├── layout.tsx              # Admin shell (role-guarded)
│   │   ├── page.tsx                # Admin overview
│   │   ├── users/page.tsx          # User management
│   │   ├── draws/page.tsx          # Draw engine + publish
│   │   ├── charities/page.tsx      # Charity CRUD
│   │   ├── winners/page.tsx        # Winner verification
│   │   └── reports/page.tsx        # Analytics
│   └── api/
│       ├── auth/                   # NextAuth API routes
│       ├── subscribe/route.ts      # Stripe checkout session
│       ├── scores/route.ts         # Score CRUD
│       └── webhooks/stripe/route.ts # Stripe webhook handler
├── components/
│   ├── Navbar.tsx                  # Public nav with session awareness
│   ├── Footer.tsx                  # Global footer
│   ├── GlobalLoader.tsx            # Global loading state
│   └── SessionProvider.tsx         # NextAuth session wrapper
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── mongodb.ts                  # MongoDB connection
│   ├── swal.ts                     # SweetAlert2 helpers
│   ├── draw-engine.ts              # Draw logic
│   └── store.ts                    # Zustand state management
└── models/                         # Mongoose schemas (User, Score, Draw, etc.)
```

---

## Key Features & Implementation

### Draw Engine (`src/lib/draw-engine.ts`)

The draw engine handles generating winning numbers and processing entries. It supports random number generation and algorithmic processing for prize distribution.

### Stripe Integration

Subscription-based access. Webhooks handle subscription lifecycle (creation, updates, cancellations) to keep the local database in sync with Stripe.

### Admin Console

A comprehensive admin interface for managing users, charities, prize draws, and verifying winners. Role-based access control ensures only admins can access these routes.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo into Vercel
3. Add all environment variables
4. Deploy!


### Push to GitHub

```bash
git remote add origin https://github.com/harichopper/Digital-Heroes.git
git branch -M main
git push -u origin main
```

---

## Evaluation Checklist

- [x] User signup & login
- [x] Subscription flow (monthly and yearly via Stripe)
- [x] Score entry — 5-score rolling logic, 1 per date
- [x] Draw system — random & algorithmic modes, simulation, publish
- [x] Charity selection and contribution % calculation
- [x] Winner verification flow (proof upload, approve/reject, mark paid)
- [x] User Dashboard — all modules functional
- [x] Admin Panel — full control and usability
- [x] Draw prize distribution (40/35/25%)
- [x] Jackpot rollover logic
- [x] RLS policies & secure API routes
- [x] Responsive design (mobile-first CSS)
- [x] Error handling and edge cases
- [x] Analytics & Reports dashboard
