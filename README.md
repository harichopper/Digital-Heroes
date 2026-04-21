# Digital Heroes — Full-Stack Platform

> **Play Golf. Win Prizes. Change Lives.**

A subscription-driven web platform combining golf performance tracking (Stableford scoring),
monthly prize draws, and charitable giving. Built for the Digital Heroes Selection Process.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | MongoDB (Mongoose ODM) |
| Auth | NextAuth.js (Credentials + OAuth) |
| Payments | Stripe (Checkout, Subscriptions, Webhooks) |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
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
2. Create a database named `digital-heroes`
3. Copy your connection string (include the database name)
4. The app uses Mongoose models defined in `src/models/`

### 3. Set Up Stripe

1. Create a new Stripe account or project
2. Create two products/prices:
   - Monthly: £9.99/month recurring
   - Yearly: £99.90/year recurring
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

# Optional: email notifications (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

### 5. Create Admin User

After signing up on the platform, update the user's role in MongoDB:

```javascript
// In MongoDB shell or Atlas Data Explorer
db.users.updateOne(
  { email: 'your-admin@email.com' },
  { $set: { role: 'admin' } }
)
```

### 6. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| User | user@test.com | test123456 |
| Admin | admin@test.com | admin123456 |

> Create these accounts via the signup page, then set the admin role via SQL.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── not-found.tsx               # 404 page
│   ├── auth/
│   │   ├── login/page.tsx          # Login
│   │   └── signup/page.tsx         # Signup with plan selection
│   ├── charities/
│   │   ├── page.tsx                # Charity directory
│   │   └── [slug]/page.tsx         # Charity profile
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
│   │   ├── winners/page.tsx        # Winner verification + payouts
│   │   └── reports/page.tsx        # Analytics
│   └── api/
│       ├── subscribe/route.ts      # Stripe checkout session
│       ├── scores/route.ts         # Score CRUD with validation
│       └── webhooks/stripe/route.ts # Stripe webhook handler
├── components/
│   ├── Navbar.tsx                  # Public nav with mobile menu
│   └── Footer.tsx                  # Global footer
├── lib/
│   ├── types.ts                    # All TypeScript types + constants
│   ├── utils.ts                    # Shared utility functions
│   ├── store.ts                    # Zustand global state
│   ├── draw-engine.ts              # Draw logic (random + algorithmic)
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server Supabase clients (+ admin)
├── middleware.ts                   # Auth + route protection
supabase/
└── schema.sql                      # Full DB schema, RLS, seed data
```

---

## Key Features & Implementation

### Score Rolling Logic

The `golf_scores` table has a unique constraint on `(user_id, played_date)`.
When adding a 6th score, the oldest is automatically deleted first (enforced in both the API route and client-side UI).

### Draw Engine (`src/lib/draw-engine.ts`)

**Random mode**: 5 unique numbers drawn uniformly from [1, 45].

**Algorithmic mode**: Numbers weighted inversely by frequency across all user scores — less common scores have higher probability of being drawn.

**Prize calculation**: Automatic split by match tier (40/35/25%). Unclaimed jackpots roll forward automatically.

### Row Level Security

All tables enforce RLS. Users can only see/modify their own data.
Admin role bypasses restrictions using the Service Role key (server-only).

### Stripe Integration

Checkout sessions pass `user_id` as metadata. The webhook picks this up and creates the subscription record in Supabase, linking the Stripe subscription to the user profile.

---

## Deployment (Vercel)

```bash
npm run build   # Verify build passes locally first
```

1. Push to GitHub
2. Import repo into a **new** Vercel account
3. Add all environment variables in Vercel project settings
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
5. Update Stripe webhook to point to `https://your-app.vercel.app/api/webhooks/stripe`
6. Deploy!

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
