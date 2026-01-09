# Amoxtli Partners

A production-grade partner referral management system built with Next.js 15, TypeScript, MongoDB, and Clerk authentication.

## Overview

Amoxtli Partners is a secure platform for managing partner referrals with two distinct roles:

- **SUPER_ADMIN**: Full access to manage partners, review leads, set financials, and process payouts
- **PARTNER**: Create referral links, track status (safe view), and view commission/payout information only

## Key Features

### Security & Privacy
- **Strict data separation**: Partners NEVER see sensitive lead data (email, phone, company) or project financials (total price, costs, profit breakdown)
- **Server-side authorization**: All actions validated with role-based guards
- **Antifraud measures**: Self-referral blocking, dedupe protection, first-partner-wins policy
- **Commission caps**: Per-project (25K MXN), monthly (40K MXN), yearly (120K MXN)

### Business Logic
- Commission calculated from PROFIT NETO REAL: `profit = amountCharged - directCosts`
- Configurable commission rate (max 10%)
- 50/50 payout split (after first & second client payments)
- 90-day lead protection window
- Max 5 active referrals per partner per month

### Pipeline Statuses
- LINK_CREATED → INTAKE_SUBMITTED → IN_REVIEW → ACCEPTED/REJECTED
- PROPOSAL_SENT → NEGOTIATION → WON/LOST
- PAYMENT_RECEIVED → COMMISSION_PENDING → COMMISSION_PARTIALLY_PAID → COMMISSION_PAID

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode, no `any`)
- **Auth**: Clerk
- **Database**: MongoDB (native driver)
- **UI**: TailwindCSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Backend**: Server Actions

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Clerk account (free tier works)

## Setup

### 1. Clone and Install

```bash
cd amoxtli-partners
npm install
```

### 2. Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# MongoDB
MONGODB_URI="mongodb://localhost:27017/amoxtli-partners"

