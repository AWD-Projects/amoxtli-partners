# Security Documentation

## Critical Privacy Rule

**Partners must NEVER be able to access or infer:**
- Lead contact information (email, phone, company name)
- Project financials (amountChargedMxn, directCostsMxn, profitNetMxn)
- Commission calculation details (commissionRate)
- Internal project names
- Admin-only notes

**Partners may only access:**
- Their own referral codes and statuses
- Project public aliases (e.g., "Project #2024-001")
- Their commission amounts (final calculated value)
- Their payout schedule (amounts, parts, dates)
- Public timeline notes

## Security Implementation

### 1. Database Layer Separation

**Sensitive Collections (Admin-Only):**
```typescript
// lead_intakes - Contains email, phone, companyName
// project_financials - Contains amountChargedMxn, directCostsMxn, profitNetMxn, commissionRate
```

**Safe Collections (Partner-Accessible):**
```typescript
// partner_commissions - Only contains commissionAmountMxn, status
// commission_payouts - Only contains amountMxn, part, dates
// projects - Partners see publicAlias only (not internalName)
```

### 2. Server Actions Authorization

All server actions implement role-based guards:

```typescript
// Admin actions
export async function getAllProjects() {
  await requireAdmin(); // Throws if not super admin
  // ... full data access
}

// Partner actions
export async function getMyCommissions() {
  const { partner } = await requireActivePartner(); // Throws if not active partner
  // ... returns safe data only
}
```

### 3. Type Safety

Separate types for safe and sensitive data:

```typescript
// Full project type (admin)
interface Project {
  publicAlias: string;
  internalName: string; // admin-only
  // ...
}

// Safe project type (partner)
interface SafeProject {
  publicAlias: string; // only this field
  status: ReferralStatus;
  createdAt: Date;
}
```

### 4. Query Isolation

Partner queries NEVER join sensitive tables:

```typescript
// CORRECT - Partner action
export async function getMyCommissions() {
  const commissionsCollection = await getPartnerCommissionsCollection();
  // Only queries partner_commissions (safe)
  return commissionsCollection.find({ partnerId }).toArray();
}

// WRONG - Would expose sensitive data
export async function getMyCommissions() {
  // Never do this in partner actions!
  const financialsCollection = await getProjectFinancialsCollection();
  return financialsCollection.find(...); // ❌ Exposes pricing
}
```

## Antifraud Measures

### 1. Self-Referral Prevention

```typescript
function isSelfReferral(partnerEmail: string, leadEmail: string): boolean {
  // Check exact email match
  if (partnerEmail.toLowerCase() === leadEmail.toLowerCase()) {
    return true;
  }

  // Check domain match (company self-referrals)
  const partnerDomain = partnerEmail.split('@')[1];
  const leadDomain = leadEmail.split('@')[1];
  if (partnerDomain === leadDomain) {
    return true;
  }

  return false;
}
```

### 2. Dedupe Protection (First Partner Wins)

```typescript
function generateDedupeKey(email: string, phone: string, company: string): string {
  // Normalize all inputs
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone.replace(/\D/g, '');
  const normalizedCompany = company.toLowerCase().trim().replace(/[^\w\s]/g, '');

  // Create hash
  const data = `${normalizedEmail}|${normalizedPhone}|${normalizedCompany}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// In intake submission:
const dedupeKey = generateDedupeKey(email, phone, companyName);
const existing = await dedupeRegistry.findOne({ dedupeKey });
if (existing) {
  throw new Error('Lead already registered by another partner');
}
```

TTL index ensures dedupe keys expire after 90 days.

### 3. Rate Limits

- **Monthly active referrals**: Max 5 per partner
- **Project commission cap**: 25,000 MXN
- **Monthly payout cap**: 40,000 MXN
- **Yearly payout cap**: 120,000 MXN

Enforced server-side in `actions/partner.ts` and `actions/admin.ts`.

## Commission Calculation

Commission is based on **PROFIT NETO REAL** only:

```typescript
const profitNetMxn = amountChargedMxn - directCostsMxn;
const commission = Math.min(
  profitNetMxn * (commissionRate / 100),
  25000 // Project cap
);
```

Partners see only the final `commission` value. They never see:
- `amountChargedMxn`
- `directCostsMxn`
- `profitNetMxn`
- `commissionRate`

This is stored in separate collections:
- `project_financials` (admin-only) - Contains all values
- `partner_commissions` (safe) - Contains only final commission amount

## Admin Access

Super admin is identified by email match:

```typescript
const clerkUser = await auth();
const email = clerkUser.sessionClaims?.email;
const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;
```

Set `SUPER_ADMIN_EMAIL` in `.env.local`. Never hardcode.

## Secure Practices

1. **Never log sensitive data**
   - No email, phone, or financial data in console.log
   - Use generic error messages for user-facing errors

2. **Server-side validation**
   - All Zod schemas validated server-side
   - Never trust client input

3. **Environment variables**
   - Never commit `.env.local`
   - Use example file only
   - Secrets should never appear in code

4. **Type safety**
   - Strict TypeScript mode
   - No `any` types
   - Explicit types for all data structures

5. **Authorization at every layer**
   - Middleware (Clerk)
   - Server actions (guards)
   - Database queries (scoped to user/role)

## Testing Security

To verify partner data isolation:

1. Create a partner account
2. Sign in as partner
3. Try to access:
   - `/admin/*` → Should redirect
   - Lead contact info → Should never appear
   - Project financials → Should never appear
4. Use browser DevTools Network tab:
   - Check server action responses
   - Verify no sensitive fields returned

To verify admin access:

1. Sign in with account matching `SUPER_ADMIN_EMAIL`
2. Should have access to all admin routes
3. Should see all sensitive data
4. Should be able to approve partners, set financials, etc.

## Incident Response

If a security issue is discovered:

1. **Immediately** rotate any exposed credentials
2. Review server action code for unauthorized data access
3. Check database query logs for anomalies
4. Audit partner access patterns
5. Consider suspending affected partner accounts

## Compliance

This system is designed to:
- Protect client confidentiality
- Prevent commission gaming
- Ensure fair partner competition
- Maintain data integrity

All partner actions are logged via `referral_events` for audit trail.
