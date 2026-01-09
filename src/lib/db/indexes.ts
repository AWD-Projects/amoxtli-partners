import { getDb } from './client';

export async function createIndexes(): Promise<void> {
  const db = await getDb();

  // partners collection
  await db.collection('partners').createIndex({ clerkUserId: 1 }, { unique: true });

  // referrals collection
  await db.collection('referrals').createIndex({ referralCode: 1 }, { unique: true });
  await db.collection('referrals').createIndex({ partnerId: 1, createdAt: -1 });

  // lead_intakes collection
  await db.collection('lead_intakes').createIndex({ referralId: 1 });
  await db.collection('lead_intakes').createIndex({ dedupeKey: 1 });

  // dedupe_registry collection
  await db.collection('dedupe_registry').createIndex({ dedupeKey: 1 }, { unique: true });
  await db.collection('dedupe_registry').createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  // projects collection
  await db.collection('projects').createIndex({ referralId: 1 });
  await db.collection('projects').createIndex({ partnerId: 1, createdAt: -1 });

  // project_financials collection
  await db.collection('project_financials').createIndex({ projectId: 1 }, { unique: true });

  // partner_commissions collection
  await db.collection('partner_commissions').createIndex({ partnerId: 1, createdAt: -1 });
  await db.collection('partner_commissions').createIndex({ projectId: 1 }, { unique: true });

  // commission_payouts collection
  await db.collection('commission_payouts').createIndex({ partnerId: 1, paidAt: -1 });
  await db.collection('commission_payouts').createIndex({ partnerId: 1, scheduledAt: -1 });

  // referral_events collection
  await db.collection('referral_events').createIndex({ referralId: 1, createdAt: -1 });

  console.log('✅ All indexes created successfully');
}
