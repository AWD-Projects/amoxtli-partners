import crypto from 'crypto';

export function generateDedupeKey(
  email: string,
  phone: string,
  companyName: string
): string {
  // Normalize inputs
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone.replace(/\D/g, ''); // Remove all non-digits
  const normalizedCompany = companyName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ''); // Remove punctuation

  // Create hash
  const dataString = `${normalizedEmail}|${normalizedPhone}|${normalizedCompany}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

export function isSelfReferral(
  partnerEmail: string,
  leadEmail: string,
  leadPhone: string
): boolean {
  // Check if emails match
  if (partnerEmail.toLowerCase() === leadEmail.toLowerCase()) {
    return true;
  }

  // Check if email domains match
  const partnerDomain = partnerEmail.split('@')[1];
  const leadDomain = leadEmail.split('@')[1];
  if (partnerDomain && leadDomain && partnerDomain === leadDomain) {
    return true;
  }

  // Additional checks could be added here (e.g., phone number matching)

  return false;
}

export function calculateCommission(
  profitNetMxn: number,
  commissionRate: number
): number {
  const PROJECT_COMMISSION_CAP = 25000;
  const commission = profitNetMxn * (commissionRate / 100);
  return Math.min(commission, PROJECT_COMMISSION_CAP);
}

export function canSchedulePayout(
  currentMonthTotal: number,
  currentYearTotal: number,
  payoutAmount: number
): { allowed: boolean; reason?: string } {
  const MONTHLY_CAP = 40000;
  const YEARLY_CAP = 120000;

  if (currentMonthTotal + payoutAmount > MONTHLY_CAP) {
    return {
      allowed: false,
      reason: `Would exceed monthly cap of ${MONTHLY_CAP} MXN`,
    };
  }

  if (currentYearTotal + payoutAmount > YEARLY_CAP) {
    return {
      allowed: false,
      reason: `Would exceed yearly cap of ${YEARLY_CAP} MXN`,
    };
  }

  return { allowed: true };
}