# Clerk Authentication (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Admin Access
SUPER_ADMIN_EMAIL="awd@amoxtli.tech"
```

**IMPORTANT**:
- Never commit `.env.local` to version control
- The user whose Clerk email matches `SUPER_ADMIN_EMAIL` will have admin access
- All other authenticated users are treated as partners

### 3. Database Setup

Run the database setup script to create collections and indexes:

```bash
npm run db:setup
```

This will:
- Create all required collections
- Set up indexes (including unique constraints and TTL for dedupe)
- Verify connection to MongoDB

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## User Flows

### Partner Registration & Approval

1. User signs up via Clerk at `/sign-up`
2. On first login, redirected to `/partner/onboarding` to create profile
3. Partner status is set to `PENDING`
4. Partner sees "Pending approval" page
5. Admin approves partner at `/admin/partners` → status becomes `ACTIVE`
6. Partner can now create referral links

### Creating & Using Referral Links

1. Partner creates referral link at `/partner/referrals/new`
2. System checks monthly limit (max 5 active referrals)
3. Unique referral code generated (e.g., `ABC12XYZ`)
4. Partner shares link: `/r/ABC12XYZ`
5. Client submits intake form with company/contact/email/phone/message
6. System:
   - Validates referral code and expiration
   - Computes dedupe key from email+phone+company (normalized hash)
   - Checks for duplicate leads (first partner wins)
   - Creates lead intake (SENSITIVE - admin only)
   - Updates referral status to `INTAKE_SUBMITTED`
   - Adds timeline event (public note)

### Admin Review & Pipeline

1. Admin views all referrals at `/admin/referrals`
2. Admin clicks "Manage" to see sensitive lead details
3. Admin can:
   - Accept/reject lead
   - Set pipeline status (PROPOSAL_SENT, NEGOTIATION, WON, LOST)
   - Add public notes (visible to partner) and private notes (admin-only)
   - Create project from referral (set `publicAlias` for partner, `internalName` for internal use)

### Financials & Commissions (Admin-Only)

1. Admin sets project financials at `/admin/projects`:
   - Amount charged (MXN)
   - Direct costs (MXN)
   - Commission rate (max 10%)
2. System calculates:
   - Profit = amountCharged - directCosts
   - Commission = min(profit × rate, 25000 MXN)
3. System creates/updates `partner_commissions` record (SAFE for partners to read)
   - Only contains: partnerId, projectId, commissionAmountMxn, status
   - Does NOT contain: amountCharged, directCosts, profit, commissionRate

### Payouts

1. Admin schedules payout (Part 1 or Part 2) at `/admin/payouts`
2. System checks monthly/yearly caps
3. Payout created with status `SCHEDULED`
4. Admin marks payout as `PAID` when payment is sent
5. Partner sees payout status and dates at `/partner/commissions`

## Project Structure

```
src/
├── actions/           # Server actions
│   ├── admin.ts       # Admin-only actions (full data access)
│   ├── partner.ts     # Partner actions (safe data only)
│   └── public.ts      # Public intake submission
├── app/               # Next.js App Router pages
│   ├── (auth)/        # Sign-in/sign-up pages
│   ├── (admin)/       # Admin dashboard & pages
│   ├── (partner)/     # Partner dashboard & pages
│   └── r/             # Public referral intake
├── components/        # React components
│   ├── ui/            # shadcn/ui base components
│   ├── sidebar-layout.tsx
│   ├── status-badge.tsx
│   └── timeline.tsx
├── lib/
│   ├── auth/          # Clerk guards (requireAdmin, requireActivePartner)
│   ├── db/            # MongoDB client, collections, types
│   ├── validators/    # Zod schemas
│   ├── antifraud.ts   # Dedupe, caps, self-referral checks
│   └── utils.ts       # Helpers
└── styles/
```

## Security Architecture

### Role-Based Access Control

- `requireSignedIn()`: Ensures user is authenticated
- `requireAdmin()`: Ensures user email matches `SUPER_ADMIN_EMAIL`
- `requireActivePartner()`: Ensures partner exists and status is `ACTIVE`
- `requirePartner()`: Ensures partner exists (any status)

### Data Separation

**Admin-only collections:**
- `lead_intakes` - Contains sensitive lead data
- `project_financials` - Contains pricing, costs, profit, commission rate

**Partner-safe collections:**
- `partner_commissions` - Only commission amount and status
- `commission_payouts` - Only payout amount, part, and dates
- `projects` - Only `publicAlias` exposed to partners (not `internalName`)

**Server actions:**
- Admin actions in `actions/admin.ts` can query all data
- Partner actions in `actions/partner.ts` NEVER join financial tables
- Partner actions return safe types only (SafeReferral, SafeProject)

### Why Partners Cannot See Financial Breakdowns

Partners can only see:
- Their commission amount (from `partner_commissions`)
- Payout schedule and status
- Project public alias
- Pipeline status and dates

Partners CANNOT see:
- Total amount charged to client
- Direct costs
- Profit calculation
- Commission rate
- Lead contact information (email, phone)
- Internal project names
- Admin-only notes

This is enforced by:
1. Separate database collections for sensitive vs. safe data
2. Separate server actions with different authorization levels
3. TypeScript types that exclude sensitive fields for partner-facing APIs
4. Server-side guards that prevent unauthorized access

## Database Collections

1. **partners** - Partner accounts
2. **referrals** - Referral links and status
3. **lead_intakes** - Sensitive lead data (admin-only)
4. **dedupe_registry** - First-partner-wins enforcement (TTL: 90 days)
5. **projects** - Projects with safe + admin-only fields
6. **project_financials** - Pricing, costs, profit (admin-only)
7. **partner_commissions** - Commission summary (safe for partners)
8. **commission_payouts** - Payout schedule (safe for partners)
9. **referral_events** - Timeline with public/private notes

## Commands

```bash
# Install dependencies
npm install

# Set up database (create collections and indexes)
npm run db:setup

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Design System

- **Brand primary**: #1F2A44
- **Brand accent**: #C7A667
- **Background**: #F7F8FA
- **Card**: #FFFFFF
- **Border**: #D6DCE8
- **Text primary**: #0B1220
- **Text muted**: #5B667A
- **Border radius**: 12px
- **Shadows**: Subtle elevation only

## Contributing

This is a production application. Any changes must:
- Maintain strict type safety (no `any`)
- Pass authorization checks server-side
- Never expose sensitive data to partners
- Follow the existing design system
- Include proper error handling

## License

Proprietary - Amoxtli
# amoxtli-partners
